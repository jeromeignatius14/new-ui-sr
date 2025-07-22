"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/app/service/api/admin";
import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRequest } from "@/app/service/api/manager";
import { WeeklySwitcher } from "@/app/components/ui/WeeklySwitcher";
import { useUrgentMode } from "@/app/context/UrgentModeContext";

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
    case "action":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      );
    case "line":
      return (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
};

// Column header component
const ColumnHeader = ({
  icon,
  title,
  showFilter = false,
}: {
  icon: string;
  title: string;
  showFilter?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <HeaderIcon type={icon} />
        <span>{title}</span>
      </div>
    </div>
  );
};

// Helper to get line/road display for a request
const getLineOrRoad = (request: UserRequest) => {
  if (
    request.processedLineSections &&
    Array.isArray(request.processedLineSections) &&
    request.processedLineSections.length > 0
  ) {
    return request.processedLineSections
      .map((section) => {
        if (section.type === "yard") {
          if (section.stream && section.road) {
            return `${section.stream}/${section.road}`;
          }
          if (section.stream) {
            return section.stream;
          }
          if (section.road) {
            return section.road;
          }
        } else if (section.lineName) {
          return section.lineName;
        }
        return null;
      })
      .filter(Boolean)
      .join(", ") || "N/A";
  }
  return "N/A";
};

export default function OptimiseTablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isUrgentMode } = useUrgentMode();
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      return new Date(dateParam);
    }
    const today = new Date();
    const lastSaturday = subDays(today, (today.getDay() + 1) % 7);
    return startOfWeek(lastSaturday, { weekStartsOn: 6 });
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [departmentTab, setDepartmentTab] = useState<'all' | 'engg' | 'trd' | 'snt'>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>("ALL");
  const [activityFilter, setActivityFilter] = useState<string>("ALL");
  const [timeSlotFilter, setTimeSlotFilter] = useState<string>("ALL");

  // Update URL when currentWeekStart changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', format(currentWeekStart, 'yyyy-MM-dd'));
    router.push(`?${params.toString()}`, { scroll: false });
  }, [currentWeekStart, router]);

  const weekEnd = isUrgentMode
    ? currentWeekStart
    : endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekStart = isUrgentMode
    ? currentWeekStart
    : startOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const apiStartDate = format(weekStart, "yyyy-MM-dd");
  const apiEndDate = isUrgentMode
    ? apiStartDate
    : format(weekEnd, "yyyy-MM-dd");
  const limit = 5000;

  // Fetch approved requests data
  const { data, isLoading, error } = useQuery({
    queryKey: ["approved-requests", apiStartDate, apiEndDate, isUrgentMode],
    queryFn: () =>
      adminService.getOptimizeRequests(apiStartDate, apiEndDate, 1, limit),
  });

  // DEBUG: Log API data
  console.log("API data", data?.data?.requests);

  // Get unique work types and activities for filters
  const uniqueWorkTypes = Array.from(new Set(data?.data?.requests?.map((r: UserRequest) => r.workType).filter(Boolean) || [])) as string[];
  const uniqueActivities = Array.from(new Set(data?.data?.requests?.map((r: UserRequest) => r.activity).filter(Boolean) || [])) as string[];

  // Time slot helper function
  const getTimeSlot = (timeStr: string) => {
    if (!timeStr) return "N/A";
    const hour = new Date(timeStr).getUTCHours();
    if (hour >= 20 || hour < 4) return "20:00-04:00";
    if (hour >= 4 && hour < 12) return "04:00-12:00";
    return "12:00-20:00";
  };

  // Filter requests based on department and other filters
  const filteredRequests = data?.data?.requests?.filter((request: UserRequest) => {
    const departmentMatch = departmentTab === 'all' ||
      (departmentTab === 'snt' ? request.selectedDepartment?.toUpperCase() === 'S&T' :
        request.selectedDepartment?.toUpperCase() === departmentTab.toUpperCase());
    const workTypeMatch = workTypeFilter === "ALL" || request.workType === workTypeFilter;
    const activityMatch = activityFilter === "ALL" || request.activity === activityFilter;
    const timeSlotMatch = timeSlotFilter === "ALL" || getTimeSlot(request.demandTimeFrom) === timeSlotFilter;

    return departmentMatch && workTypeMatch && activityMatch && timeSlotMatch;
  }) || [];

  // Separate corridor and non-corridor requests
  const corridorRequests = filteredRequests.filter(
    (request: UserRequest) => request.corridorType === "Corridor"
  );

  const nonCorridorRequests = filteredRequests.filter(
    (request: UserRequest) => request.corridorType === "Outside Corridor"
  );

  const [optimizedData, setOptimizedData] = useState<UserRequest[] | null>(null);

  interface SanctionRequest {
    id: string;
    optimizeTimeFrom: string;
    optimizeTimeTo: string;
  }

  // Add this with your other mutations
  const updateSanctionStatus = useMutation({
    mutationFn: (requests: SanctionRequest[]) =>
      adminService.updateSanctionStatus(requests),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["approved-requests", currentWeekStart],
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      console.error("Error updating sanction status:", error);
      alert("Failed to update sanction status. Please try again.");
    },
  });

  const handleSendClick = () => {
    const requestsToSanction = data?.data?.requests
      ?.filter(
        (request: UserRequest) =>
          request.optimizeStatus === true &&
          !request.isSanctioned &&
          request?.optimizeData?.optimizeTimeFrom &&
          request?.optimizeData?.optimizeTimeTo
      )
      ?.map(
        (request: UserRequest): SanctionRequest => ({
          id: request.id,
          optimizeTimeFrom: request.optimizeData.optimizeTimeFrom,
          optimizeTimeTo: request.optimizeData.optimizeTimeTo,
        })
      );

    if (!requestsToSanction || requestsToSanction.length === 0) {
      alert("No valid requests available to send for sanction");
      return;
    }

    if (confirm(`Send ${requestsToSanction.length} request(s) for sanction?`)) {
      updateSanctionStatus.mutate(requestsToSanction);
    }
  };

  // Mutation for updating optimized times
  const updateOptimizedTimes = useMutation({
    mutationFn: (data: {
      requestId: string;
      optimizeTimeFrom: string;
      optimizeTimeTo: string;
    }) => adminService.updateOptimizeTimes(data),
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["approved-requests", apiStartDate, apiEndDate, isUrgentMode],
        (oldData: any) => {
          if (!oldData) return oldData;
          const updatedRequests = oldData.data.requests.map((req: UserRequest) => {
            if (req.id === response.data.id) {
              return {
                ...req,
                optimizeTimeFrom: response.data.optimizeTimeFrom,
                optimizeTimeTo: response.data.optimizeTimeTo,
                optimizeData: {
                  ...req.optimizeData,
                  optimizeTimeFrom: response.data.optimizeTimeFrom,
                  optimizeTimeTo: response.data.optimizeTimeTo
                }
              };
            }
            return req;
          });
          return {
            ...oldData,
            data: {
              ...oldData.data,
              requests: updatedRequests
            }
          };
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["approved-requests", apiStartDate, apiEndDate, isUrgentMode],
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setEditingId(null);
    },
    onError: (error) => {
      console.error("Error updating times:", error);
      alert("Failed to update times. Please try again.");
    },
  });

  // Format date and time helpers
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy");
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
    } catch (error) {
      console.error("Error formatting time:", error, dateString);
      return "N/A";
    }
  };

  // Function to navigate to previous/next period
  const handleWeekChange = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => {
      if (isUrgentMode) {
        return direction === "prev" ? subDays(prev, 1) : addDays(prev, 1);
      } else {
        return direction === "prev" ? subDays(prev, 7) : addDays(prev, 7);
      }
    });
  };

  // Edit functionality
  const handleEditClick = (request: UserRequest) => {
    setEditingId(request.id);
    setTimeFrom(
      request.optimizeData?.optimizeTimeFrom
        ? formatTime(request.optimizeData.optimizeTimeFrom)
        : ""
    );
    setTimeTo(
      request.optimizeData?.optimizeTimeTo
        ? formatTime(request.optimizeData.optimizeTimeTo)
        : ""
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTimeFrom("");
    setTimeTo("");
  };

  // Delete mutation
  const deleteRequestMutation = useMutation({
    mutationFn: (requestId: string) => adminService.deleteRequest(requestId),
    onMutate: (requestId) => {
      setDeletingIds((prev) => new Set(prev).add(requestId));
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({
        queryKey: ["approved-requests", currentWeekStart],
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    },
    onError: (error, requestId) => {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Please try again.");
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    },
  });

  const handleDelete = (requestId: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteRequestMutation.mutate(requestId);
    }
  };

  const handleUpdateClick = (requestId: string) => {
    if (!timeFrom || !timeTo) {
      alert("Please fill both start and end times");
      return;
    }

    try {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(timeFrom) || !timeRegex.test(timeTo)) {
        throw new Error("Time must be in HH:mm format (e.g., 14:30)");
      }

      // Create Date objects in local time
      const localFrom = new Date(`${format(new Date(), "yyyy-MM-dd")}T${timeFrom}`);
      const localTo = new Date(`${format(new Date(), "yyyy-MM-dd")}T${timeTo}`);

      // Convert to ISO strings without timezone adjustment
      const optimizeTimeFromISO = formatForBackend(localFrom);
      const optimizeTimeToISO = formatForBackend(localTo);

      updateOptimizedTimes.mutate({
        requestId,
        optimizeTimeFrom: optimizeTimeFromISO,
        optimizeTimeTo: optimizeTimeToISO,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Invalid input");
    }
  };

  // Helper function to format time for backend
  const formatForBackend = (date: Date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00.000Z`;
  };

  // Helper function to pad numbers with leading zero
  const pad = (num: number) => num.toString().padStart(2, '0');

  const getOptimisedTime = (request: UserRequest) => {
    if (request.optimizeData?.optimizeTimeFrom && request.optimizeData?.optimizeTimeTo) {
      return `${formatTime(request.optimizeData.optimizeTimeFrom)} - ${formatTime(request.optimizeData.optimizeTimeTo)}`;
    }
    return "N/A";
  };

  const getAdjacentLinesAffected = (request: UserRequest): string => {
    if (request.adjacentLinesAffected) {
      return request.adjacentLinesAffected;
    }

    if (request.processedLineSections) {
      const affectedLines = request.processedLineSections.map(section => {
        if (section.type === 'yard') {
          return section.otherRoads;
        }
        return section.otherLines;
      }).filter(Boolean).join(", ");

      return affectedLines || "N/A";
    }

    return "N/A";
  };

  const handleDownloadCSV = () => {
    if (!data?.data?.requests) return;

    // Get the current filtered requests
    const requestsToDownload = filteredRequests;

    // Create CSV headers
    const headers = [
      "Date",
      "Major Section",
      "Depot",
      "Block Section",
      "Line/Road",
      "Adjacent Lines Affected",
      "Work Type",
      "Corridor Type",
      "Activity",
      "Demanded Time From",
      "Demanded Time To",
      "Optimized Time From",
      "Optimized Time To",
      "Requested By",
      "Department",
      "Description"
    ];

    // Create CSV rows
    const rows = requestsToDownload.map((request: UserRequest) => [
      formatDate(request.date),
      request.selectedSection || "N/A",
      request.selectedDepo || "N/A",
      request.missionBlock || "N/A",
      getLineOrRoad(request),
      request.adjacentLinesAffected || getAdjacentLinesAffected(request),
      request.workType || "N/A",
      request.corridorType || "N/A",
      request.activity || "N/A",
      formatTime(request.demandTimeFrom || ""),
      formatTime(request.demandTimeTo || ""),
      formatTime(request.optimizeTimeFrom || ""),
      formatTime(request.optimizeTimeTo || ""),
      request.user?.name || "N/A",
      request.selectedDepartment || "N/A",
      request.requestremarks || "N/A"
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(","))
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `optimized_requests_${format(currentWeekStart, "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="bg-white p-3 border border-black">
      {showSuccess && (
        <div className="fixed top-20 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Operation successful!
        </div>
      )}

      <div className="border-b-2 border-[#13529e] pb-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-[#13529e]">Optimized Requests</h1>
        {isUrgentMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWeekChange("prev")}
              className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-800"
            >
              Previous Day
            </button>
            <span className="text-sm font-medium text-black">
              Date: {format(currentWeekStart, "dd-MM-yyyy")}
            </span>
            <button
              onClick={() => handleWeekChange("next")}
              className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-800"
            >
              Next Day
            </button>
          </div>
        ) : (
          <WeeklySwitcher
            currentWeekStart={currentWeekStart}
            onWeekChange={handleWeekChange}
            weekStartsOn={1}
          />
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg border border-[#13529e] mb-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#13529e]">Work Type</label>
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#13529e] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#13529e] focus:border-[#13529e] text-gray-700"
            >
              <option value="ALL">All Work Types</option>
              {uniqueWorkTypes.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#13529e]">Activity</label>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#13529e] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#13529e] focus:border-[#13529e] text-gray-700"
            >
              <option value="ALL">All Activities</option>
              {uniqueActivities.map((activity: string) => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#13529e]">Time Slot</label>
            <select
              value={timeSlotFilter}
              onChange={(e) => setTimeSlotFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#13529e] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#13529e] focus:border-[#13529e] text-gray-700"
            >
              <option value="ALL">All Time Slots</option>
              <option value="20:00-04:00">Night (20:00-04:00)</option>
              <option value="04:00-12:00">Morning (04:00-12:00)</option>
              <option value="12:00-20:00">Afternoon (12:00-20:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8">
          <button
            onClick={() => setDepartmentTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${departmentTab === 'all'
              ? 'border-[#13529e] text-[#13529e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            All Requests
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              {isUrgentMode
                ? data?.data?.requests?.filter((r: UserRequest) => r.corridorType === "Urgent Block" || r.workType === "EMERGENCY").length || 0
                : data?.data?.requests?.filter((r: UserRequest) => r.corridorType !== "Urgent Block" && r.workType !== "EMERGENCY").length || 0}
            </span>
          </button>
          <button
            onClick={() => setDepartmentTab('engg')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${departmentTab === 'engg'
              ? 'border-[#13529e] text-[#13529e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Engineering
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              {isUrgentMode
                ? data?.data?.requests?.filter((r: UserRequest) => (r.corridorType === "Urgent Block" || r.workType === "EMERGENCY") && r.selectedDepartment?.toUpperCase() === 'ENGG').length || 0
                : data?.data?.requests?.filter((r: UserRequest) => r.corridorType !== "Urgent Block" && r.workType !== "EMERGENCY" && r.selectedDepartment?.toUpperCase() === 'ENGG').length || 0}
            </span>
          </button>
          <button
            onClick={() => setDepartmentTab('trd')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${departmentTab === 'trd'
              ? 'border-[#13529e] text-[#13529e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            TRD
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              {isUrgentMode
                ? data?.data?.requests?.filter((r: UserRequest) => (r.corridorType === "Urgent Block" || r.workType === "EMERGENCY") && r.selectedDepartment?.toUpperCase() === 'TRD').length || 0
                : data?.data?.requests?.filter((r: UserRequest) => r.corridorType !== "Urgent Block" && r.workType !== "EMERGENCY" && r.selectedDepartment?.toUpperCase() === 'TRD').length || 0}
            </span>
          </button>
          <button
            onClick={() => setDepartmentTab('snt')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${departmentTab === 'snt'
              ? 'border-[#13529e] text-[#13529e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            S&T
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              {isUrgentMode
                ? data?.data?.requests?.filter((r: UserRequest) => (r.corridorType === "Urgent Block" || r.workType === "EMERGENCY") && r.selectedDepartment?.toUpperCase() === 'S&T').length || 0
                : data?.data?.requests?.filter((r: UserRequest) => r.corridorType !== "Urgent Block" && r.workType !== "EMERGENCY" && r.selectedDepartment?.toUpperCase() === 'S&T').length || 0}
            </span>
          </button>
        </nav>
      </div>

      {!isUrgentMode && (
        <>
          {/* Corridor Requests Table */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-[#13529e]">
              Corridor Requests
            </h2>
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-300 shadow-sm">
              <table className="w-full border-collapse text-black bg-white">
                <thead className="sticky top-0 z-10 bg-gray-100 shadow">
                  <tr className="bg-gray-50">
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="date" title="Date" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="section" title="Major Section" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="section" title="Depot" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="section" title="Block Section" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="line" title="Line / Road" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="time" title="Optimized Time" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="work" title="Work Type" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="work" title="Activity" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="action" title="Actions" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {corridorRequests.map((request: UserRequest) => (
                    <tr
                      key={`request-${request.id}-${request.date}`}
                      className={`hover:bg-blue-50 transition-colors ${request.optimizeTimeFrom && request.optimizeTimeTo
                        ? "bg-green-50"
                        : ""
                        }`}
                    >
                      <td className="border border-black p-2 text-sm">
                        {formatDate(request.date)}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.selectedSection}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.selectedDepo}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.missionBlock}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {getLineOrRoad(request)}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.optimizeTimeFrom
                          ? formatTime(request.optimizeTimeFrom)
                          : "N/A"}{" "}
                        -{" "}
                        {request.optimizeTimeTo
                          ? formatTime(request.optimizeTimeTo)
                          : "N/A"}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.workType}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.activity}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/view-request/${request.id}?from=optimised-table-data`}
                            className="px-2 py-1 text-xs bg-[#13529e] hover:bg-[#0e4080] text-white border border-[#0e4080] rounded flex items-center"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Non-Corridor Requests Table */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[#13529e]">
              Non-Corridor Requests
            </h2>
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-300 shadow-sm">
              <table className="w-full border-collapse text-black bg-white">
                <thead className="sticky top-0 z-10 bg-gray-100 shadow">
                  <tr className="bg-gray-50">
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="date" title="Date" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="section" title="Major Section" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="section" title="Depot" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="section" title="Block Section" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="line" title="Line / Road" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="time" title="Optimized Time" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="work" title="Work Type" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="work" title="Activity" />
                    </th>
                    <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                      <ColumnHeader icon="action" title="Actions" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nonCorridorRequests.map((request: UserRequest) => (
                    <tr
                      key={`request-${request.id}-${request.date}`}
                      className={`hover:bg-blue-50 transition-colors ${request.optimizeTimeFrom && request.optimizeTimeTo
                        ? "bg-green-50"
                        : ""
                        }`}
                    >
                      <td className="border border-black p-2 text-sm">
                        {formatDate(request.date)}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.selectedSection}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.selectedDepo}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.missionBlock}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {getLineOrRoad(request)}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.optimizeTimeFrom
                          ? formatTime(request.optimizeTimeFrom)
                          : "N/A"}{" "}
                        -{" "}
                        {request.optimizeTimeTo
                          ? formatTime(request.optimizeTimeTo)
                          : "N/A"}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.workType}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {request.activity}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/view-request/${request.id}?from=optimised-table-data`}
                            className="px-2 py-1 text-xs bg-[#13529e] hover:bg-[#0e4080] text-white border border-[#0e4080] rounded flex items-center"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isUrgentMode && (
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-300 shadow-sm">
          <table className="w-full border-collapse text-black bg-white">
            <thead className="sticky top-0 z-10 bg-gray-100 shadow">
              <tr className="bg-gray-50">
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="date" title="Date" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="section" title="Major Section" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="section" title="Depot" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="section" title="Block Section" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="line" title="Line / Road" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="time" title="Optimized Time" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="work" title="Work Type" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="work" title="Activity" />
                </th>
                <th className="border border-black p-2 text-left text-sm font-semibold text-black sticky top-0 bg-gray-100 z-10">
                  <ColumnHeader icon="action" title="Actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request: UserRequest) => (
                <tr
                  key={`request-${request.id}-${request.date}`}
                  className={`hover:bg-blue-50 transition-colors ${request.optimizeTimeFrom && request.optimizeTimeTo
                    ? "bg-green-50"
                    : ""
                    }`}
                >
                  <td className="border border-black p-2 text-sm">
                    {formatDate(request.date)}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    {request.selectedSection}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    {request.selectedDepo}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    {request.missionBlock}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    {getLineOrRoad(request)}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    {request.optimizeTimeFrom
                      ? formatTime(request.optimizeTimeFrom)
                      : "N/A"}{" "}
                    -{" "}
                    {request.optimizeTimeTo
                      ? formatTime(request.optimizeTimeTo)
                      : "N/A"}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    {request.workType}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    {request.activity}
                  </td>
                  <td className="border border-black p-2 text-sm">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/view-request/${request.id}?from=optimised-table-data`}
                        className="px-2 py-1 text-xs bg-[#13529e] hover:bg-[#0e4080] text-white border border-[#0e4080] rounded flex items-center"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1 text-right">
        © {new Date().getFullYear()} Indian Railways
      </div>
    </div>
  );
}
