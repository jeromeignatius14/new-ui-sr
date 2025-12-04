"use client";
import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userRequestService } from "@/app/service/api/user-request";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useState } from "react";

export default function ViewRequest() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);

  const sourcePage = searchParams.get("from") || "request-table";

  const getBackUrl = (request: any) => {
    const date = format(new Date(request.date), "yyyy-MM-dd");
    switch (sourcePage) {
      case "other-requests":
        return `/other-requests?date=${date}`;
      default:
        return `/request-table?date=${date}`;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["request", id],
    queryFn: () => userRequestService.getById(id),
  });

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const timePart = dateString.includes("T")
        ? dateString.split("T")[1]
        : dateString;
      const [hours, minutes] = timePart.split(":");
      return `${hours.padStart(2, "0")}:${(minutes || "00")
        .padStart(2, "0")
        .substring(0, 2)}`;
    } catch {
      return "Invalid time";
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this request?")) {
      setIsDeleting(true);
      try {
        await userRequestService.delete(id);
        alert("Request deleted successfully");
        router.push("/request-table");
      } catch (error) {
        console.error("Failed to delete request:", error);
        alert("Failed to delete request. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusBadgeClass = (overAllStatus: string|String) => {
    if (request && isAvailedTimeExceeded(request)) {
    return "bg-red-100 text-red-800 border border-black";
  }
    switch (overAllStatus) {
      case "Sanctioned and Accepted by SSE":
        return "bg-green-100 text-green-800 border border-black";
      case "Sanctioned and Rejected by SSE":
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
    router.push("/auth/login");
  }

  const request = data?.data;

  if (!request) {
    return (
      <div className="bg-white p-3 border border-black mb-3">
        <div className="text-center py-5">Request not found</div>
      </div>
    );
  }

  const blockSections = request.missionBlock
    ? request.missionBlock.split(",")
    : [];

    console.log("Request Data:", request);
    
    const calculateDuration = (fromTime: string, toTime: string): number => {
  if (!fromTime || !toTime) return 0;
  
  try {
    const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
    const [toHours, toMinutes] = toTime.split(':').map(Number);
    
    const fromTotalMinutes = fromHours * 60 + (fromMinutes || 0);
    const toTotalMinutes = toHours * 60 + (toMinutes || 0);
    
    return toTotalMinutes - fromTotalMinutes;
  } catch {
    return 0;
  }
};
const isAvailedTimeExceeded = (request: any): boolean => {
  if (!request.AvailedTimeFrom || !request.AvailedTimeTo || 
      !request.grantedFromTime || !request.grantedToTime) {
    return false;
  }
  
  // Format times first to ensure consistent format
  const availedFrom = formatTime(request.AvailedTimeFrom);
  const availedTo = formatTime(request.AvailedTimeTo);
  const grantedFrom = formatTime(request.grantedFromTime);
  const grantedTo = formatTime(request.grantedToTime);
  
  const availedDuration = calculateDuration(availedFrom, availedTo);
  const grantedDuration = calculateDuration(grantedFrom, grantedTo);
  
  return availedDuration > grantedDuration;
};
const getSanctionStatus = (block:any) => {
  // 1) Sanctioned → Pending with SSE
  if (
block.overAllStatus==="Sanctioned, Pending with SSE For Acceptance"
  ) {
    return "Sanctioned, Pending with SSE For Acceptance";
  }

  // 2) Accepted by SSE
  if (
    block.overAllStatus === "Sanctioned and Accepted by SSE"
  ) {
    return "Sanctioned and Accepted by SSE";
  }

  // 3) Rejected by SSE
  if (

    block.overAllStatus === "Sanctioned and Rejected by SSE"
  ) {
    return "Sanctioned and Rejected by SSE";
  }

  // 4) fallback — DO NOT use overAllStatus (as you said)
  return  block.overAllStatus || "N/A";
};


  return (
    <div className="bg-white p-3 border border-black mb-3 text-black">
      <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">Block Details</h1>
        <div className="flex gap-2">
          {/* <Link
            href={data?.data ? getBackUrl(data.data) : '/request-table'}
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black"
          >
            Back
          </Link> */}
          <button
            onClick={() => window.history.back()}
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {request.status === "PENDING" && (
            <>
              <Link
                href={`/edit-request/${id}`}
                className="px-3 py-1 text-sm bg-[#13529e] text-white border border-black"
              >
                Edit Request
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 text-sm bg-[#f94449] text-white border border-black disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Reject/Cancel"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 px-2 py-1 inline-block">
        <span
  className={`px-2 py-0.5 text-sm ${
    isAvailedTimeExceeded(request) 
      ? 'bg-red-100 text-red-800 border border-black' 
      : getStatusBadgeClass(request.overAllStatus)
  }`}
>
  Status: {isAvailedTimeExceeded(request) ? 'BLOCK BURST' : getSanctionStatus(request)}
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
                <td className="py-1">{request.divisionId || request.id}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Date:</td>
                <td className="py-1">{formatDate(request.date)}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Created Date:</td>
                <td className="py-1"> {request.createdAt.split(/[T ]/)[0].split("-").reverse().join("-")}</td>
                
              </tr>
              <tr>
                <td className="py-1 font-medium">Created Time:</td>
                <td className="py-1">{formatTime(request.createdAt)}</td>
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
                <td className="py-1 font-medium ">Request Type:</td>
                <td className="py-1">{request.corridorType}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium ">Manager Acceptance Date:</td>
                <td className="py-1">
                  {request.managerResponseTiming
                    ? request.managerResponseTiming.split(/[T ]/)[0].split("-").reverse().join("-")
                    : "N/A"}
                </td>
              </tr>
                   <tr>
                <td className="py-1 font-medium ">Manager Acceptance Time:</td>
                <td className="py-1">
                  {formatTime(request.managerResponseTiming ?? "")}
                </td>
              </tr>
              {/* <tr>
                <td className="py-1 font-medium">Depot:</td>
                <td className="py-1">{request.selectedDepo}</td>
              </tr> */}
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
                <td className="py-1 font-medium">Requested Time:</td>
                <td className="py-1">
                  {formatTime(request.demandTimeFrom)} to{" "}
                  {formatTime(request.demandTimeTo)}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Sanctioned Time:</td>
                <td className="py-1">
                  {request.sanctionedTimeFrom && request.sanctionedTimeTo ? (
                    `${formatTime(request.sanctionedTimeFrom)} to ${formatTime(request.sanctionedTimeTo)}`
                  ) : (
                    "Not yet sanctioned"
                  )}
                </td>
              </tr>
             <tr >
  <td className="py-1 font-medium">Availed Time:</td>
  <td className={"py-1"}>
   {request.AvailedTimeFrom && request.AvailedTimeTo ? (
      <span className={isAvailedTimeExceeded(request) ? 'bg-red-300' : ''}>
        {formatTime(request.AvailedTimeFrom)} to {formatTime(request.AvailedTimeTo)}
      </span>
    ) : (
      "N/A"
    )}
  </td>
</tr>
<tr>
  <td className="py-1 font-medium">Granted Time:</td>
  <td className="py-1">
    {request.grantedFromTime && request.grantedToTime ? (
      `${formatTime(request.grantedFromTime)} to ${formatTime(request.grantedToTime)}`
    ) : (
      "N/A"
    )}
  </td>
</tr>

               <tr>
                <td className="py-1 font-medium">S&T Availed Time:</td>
                <td className="py-1">
                  {request.SntDisconnectionAvailedTimeFrom && request.SntDisconnectionAvailedTimeTo ? (
                    `${formatTime(request.SntDisconnectionAvailedTimeFrom)} to ${formatTime(request.SntDisconnectionAvailedTimeTo)}`
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>

               <tr>
                <td className="py-1 font-medium">TRD Availed Time:</td>
                <td className="py-1">
                  {request.TrdDisconnectionAvailedTimeFrom && request.TrdDisconnectionAvailedTimeTo ? (
                    `${formatTime(request.TrdDisconnectionAvailedTimeFrom)} to ${formatTime(request.TrdDisconnectionAvailedTimeTo)}`
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>

                 <tr>
                <td className="py-1 font-medium">Applied Time:</td>
                <td className="py-1">
                  {request.AppliedTimeFrom && request.AppliedTimeTo ? (
                    `${formatTime(request.AppliedTimeFrom)} to ${formatTime(request.AppliedTimeTo)}`
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-1 font-medium">Block Section:</td>
                <td className="py-1">{request.missionBlock}</td>
              </tr>
              {request.workLocationFrom ? (
                <tr>
                  <td className="py-1 font-medium">Work Location:</td>
                  {/* <td className="py-1">
                    {request.workLocationFrom} to {request.workLocationTo}
                  </td> */}
                  <td className="py-1">
                    {request.workLocationFrom && request.workLocationTo
                      ? `${request.workLocationFrom} to ${request.workLocationTo}`
                      : `${request.workLocationFrom}`}
                  </td>
                </tr>
              ) : null}

              {request.elementarySection && request.selectedDepartment === "TRD" && (
                <tr>
                  <td className="py-1 font-medium">Elementary Section:</td>
                  <td className="py-1">{request.elementarySection}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/*Emergency Block Remarks code below */}

      {request.processedLineSections &&
        request.processedLineSections.length > 0 && (
          <div className="border border-black p-3 mb-4">
            <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
              Block Sections Detail
            </h2>
            {/* <div className="space-y-3">
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
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {request.emergencyBlockRemarks && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            {request.corridorType === "Urgent Block"
              ? "Emergency Block Remarks"
              : "Non-corridor Block Remarks"}
          </h2>
          <div className="py-1">{request.emergencyBlockRemarks}</div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4 w-full">
        {request.selectedDepartment !== "TRD" && (
          <div className="border border-black p-3 flex-1">
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
                {request.powerBlockRequired &&
                  request.powerBlockRequirements && (
                    <tr>
                      <td className="py-1 font-medium">Power Block Details:</td>
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
                    {request.powerBlockDisconnectionAssignTo || "N/A"}
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
                     {request.sntDisconnectionRequired &&
                  request.sntDisconnectionRequirements && (
                <tr>
                  <td className="py-1 font-medium">
                    Selected Depot For S&T Disconnection:
                  </td>
                  <td className="py-1">
                    {request.sntDisconnectionAssignTo || "N/A"}
                  </td>
                </tr>
                 )}
                {request.sntDisconnectionLineFrom &&
                  request.sntDisconnectionLineTo && (
                    <tr>
                      <td className="py-1 font-medium">S&T Lines:</td>
                      <td className="py-1">
                        {request.sntDisconnectionLineFrom &&
                        request.sntDisconnectionLineTo
                          ? `${request.sntDisconnectionLineFrom} to ${request.sntDisconnectionLineTo}`
                          : "-"}
                      </td>
                    </tr>
                  )}

                {/* <tr>
                <td className="py-1 font-medium">Caution Required :</td>
                <td className="py-1">
                  {request.sigDisconnection ? "Yes" : "No"}
                </td>
              </tr> */}
                {/* {request.sigDisconnection &&
                request.sigDisconnectionRequirements && (
                  <tr>
                    <td className="py-1 font-medium">
                      Caution Details:
                    </td>
                    <td className="py-1">
                      {request.sigDisconnectionRequirements || "N/A"}
                    </td>
                  </tr>
                )} */}
              </tbody>
            </table>
          </div>
        )}

        <div className="border border-black p-3 flex-1 ">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Safety & Additional Information
          </h2>
          <table className="w-full text-sm">
            {/* <tbody>
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
                  {request.freshCautionLocationFrom &&
                    request.freshCautionLocationTo && (
                      <tr>
                        <td className="py-1 font-medium">Caution Location:</td>
                        <td className="py-1">
                          {request.freshCautionLocationFrom
                            .split(",")
                            .map((fromVal: string, idx: number) => {
                              const toVals = (
                                request.freshCautionLocationTo ?? ""
                              ).split(",");
                              return `(${fromVal},${toVals[idx] || ""})`;
                            })
                            .join(",")}
                        </td>
                      </tr>
                    )}

                  <tr>
                    <td className="py-1 font-medium">
                      Adjacent lines affected:
                    </td>
                    <td className="py-1">{request.adjacentLinesAffected}</td>
                  </tr>
                </>
              )}
              {request.repercussions && (
                <tr>
                  <td className="py-1 font-medium">Repercussions:</td>
                  <td className="py-1">{request.repercussions}</td>
                </tr>
              )}
            </tbody> */}
<tbody>
  <tr>
    <td className="py-1 font-medium">Fresh Caution Required:</td>
    <td className="py-1">
      {request.freshCautionRequired ? "Yes" : "No"}
    </td>
  </tr>
  
  {request.freshCautionRequired && request.freshCautions && (
    <>
      <tr>
        <td colSpan={2} className="py-2 font-medium bg-gray-50">
          Fresh Caution Details:
        </td>
      </tr>
      {request.freshCautions.map((caution:any, index:any) => (
        <React.Fragment key={index}>
          <tr className="bg-gray-25">
            <td className="py-2 pl-4 font-medium border-l-4 border-blue-500">
              Caution {index + 1}
            </td>
            <td className="py-2"></td>
          </tr>
          <tr>
            <td className="py-1 pl-6 font-medium">Speed:</td>
            <td className="py-1">{caution.freshCautionSpeed} km/h</td>
          </tr>
          <tr>
            <td className="py-1 pl-6 font-medium">Date:</td>
            <td className="py-1">
              {caution.freshCautionFromDate} to {caution.freshCautionToDate}
            </td>
          </tr>
          <tr>
            <td className="py-1 pl-6 font-medium">Time:</td>
            <td className="py-1">
              {caution.freshCautionFromTime} to {caution.freshCautionToTime}
            </td>
          </tr>
          <tr>
            <td className="py-1 pl-6 font-medium">Location:</td>
            <td className="py-1">
              {caution.freshCautionLocationFrom} to {caution.freshCautionLocationTo}
            </td>
          </tr>
          <tr>
            <td className="py-1 pl-6 font-medium">Lines Affected:</td>
            <td className="py-1">{caution.adjacentLinesAffected}</td>
          </tr>
          {index < request.freshCautions.length - 1 && (
            <tr>
              <td colSpan={2} className="py-3 border-b border-gray-200"></td>
            </tr>
          )}
        </React.Fragment>
      ))}
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
 {request.tpcRemarks && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Department Controller Remarks
          </h2>
          <p className="text-sm">{request.tpcRemarks}</p>
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


      {/* ENGG Disconnection Approvals Table */}
      {request.enggDisconnectionsRequired && request.enggDisconnections && Object.keys(request.enggDisconnections).length > 0 && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            ENGG Disconnection Approvals
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Depot</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Approved At</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(request.enggDisconnections).map(([depotCode, approval]) => (
                  <tr key={depotCode} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 font-medium">{approval.depot}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        approval.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {approval.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {approval.approvedAt ? formatDateTime(approval.approvedAt) : 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{approval.remarks || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* TRD Disconnection Approvals Table */}
      {request.powerBlockRequired && request.trdDisconnections && Object.keys(request.trdDisconnections).length > 0 && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            TRD Disconnection Approvals
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Depot</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Approved At</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(request.trdDisconnections).map(([depotCode, approval]) => (
                  <tr key={depotCode} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 font-medium">{approval.depot}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        approval.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {approval.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {approval.approvedAt ? formatDateTime(approval.approvedAt) : 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{approval.remarks || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* S&T Disconnection Approvals Table */}
      {request.sntDisconnectionRequired && request.sntDisconnections && Object.keys(request.sntDisconnections).length > 0 && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            S&T Disconnection Approvals
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Depot</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Approved At</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(request.sntDisconnections).map(([depotCode, approval]) => (
                  <tr key={depotCode} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 font-medium">{approval.depot}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        approval.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {approval.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {approval.approvedAt ? formatDateTime(approval.approvedAt) : 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{approval.remarks || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Rejection Remarks - Only show when request is REJECTED */}
      {request.status === "REJECTED" && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Request Rejection Details
          </h2>
          {request.rejectedBy ? (
            <div className="mb-2">
              <p className="text-sm font-medium">Rejected by: {request.rejectedBy.name} ({request.rejectedBy.role})</p>
            </div>
          ) : (
            // Fallback logic to determine who rejected based on approval status
            (() => {
              let rejectedBy = "Unknown";
              
              // Check if manager rejected
              if (request.remarkByManager) {
                rejectedBy = "Manager";
              }
              // Check if any S&T depot rejected
              else if (request.sntDisconnections && Object.values(request.sntDisconnections).some(approval => approval.status === 'REJECTED')) {
                rejectedBy = "S&T Department";
              }
              // Check if any TRD depot rejected
              else if (request.trdDisconnections && Object.values(request.trdDisconnections).some(approval => approval.status === 'REJECTED')) {
                rejectedBy = "TRD Department";
              }
              else if (request.enggDisconnections && Object.values(request.enggDisconnections).some(approval => approval.status === 'REJECTED')) {
                rejectedBy = "ENGG Department";
              }
              return (
                <div className="mb-2">
                  <p className="text-sm font-medium">Rejected by: {rejectedBy}</p>
                </div>
              );
            })()
          )}
          <p className="text-sm">{request.remarkByManager || request.disconnectionRequestRejectRemarks || "No rejection remarks provided"}</p>
        </div>
      )}
      
      {request.isSanctioned &&request.sanctionedRemarks && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            Sanction Remarks
          </h2>
          <p className="text-sm">{request.sanctionedRemarks}</p>
        </div>
      )}

       {request.isSanctioned && request.userResponse && (
        <div className="border border-black p-3 mb-4">
          <h2 className="text-md font-bold text-[#13529e] mb-2 border-b border-gray-200 pb-1">
            User Reject Remarks
          </h2>
          <p className="text-sm">{request.userResponse}</p>
        </div>
      )}

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1">
        © {new Date().getFullYear()} Indian Railways. All Rights Reserved.
      </div>
    </div>
  );
}