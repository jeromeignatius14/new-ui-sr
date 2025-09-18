"use client";
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

  const formatTime = (dateString: string): string => {
    if (!dateString) return "Invalid time";
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
          className={`px-2 py-0.5 text-sm ${getStatusBadgeClass(
            request.status
          )}`}
        >
          Status: {request.overAllStatus}
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
                <tr>
                  <td className="py-1 font-medium">
                    Selected Depot For S&T Disconnection:
                  </td>
                  <td className="py-1">
                    {request.sntDisconnectionAssignTo || "N/A"}
                  </td>
                </tr>
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
