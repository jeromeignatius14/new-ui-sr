"use client";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { UrgentModeProvider } from "../context/UrgentModeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: "Southern Railway - Dashboard",
  description: "Southern Railway Employee Portal Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UrgentModeProvider>
      {children}
    </UrgentModeProvider>
  );
}
