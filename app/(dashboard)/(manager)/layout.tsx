"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/app/components/ui/Loader";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const allowedRoles = ["BRANCH_OFFICER", "JUNIOR_OFFICER", "SENIOR_OFFICER","DEPT_CONTROLLER"];

  useEffect(() => {
    if (
      status === "authenticated" &&
      !allowedRoles.includes(session?.user?.role || "")
    ) {
      router.push("/404");
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return <Loader name="page" />;
  }

  // If not authenticated or not a user, don't render children
  if (
    status === "unauthenticated" ||
    !allowedRoles.includes(session?.user?.role || "")
  ) {
    return null;
  }

  return <>{children}</>;
}
