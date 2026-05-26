"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/app/components/ui/Loader";

export default function CteLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const allowed = ["CTE", "CEDE", "CSE", "CTPM", "SUPER_ADMIN", "HQ"];

  useEffect(() => {
    if (status === "authenticated" && !allowed.includes(session?.user?.role ?? "")) {
      router.push("/404");
    }
  }, [session, status, router]);

  if (status === "loading") return <Loader name="page" />;
  if (status === "unauthenticated" || !allowed.includes(session?.user?.role ?? "")) return null;

  return <>{children}</>;
}
