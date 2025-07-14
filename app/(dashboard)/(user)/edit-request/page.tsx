"use client";
import React from "react";
import { useGetUserRequests } from "@/app/service/query/user-request";
import { useRouter } from "next/navigation";
import { Loader } from "@/app/components/ui/Loader";
import { extractTimeFromDatetime } from "@/app/lib/helper";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import { useDeleteUserRequest } from "@/app/service/mutation/user-request";
import formatTime from "@/app/utils/formatTime";

export default function EditRequestsPage() {
    const router = useRouter();
    const { data: requests, isLoading } = useGetUserRequests();
    const { data: session } = useSession();
    const deleteMutation = useDeleteUserRequest();
    const [cancelModal, setCancelModal] = React.useState<{ id: string; open: boolean }>({ id: "", open: false });
    const [cancelRemark, setCancelRemark] = React.useState("");
    const [cancelError, setCancelError] = React.useState("");
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    const getDuration = (from: string, to: string) => {
        if (!from || !to) return "-";
        const [fromHours, fromMinutes] = from.split(":").map(Number);
        const [toHours, toMinutes] = to.split(":").map(Number);
        const fromTotal = fromHours * 60 + fromMinutes;
        const toTotal = toHours * 60 + toMinutes;
        let diff = toTotal - fromTotal;
        if (diff < 0) diff += 24 * 60;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
    };

    if (isLoading) {
        return (
            <div>
                <Loader name="Loading Block Requests" />
            </div>
        );
    }

    // Filter requests to only those made by the logged-in user
    const userId = session?.user?.id;
    const allRequests = Array.isArray(requests?.data?.requests) ? requests.data.requests : [];
    const now = new Date();
    let userRequests = allRequests.filter((req: any) => {
        const blockDate = new Date(req.date);
        return req.userId === userId && blockDate > now;
    });
    userRequests = userRequests.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Helper to check if a request is editable (more than 3 days from now)
    const isEditable = (dateStr: string) => {
        const blockDate = new Date(dateStr);
        const diffDays = (blockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > 3;
    };

    // Replace handleCancel
    const handleCancel = (id: string) => {
        setCancelModal({ id, open: true });
        setCancelRemark("");
        setCancelError("");
    };

    return (
        <>
            {/* Cancel Modal */}
            {cancelModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-2 text-black">Cancel Request</h2>
                        <p className="mb-2 text-black">Please enter a remark for cancellation:</p>
                        <textarea
                            className="w-full border border-gray-400 rounded p-2 mb-2 text-black"
                            rows={3}
                            value={cancelRemark}
                            onChange={e => setCancelRemark(e.target.value)}
                            placeholder="Enter cancellation remark..."
                        />
                        {cancelError && <div className="text-red-600 text-xs mb-2">{cancelError}</div>}
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setCancelModal({ id: "", open: false })}
                                className="px-4 py-1 bg-gray-200 text-black rounded border border-gray-400 hover:bg-gray-300"
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!cancelRemark.trim()) {
                                        setCancelError("Remark is required.");
                                        return;
                                    }
                                    setCancelError("");
                                    setDeletingId(cancelModal.id);
                                    try {
                                        await deleteMutation.mutateAsync(cancelModal.id);
                                        setCancelModal({ id: "", open: false });
                                        setDeletingId(null);
                                        // Optionally, reload the page or refetch queries
                                        window.location.reload();
                                    } catch (err) {
                                        setCancelError("Failed to cancel request. Please try again.");
                                        setDeletingId(null);
                                    }
                                }}
                                className="px-4 py-1 bg-red-600 text-white rounded border border-red-700 hover:bg-red-700 disabled:opacity-50"
                                disabled={deletingId !== null}
                            >
                                {deletingId === cancelModal.id ? "Cancelling..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Main Page Content */}
            <div className="min-h-screen bg-[#FFFDF5] max-w-[1366px] mx-auto px-2 relative pb-32">
                {/* Top Yellow Bar */}
                <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
                    <span className="text-[24px] font-bold text-[#B57CF6] tracking-widest">
            RBMS-{session?.user?.location}-DIVN
                    </span>
                </div>
                {/* Main Title on Light Blue */}
                <div className="w-full bg-[#D6F3FF] py-3 flex flex-col items-center border-b-2 border-black">
                    <span className="text-[24px] md:text-3xl font-bold text-black text-center">Edit/Cancel Previous Block Requests</span>
                </div>
                {/* Table Box */}
                <div className="flex justify-center mt-3 mb-6">
                    <div className="w-full rounded-2xl border-2 border-[#B5B5B5] bg-[#F5E7B2] shadow p-0">
                        <div className="text-[24px] font-bold text-black text-center py-2">MY UPCOMING BLOCK REQUESTS</div>
                        <div className="italic text-center text-[24px] text-black pb-2">(Click ID to edit or cancel)</div>
                        {/* Table */}
                        <div className="  max-h-[430px] min-h-[100px] overflow-x-auto rounded-xl mx-2 mb-2">
                            <table className="w-full border border-black rounded-xl overflow-hidden text-[24px]">
                                <thead>
                                    <tr className="bg-[#D6F3FF] text-black">
                                        <th className="border border-black px-2 py-1 whitespace-nowrap w-[12%]">Date</th>
                                        <th className="border border-black px-2 py-1 whitespace-nowrap w-[8%]">ID</th>
                                        <th className="border border-black px-2 py-1 whitespace-nowrap w-[25%]">Block Section</th>
                                        <th className="border border-black px-2 py-1 whitespace-nowrap w-[15%]">Line/Road</th>
                                        <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">Demand</th>
                                        <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">Edit/Cancel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center text-gray-600 py-8 text-[24px] ">No block requests found for your account.</td>
                                        </tr>
                                    ) : (
                                        userRequests.map((request: any, idx: number) => (
                                            <tr key={request.id} className={idx % 2 === 0 ? "bg-[#FFF86B]" : "bg-[#E6E6FA]"}>
                                                <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">{dayjs(request.date).format("DD-MM-YY")}</td>
                                                <td className="border border-black px-2 py-1 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => {
                                                            if (isEditable(request.date)) {
                                                                router.push(`/edit-request/${request.id}`);
                                                            } else {
                                                                handleCancel(request.id);
                                                            }
                                                        }}
                                                        className="text-black hover:underline"
                                                    >
                                                        {request.divisionId || request.id.slice(-4)}
                                                    </button>
                                                </td>
                                                <td className="border border-black px-2 py-1 text-black">{request.missionBlock || "-"}</td>
                                                <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                                                    {request.processedLineSections?.map((section: any) => section.lineName || section.road).join(", ") || "-"}
                                                </td>
                                                <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                                                    
                                                    {formatTime(request.demandTimeFrom)} -{" "}
                                                    {formatTime(request.demandTimeTo)}
                                                </td>
                                                <td className="border border-black px-2 py-1 text-center whitespace-nowrap text-black">
                                                    {isEditable(request.date) ? (
                                                        <button
                                                            onClick={() => router.push(`/edit-request/${request.id}`)}
                                                            className="bg-[#b7b7f7] text-black px-2 py-1 rounded border border-black text-[24px] hover:bg-[#e6e6fa] transition"
                                                        >
                                                            Edit
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleCancel(request.id)}
                                                            className="bg-[#ffb7b7] text-black px-2 py-1 rounded border border-black text-[24px] hover:bg-[#ffcccc] transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 bg-[#FFFDF5] pb-2 z-10">
                    <div className="max-w-[1366px] mx-auto px-2">
                        <div className="flex justify-center gap-3 mb-2">
                            {/* <button
                                onClick={() => router.push('/dashboard')}
              className="text-center w-full max-w-60 rounded-[50%] bg-violet-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#baffc9] transition"
                            >
                                 Home
                            </button> */}
                            <button
                                onClick={() => (window.location.href = '/dashboard')}
              className="text-center w-full max-w-60 rounded-[50%] bg-cyan-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#baffc9] transition"
                            >
                                 Back
                            </button>
                            {/* <button
                                onClick={() => router.push('/auth/logout')}
                                className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black"
                            >
                                Logout
                            </button> */}
                            <button
                                onClick={async () => {
                                    const { signOut } = await import('next-auth/react');
                                    await signOut({ redirect: true, callbackUrl: '/auth/login' });
                                }}
              className="text-center w-full max-w-60 rounded-[50%] bg-emerald-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#baffc9] transition"
                            >
                                Logout
                            </button>
                        </div>
                        <div className="text-[12px] text-gray-600 border-t border-black pt-1 text-right">
                            © {new Date().getFullYear()} Indian Railways
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 