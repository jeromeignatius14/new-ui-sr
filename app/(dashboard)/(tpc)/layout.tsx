"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/app/components/ui/Loader";

export default function TpcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "BOARD_CONTROLLER") {
      router.push("/404");
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return <Loader name="page" />;
  }

  // If not authenticated or not a BOARD_CONTROLLER, don't render children
  if (status === "unauthenticated" || session?.user?.role !== "BOARD_CONTROLLER") {
    return null;
  }

  // If authenticated and is a BOARD_CONTROLLER, render children
  return <>{children}</>;
}