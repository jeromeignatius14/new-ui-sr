"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { managerService } from "@/app/service/api/manager";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useAcceptUserRequest } from "@/app/service/mutation/admin";

export default function ViewRequestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isProcessing, setIsProcessing] = useState(false);
  const acceptMutation = useAcceptUserRequest();

  // Get the source page from URL parameter or default to optimise-table
  const sourcePage = searchParams.get('from') || 'optimise-table';

  // Fetch request data
  const { data, isLoading, error } = useQuery({
    queryKey: ["request", id],
    queryFn: () => managerService.getUserRequestById(id),
  });

  // Format date and time
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return "Invalid time";

    try {
      // Handle both full ISO strings and time-only strings
      const timePart = dateString.includes('T')
        ? dateString.split('T')[1]
        : dateString;

      // Extract just the hours and minutes
      const [hours, minutes] = timePart.split(':');
      return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0').substring(0, 2)}`;
    } catch {
      return "Invalid time";
    }
  };

  // Handle accept/reject request
  const handleRequestAction = async (accept: boolean) => {
    if (
      confirm(
        `Are you sure you want to ${accept ? "approve" : "reject"
        } this request?`
      )
    ) {
      setIsProcessing(true);
      try {
        await acceptMutation.mutateAsync({ id, accept });
        alert(`Request ${accept ? "approved" : "rejected"} successfully`);
        router.push("/admin/request-table");
      } catch (error) {
        console.error("Failed to process request:", error);
        alert("Failed to process request. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACCEPTED":
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
    return null;
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
      <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">
          Block Details
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {request.adminRequestStatus === "PENDING" && (
            <button
              onClick={() => handleRequestAction(false)}
              disabled={isProcessing}
              className="px-3 py-1 text-sm bg-red-600 text-white border border-black disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Delete/Cancel"}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 px-2 py-1 inline-block">
        <span
          className={`px-2 py-0.5 text-sm ${getStatusBadgeClass(
            request.adminRequestStatus
          )}`}
        >
          Status: {request.adminRequestStatus}
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
                    {request.workLocationFrom && request.workLocationTo
                      ? `${request.workLocationFrom} to ${request.workLocationTo}`
                      : `${request.workLocationFrom}`}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {(request as any).processedLineSections &&
        (request as any).processedLineSections.length > 0 && (
          <div className="border border-black p-3 mb-4">
            <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
              Block Sections Detail
            </h2>
            <div className="space-y-3">
              {(request as any).processedLineSections.map((section: any, index: number) => (
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
                      {section.stream && (<div>
                        <span className="text-xs font-medium">Stream:</span>
                        <div className="py-1">{section.stream || "N/A"}</div>
                      </div>)}
                      {section.road && (<div>
                        <span className="text-xs font-medium">Road:</span>
                        <div className="py-1">{section.road || "N/A"}</div>
                      </div>)}

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

      {(request as any).emergencyBlockRemarks && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Emergency Block Remarks
          </h2>
          <div className="py-1">{(request as any).emergencyBlockRemarks}</div>
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
              {request.powerBlockRequired && (request as any).powerBlockRequirements && (
                <tr>
                  <td className="py-1 font-medium">Power Block Details:</td>
                  <td className="py-1">
                    {Array.isArray((request as any).powerBlockRequirements) 
                      ? (request as any).powerBlockRequirements.join(", ") 
                      : (request as any).powerBlockRequirements || "N/A"}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-1 font-medium">
                  SelectedDepot For Power Block:
                </td>
                <td className="py-1">
                  {(request as any).powerBlockDisconnectionAssignTo || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Elementary Section:</td>
                <td className="py-1">
                  {(request as any).elementarySection || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">
                  S&T Disconnection Required:
                </td>
                <td className="py-1">
                  {request.sntDisconnectionRequired ? "Yes" : "No"}
                </td>
              </tr>
              {request.sntDisconnectionRequired &&
                (request as any).sntDisconnectionRequirements && (
                  <tr>
                    <td className="py-1 font-medium">
                      S&T Disconnection Details:
                    </td>
                    <td className="py-1">
                      {Array.isArray((request as any).sntDisconnectionRequirements)
                        ? (request as any).sntDisconnectionRequirements.join(", ")
                        : (request as any).sntDisconnectionRequirements || "N/A"}
                    </td>
                  </tr>
                )}
              <tr>
                <td className="py-1 font-medium">
                  SelectedDepot For S&T Disconnection:
                </td>
                <td className="py-1">
                  {(request as any).sntDisconnectionAssignTo || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">S&T Lines:</td>
                <td className="py-1">
                  {(request as any).sntDisconnectionLineFrom && (request as any).sntDisconnectionLineTo
                    ? `${(request as any).sntDisconnectionLineFrom} to ${(request as any).sntDisconnectionLineTo}`
                    : "-"}
                </td>
              </tr>
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
                  {(request as any).freshCautionRequired ? "Yes" : "No"}
                </td>
              </tr>
              {(request as any).freshCautionRequired && (
                <>
                  <tr>
                    <td className="py-1 font-medium">Caution Speed:</td>
                    <td className="py-1">{(request as any).freshCautionSpeed} km/h</td>
                  </tr>
                  {(request as any).freshCautionLocationFrom && (
                    <tr>
                      <td className="py-1 font-medium">Caution Location:</td>
                      <td className="py-1">
                        {(request as any).freshCautionLocationFrom} to{" "}
                        {(request as any).freshCautionLocationTo}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-1 font-medium">Adjacent lines affected:</td>
                    <td className="py-1">
                      {(request as any).adjacentLinesAffected}
                    </td>
                  </tr>
                </>
              )}
              {(request as any).repercussions && (
                <tr>
                  <td className="py-1 font-medium">Repercussions:</td>
                  <td className="py-1">{(request as any).repercussions}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(request as any).requestremarks && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Remarks
          </h2>
          <p className="text-sm">{(request as any).requestremarks}</p>
        </div>
      )}

      {request.adminRequestStatus !== "PENDING" && (request as any).ManagerResponse && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Manager Response
          </h2>
          <p className="text-sm">{(request as any).ManagerResponse}</p>
        </div>
      )}

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1">
        © {new Date().getFullYear()} Indian Railways. All Rights Reserved.
      </div>
    </div>
  );
}