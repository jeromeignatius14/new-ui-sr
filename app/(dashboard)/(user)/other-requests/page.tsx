// app/(dashboard)/dashboard/other-requests/page.tsx
"use client";
import { useState } from "react";
import { useGetOtherRequests } from "@/app/service/query/user-request";
import { useUpdateOtherRequest } from "@/app/service/mutation/user-request";
import { useSession } from "next-auth/react";
import { format, parseISO, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader } from "@/app/components/ui/Loader";
import { WeeklySwitcher } from "@/app/components/ui/WeeklySwitcher";
import { useUrgentMode } from "@/app/context/UrgentModeContext";
import { RequestItem } from "@/app/service/query/user-request";

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
    case "status":
      return (
        <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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

// Define TooltipPosition interface
interface TooltipPosition {
  x: number;
  y: number;
  placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "dd-MM-yyyy");
  } catch {
    return "Invalid date";
  }
};

// Helper function to format times
const formatTime = (dateString: string) => {
  try {
    return format(parseISO(dateString), "HH:mm");
  } catch {
    return "Invalid time";
  }
};

// Helper function to format time periods
const formatTimePeriod = (fromTime: string, toTime: string) => {
  try {
    const from = formatTime(fromTime);
    const to = formatTime(toTime);
    return `${from}-${to}`;
  } catch {
    return "Invalid time period";
  }
};

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex justify-center gap-1 mt-3 text-black">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 text-sm border border-black rounded disabled:opacity-50 bg-white"
      >
        Previous
      </button>
      <span className="px-2 py-1 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-sm border border-black rounded disabled:opacity-50 bg-white"
      >
        Next
      </button>
    </div>
  );
};

export default function OtherRequestsPage() {
  const { isUrgentMode } = useUrgentMode();
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role || "USER";

  // State for pagination and view type
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewType, setViewType] = useState<"compact" | "gantt">("compact");
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // State for rejection dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");

  // State for week selection
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    return isUrgentMode ? today : startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
  });

  // Get the depot from session data
  const selectedDepo = session?.user?.depot || "";

  // Calculate week range
  const weekEnd = isUrgentMode
    ? currentWeekStart
    : endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekStart = isUrgentMode
    ? currentWeekStart
    : startOfWeek(currentWeekStart, { weekStartsOn: 1 });

  // Get other requests data
  const {
    data: otherRequestsData,
    isLoading,
    error,
    refetch
  } = useGetOtherRequests(
    selectedDepo,
    currentPage,
    pageSize,
    format(weekStart, "yyyy-MM-dd"),
    format(weekEnd, "yyyy-MM-dd")
  );

  // Update other request mutation
  const { mutate: updateOtherRequest, isPending: isMutating } = useUpdateOtherRequest();

  // Handle week change
  const goToPreviousPeriod = () => {
    setCurrentWeekStart((prevDate) => {
      if (isUrgentMode) {
        return subDays(prevDate, 1);
      }
      // For weekly view, go back 7 days from the start of the current week
      const weekStart = startOfWeek(prevDate, { weekStartsOn: 1 });
      return subDays(weekStart, 7);
    });
  };

  // Function to navigate to next period
  const goToNextPeriod = () => {
    setCurrentWeekStart((prevDate) => {
      if (isUrgentMode) {
        return addDays(prevDate, 1);
      }
      // For weekly view, go forward 7 days from the start of the current week
      const weekStart = startOfWeek(prevDate, { weekStartsOn: 1 });
      return addDays(weekStart, 7);
    });
  };


  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Get status badge class
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

  // Handle status update with refetch
  const handleStatusUpdate = (id: string, accept: boolean) => {
    if (accept) {
      updateOtherRequest(
        {
          id,
          accept,
        },
        {
          onSuccess: () => {
            // Refetch the data after the mutation succeeds
            refetch();
          },
        }
      );
    } else {
      // If rejecting, show the dialog to enter remarks
      setSelectedRequestId(id);
      setShowRejectDialog(true);
    }
  };

  // Handle confirmation of rejection with remarks
  const handleConfirmReject = () => {
    if (!rejectRemarks.trim()) {
      alert("Please provide rejection remarks");
      return;
    }

    updateOtherRequest(
      {
        id: selectedRequestId,
        accept: false,
        disconnectionRequestRejectRemarks: rejectRemarks,
      },
      {
        onSuccess: () => {
          // Reset the form and refetch data after successful rejection
          setShowRejectDialog(false);
          setRejectRemarks("");
          setSelectedRequestId("");
          refetch();
        },
      }
    );
  };

  // Add this function to handle "View Details"
  const handleViewDetails = (request: any) => {
    // Example: Navigate to a details page using the request id
    router.push(`/dashboard/other-requests/${request.id}`);
  };

  if (isLoading) {
    return <Loader name="other requests" />;
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

  return (
    <div className="bg-white p-3 border border-black mb-3">
      <div className="border-b-2 border-[#13529e] pb-3 mb-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">Other Requests</h1>
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
        />
      </div>

      <div className="flex justify-end mb-3">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="p-1 text-sm border border-black bg-white text-black"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        {otherRequestsData?.data.requests.length === 0 ? (
          <div className="text-center py-3 text-sm text-gray-600">
            No other requests found.
          </div>
        ) : (
          <>
            <table className="min-w-full border-collapse border border-black text-sm text-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="id" title="Request ID" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="date" title="Date" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="section" title="Major Section" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="section" title="Depot" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="section" title="Block Section" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="time" title="Time" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="work" title="Work Type" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="work" title="Activity" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="status" title="Status" />
                  </th>
                  <th className="border border-black p-1 text-left font-medium">
                    <ColumnHeader icon="action" title="Actions" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherRequestsData?.data.requests.map((request: any) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="border border-black p-1">
                      {request.id.substring(0, 8)}
                    </td>
                    <td className="border border-black p-1">
                      {formatDate(request.date)}
                    </td>
                    <td className="border border-black p-1">
                      {request.selectedSection}
                    </td>
                    <td className="border border-black p-1">
                      {request.selectedDepo}
                    </td>
                    <td className="border border-black p-1">
                      {request.missionBlock}
                    </td>
                    <td className="border border-black p-1">
                      {formatTimePeriod(
                        request.demandTimeFrom,
                        request.demandTimeTo
                      )}
                    </td>
                    <td className="border border-black p-1">
                      {request.workType}
                    </td>
                    <td className="border border-black p-1">
                      {request.activity}
                    </td>
                    <td className="border border-black p-1">
                      <span
                        className={`px-1 py-0.5 text-xs ${getStatusBadgeClass(
                          request.DisconnAcceptance
                        )}`}
                      >
                        {request.DisconnAcceptance}
                      </span>
                    </td>
                    <td className="border border-black p-1 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded border border-blue-700 flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View Details
                        </button>
                      </div>
                      {request.DisconnAcceptance === "PENDING" && (
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => handleStatusUpdate(request.id, true)}
                            disabled={isMutating}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded border border-green-700 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, false)}
                            disabled={isMutating}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded border border-red-700 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Reject
                          </button>
                          {isMutating && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={otherRequestsData?.data.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
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
                  setSelectedRequestId("");
                }}
                className="px-3 py-1 text-sm bg-gray-50 text-gray-700 border border-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-700 rounded"
                disabled={!rejectRemarks.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1">
        © {new Date().getFullYear()} Indian Railways. All Rights Reserved.
      </div>
    </div>
  );
}
