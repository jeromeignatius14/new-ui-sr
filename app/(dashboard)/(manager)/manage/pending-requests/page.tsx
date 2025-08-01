"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService, UserRequest } from "@/app/service/api/manager";
import { useBulkAcceptRequests, useBulkRejectRequests } from "@/app/service/mutation/manager";
import { toast } from "react-hot-toast";
import { notFound } from "next/navigation";

export default function PendingRequestsPage() {
    const { data: session } = useSession();
    const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<null | string>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    // Fetch all requests (same as request-table)
    const { data, isLoading, error } = useQuery({
        queryKey: ["pendingRequests"],
        queryFn: async () => {
            try {
                const result = await managerService.getUserRequestsByManager(1, 10000);
                return result;
            } catch (err) {
                console.error("Error fetching requests:", err);
                throw err;
            }
        }
    });

    // Defensive: get requests array safely and filter for 'Pending with me'
 const pendingRequests = (Array.isArray(data?.data?.requests) ? data.data.requests : [])
    .filter((r: UserRequest) => r.status === 'PENDING' && r.managerAcceptance === false)
    .sort((a: UserRequest, b: UserRequest) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
    })

    // Mutations
    const bulkAcceptRequests = useBulkAcceptRequests();
    const bulkRejectRequests = useBulkRejectRequests();

    const queryClient = useQueryClient();

    // Accept mutation - updated with mobileView parameter
    const acceptMutation = useMutation({
        mutationFn: ({ id, isAccept, remark, mobileView }: { id: string; isAccept: boolean; remark?: string; mobileView: boolean }) =>
            managerService.acceptUserRequest(id, isAccept, remark, mobileView),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            setShowSuccessModal("Request processed successfully");
        },
        onError: (error) => {
            console.error("Failed to process request:", error);
            toast.error("Failed to process request. Please try again.");
        },
    });

    // Handle accept request
    // const handleAccept = async (id: string) => {
    //     if (confirm("Are you sure you want to accept this request?")) {
    //         setIsAccepting(true);
    //         try {
    //             await acceptMutation.mutateAsync({ 
    //                 id, 
    //                 isAccept: true, 
    //                 remark: "", 
    //                 mobileView: true 
    //             });
    //         } finally {
    //             setIsAccepting(false);
    //         }
    //     }
    // };


const handleAccept = async (
  id: string,
  requestDateStr: string,
  corridorType: string
) => {
  const now = new Date();
  const requestDate = new Date(requestDateStr);

  const today = now.getDay(); // 5 = Friday
  const hour = now.getHours();
  const minute = now.getMinutes();

  const isUrgent = corridorType === "Urgent Block";
  const isFridayAfterNoon = today === 5 && (hour > 12 || (hour === 12 && minute >= 0));

  if (!isUrgent && isFridayAfterNoon) {
    // Define block start = tomorrow (Saturday)
    const blockStart = new Date(now);
    blockStart.setDate(now.getDate() + 1); // Saturday
    blockStart.setHours(0, 0, 0, 0);

    // Define block end = Sunday next week
    const blockEnd = new Date(blockStart);
    blockEnd.setDate(blockStart.getDate() + 8); // Sunday next week
    blockEnd.setHours(23, 59, 59, 999);

    // Block requests within [Saturday ... next Sunday]
    if (requestDate >= blockStart && requestDate <= blockEnd) {
      alert("You cannot accept requests from tomorrow to next Sunday on Friday after 12 PM.");
      return;
    }
  }

  if (confirm("Are you sure you want to accept this request?")) {
    setIsAccepting(true);
    try {
      await acceptMutation.mutateAsync({
        id,
        isAccept: true,
        remark: "",
        mobileView: true,
      });
    } finally {
      setIsAccepting(false);
    }
  }
};



    // Handle reject request
    const handleReject = async (id: string) => {
        setRequestToReject(id);
        setShowRejectModal(true);
    };

    // Submit rejection with reason
    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please enter a rejection reason");
            return;
        }

        if (!requestToReject) return;

        setIsRejecting(true);
        try {
            await acceptMutation.mutateAsync({
                id: requestToReject,
                isAccept: false,
                remark: rejectionReason,
                mobileView: false
            });
            setShowRejectModal(false);
            setRejectionReason("");
            setRequestToReject(null);
        } finally {
            setIsRejecting(false);
        }
    };

    // Handle bulk actions
    const handleSelectAll = () => {
        if (selectedRequests.size === pendingRequests.length) {
            setSelectedRequests(new Set());
        } else {
            setSelectedRequests(new Set(pendingRequests.map(r => r.id)));
        }
    };

    const handleSelectRequest = (id: string) => {
        const newSelected = new Set(selectedRequests);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRequests(newSelected);
    };

//   const handleBulkAccept = async () => {
//   if (selectedRequests.size === 0) return;

//   if (!confirm(`Are you sure you want to forward ${selectedRequests.size} requests?`)) return;

//   setIsAccepting(true);
//   try {
//     for (const id of selectedRequests) {
//       await acceptMutation.mutateAsync({
//         id,
//         isAccept: true,
//         remark: "",
//         mobileView: true,
//       });
//     }
//     setSelectedRequests(new Set());
//     toast.success("All selected requests forwarded successfully!");
//   } catch (error) {
//     console.error("Error forwarding requests:", error);
//     toast.error("Some requests failed. Check logs.");
//   } finally {
//     setIsAccepting(false);
//   }
// };



// const handleBulkAccept = async () => {
//   if (selectedRequests.size === 0) return;

//   if (!confirm(`Are you sure you want to forward ${selectedRequests.size} requests?`)) return;

//   setIsAccepting(true);
//   try {
//     // Process all requests first
//     const promises = Array.from(selectedRequests).map(id => 
//       acceptMutation.mutateAsync({
//         id,
//         isAccept: true,
//         remark: "",
//         mobileView: true,
//       })
//     );
    
//     await Promise.all(promises);
    
//     // Clear selection
//     setSelectedRequests(new Set());
    
//     // Show success only once after all are done
//     setShowSuccessModal(`${selectedRequests.size} requests forwarded successfully!`);
//   } catch (error) {
//     console.error("Error forwarding requests:", error);
//     toast.error("Some requests failed. Check logs.");
//   } finally {
//     setIsAccepting(false);
//   }
// };
const handleBulkAccept = async () => {
  if (selectedRequests.size === 0) return;

  const now = new Date();
  const today = now.getDay(); // 5 = Friday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const isFridayAfterNoon = today === 5 && (hour > 12 || (hour === 12 && minute >= 0));

  // If it's Friday afternoon, we need to check each selected request
  if (isFridayAfterNoon) {
    // Define block period (Saturday to next Sunday)
    const blockStart = new Date(now);
    blockStart.setDate(now.getDate() + 1); // Saturday
    blockStart.setHours(0, 0, 0, 0);

    const blockEnd = new Date(blockStart);
    blockEnd.setDate(blockStart.getDate() + 8); // Sunday next week
    blockEnd.setHours(23, 59, 59, 999);

    // Check each selected request
    for (const id of selectedRequests) {
      const request = pendingRequests.find(r => r.id === id);
      if (!request) continue;
      
      const requestDate = new Date(request.date);
      const isUrgent = request.corridorType === "Urgent Block";

      // Block non-urgent requests within the weekend period
      if (!isUrgent && requestDate >= blockStart && requestDate <= blockEnd) {
        alert(`You cannot accept request ${request.divisionId || request.id} (${formatDate(request.date)}) because it falls within the weekend period (Saturday to next Sunday) on Friday after 12 PM.`);
        return;
      }
    }
  }

  if (!confirm(`Are you sure you want to forward ${selectedRequests.size} requests?`)) return;

  setIsAccepting(true);
  try {
    // Process all requests first
    const promises = Array.from(selectedRequests).map(id => 
      acceptMutation.mutateAsync({
        id,
        isAccept: true,
        remark: "",
        mobileView: true,
      })
    );
    
    await Promise.all(promises);
    
    // Clear selection
    setSelectedRequests(new Set());
    
    // Show success only once after all are done
    setShowSuccessModal(`${selectedRequests.size} requests forwarded successfully!`);
  } catch (error) {
    console.error("Error forwarding requests:", error);
    toast.error("Some requests failed. Check logs.");
  } finally {
    setIsAccepting(false);
  }
};
    const handleBulkReject = async () => {
        setRequestToReject('bulk');
        setShowRejectModal(true);
    };

    // Status mapping function for pending requests (same as main table)
    function getPendingDisplayStatus(request: UserRequest) {
        if (request.status === 'PENDING' && request.managerAcceptance === false) {
            return { label: 'Pending with me', style: { background: '#d47ed4', color: '#222' } };
        }
        // Fallback
        return { label: request.status, style: { background: '#fff', color: '#222' } };
    }

    // Format helpers
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd-MM-yy");
        } catch {
            return "Invalid date";
        }
    };
    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch {
            return "N/A";
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
        notFound();
    }

    // if (!isLoading && !error && pendingRequests.length === 0) {
    //     notFound();
    // }

    if (!isLoading && !error && pendingRequests.length === 0) {
    return (
        <div className="min-h-screen text-black bg-white p-3 border border-black flex flex-col items-center justify-center gap-4">
            <div className="text-center text-xl font-bold">No pending requests found</div>
            <Link 
                href="/manage/request-table" 
                className="bg-[#90EE90] px-8 py-2 rounded-[50%] border-2 border-black font-bold"
            >
                Back to Requests
            </Link>
        </div>
    );
}
    const handleDownloadExcel = async () => {
    try {
      if (!pendingRequests || pendingRequests.length === 0) {
        alert("No data available to download!");
        return;
      }

      // Import xlsx library dynamically to reduce bundle size
      const XLSX = await import("xlsx");

      // Define Excel headers
      const headers = [
        "Date",
        "Request ID",
        "Block Section",
        "Line/Road",
        "Activity",
        "Status",
        "Start Time (HH:MM)",
        "End Time (HH:MM)",
        "Corridor Type",
        "SSE Name",
        "Work Location",
        "Remarks",
      ];

      // Map data to Excel rows
      const rows = pendingRequests.map((request) => {
        // Function to get exact time as stored in DB
        const getExactTime = (dateString: string | null) => {
          if (!dateString) return "N/A";

          try {
            // Extract exactly what's after 'T' and before '.'
            const isoString = new Date(dateString).toISOString();
            const timePart = isoString.split("T")[1].split(".")[0];
            return timePart.substring(0, 5); // Get HH:MM
          } catch {
            return "N/A";
          }
        };

        return [
          formatDate(request.date),
          request.divisionId || request.id,
          request.missionBlock,
          request.processedLineSections?.[0]?.road ||
            request.processedLineSections?.[0]?.lineName,
          request.activity,
          request.status || "N/A", // Added status which was in headers but missing in rows
          getExactTime(request.demandTimeFrom),
          getExactTime(request.demandTimeTo),
          request.corridorType,
          request.user?.name || "N/A",
          request.workLocationFrom,
          request.requestremarks,
        ];
      });

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Block Requests");

      // Generate Excel file and trigger download
      const dateString = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `block_requests_${dateString}.xlsx`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate Excel file. Please check console for details.");
    }
  };

    return (
        <div className="min-h-screen bg-[#FFFDF5]">
            {/* Top Yellow Bar */}
            <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
                <span className="text-[9vw] min-[430px]:text-4xl  font-bold text-[#B57CF6] tracking-widest">
            RBMS-{session?.user?.location}-DIVN
                </span>
            </div>

            {/* Main Title on Light Blue */}
            <div className="w-full bg-[#D6F3FF] py-3 flex flex-col items-center border-b-2 border-black">
                <span className="text-2xl md:text-3xl font-bold text-black text-center">Requests Pending With Me</span>
            </div>

            {/* Department Name */}
            <div className="w-full bg-[#D6F3FF] py-2 flex flex-col items-center">
                <span className="text-xl font-bold text-black">{session?.user?.department || "..."} Controller</span>
            </div>

            {/* Bulk Actions */}
            <div className="mx-4 mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={selectedRequests.size === pendingRequests.length && pendingRequests.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#13529e] border-gray-300 rounded focus:ring-[#13529e]"
                        disabled={pendingRequests.length === 0}
                    />
                    <span className="text-sm text-gray-700">Select All</span>
                </div>
                {selectedRequests.size > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkAccept}
                            disabled={bulkAcceptRequests.isPending}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {bulkAcceptRequests.isPending ? "Processing..." : `Forward (${selectedRequests.size})`}
                        </button>
                        {/* <button
                            onClick={handleBulkReject}
                            disabled={bulkRejectRequests.isPending}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {bulkRejectRequests.isPending ? "Processing..." : `Return (${selectedRequests.size})`}
                        </button> */}
                    </div>
                )}
            </div>

            {/* Table Section */}
            <div className="mx-4 mt-6 overflow-x-auto">
                <div className={`rounded-xl overflow-hidden border-2 border-black bg-[#F5E7B2] min-w-[700px] ${showRejectModal || showSuccessModal ? 'invisible' : ''}`}>
                    <table className="w-full text-black text-base border-collapse">
                        <thead>
                            <tr className="bg-[#D6F3FF] text-black font-bold">
                                <th className="border-2 border-black px-2 py-2 w-10 bg-[#D6F3FF]">{/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedRequests.size === pendingRequests.length && pendingRequests.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-[#13529e] border-gray-300 rounded focus:ring-[#13529e]"
                                    />
                                </th>
                                <th className="border-2 border-black px-2 py-2 bg-[#D6F3FF]">Date</th>
                                <th className="border-2 border-black px-2 py-2 bg-[#D6F3FF]">ID</th>
                                <th className="border-2 border-black px-2 py-2 bg-[#D6F3FF]">Block Section</th>
                                <th className="border-2 border-black px-2 py-2 bg-[#D6F3FF]">Line</th>
                                <th className="border-2 border-black px-2 py-2 bg-[#D6F3FF]">Demanded</th>
                                <th className="border-2 border-black px-2 py-2 bg-[#D6F3FF]">Activity</th>
                                <th className="border-2 border-black px-2 py-2 sticky right-0 z-10 bg-[#D6F3FF] w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRequests.map((request: UserRequest) => (
                                <tr key={request.id} className="bg-white hover:bg-[#FFF86B] text-black">
                                    <td className="border border-black px-2 py-1 text-center align-middle">
                                        <input
                                            type="checkbox"
                                            checked={selectedRequests.has(request.id)}
                                            onChange={() => handleSelectRequest(request.id)}
                                            className="w-4 h-4 text-[#13529e] border-gray-300 rounded focus:ring-[#13529e]"
                                        />
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{formatDate(request.date)}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">
                                        <Link href={`/manage/view-request/${request.id}`} className="text-[#13529e] hover:underline font-semibold">
                                            {request.divisionId||request.id}
                                        </Link>
                                    </td>
                                    <td className="border border-black px-2 py-1 align-middle">{request.missionBlock}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{request.processedLineSections?.[0]?.lineName || 'N/A'}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{formatTime(request.demandTimeFrom)} - {formatTime(request.demandTimeTo)}</td>
                                    <td className="border border-black px-2 py-1 align-middle">{request.activity}</td>
                                    <td className="border border-black px-2 py-1 sticky right-0 z-10 bg-[#E6E6FA] text-center align-middle w-32">
                                        <div className="flex gap-2 justify-center flex-col md:flex-row">
                                            <button
                                                onClick={() => handleAccept(request.id, request.date, request.corridorType)}
                                                disabled={isAccepting || isRejecting}
                                                className="px-2 py-1 text-xs md:text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-bold"
                                            >
                                                {isAccepting ? "Accepting..." : "F"}
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                disabled={isAccepting || isRejecting}
                                                className="px-2 py-1 text-xs md:text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
                                            >
                                                {isRejecting ? "Rejecting..." : "R"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mx-4 mt-6 mb-8 flex justify-center gap-4">
                <button  onClick={handleDownloadExcel} className="bg-[#FFA07A] px-8 py-2 rounded-[50%] border-2 border-black font-bold">
                    Download
                </button>
                <Link href="/manage/request-table" className="bg-[#90EE90] px-8 py-2 rounded-[50%] border-2 border-black font-bold">
                    Back
                </Link>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 text-black " >Reason{requestToReject === 'bulk' ? 's' : ''}</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason"
                            className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
                            rows={4}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                    setRequestToReject(null);
                                }}
                                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={isRejecting}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {isRejecting ? "Submitting..." : "Return"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-xs w-full flex flex-col items-center">
                        <div className="text-lg font-bold mb-4 text-center">{showSuccessModal}</div>
                        <button
                            onClick={() => setShowSuccessModal(null)}
                            className="px-6 py-2 text-base bg-green-600 text-white rounded hover:bg-green-700 mt-2 font-bold"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )} */}
            {showSuccessModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg p-6 max-w-xs w-full flex flex-col items-center">
      <div className="text-lg font-bold mb-4 text-center text-black">{showSuccessModal}</div>
      <button
        onClick={() => setShowSuccessModal(null)}
        className="px-6 py-2 text-base bg-green-600 text-white rounded hover:bg-green-700 mt-2 font-bold"
      >
        OK
      </button>
    </div>
  </div>
)}
        </div>
    );
}