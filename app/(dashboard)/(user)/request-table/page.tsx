// app/(dashboard)/dashboard/request-table/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  useGetUserRequests,
  useGetWeeklyUserRequests,
  DateRangeFilter,
  RequestItem,
  useGetOtherRequests,
} from "@/app/service/query/user-request";
import Link from "next/link";
import * as XLSX from 'xlsx';

import {
  format,
  parseISO,
  addDays,
  startOfWeek,
  endOfWeek,
  subDays,
} from "date-fns";
import { useSession } from "next-auth/react";
import {
  useUpdateOtherRequest,
  useDeleteUserRequest,
} from "@/app/service/mutation/user-request";
import { Toaster, toast } from "react-hot-toast";
import { useUrgentMode } from "@/app/context/UrgentModeContext";
import { ShowAllToggle } from "@/app/components/ui/ShowAllToggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userRequestService } from "@/app/service/api/user-request";
import { WeeklySwitcher } from "@/app/components/ui/WeeklySwitcher";
import { managerService } from "@/app/service/api/manager";
import dayjs from "dayjs";
import formatTime from "@/app/utils/formatTime";

// Components
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

// Helper function to format dates
const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "dd-MM-yyyy");
  } catch {
    return "Invalid date";
  }
};



// Helper function to format time periods with duration
const formatTimePeriod = (fromTime: string, toTime: string): string => {
  const from = formatTime(fromTime);
  const to = formatTime(toTime);

  if (from === "Invalid time" || to === "Invalid time") {
    return "Invalid time period";
  }

  // Calculate duration if possible
  let durationText = "";
  try {
    const fromParts = from.split(":").map(Number);
    const toParts = to.split(":").map(Number);

    if (fromParts.length === 2 && toParts.length === 2) {
      let hours = toParts[0] - fromParts[0];
      let minutes = toParts[1] - fromParts[1];

      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }

      if (hours < 0) {
        hours += 24; // Assuming end time could be next day
      }

      durationText = ` (${hours}h ${minutes}m)`;
    }
  } catch (error) {
    console.error("Error calculating duration", error);
  }

  return `${from}-${to}${durationText}`;
};

// Get status details with secondary phrase
const getStatusDetails = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "Request approved and scheduled";
    case "REJECTED":
      return "Request rejected - cannot proceed";
    case "PENDING":
      return "Awaiting approval - may change";
    default:
      return "Status not available";
  }
};

// Get disconnection status details
const getDisconnectionStatus = (type: string, request: RequestItem) => {
  // Since the actual status fields aren't in the RequestItem type, we'll use simulated statuses
  const statusOptions = [
    "Accepted by Electrical Dept.",
    "Pending Approval",
    "Rejected by S&T Dept.",
    "Approved by Station Master",
  ];
  const randomIndex = (request.id || "").length % statusOptions.length; // Use ID length to create consistent "random" index

  switch (type) {
    case "power":
      return statusOptions[1];
    case "snt":
      return statusOptions[(randomIndex + 1) % statusOptions.length];
    case "sig":
      return "Conditionally approved - needs verification";
    case "trd":
      return "Pending review by TRD officer";
    default:
      return "Status not available";
  }
};

// Header icons for tables
const HeaderIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "id":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.5 9.5A2.5 2.5 0 018 12V8.5H5.5v1zm0 0V8.5H8V12a2.5 2.5 0 01-2.5-2.5zM12 12v-1.5h-1.5V12H12zm-1.5-3V12H12V9h-1.5zm3.5.5v1h1.5V8h-5v1.5h2V12h1.5V9.5h1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "date":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "section":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "time":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "work":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      );
    case "disconnection":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "status":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "filter":
      return (
        <svg
          className="w-3 h-3 inline-block ml-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
};

// Define a tooltip position state type
interface TooltipPosition {
  x: number;
  y: number;
  placement: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

// Time chip component for better visualization
const TimeChip = ({ time, label }: { time: string; label?: string }) => (
  <div className="inline-flex items-center bg-blue-50 rounded-full px-2 py-1 border border-blue-200 text-xs shadow-sm">
    <svg
      className="w-3 h-3 mr-1 text-blue-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
    <span className="font-medium">{time}</span>
    {label && <span className="ml-1 text-gray-500">{label}</span>}
  </div>
);

// Time period display with duration
const TimePeriodDisplay = ({
  fromTime,
  toTime,
}: {
  fromTime: string;
  toTime: string;
}) => {
  const formattedPeriod = formatTimePeriod(fromTime, toTime);
  const [timeRange, duration] = formattedPeriod
    .split(/\s+\(|\)/)
    .filter(Boolean);
  const [startTime, endTime] = timeRange.split("-");

  return (
    <div className="flex items-center space-x-2">
      <TimeChip time={startTime} />
      <div className="flex items-center justify-center">
        <svg
          className="w-4 h-4 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <TimeChip time={endTime} />
      {duration && (
        <span className="ml-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200 text-xs font-medium whitespace-nowrap">
          {duration}
        </span>
      )}
    </div>
  );
};

export default function RequestTablePage() {
  // State for pagination and view type
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 9),
  });
  const [downloadDateRange, setDownloadDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { isUrgentMode } = useUrgentMode();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 9),
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const today = new Date(); // Current date
  const endDate = addDays(today, 10); // Today + 10 days

  const formattedStartDate = format(today, "yyyy-MM-dd"); // "2025-06-10"
  const formattedEndDate = format(endDate, "yyyy-MM-dd");
  const { mutate: updateOtherRequest, isPending: isMutating } =
    useUpdateOtherRequest();

  // Get user session for role-based features
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "USER";
  const selectedDepo = session?.user?.depot || "";
  const userDepartement=session?.user?.department||""

  const [rejectRemarkPopup, setRejectRemarkPopup] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [rejectReqId, setRejectReqId] = useState("");
const [rejectReason, setRejectReason] = useState("");
const [showRejectReasonPopup, setShowRejectReasonPopup] = useState(false);
const [requestToReject, setRequestToReject] = useState<{
  id: string;
  userDepartement: string;
  mobileView: string;
} | null>(null);
  const { data: otherRequestsData, refetch } = useGetOtherRequests(
    selectedDepo,
    currentPage,
    pageSize,
    formattedStartDate,
    formattedEndDate,
    userDepartement,
  );
  // Map frontend roles to backend roles
  const getBackendRole = (role: string) => {
    switch (role) {
      case "MANAGER":
        return "BRANCH_OFFICER";
      default:
        return role;
    }
  };

  const handleStatusUpdate = (id: string, accept: boolean,userDepartement:string,mobileView:string) => {
    if (accept) {
      updateOtherRequest(
        {
          id,
          accept,
          userDepartement,
          mobileView
        },
        {
          onSuccess: () => {
            // Refetch the data after the mutation succeeds
            refetch();
          },
        }
      );
    } else {
    setRequestToReject({ id, userDepartement, mobileView });
    setShowRejectReasonPopup(true);
    }
  };



  const handleConfirmReject = () => {
  if (!requestToReject || !rejectReason.trim()) return;
  
  updateOtherRequest(
    {
      id: requestToReject.id,
      accept: false,
      userDepartement: requestToReject.userDepartement,
      mobileView: requestToReject.mobileView,
      disconnectionRequestRejectRemarks: rejectReason // Make sure your API accepts this field
    },
    {
      onSuccess: () => {
        refetch();
        setShowRejectReasonPopup(false);
        setRejectReason("");
        setRequestToReject(null);
        toast.success("Request rejected successfully");
      },
      onError: () => {
        toast.error("Failed to reject request");
      }
    }
  );
};
  // Fetch requests data
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "requests",
      currentPage,
      statusFilter,
      customDateRange,
      userRole,
    ],
    queryFn: async () => {
      const backendRole = getBackendRole(userRole);
      if (
        backendRole === "BRANCH_OFFICER" ||
        backendRole === "SENIOR_OFFICER" ||
        backendRole === "JUNIOR_OFFICER"
      ) {
        // For managers, fetch all subordinate requests with date filtering
        return await managerService.getUserRequestsByManager(
          currentPage,
          pageSize,
          format(customDateRange.startDate, "yyyy-MM-dd"),
          format(customDateRange.endDate, "yyyy-MM-dd"),
          statusFilter !== "ALL" ? statusFilter : undefined
        );
      } else {
        // For users, fetch only their own requests (no date filtering for download, but table always next 10 days)
        return await userRequestService.getUserRequests(currentPage, pageSize);
      }
    },
  });
  const queryClient = useQueryClient();

  // Accept Mutation
  const acceptMutation = useMutation({
    mutationFn: (id: string) => userRequestService.acceptUserRequestRemark(id),
    onSuccess: () => {
      toast.success("Request accepted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-requests"] }); // Refresh data
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to accept request.");
      console.error(error);
    },
  });

  console.log("userRequestService  ----- > ")
  console.dir(data)

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn:({ id, reason }: { id: string; reason: string })  => userRequestService.rejectUserRequestRemark(id, reason),
    onSuccess: () => {
      toast.success("Request rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-requests"] }); // Refresh data
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to reject request.");
      console.error(error);
    },
  });
    const handleReject = async (id: string, reason: string) => {
    if (confirm("Are you sure you want to reject this request?")) {
      await rejectMutation.mutateAsync({id,reason});

      // This will refetch the correct query and update UI
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
    }
  };

 const handleAccept = async (id: string) => {
  if (confirm("Are you sure you want to accept this request?")) {
    try {
      await acceptMutation.mutateAsync(id);
      // This will refetch the correct query and update UI
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Request accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept request.");
      console.error(error);
    }
  }
};


  // For managers, show all requests in the selected date range
  // For users, show only next 10 days
  let filteredRequests: any[] = [];
  const backendRole = getBackendRole(userRole);
  if (
    backendRole === "BRANCH_OFFICER" ||
    backendRole === "SENIOR_OFFICER" ||
    backendRole === "JUNIOR_OFFICER"
  ) {
    filteredRequests = data?.data?.requests || [];
  } else {
    const today = new Date();
    const tenDaysLater = new Date();
    tenDaysLater.setDate(today.getDate() + 9);
    filteredRequests =
      data?.data?.requests?.filter((request: any) => {
        const reqDate = new Date(request.date);
        return reqDate >= today && reqDate <= tenDaysLater;
      }) || [];
  }

  // Handle date range navigation
  const goToPreviousPeriod = () => {
    setDateRange((prev) => ({
      startDate: subDays(prev.startDate, 10),
      endDate: subDays(prev.endDate, 10),
    }));
  };

  const goToNextPeriod = () => {
    setDateRange((prev) => ({
      startDate: addDays(prev.startDate, 10),
      endDate: addDays(prev.endDate, 10),
    }));
  };
  // AcceptOrRejectButton is declared but not used
  const AcceptOrRejectButton = (request: any) => (
    <div className="flex gap-2 justify-center flex-col md:flex-row">
      {/* Accept Button */}
      <button
        onClick={() => handleAccept(request.id)}
        disabled={acceptMutation.isPending || rejectMutation.isPending}
        className="px-2 py-1 text-xs md:text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-bold"
      >
        {acceptMutation.isPending ? "Processing..." : "Accept"}
      </button>

      {/* Reject Button */}
      <button
        onClick={() => {
          setRejectRemarkPopup(true);
          setRejectReqId(request.id);
        }}
        disabled={acceptMutation.isPending || rejectMutation.isPending}
        className="px-2 py-1 text-xs md:text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
      >
        {rejectMutation.isPending ? "Processing..." : "Reject"}
      </button>
    </div>
  );

  // Handle Excel download
  // const handleDownload = () => {
  //   try {
  //     if (!data?.data?.requests || data.data.requests.length === 0) {
  //       toast.error("No data available to download");
  //       return;
  //     }

  //     // Create CSV headers
  //     const headers = [
  //       "Date",
  //       "Block Section",
  //       "UP/DN/SL/Rpad No.",
  //       "Activity",
  //       "Duration",
  //       "Status",
  //     ];

  //     // Create CSV rows
  //     const rows = data.data.requests.map((request: any) => [
  //       formatDate(request.date),
  //       request.missionBlock || "N/A",
  //       request.lineDirection || "N/A",
  //       request.activity || "N/A",
  //       formatDuration(request.demandTimeFrom, request.demandTimeTo),
  //       request.adminRequestStatus === "ACCEPTED" ? "Y" : "N",
  //     ]);

  //     // Combine headers and rows
  //     const csvContent = [
  //       headers.join(","),
  //       ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  //     ].join("\n");

  //     // Create blob and download
  //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `block_requests_${format(new Date(), "dd-MM-yyyy")}.csv`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //     toast.success("Download completed successfully");
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     toast.error("Failed to download file. Please try again.");
  //   }
  // };

// ... (other imports remain the same)

const handleDownload = () => {
  try {
    if (!data?.data?.requests || data.data.requests.length === 0) {
      console.log("No data available to download");
      return;
    }

    // Apply date filter
    const filteredRequests = data.data.requests.filter((request: any) => {
      const requestDate = new Date(request.date);
      const startDate = new Date(customDateRange.startDate);
      const endDate = new Date(customDateRange.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return requestDate >= startDate && requestDate <= endDate;
    });

    if (filteredRequests.length === 0) {
      toast.error("No data found for selected date range.");
      return;
    }

    const excelData = filteredRequests.map((request: any) => ({
      "Date": formatDate(request.date),
      "Block Section": request.missionBlock || "N/A",
      "UP/DN/SL/Rpad No.": request.lineDirection || "N/A",
      "Activity": request.activity || "N/A",
      "Duration": formatDuration(request.demandTimeFrom, request.demandTimeTo),
      "Status": request.adminRequestStatus === "ACCEPTED" ? "Y" : "N",
      "Sanctioned From": request.sanctionedTimeFrom ? formatTime(request.sanctionedTimeFrom) : "N/A",
      "Sanctioned To": request.sanctionedTimeTo ? formatTime(request.sanctionedTimeTo) : "N/A",
      "Accept/Reject Status": request.userResponse || "Pending"
    }));

    console.log(excelData);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Block Requests");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `block_requests_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Excel file downloaded successfully");
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download Excel file. Please try again.");
  }
};
  // Pagination component
  const Pagination = () => {
    if (!data?.data?.totalPages || data.data.totalPages <= 1) return null;

    return (
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-white text-[#13529e] border border-[#13529e] disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm">
          Page {currentPage} of {data.data.totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(data.data.totalPages, p + 1))
          }
          disabled={currentPage === data.data.totalPages}
          className="px-3 py-1 text-sm bg-white text-[#13529e] border border-[#13529e] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] max-w-[1366px] mx-auto px-2 relative ">

      {showRejectReasonPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-300">
      <h2 className="text-lg font-bold mb-2 text-black">Reason for Rejection</h2>
      <textarea
        className="w-full border border-gray-400 rounded p-2 mb-4 text-black"
        rows={3}
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="Please specify the reason for rejection..."
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-1 rounded bg-gray-200 text-black font-semibold"
          onClick={() => {
            setShowRejectReasonPopup(false);
            setRejectReason("");
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-1 rounded bg-red-600 text-white font-semibold"
          disabled={!rejectReason.trim() || isMutating}
          onClick={handleConfirmReject}
        >
          {isMutating ? "Rejecting..." : "Confirm Reject"}
        </button>
      </div>
    </div>
  </div>
)}

      {rejectRemarkPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-300">
            <h2 className="text-lg font-bold mb-2 text-black">Reject Request</h2>
            <p className="mb-2 text-black">Please provide remarks for rejection:</p>
            <textarea
              className="w-full border border-gray-400 rounded p-2 mb-4 text-black"
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Enter remarks..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-200 text-black font-semibold"
                onClick={() => {
                  setRejectRemarkPopup(false);
                  setRejectRemarks("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-red-600 text-white font-semibold"
                disabled={!rejectRemarks.trim() || rejectMutation.isPending}
                onClick={async () => {
                  await handleReject(rejectReqId, rejectRemarks);
                  setRejectRemarkPopup(false);
                  setRejectRemarks("");
                  setRejectReqId("");
                }}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Yellow Bar */}
      <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
        <span className="text-[24px] font-bold text-[#B57CF6] tracking-widest">
            RBMS-{session?.user?.location}-DIVN
        </span>
      </div>

      {/* Main Title on Light Blue */}
      <div className="w-full bg-[#D6F3FF] py-3 flex flex-col items-center border-b-2 border-black">
        <span className="text-[24px] md:text-3xl font-bold text-black text-center">
          Summary of My Block Requests
        </span>
      </div>

      {/* User Info Row */}
   <div className="flex justify-center mt-3">
  <div className="flex gap-3">
    <span className="bg-[#FFB74D] border-2 border-black px-5 py-2 font-bold text-2xl text-black rounded-lg">
      DESGN:
    </span>
    <span className="bg-[#FFB74D] border-2 border-black px-5 py-2 font-bold text-2xl text-black rounded-lg">
      {userName}
    </span>
  </div>
</div>

      {/* Summary Box */}
      <div className="flex justify-center mt-3 mb-6">
        <div className="w-full rounded-2xl border-2 border-[#B5B5B5] bg-[#F5E7B2] shadow p-0">
          <div className="text-[24px] font-bold text-black text-center py-2">
            SUMMARY OF NEXT 10 DAYS
          </div>
          <div className="italic text-center text-[24px] text-black pb-2">
            (Click ID to see full details or to Edit)
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl mx-2 mb-2">
            <table className="w-full border border-black rounded-xl overflow-hidden text-[24px]">
              <thead>
                <tr className="bg-[#D6F3FF] text-black">
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[12%]">
                    Date
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[8%]">
                    ID
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[25%]">
                    Block Section
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[15%]">
                    Line/Road
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[20%]">
                    Activity
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">
                    Demanded
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">
                     Offered
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">
                    Status
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">
                    Accept Offered Timing?
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request: any, idx: number) => (
                  <tr
                    key={request.id}
                    className={idx % 2 === 0 ? "bg-[#FFF86B]" : "bg-[#E6E6FA]"}
                  >
                    <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                      {dayjs(request.date).format("DD-MM-YY")}
                    </td>
                    <td className="border border-black px-2 py-1 whitespace-nowrap text-center">
                      <Link
                        href={`/view-request/${request.id}?from=request-table`}
                        className="text-black hover:underline"
                      >
                        {request.divisionId || request.id.slice(-4)}
                      </Link>
                    </td>
                    <td className="border border-black px-2 py-1 text-black">
                      {request.missionBlock}
                    </td>
                    <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                      {request.processedLineSections[0].lineName ||request.processedLineSections[0].road|| "N/A"}
                    </td>
                    <td className="border border-black px-2 py-1 text-black">
                      {request.activity}
                    </td>
                    <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                      {formatTime(request.demandTimeFrom)} -{" "}
                      {formatTime(request.demandTimeTo)}
                    </td>
                    <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                      {request.isSanctioned === true ? (
                        <>
                          {request.sanctionedTimeFrom === null || request.sanctionedTimeTo === null ? (
                            <span className="text-gray-500">00:00 - 00:00</span>
                          ) : (
                            <>
                              {formatTime(request.sanctionedTimeFrom)} -{" "}
                              {formatTime(request.sanctionedTimeTo)}
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="border border-black px-2 py-1 text-center whitespace-nowrap text-black">
                      {request.isSanctioned === true ? "Y" : "N"}
                    </td>
                    <td className="border border-black px-2 py-1 bg-[#E6E6FA] text-center align-middle w-32">
                      {request.isSanctioned === true ? (
                        <>
                        {
                          request.userResponse === "ACCEPTED" ? (
                          <div className="px-2 py-1 bg-green-100 text-green-800 mx-auto">
                            Sanctioned and Accepted
                          </div>
                        ) : (
                          AcceptOrRejectButton(request)
                        )}
                        </>
                      ) : (
                        <>
                         <span className="text-gray-500">{request.overAllStatus}</span>
  {/* {(() => {
    if (request.managerAcceptance === false&&request.remarkByManager===null ) {
      return <span className="text-gray-500">with Dept controller</span>;
    } 

    else if (request.managerAcceptance === false&&request.remarkByManager!==null) {
      return <span className="text-gray-500">return to applicant by Dept controller</span>;
    }
    else if (request.managerAcceptance === true && request.sigActionsNeeded === false&&request.sigResponse===""&&request.oheResponse===""&&request.trdActionsNeeded===false&&request.DisconnAcceptance!=="ACCEPTED"&&request.sntDisconnectionRequired===true&&request.powerBlockRequired===true) {
      return <span className="text-gray-500">with s&t dsiconnection and with trd disconnection</span>;
    } 
      
    else if (request.managerAcceptance === true && request.sigActionsNeeded === false&&request.sigResponse===""&&request.sntDisconnectionRequired===true) {
      return <span className="text-gray-500">with s&t for disconnection</span>;
    }
    else if (request.managerAcceptance === true &&request.oheResponse===""&&request.trdActionsNeeded===false&&request.powerBlockRequired===true) {
      return <span className="text-gray-500">with trd for disconnection</span>;
    }
    
    else if (request.managerAcceptance === true &&request.sigActionsNeeded === true&&request.isSanctioned===false&&request.optimizeStatus===false) {
      return <span className="text-green-500">with optg</span>;
    }


     else if (request.managerAcceptance === true &&request.trdActionsNeeded === true&&request.isSanctioned===false&&request.optimizeStatus===false) {
      return <span className="text-green-500">with optg</span>;
    }

     else if (request.managerAcceptance === true &&request.trdActionsNeeded === true&&request.sigActionsNeeded === true&&request.isSanctioned===false&&request.optimizeStatus===false) {
      return <span className="text-green-500">with optg</span>;
    }




 else if (request.managerAcceptance === true && request.sigActionsNeeded === false&&request.sigResponse!==""&&request.sntDisconnectionRequired===true) {
      return <span className="text-gray-500">return to applicant by s&t</span>;
    }



 else if (request.managerAcceptance === false && request.sigActionsNeeded === false&&request.sigResponse!==""&&request.sntDisconnectionRequired===true) {
      return <span className="text-gray-500">return to applicant by s&t</span>;
    }

    else if (request.managerAcceptance === true &&request.oheResponse!==""&&request.trdActionsNeeded===false&&request.powerBlockRequired===true) {
      return <span className="text-gray-500">return to applicant by s&t</span>;
    }


      else if (request.managerAcceptance === false &&request.oheResponse!==""&&request.trdActionsNeeded===false&&request.powerBlockRequired===true) {
      return <span className="text-gray-500">return to applicant by s&t</span>;
    }

     else if (request.managerAcceptance === false && request.sigActionsNeeded === false&&request.sigResponse!==""&&request.oheResponse!==""&&request.trdActionsNeeded===false) {
      return <span className="text-gray-500">{request.sigActionsNeeded === false&&request.sigResponse!==""?"return to applicant by s&t":"return to applicant by trd"}</span>;
    }
    else if(request.adminRequestStatus==="REJECTED"){
      return <span className="text-green-500">return to applicant by optg</span>;
    }
    //   else if(request.userResponse!=="ACCEPTED"&&request.userResponse!==""){
    //   return <span className="text-red-400">return to optg by remarks</span>;
    // }
  })()} */}
</>
                        
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      { session?.user?.department !== "ENGG" && (
      <div className="flex justify-center mt-3 mb-6">
        <div className="w-full rounded-2xl border-2 border-[#B5B5B5] bg-[#F5E7B2] shadow p-0">
          <div className="text-[24px] font-bold text-black text-center py-2">
            SUMMARY OF OTHER REQUEST FOR NEXT 10 DAYS
          </div>
          <div className="italic text-center text-[24px] text-black pb-2">
            (Click ID to see full details or to Edit)
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl mx-2 mb-2">
            <table className="w-full border border-black rounded-xl overflow-hidden text-[24px]">
              <thead>
                <tr className="bg-[#D6F3FF] text-black">
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[12%]">
                    Date
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[8%]">
                    ID
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[25%]">
                    Block Section
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[15%]">
                    UP/DN/SL/Rpad
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[20%]">
                    Activity
                  </th>
                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">
                    Duration
                  </th>

                  <th className="border border-black px-2 py-1 whitespace-nowrap w-[10%]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherRequestsData?.data.requests.map(
                  (request: any, idx: number) => (
                    <tr
                      key={request.id}
                      className={
                        idx % 2 === 0 ? "bg-[#FFF86B]" : "bg-[#E6E6FA]"
                      }
                    >
                      <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                        {formatDate(request.date)}
                      </td>
                      <td className="border border-black px-2 py-1 whitespace-nowrap text-center">
                        <Link
                          href={`/view-request/${request.id}?from=request-table`}
                          className="text-black hover:underline"
                        >
                          {request.divisionId || request.id.slice(-4)}
                        </Link>
                      </td>
                      <td className="border border-black px-2 py-1 text-black">
                        {request.missionBlock}
                      </td>
                   <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                      {session?.user.department === "S&T"
                        ? request.processedLineSections
                            .map((section: any) =>
                              section.type === "line"
                                ? [section.lineName, section.otherLines]
                                : [section.road, section.otherRoads]
                            )
                            .flat()
                            .filter(Boolean)
                            .join(", ")
                        : request.processedLineSections
                            .map((section: any) => section.lineName)
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                    </td>
                      <td className="border border-black px-2 py-1 text-black">
                        {request.activity}
                      </td>
                      <td className="border border-black px-2 py-1 whitespace-nowrap text-center text-black">
                        {formatDuration(
                          request.demandTimeFrom,
                          request.demandTimeTo
                        )}
                      </td>
                      <td className="border border-black px-2 py-1 text-center whitespace-nowrap">
                        {request.DisconnAcceptance === "ACCEPTED" ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Accepted
                          </span>
                        ) : request.DisconnAcceptance === "REJECTED" ? (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Rejected
                          </span>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                handleStatusUpdate(request.id, true,userDepartement,"mobileView")
                              }
                              disabled={isMutating}
                              className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-md border border-green-200 flex items-center transition-colors"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(request.id, false,userDepartement,"mobileView")
                              }
                              disabled={isMutating}
                              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded-md border border-red-200 flex items-center transition-colors"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                      {/* {request.DisconnAcceptance === "PENDING" && (
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
                        </div>
                      )} */}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )
      }


      {/* Fixed Bottom Navigation */}
      <div className="bg-[#FFFDF5] pb-2">
        <div className=" text-center">
          <h3 style={{ background: "#E6E6FA", color: "black" ,fontSize:"24px"}}>
            Customised Summary
          </h3>
        </div>

        <div className="max-w-[1366px] mx-auto px-2">
          <div className="flex justify-center items-center gap-4 mb-4  py-3 w-full rounded-lg">
            <div className="flex items-center gap-4 flex-wrap justify-center">
                    <div className="flex items-center gap-1"> {/* Added this container */}

              <div className="flex flex-col">
                <label className="text-[24px] font-medium mb-1 text-black">
                  From Date
                </label>
                <input
                  type="date"
                  value={format(customDateRange.startDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setCustomDateRange((prev) => ({
                      ...prev,
                      startDate: newDate,
                      endDate: newDate > prev.endDate ? newDate : prev.endDate,
                    }));
                  }}
                  className="w-fit bg-[#B2F3F5] border-2 border-red-500 text-black pl-2 -pr-10 py-1 rounded text-2xl"
                  max={format(customDateRange.endDate, "yyyy-MM-dd")}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[24px] font-medium mb-1 text-black">
                  To Date
                </label>
                <input
                  type="date"
                  value={format(customDateRange.endDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setCustomDateRange((prev) => ({
                      ...prev,
                      endDate: newDate,
                      startDate:
                        newDate < prev.startDate ? newDate : prev.startDate,
                    }));
                  }}
                  className="w-fit bg-[#B2F3F5] border-2 border-red-500 text-black py-1 -pr-10 rounded text-2xl"
                  min={format(customDateRange.startDate, "yyyy-MM-dd")}
                />
              </div>
              </div>

              {/* <div className="w-fit text-center mt-2">
                <h3 className="bg-[#E6E6FA] text-black text-[12px] font-medium px-3 py-1 rounded">
                  For printing the summary,
                  <br />
                  click Download
                </h3>
              </div>

              <button
                onClick={handleDownload}
                className="mt-1 bg-[#FFB74D] border border-black px-6 py-1.5 rounded-full text-[24px] font-bold text-black hover:bg-[#FFA726]"
              >
                Download XLSX
              </button> */}

              <div className="flex flex-col items-center gap-1"> {/* Changed to column layout */}
  <div className="w-full text-center">
    <h3 className="bg-[#E6E6FA] text-black text-[18px] font-medium px-3 py-1 rounded mb-1">
      For printing the summary,
      <br />
      click Download
    </h3>
  </div>

  <button
    onClick={handleDownload}
    className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded-full text-[24px] font-bold text-black hover:bg-[#FFA726]"
  >
    Download XLSX
  </button>
</div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-center gap-3 mb-2">
            {/* <Link
              href="/dashboard"
              className="text-center w-full max-w-60 rounded-[50%] bg-violet-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#baffc9] transition"

              
            >
               Home
            </Link> */}
            <button
              onClick={() => window.history.back()}
              className="text-center w-full max-w-60 rounded-[50%] bg-cyan-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#baffc9] transition"

              
            >
               Back
            </button>
            {/* <Link href="/logout" className="bg-[#FFB74D] border border-black px-6 py-1.5 max-w-6 rounded-[50%] text-lg font-bold text-black">
              Logout
            </Link> */}
            <button
              onClick={async () => {
                const { signOut } = await import("next-auth/react");
                await signOut({ redirect: true, callbackUrl: "/auth/login" });
              }}
              className="text-center w-full max-w-60 rounded-[50%] bg-emerald-200 text-black font-bold text-[24px] py-4 tracking-wider border border-[#b7b7d1] hover:bg-[#baffc9] transition"

              
            >
              Logout
            </button>
          </div>
          <div className="text-[10px] text-gray-600 border-t border-black pt-1 text-right">
            © {new Date().getFullYear()} Indian Railways
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format duration
function formatDuration(from: string, to: string) {
  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffInMinutes = Math.round(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60)
    );
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  } catch {
    return "N/A";
  }
}
