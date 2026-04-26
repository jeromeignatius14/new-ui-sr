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
        if (!res.data?.data?.valid) {
          forcedOutRef.current = true;
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
            Please log in again to continue.
          </p>
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
