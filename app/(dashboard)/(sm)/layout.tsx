"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader } from "@/app/components/ui/Loader";
import { smSessionApi } from "@/app/service/api/smSession";

export default function SmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forcedOut, setForcedOut] = useState(false);
  const [replacedBy, setReplacedBy] = useState<{ userName: string; userPhone: string | null } | null>(null);
  const forcedOutRef = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SM") {
      router.push("/404");
    }
  }, [session, status, router]);

  // Poll session validity — detect if another SM has force-logged-out this SM
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "SM") return;

    const check = async () => {
      if (forcedOutRef.current) return;
      try {
        const res = await smSessionApi.verify();
        const data = res.data?.data;
        if (!data?.valid) {
          forcedOutRef.current = true;
          setReplacedBy(data?.replacedBy ?? null);
          setForcedOut(true);
        }
      } catch {
        // Network error — don't force out, just retry next cycle
      }
    };

    check();
    const interval = setInterval(check, 30000); // check every 30 s
    return () => clearInterval(interval);
  }, [status, session]);

  if (status === "loading") {
    return <Loader name="page" />;
  }

  if (status === "unauthenticated" || session?.user?.role !== "SM") {
    return null;
  }

  if (forcedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbe9] px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center">You Have Been Logged Out</h2>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Another Station Master has logged in at your station and your session has been ended.
          </p>
          {replacedBy && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500 w-16 shrink-0">Name</span>
                <span className="text-sm font-bold text-gray-800">{replacedBy.userName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500 w-16 shrink-0">CUG</span>
                <span className="text-sm font-bold text-gray-800">{replacedBy.userPhone ?? "—"}</span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 text-center">Please log in again to continue.</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 rounded-xl font-bold text-white text-base"
            style={{ backgroundColor: "#f4a47c" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
