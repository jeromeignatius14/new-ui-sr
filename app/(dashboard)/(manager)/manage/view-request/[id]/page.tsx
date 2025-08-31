"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService } from "@/app/service/api/manager";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useState } from "react";

export default function ViewRequestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Get the source page from URL parameter or default to request-table
  const sourcePage = searchParams.get('from') || 'request-table';

  // Get the date parameter or use the request's date
  const getBackUrl = (request: any) => {
    const date = format(new Date(request.date), 'yyyy-MM-dd');
    switch (sourcePage) {
      case 'sanction-table':
        return `/manage/sanction-table?date=${date}`;
      case 'optimised-table':
        return `/manage/optimised-table?date=${date}`;
      default:
        return `/manage/request-table?date=${date}`;
    }
  };

  // Fetch request data
  const { data, isLoading, error } = useQuery({
    queryKey: ["request", id],
    queryFn: () => managerService.getUserRequestById(id),
  });

  // Accept request mutation
  // const acceptMutation = useMutation({
  //   mutationFn: () => managerService.acceptUserRequest(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["request", id] });
  //     queryClient.invalidateQueries({ queryKey: ["requests"] });
  //     alert("Request accepted successfully");
  //     router.push("/manage/request-table");
  //   },
  //   onError: (error) => {
  //     console.error("Failed to accept request:", error);
  //     alert("Failed to accept request. Please try again.");
  //   },
  // });
  // const acceptMutation = useMutation({
  //   mutationFn: (isAccept: boolean) => 
  //     managerService.acceptUserRequest(id, isAccept),  // Pass the decision to the API
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["request", id] });
  //     queryClient.invalidateQueries({ queryKey: ["requests"] });
  //     alert("Request processed successfully");
  //     router.push("/manage/request-table");
  //   },
  //   onError: (error) => {
  //     console.error("Failed to process request:", error);
  //     alert("Failed to process request. Please try again.");
  //   },
  // });
  const acceptMutation = useMutation({
    mutationFn: ({ isAccept, remark,mobileView }: { isAccept: boolean; remark?: string;mobileView:boolean }) =>
      managerService.acceptUserRequest(id, isAccept, remark,mobileView),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      alert(`Request ${isAccepting ? "accepted" : "rejected"} successfully`);
      router.push("/manage/request-table");
    },
    onError: (error) => {
      console.error("Failed to process request:", error);
      alert("Failed to process request. Please try again.");
    },
  });
  // Format date and time
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm");
    } catch {
      return "Invalid time";
    }
  };

  // Handle accept request
  // const handleAccept = async () => {
  //   if (confirm("Are you sure you want to accept this request?")) {
  //     setIsAccepting(true);
  //     try {
  //       await acceptMutation.mutateAsync();
  //     } finally {
  //       setIsAccepting(false);
  //     }
  //   }
  // };

  // Handle accept or reject request
  // const handleAcceptReject = async (isAccept: boolean) => {
  //   const action = isAccept ? "accept" : "reject";
  //   if (confirm(`Are you sure you want to ${action} this request?`)) {
  //     if (isAccept) {
  //       setIsAccepting(true);
  //     } else {
  //       setIsRejecting(true);
  //     }
  //     try {
  //       await acceptMutation.mutateAsync(isAccept);
  //     } finally {
  //       if (isAccept) {
  //         setIsAccepting(false);
  //       } else {
  //         setIsRejecting(false);
  //       }
  //     }
  //   }
  // };
  // Handle accept request
  const handleAccept = async () => {
    if (confirm("Are you sure you want to accept this request?")) {
      setIsAccepting(true);
      try {
        await acceptMutation.mutateAsync({ isAccept: true,mobileView:true });
      } finally {
        setIsAccepting(false);
      }
    }
  };

  // Handle reject request with reason
  const handleReject = async () => {
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    setIsRejecting(true);
    try {
      await acceptMutation.mutateAsync({
        isAccept: false,
        remark: rejectionReason,
        mobileView:false
      });
    } finally {
      setIsRejecting(false);
      setShowRejectModal(false);
      setRejectionReason("");
    }
  };


  // Status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border border-black";
      case "REJECTED":
        return "bg-red-100 text-red-800 border border-black";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800 border border-black";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen text-black bg-white p-3 border border-black flex items-center justify-center">
        <div className="text-center py-5">Loading approved requests...</div>
      </div>
    );
  }

  if (error) {
    router.push('/auth/login');
    // return (
    //   <div className="min-h-screen bg-white p-3 border border-black flex items-center justify-center">
    //     <div className="text-center py-5 text-red-600">
    //       Error loading approved requests. Please try again.
    //     </div>
    //   </div>
    // );
  }

  const request = data?.data;

  if (!request) {
    return (
      <div className="bg-white p-3 border border-black mb-3">
        <div className="text-center py-5">Request not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 border border-black mb-3 text-black">
      {showRejectModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Enter Rejection Reason</h2>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows={4}
              placeholder="Please specify the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={isRejecting}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              >
                {isRejecting ? "Submitting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">
          Block Details
        </h1>
        <div className="flex gap-2">
          <button
            // href={data?.data ? getBackUrl(data.data) : '/manage/request-table'}
            onClick={() => window.history.back()}
  className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black flex items-center gap-1"

          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
            Back
          </button>{request.status === "PENDING" && !request.managerAcceptance && (
            <>
              <button
                onClick={handleAccept}  // Accept
                disabled={isAccepting || isRejecting}
                className="px-3 py-1 text-sm bg-[#13529e] text-white border border-black disabled:opacity-50"
              >
                {isAccepting ? "Accepting..." : "Accept Request"}
              </button>
              <button
                onClick={handleReject}  // Reject
                disabled={isAccepting || isRejecting}
                className="px-3 py-1 text-sm bg-red-600 text-white border border-black disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Delete/Cancel"}
              </button>
            </>
          )}

        </div>
      </div>

      <div className="mb-4 px-2 py-1 inline-block">
        <span
          className={`px-2 py-0.5 text-xl font-medium ${getStatusBadgeClass(
            request.managerAcceptance ? "APPROVED" : "PENDING"
          )}`}
        >
          Status: {request.managerAcceptance ? "APPROVED" : "PENDING"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border border-black p-3">
          <h2 className="text-[24px] font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Request Information
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-medium text-[18px]">Request ID:</td>
                <td className="py-1">{request.id}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Date:</td>
                <td className="py-1">{formatDate(request.date)}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Created Date:</td>
                <td className="py-1">{formatDate(request.createdAt)}</td>
              </tr>
               <tr>
                <td className="py-1 font-medium">Created Time:</td>
                <td className="py-1">{formatTime(request.createdAt)}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Requested By:</td>
                <td className="py-1">{request.user.name}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Department:</td>
                <td className="py-1">{request.selectedDepartment}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Section:</td>
                <td className="py-1">{request.selectedSection}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Request Type:</td>
                <td className="py-1">{request.corridorType}</td>
              </tr>
              {/* <tr>
                <td className="py-1 font-medium text-[18px]">Depot:</td>
                <td className="py-1">{request.selectedDepo}</td>
              </tr> */}
            </tbody>
          </table>
        </div>

        <div className="border border-black p-3">
          <h2 className="text-[24px] font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Work Details
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-medium text-[18px]">Work Type:</td>
                <td className="py-1">{request.workType}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Activity:</td>
                <td className="py-1">{request.activity}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Time:</td>
                {/* <td className="py-1">
                  {formatTime(request.demandTimeFrom)} to{" "}
                  {formatTime(request.demandTimeTo)}
                </td> */}
                <td className="py-1">
                  {request.demandTimeFrom && request.demandTimeTo
                    ? `${new Date(request.demandTimeFrom).toISOString().substring(11, 16)} to ${new Date(request.demandTimeTo).toISOString().substring(11, 16)}`
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium text-[18px]">Block Section:</td>
                <td className="py-1">{request.missionBlock}</td>
              </tr>
              {request.workLocationFrom ? (
                <tr>
                  <td className="py-1 font-medium text-[18px]">Work Location:</td>
                  <td className="py-1">
                    {request.workLocationFrom}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {request.processedLineSections &&
        request.processedLineSections.length > 0 && (
          <div className="border border-black p-3 mb-4">
            <h2 className="text-[24px] font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
              Block Sections Detail
            </h2>
            {/* <div className="space-y-3">
              {request.processedLineSections.map((section, index) => (
                <div key={index} className="border border-gray-200 p-2">
                  <h3 className="font-medium text-[#13529e] text-[18px]">
                    {section.block}
                  </h3>
                  {section.type === "line"|| section.type==="regular" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[18px]">Line:</span>
                        <div className="py-1">{section.lineName || "N/A"}</div>
                      </div>
                      {section.otherLines && (
                        <div >
                          <span className="text-[18px] font-medium">
                            Other Lines Affected:
                          </span>
                          <div className="py-1">{section.otherLines}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[18px] font-medium">Stream:</span>
                        <div className="py-1">{section.stream || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-[18px] font-medium">Road:</span>
                        <div className="py-1">{section.road || "N/A"}</div>
                      </div>
                      {section.otherRoads && (
                        <div className="col-span-2">
                          <span className="text-[18px] font-medium">
                            Other Roads Affected:
                          </span>
                          <div className="py-1">{section.otherRoads}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div> */}
                  <div className="space-y-3">
        {request.processedLineSections.map((section, index) => (
          <div key={index} className="border border-gray-200 p-2">
            <h3 className="font-medium text-[#13529e]">
              {section.block}
            </h3>
            {section.type === "line" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-medium">Line:</span>
                  <div className="py-1">{section.lineName || "N/A"}</div>
                </div>
                {section.otherLines && (
                  <div>
                    <span className="text-xs font-medium">
                      Other Lines Affected:
                    </span>
                    <div className="py-1">{section.otherLines}</div>
                  </div>
                )}
              </div>
            ) : section.type === "yard" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-medium">Road:</span>
                  <div className="py-1">{section.road || "N/A"}</div>
                </div>
                {section.otherRoads && (
                  <div className="col-span-2">
                    <span className="text-xs font-medium">
                      Other Roads Affected:
                    </span>
                    <div className="py-1">{section.otherRoads}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-medium">Stream:</span>
                  <div className="py-1">{section.stream || "N/A"}</div>
                </div>
                <div>
                  <span className="text-xs font-medium">Road:</span>
                  <div className="py-1">{section.road || "N/A"}</div>
                </div>
                {section.otherRoads && (
                  <div className="col-span-2">
                    <span className="text-xs font-medium">
                      Other Roads Affected:
                    </span>
                    <div className="py-1">{section.otherRoads}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
          </div>
        )}
        {request.emergencyBlockRemarks && (
        <div className="border border-black p-3 mb-4">
           <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
           {request.corridorType==="Urgent Block"?"Emergency Block Remarks":"Non-corridor Block Remarks"} 
          </h2>
          <div className="py-1">{request.emergencyBlockRemarks}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border border-black p-3">
          <h2 className="text-[24px] font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            System Disconnections
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-[18px]">Power Block Required:</td>
                <td className="py-1">
                  {request?.powerBlockRequired && request.powerBlockRequired
                    ? "Yes"
                    : "No"}
                </td>
              </tr>
              {request.powerBlockRequired && request.powerBlockRequirements && (
                <tr>
                  <td className="py-1 text-[18px]">Power Block Details:</td>
                  <td className="py-1">
                    {request.powerBlockRequirements?.join(", ") || "N/A"}
                  </td>
                </tr>
              )}
                <tr>
                <td className="py-1 font-medium">
                  Selected Depot For Power Block:
                </td>
                <td className="py-1">
                  {request.powerBlockDisconnectionAssignTo ||
                    "N/A"}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-[18px]">Elementary Section:</td>
                <td className="py-1">{request.elementarySection}</td>
              </tr>

              <tr>
                <td className="py-1 text-[18px]">
                  S&T Disconnection Required:
                </td>
                <td className="py-1">
                  {request.sntDisconnectionRequired ? "Yes" : "No"}
                </td>
              </tr>
              {request.sntDisconnectionRequired &&
                request.sntDisconnectionRequirements && (
                  <tr>
                    <td className="py-1 text-[18px]">
                      S&T Disconnection Details:
                    </td>
                    <td className="py-1">
                      {request.sntDisconnectionRequirements?.join(", ") ||
                        "N/A"}
                    </td>
                  </tr>
                )}
              <tr>
                 <tr>
                <td className="py-1 font-medium">
                  Selected Depot For S&T Disconnection:
                </td>
                <td className="py-1">
                  {request.sntDisconnectionAssignTo ||
                    "N/A"}
                </td>
              </tr>
           
              </tr>
              {request.sntDisconnectionLineFrom && request.sntDisconnectionLineTo && (
                 <tr>
                <td className="py-1 font-medium">S&T Lines:</td>
                <td className="py-1">
                  {request.sntDisconnectionLineFrom && request.sntDisconnectionLineTo
                    ? `${request.sntDisconnectionLineFrom} to ${request.sntDisconnectionLineTo}`
                    : "-"}
                </td>
              </tr>
              )}
              {request.sigDisconnection && request.sntDisconnectionRequired && (
                <tr>
                  <td className="py-1 text-[18px]">
                    Signal Disconnection Details:
                  </td>
                  <td className="py-1">
                    {request.sntDisconnectionRequired || "N/A"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border border-black p-3">
          <h2 className="text-[24px] font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Safety & Additional Information
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-[18px]">Fresh Caution Required:</td>
                <td className="py-1">
                  {request.freshCautionRequired ? "Yes" : "No"}
                </td>
              </tr>
              {request.freshCautionRequired && (
                <>
                  <tr>
                    <td className="py-1 text-[18px]">Caution Speed:</td>
                    <td className="py-1">{request.freshCautionSpeed} km/h</td>
                  </tr>
                              {request.freshCautionLocationFrom && request.freshCautionLocationTo && (
  <tr>
    <td className="py-1 font-medium">Caution Location:</td>
    <td className="py-1">
      {request.freshCautionLocationFrom.split(",")
        .map((fromVal: string, idx: number) => {
          const toVals = (request.freshCautionLocationTo ?? "").split(",");
          return `(${fromVal},${toVals[idx] || ""})`;
        })
        .join(",")}
    </td>
  </tr>
)}
                </>
              )}
              <tr>
                <td className="py-1 text-[18px]">Adjacent lines affected:</td>
                <td className="py-1">{request.adjacentLinesAffected}</td>
              </tr>
              {request.repercussions && (
                <tr>
                  <td className="py-1 text-[18px]">Repercussions:</td>
                  <td className="py-1">{request.repercussions}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* {request.requestremarks && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Remarks
          </h2>
          <p className="text-sm">{request.requestremarks}</p>
        </div>
      )} */}

 <div className="border border-black p-3 mb-4">
          <h2 className="text-[24px] font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Remarks
          </h2>
          {/* <p className="text-sm">{request.requestremarks}</p> */}
          <p className="text-[18px]">
  {request.requestremarks?.trim() ? request.requestremarks : "Nil"}
</p>

        </div>
        {request.status !== "PENDING" && request.ManagerResponse && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Manager Response
          </h2>
          <p className="text-sm">{request.ManagerResponse}</p>
        </div>
      )}
      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1 text-right">
        © {new Date().getFullYear()} Indian Railways
      </div>
    </div>
  );
}