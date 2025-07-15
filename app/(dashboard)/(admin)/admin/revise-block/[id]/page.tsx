"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService } from "@/app/service/api/manager";
import { adminService } from "@/app/service/api/admin";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ReviseBlockDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const id = params.id as string;
    const [isProcessing, setIsProcessing] = useState(false);
    const [reviseData, setReviseData] = useState({
        optimizeTimeFrom: "",
        optimizeTimeTo: "",
        date: "",
    });
  const { data: session } = useSession();

    // Fetch request data
    const { data, isLoading, error } = useQuery({
        queryKey: ["request", id],
        queryFn: () => managerService.getUserRequestById(id),
    });

    // Mutation for updating the request
    const updateMutation = useMutation({
        mutationFn: (data: any) => adminService.editRequest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["request", id] });
            queryClient.invalidateQueries({ queryKey: ["revise-blocks"] });
        },
    });

    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), "dd-MM-yyyy");
        } catch {
            return "Invalid date";
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            const hours = date.getUTCHours().toString().padStart(2, "0");
            const minutes = date.getUTCHours().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
        } catch {
            return "N/A";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm("Are you sure you want to revise this block?")) {
            setIsProcessing(true);
            try {
                await updateMutation.mutateAsync(reviseData);
                alert("Block revised successfully!");
                router.push("/admin/revise-block");
            } catch (error) {
                console.error("Failed to revise block:", error);
                alert("Failed to revise block. Please try again.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen text-black bg-white p-3 border border-black flex items-center justify-center">
        <div className="text-center py-5">Loading approved requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-3 border border-black flex items-center justify-center">
        <div className="text-center py-5 text-red-600">
          Error loading approved requests. Please try again.
        </div>
      </div>
    );
  }

    const request = data?.data;

    if (!request) {
        return (
            <div className="bg-white p-3 border border-black mb-3">
                <div className="text-center py-5">Block not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFDF5] max-w-[1366px] mx-auto px-2 pb-32">
            {/* Top Yellow Bar */}
            <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
                <span className="text-4xl font-bold text-[#B57CF6] tracking-widest">
                    RBMS-{session?.user?.location}-DIVN
                </span>
            </div>
            {/* Main Title on Light Blue */}
            <div className="w-full bg-[#D6F3FF] py-3 flex flex-col items-center border-b-2 border-black">
                <span className="text-2xl md:text-3xl font-bold text-black text-center">
                    Traffic Controller(Blocks)
                </span>
                <div className="w-full flex justify-center mt-3">
                    <h1
                        className="bg-[#cfd4ff] py-1 px-6 rounded-full font-bold text-center"
                        style={{ width: "600px" }}
                    >
                        Revise Block Details
                    </h1>
                </div>
            </div>

            <div className="bg-white p-3 border border-black mb-3 text-black">
                <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
                    <h1 className="text-lg font-bold text-[#13529e]">
                        Revise Block: {request.divisionId || request.id}
                    </h1>
                    <Link
                        href="/admin/revise-block"
                        className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black"
                    >
                        Back to List
                    </Link>
                </div>

                {/* Current Block Information */}
                <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
                    <h2 className="text-md font-bold text-[#13529e] mb-3 border-b border-gray-200 pb-1">
                        Current Block Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Date:</span>
                            <p className="font-medium">{formatDate(request.date)}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-600">Section:</span>
                            <p className="font-medium">{request.selectedSection}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-600">Block Type:</span>
                            <p className="font-medium">{request.corridorType}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-600">Current Time:</span>
                            <p className="font-medium">
                                {`${formatTime(request.sanctionedTimeFrom || request.optimizeTimeFrom)} - ${formatTime(request.sanctionedTimeTo || request.optimizeTimeTo)}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Revision Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border border-gray-300 p-4 rounded">
                        <h2 className="text-md font-bold text-[#13529e] mb-3 border-b border-gray-200 pb-1">
                            Revise Block Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    New Date <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={reviseData.date}
                                    onChange={(e) => setReviseData({ ...reviseData, date: e.target.value })}
                                    className="w-full p-2 border border-black text-black focus:outline-none focus:ring-1 focus:ring-[#13529e]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    New Start Time <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={reviseData.optimizeTimeFrom}
                                    onChange={(e) => setReviseData({ ...reviseData, optimizeTimeFrom: e.target.value })}
                                    className="w-full p-2 border border-black text-black focus:outline-none focus:ring-1 focus:ring-[#13529e]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    New End Time <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={reviseData.optimizeTimeTo}
                                    onChange={(e) => setReviseData({ ...reviseData, optimizeTimeTo: e.target.value })}
                                    className="w-full p-2 border border-black text-black focus:outline-none focus:ring-1 focus:ring-[#13529e]"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link
                            href="/admin/revise-block"
                            className="px-4 py-2 text-sm bg-white text-[#13529e] border border-black hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm bg-[#13529e] text-white border border-black hover:bg-[#0d3d7a] disabled:opacity-50"
                        >
                            {isProcessing ? "Revising..." : "Revise Block"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1 text-right">
                © {new Date().getFullYear()} Indian Railways
            </div>
        </div>
    );
} 