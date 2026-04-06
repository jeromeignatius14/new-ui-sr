"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/app/components/ui/Loader";

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ANALYST") {
      router.push("/404");
    }
  }, [session, status, router]);

  if (status === "loading") return <Loader name="page" />;
  if (status === "unauthenticated" || session?.user?.role !== "ANALYST") return null;

  return <>{children}</>;
}
