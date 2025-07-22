"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userRequestService } from "@/app/service/api/user-request";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useUpdateOtherRequest } from "@/app/service/mutation/user-request";
import { useState } from "react";

export default function ViewRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

  // Fetch request data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["request", id],
    queryFn: () => userRequestService.getById(id),
  });

  // Update other request mutation
  const { mutate: updateOtherRequest, isPending: isMutating } = useUpdateOtherRequest();

  // Handle accept/reject request
  const handleRequestAction = (accept: boolean) => {
    if (accept) {
      updateOtherRequest(
        { id, accept },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    } else {
      // Show rejection dialog
      setShowRejectDialog(true);
    }
  };

  // Handle confirm rejection with remarks
  const handleConfirmReject = () => {
    if (!rejectRemarks.trim()) {
      alert("Please provide rejection remarks");
      return;
    }

    updateOtherRequest(
      {
        id,
        accept: false,
        disconnectionRequestRejectRemarks: rejectRemarks,
      },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectRemarks("");
          refetch();
        },
      }
    );
  };

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

  // Status badge class
  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border border-black";
      case "REJECTED":
        return "bg-red-100 text-red-800 border border-black";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800 border border-black";
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

  // Get block sections from missionBlock
  const blockSections = request.missionBlock
    ? request.missionBlock.split(",")
    : [];

  return (
    <div className="bg-white p-3 border border-black mb-3 text-black">
      <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">
          Block Request Details
        </h1>
        <div className="flex gap-2">
          <Link
            href="/other-requests"
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black"
          >
            Back 
          </Link>
          {request.DisconnAcceptance === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleRequestAction(true)}
                disabled={isMutating}
                className="px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-700 rounded hover:bg-green-100 disabled:opacity-50"
              >
                {isMutating ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleRequestAction(false)}
                disabled={isMutating}
                className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-700 rounded hover:bg-red-100 disabled:opacity-50"
              >
                {isMutating ? "Processing..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md max-w-md w-full">
            <h3 className="text-lg font-medium mb-3 text-black">Rejection Remarks</h3>
            <p className="text-sm text-gray-600 mb-3">
              Please provide a reason for rejecting this request.
            </p>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-3 text-black"
              placeholder="Enter rejection remarks"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectRemarks("");
                }}
                className="px-3 py-1 text-sm bg-gray-50 text-gray-700 border border-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-700 rounded"
                disabled={!rejectRemarks.trim() || isMutating}
              >
                {isMutating ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 px-2 py-1 inline-block">
        <span
          className={`px-2 py-0.5 text-sm ${getStatusBadgeClass(
            request.DisconnAcceptance
          )}`}
        >
          Status: {request.DisconnAcceptance}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border border-black p-3">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Request Information
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-medium">Request ID:</td>
                <td className="py-1">{request.id}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Date:</td>
                <td className="py-1">{formatDate(request.date)}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Created:</td>
                <td className="py-1">{formatDate(request.createdAt)}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Requested By:</td>
                <td className="py-1">{request.user.name}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Department:</td>
                <td className="py-1">{request.selectedDepartment}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Section:</td>
                <td className="py-1">{request.selectedSection}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Depot:</td>
                <td className="py-1">{request.selectedDepo}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border border-black p-3">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Work Details
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-medium">Work Type:</td>
                <td className="py-1">{request.workType}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Activity:</td>
                <td className="py-1">{request.activity}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Time:</td>
                <td className="py-1">
                  {formatTime(request.demandTimeFrom)} to{" "}
                  {formatTime(request.demandTimeTo)}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Block Section:</td>
                <td className="py-1">{request.missionBlock}</td>
              </tr>
              {request.workLocationFrom ? (
                <tr>
                  <td className="py-1 font-medium">Work Location:</td>
                  <td className="py-1">
                    {request.workLocationFrom} to {request.workLocationTo}
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
            <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
              Block Sections Detail
            </h2>
            <div className="space-y-3">
              {request.processedLineSections.map((section, index) => (
                <div key={index} className="border border-gray-200 p-2">
                  <h3 className="font-medium text-[#13529e]">
                    {section.block}
                  </h3>
                  {section.type === "regular" ? (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border border-black p-3">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            System Disconnections
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-medium">Power Block Required:</td>
                <td className="py-1">
                  {request.powerBlockRequired ? "Yes" : "No"}
                </td>
              </tr>
              {request.powerBlockRequired && request.powerBlockRequirements && (
                <tr>
                  <td className="py-1 font-medium">Power Block Details:</td>
                  <td className="py-1">
                    {request.powerBlockRequirements?.join(", ") || "N/A"}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-1 font-medium">
                  S&T Disconnection Required:
                </td>
                <td className="py-1">
                  {request.sntDisconnectionRequired ? "Yes" : "No"}
                </td>
              </tr>
              {request.sntDisconnectionRequired &&
                request.sntDisconnectionRequirements && (
                  <tr>
                    <td className="py-1 font-medium">
                      S&T Disconnection Details:
                    </td>
                    <td className="py-1">
                      {request.sntDisconnectionRequirements?.join(", ") ||
                        "N/A"}
                    </td>
                  </tr>
                )}
              <tr>
                <td className="py-1 font-medium">Signal Disconnection:</td>
                <td className="py-1">
                  {request.sigDisconnection ? "Yes" : "No"}
                </td>
              </tr>
              {request.sigDisconnection &&
                request.sigDisconnectionRequirements && (
                  <tr>
                    <td className="py-1 font-medium">
                      Signal Disconnection Details:
                    </td>
                    <td className="py-1">
                      {request.sigDisconnectionRequirements || "N/A"}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="border border-black p-3">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Safety & Additional Information
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-medium">Fresh Caution Required:</td>
                <td className="py-1">
                  {request.freshCautionRequired ? "Yes" : "No"}
                </td>
              </tr>
              {request.freshCautionRequired && (
                <>
                  <tr>
                    <td className="py-1 font-medium">Caution Speed:</td>
                    <td className="py-1">{request.freshCautionSpeed} km/h</td>
                  </tr>
                  {request.freshCautionLocationFrom && (
                    <tr>
                      <td className="py-1 font-medium">Caution Location:</td>
                      <td className="py-1">
                        {request.freshCautionLocationFrom} to{" "}
                        {request.freshCautionLocationTo}
                      </td>
                    </tr>
                  )}
                </>
              )}
              {request.repercussions && (
                <tr>
                  <td className="py-1 font-medium">Repercussions:</td>
                  <td className="py-1">{request.repercussions}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {request.requestremarks && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Remarks
          </h2>
          <p className="text-sm">{request.requestremarks}</p>
        </div>
      )}

      {request.status !== "PENDING" && request.ManagerResponse && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Manager Response
          </h2>
          <p className="text-sm">{request.ManagerResponse}</p>
        </div>
      )}

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1">
        © {new Date().getFullYear()} Indian Railways. All Rights Reserved.
      </div>
    </div>
  );
}
