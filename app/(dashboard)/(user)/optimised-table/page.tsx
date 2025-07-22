"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/app/service/api/admin";
import {
  addDays,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import { useUrgentMode } from "@/app/context/UrgentModeContext";
import { WeeklySwitcher } from "@/app/components/ui/WeeklySwitcher";
import { useRouter } from "next/navigation";

// Header icons for tables
const HeaderIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "id":
      return (
        <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.5 9.5A2.5 2.5 0 018 12V8.5H5.5v1zm0 0V8.5H8V12a2.5 2.5 0 01-2.5-2.5zM12 12v-1.5h-1.5V12H12zm-1.5-3V12H12V9h-1.5zm3.5.5v1h1.5V8h-5v1.5h2V12h1.5V9.5h1z" clipRule="evenodd" />
        </svg>
      );
    case "date":
      return (
        <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      );
    case "section":
      return (
        <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "time":
      return (
        <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case "work":
      return (
        <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      );
    case "action":
      return (
        <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      );
    default:
      return null;
  }
};

// Column header component
const ColumnHeader = ({ icon, title, showFilter = false }: { icon: string; title: string; showFilter?: boolean }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <HeaderIcon type={icon} />
        <span>{title}</span>
      </div>
    </div>
  );
};

export default function OptimiseTablePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isUrgentMode } = useUrgentMode();
  const [page, setPage] = useState(1);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return isUrgentMode ? now : startOfWeek(now, { weekStartsOn: 1 }); // Start from Monday
  });
  const [rejectionData, setRejectionData] = useState({
    showModal: false,
    requestId: null as string | null,
    reason: "",
  });

  const limit = 30;
  // For urgent mode, use the same day for start and end
  // For non-urgent mode, use Monday to Sunday
  const weekStart = isUrgentMode
    ? currentWeekStart
    : startOfWeek(currentWeekStart, { weekStartsOn: 1 }); // Explicitly start from Monday
  const weekEnd = isUrgentMode
    ? currentWeekStart
    : addDays(weekStart, 6); // Explicitly end on Sunday (6 days after Monday)

  // In urgent mode, we use the same date for both start and end dates
  // This ensures we only get data for a single day in urgent mode
  const apiStartDate = format(weekStart, "yyyy-MM-dd");
  const apiEndDate = isUrgentMode ? apiStartDate : format(weekEnd, "yyyy-MM-dd");

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "user-requests",
      page,
      apiStartDate,
      apiEndDate,
      isUrgentMode, // Add isUrgentMode to query key to refresh when mode changes
    ],
    queryFn: () =>
      adminService.getUserRequests(
        page,
        limit,
        apiStartDate,
        apiEndDate
      ),
  });

  // Add debugging logs
  console.log('API Response:', data?.data.requests);
  console.log('Is Urgent Mode:', isUrgentMode);
  console.log('Date Range:', format(weekStart, "yyyy-MM-dd"), 'to', format(weekEnd, "yyyy-MM-dd"));
  console.log('Current Date/Time:', new Date().toISOString());
  console.log('Date Display:', isUrgentMode ?
    format(currentWeekStart, "dd-MM-yyyy") :
    `${format(weekStart, "dd-MM-yyyy")} to ${format(weekEnd, "dd-MM-yyyy")}`);
  console.log('Filtered Requests:', data?.data.requests?.filter((request: any) =>
    request.optimizeStatus === true &&
    (isUrgentMode ? request.corridorType === "Urgent Block" : request.corridorType !== "Urgent Block")
  ));

  const updateRequestStatus = useMutation({
    mutationFn: ({
      requestId,
      status,
      reason,
    }: {
      requestId: string;
      status: "yes" | "no";
      reason?: string;
    }) => adminService.updateRequestStatus(requestId, status, reason as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-requests", page] });
      setRejectionData({ showModal: false, requestId: null, reason: "" });
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
      return format(parseISO(dateString), "HH:mm");
    } catch {
      return dateString;
    }
  };

  // Function to navigate to previous period (day for urgent, week for non-urgent)
  const goToPreviousPeriod = () => {
    setCurrentWeekStart((prevDate) => {
      if (isUrgentMode) {
        // In urgent mode, just go to previous day
        return subDays(prevDate, 1);
      } else {
        // In non-urgent mode, go to previous week
        // Ensure we're starting from Monday
        const monday = startOfWeek(prevDate, { weekStartsOn: 1 });
        return subDays(monday, 7);
      }
    });
  };

  // Function to navigate to next period (day for urgent, week for non-urgent)
  const goToNextPeriod = () => {
    setCurrentWeekStart((prevDate) => {
      if (isUrgentMode) {
        // In urgent mode, just go to next day
        return addDays(prevDate, 1);
      } else {
        // In non-urgent mode, go to next week
        // Ensure we're starting from Monday
        const monday = startOfWeek(prevDate, { weekStartsOn: 1 });
        return addDays(monday, 7);
      }
    });
  };

  const handleAccept = (requestId: string) => {
    updateRequestStatus.mutate({ requestId, status: "yes" });
  };

  const handleRejectClick = (requestId: string) => {
    setRejectionData({
      showModal: true,
      requestId,
      reason: "",
    });
  };

  const handleRejectConfirm = () => {
    if (rejectionData.requestId) {
      updateRequestStatus.mutate({
        requestId: rejectionData.requestId,
        status: "no",
        reason: rejectionData.reason,
      });
    }
  };

  const handleRejectCancel = () => {
    setRejectionData({ showModal: false, requestId: null, reason: "" });
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

  const totalPages = data?.data.totalPages || 1;

  return (
    <div className="bg-white p-3 border border-black">
      <div className="border-b-2 border-[#13529e] pb-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">Optimized Requests</h1>
      </div>
      <div className="border-b-2 border-[#13529e] pb-3 flex justify-center items-center mt-4">
        <div className="flex gap-2 items-center">
          <WeeklySwitcher
            currentWeekStart={currentWeekStart}
            onWeekChange={(direction) => {
              if (direction === "prev") {
                goToPreviousPeriod();
              } else {
                goToNextPeriod();
              }
            }}
            isUrgentMode={isUrgentMode}
            weekStartsOn={1}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="date" title="Date" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="section" title="Major Section" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="section" title="Depot" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="section" title="Block Section" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="section" title="Line" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="time" title="Optimized Time" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="work" title="Work Type" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="work" title="Activity" />
              </th>
              <th className="border border-black p-1 text-left text-sm font-medium text-black">
                <ColumnHeader icon="action" title="Action" />
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.data.requests?.filter((request: any) =>
              request.optimizeStatus === true &&
              (isUrgentMode ? request.corridorType === "Urgent Block" : request.corridorType !== "Urgent Block")
            ).length > 0 ? (
              data?.data.requests
                ?.filter((request: any) =>
                  request.optimizeStatus === true &&
                  (isUrgentMode ? request.corridorType === "Urgent Block" : request.corridorType !== "Urgent Block")
                )
                .map((request: any) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="border border-black p-1 text-sm">{formatDate(request.date)}</td>
                    <td className="border border-black p-1 text-sm">{request.selectedSection || "N/A"}</td>
                    <td className="border border-black p-1 text-sm">{request.selectedDepo || "N/A"}</td>
                    <td className="border border-black p-1 text-sm">{request.missionBlock || "N/A"}</td>
                    <td className="border border-black p-1 text-sm">{request.processedLineSections?.[0]?.lineName || "N/A"}</td>
                    {/* <td className="border border-black p-1 text-sm">
                      {request.optimizeTimeFrom && request.optimizeTimeTo
                        ? `${formatTime(request.optimizeTimeFrom)} - ${formatTime(request.optimizeTimeTo)}`
                        : "N/A"}
                    </td> */}
                    <td className="border border-black p-1 text-sm">
                      {request.optimizeTimeFrom && request.optimizeTimeTo
                        ? `${new Date(request.optimizeTimeFrom).toISOString().substring(11, 16)} - ${new Date(request.optimizeTimeTo).toISOString().substring(11, 16)}`
                        : "N/A"}
                    </td>
                    <td className="border border-black p-1 text-sm">{request.workType || "N/A"}</td>
                    <td className="border border-black p-1 text-sm">{request.activity || "N/A"}</td>
                    <td className="border border-black p-1 text-sm">
                      <div className="flex gap-1">
                        {request.userStatus !== "no" && (
                          <button
                            onClick={() => handleAccept(request.id)}
                            disabled={
                              request.userStatus === "yes" ||
                              (updateRequestStatus.variables?.requestId === request.id &&
                                updateRequestStatus.variables?.status === "yes")
                            }
                            className={`px-2 py-1 text-white text-xs rounded border flex items-center ${request.userStatus === "yes"
                              ? "bg-gray-400 cursor-default border-gray-600"
                              : "bg-green-500 hover:bg-green-600 border-green-700"
                              } disabled:opacity-50`}
                          >
                            {request.userStatus === "yes" ? (
                              <>
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Accepted
                              </>
                            ) : updateRequestStatus.variables?.requestId === request.id &&
                              updateRequestStatus.variables?.status === "yes" ? (
                              <>
                                <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Accept
                              </>
                            )}
                          </button>
                        )}
                        {request.userStatus !== "yes" && (
                          <button
                            onClick={() => handleRejectClick(request.id)}
                            disabled={
                              request.userStatus === "no" ||
                              (updateRequestStatus.variables?.requestId === request.id &&
                                updateRequestStatus.variables?.status === "no")
                            }
                            className={`px-2 py-1 text-white text-xs rounded border flex items-center ${request.userStatus === "no"
                              ? "bg-gray-400 cursor-default border-gray-600"
                              : "bg-red-500 hover:bg-red-600 border-red-700"
                              } disabled:opacity-50`}
                          >
                            {request.userStatus === "no" ? (
                              <>
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Rejected
                              </>
                            ) : updateRequestStatus.variables?.requestId === request.id &&
                              updateRequestStatus.variables?.status === "no" ? (
                              <>
                                <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Reject
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={9} className="border border-black p-1 text-sm text-center">
                  No optimized requests found for this week.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm bg-white text-[#13529e] border border-black disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {rejectionData.showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h3 className="font-bold text-lg mb-2">Reason for Rejection</h3>
            <textarea
              className="w-full border border-gray-300 p-2 mb-4"
              rows={4}
              placeholder="Enter the reason for rejection..."
              value={rejectionData.reason}
              onChange={(e) =>
                setRejectionData({ ...rejectionData, reason: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleRejectCancel}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionData.reason.trim()}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1 text-right">
        © {new Date().getFullYear()} Indian Railways
      </div>
    </div>
  );
}
