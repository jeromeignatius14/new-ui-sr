"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance";

interface LockedUser {
    id: string;
    name: string;
    phone: string;
    department: string;
    depot: string;
    lockedAt: string;
}

async function fetchLockedUsers(): Promise<LockedUser[]> {
    const res = await axiosInstance.get("/api/analytics/locked-users");
    return res.data.data;
}

async function unlockUser(userId: string): Promise<void> {
    await axiosInstance.patch("/api/analytics/unlock-user", { userId });
}

export default function UnlockUsersPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ["locked-users"],
        queryFn: fetchLockedUsers,
        staleTime: 30 * 1000,
    });

    const mutation = useMutation({
        mutationFn: unlockUser,
        onMutate: (userId) => setUnlocking(userId),
        onSuccess: (_, userId) => {
            const user = users?.find((u) => u.id === userId);
            setSuccessMsg(`${user?.name ?? "User"} has been unlocked successfully.`);
            queryClient.invalidateQueries({ queryKey: ["locked-users"] });
            setUnlocking(null);
            setTimeout(() => setSuccessMsg(null), 4000);
        },
        onError: () => setUnlocking(null),
    });

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-[#fffbe9]">
            {/* Header */}
            <div className="w-full border border-black bg-yellow-200 flex items-center justify-between px-4 py-3">
                <Link href="/manage/request-table" className="text-black font-bold text-lg">← Back</Link>
                <span className="text-xl font-extrabold text-black">🔓 UNLOCK USERS</span>
                <span />
            </div>

            {/* Department badge */}
            <div className="w-full bg-[#D6F3FF] py-2 flex justify-center">
                <span className="text-lg font-bold text-black">
                    {session?.user?.department || "—"} Department
                </span>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-6">
                {successMsg && (
                    <div className="mb-4 bg-green-100 border border-green-500 text-green-800 font-semibold px-4 py-3 rounded-xl text-center">
                        ✅ {successMsg}
                    </div>
                )}

                {isLoading && (
                    <p className="text-center text-gray-500 mt-10 font-semibold">Loading locked users...</p>
                )}

                {isError && (
                    <p className="text-center text-red-600 mt-10 font-semibold">Failed to load locked users.</p>
                )}

                {!isLoading && !isError && users?.length === 0 && (
                    <div className="text-center mt-16">
                        <p className="text-2xl font-extrabold text-green-700">✅ No locked users</p>
                        <p className="text-gray-500 mt-2">All users in your department are currently active.</p>
                    </div>
                )}

                {!isLoading && users && users.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 font-semibold mb-2">
                            {users.length} locked user(s) in your department
                        </p>
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="bg-white border-2 border-[#dc2626] rounded-2xl px-5 py-4 flex flex-col gap-2 shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-extrabold text-black">{user.name}</span>
                                    <span className="bg-[#ffd6d6] text-[#dc2626] text-xs font-bold px-3 py-1 rounded-full border border-[#dc2626]">
                                        🔒 LOCKED
                                    </span>
                                </div>
                                <div className="text-sm text-gray-700 space-y-0.5">
                                    <p><span className="font-semibold">Phone:</span> {user.phone || "—"}</p>
                                    <p><span className="font-semibold">Depot:</span> {user.depot || "—"}</p>
                                    <p><span className="font-semibold">Locked at:</span> {formatDate(user.lockedAt)}</p>
                                </div>
                                <button
                                    onClick={() => mutation.mutate(user.id)}
                                    disabled={unlocking === user.id}
                                    className="mt-2 w-full bg-[#fff3cd] border-2 border-[#f59e0b] rounded-xl py-3 text-base font-extrabold text-black hover:scale-105 transition disabled:opacity-50"
                                >
                                    {unlocking === user.id ? "Unlocking..." : "🔓 Unlock"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
