"use client";
import { FaHome } from "react-icons/fa";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axiosInstance from "@/app/utils/axiosInstance";
import toast from "react-hot-toast";

function LockedUsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [permitted, setPermitted] = useState(false);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const fetchLocked = async () => {
    try {
      const res = await axiosInstance.get("/api/analytics/locked-users");
      setUsers(res.data?.data || []);
      setPermitted(true);
    } catch { /* 403 = not a BO/DC — hide panel */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocked(); }, []);

  const unlock = async (userId: string, name: string) => {
    setUnlocking(userId);
    try {
      await axiosInstance.patch("/api/analytics/unlock-user", { userId });
      toast.success(`${name} unlocked successfully`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to unlock");
    } finally { setUnlocking(null); }
  };

  if (loading || !permitted) return null;

  return (
    <div className="w-full max-w-md mt-6 border-2 border-red-500 rounded-2xl overflow-hidden">
      <div className="bg-red-100 px-4 py-3 flex items-center gap-2 border-b border-red-400">
        <span className="text-xl">🔒</span>
        <span className="font-extrabold text-red-800 text-lg">Locked Accounts ({users.length})</span>
      </div>
      {users.length === 0 ? (
        <div className="bg-white px-4 py-4 text-center text-sm text-gray-500">
          No locked accounts in your department.
        </div>
      ) : (
        <div className="bg-white divide-y divide-gray-200">
          {users.map(u => (
            <div key={u.id} className="px-4 py-3 flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-black text-base">{u.name}</p>
                <p className="text-sm text-gray-500">{u.department} · {u.depot}</p>
                <p className="text-xs text-red-500">Locked: {u.lockedAt ? new Date(u.lockedAt).toLocaleDateString("en-IN") : "—"}</p>
              </div>
              <button
                onClick={() => unlock(u.id, u.name)}
                disabled={unlocking === u.id}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold border border-green-800 disabled:opacity-50"
              >
                {unlocking === u.id ? "..." : "Unlock"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
            {session?.user?.name}
          </span>
        </div>
      </div>
      {/* Navigation buttons */}
      <div className="w-full flex flex-col items-center gap-8 mt-10 px-2 max-w-md mb-2">
        <Link href="/bo/generate-report" className="w-full">
          <button className="w-full rounded-2xl bg-[#c7c7f7] border border-black py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
            BLOCK SUMMARY REPORT
          </button>
        </Link>
        <Link href="/bo/defaulters" className="w-full">
          <button className="w-full rounded-2xl bg-[#ffd6d6] border-2 border-[#dc2626] py-6 text-2xl font-extrabold text-black text-center shadow hover:scale-105 transition">
            ⚠️ EXCEPTIONAL LIST
          </button>
        </Link>
      </div>
      <LockedUsersPanel />

      <button
        onClick={async () => {
          const { signOut } = await import("next-auth/react");
          await signOut({ redirect: true, callbackUrl: "/auth/login" });
        }}
        className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
      >
        Logout
      </button>
    </div>
  );
}
