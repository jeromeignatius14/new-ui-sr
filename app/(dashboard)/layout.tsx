"use client";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sidebar } from "../components/ui/sidebar";
import { UrgentModeProvider, useUrgentMode } from "../context/UrgentModeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: "Southern Railway - Dashboard",
  description: "Southern Railway Employee Portal Dashboard",
};

const LOCK_NOTICE_KEY = "lockNotice_dismissed_v1";
const LOCK_NOTICE_EXPIRY = new Date("2026-07-14T00:00:00+05:30").getTime();

function LockNoticeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Date.now() > LOCK_NOTICE_EXPIRY) return;
    const dismissed = localStorage.getItem(LOCK_NOTICE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const isLive = Date.now() >= new Date("2026-07-06T00:30:00Z").getTime();

  return (
    <div className="w-full bg-amber-100 border-b-2 border-amber-400 px-4 py-2 flex items-start gap-3 z-50">
      <span className="text-amber-700 text-xl mt-0.5">⚠️</span>
      <div className="flex-1 text-amber-900 text-sm leading-snug">
        {isLive ? (
          <>
            <span className="font-bold">Account Locking is now active.</span>{" "}
            Every Monday, accounts with 2 or more unacknowledged or unapplied block exceptions in the previous week are automatically locked. Locked accounts cannot create new block requests. Contact your Branch Officer or Department Controller to unlock.
          </>
        ) : (
          <>
            <span className="font-bold">Account Locking starts 6th July 2026 (tomorrow).</span>{" "}
            Every Monday, accounts with 2 or more unacknowledged or unapplied block exceptions in the previous week will be automatically locked. Locked accounts cannot create new block requests. Contact your Branch Officer or Department Controller to unlock.
          </>
        )}
      </div>
      <button
        onClick={() => { localStorage.setItem(LOCK_NOTICE_KEY, "1"); setVisible(false); }}
        className="text-amber-700 hover:text-amber-900 text-lg font-bold ml-2 shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <LockNoticeBanner />
      {children}
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UrgentModeProvider>
      <DashboardContent>{children}</DashboardContent>
    </UrgentModeProvider>
  );
}
