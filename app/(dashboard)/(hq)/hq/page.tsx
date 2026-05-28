"use client";
import { FaHome } from "react-icons/fa";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AdminDashboardPage() {
    const { data: session } = useSession();
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#fffbe9]">
      {/* Header */}
      <div
        className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2"
        style={{ minHeight: 60 }}
      >
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <FaHome className="w-9 h-9 text-black" />
        </span>
        <span className="text-2xl font-bold text-black">Home</span>
      </div>
      {/* RBMS badge */}
      <div className="w-full flex justify-center mt-4">
        <div className="bg-green-200 rounded-2xl px-8 py-2">
          <span className="text-4xl font-extrabold text-[#b07be0] tracking-wide">
            RBMS-{session?.user?.location}-DIVN
          </span>
        </div>
      </div>
      {/* Designation bar */}
      <div className="w-full flex justify-center mt-4">
        <div
          className="bg-[#ffeaea] rounded-full px-6 py-2 border border-black flex flex-col items-center"
          style={{ maxWidth: "90vw" }}
        >
          <span className="text-lg font-bold text-black tracking-wide">
            HQ
          </span>
        </div>
      </div>
      {/* Navigation buttons */}
      <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md">
        <Link href="/hq/generate-report" className="w-full">
          <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
            BLOCK SUMMARY REPORT
          </button>
        </Link>
      </div>

      <button
                            className="flex items-center gap-2 bg-[#ffb347] border-2 border-black rounded-lg px-4 py-2 text-lg font-bold text-black"
                            onClick={() => signOut()}
                        >
                            Logout
                        </button>
    </div>
  );
}
