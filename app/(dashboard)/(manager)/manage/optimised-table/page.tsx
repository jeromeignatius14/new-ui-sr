"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { managerService } from "@/app/service/api/manager";
import { useRouter} from "next/navigation";

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
  
  const { isUrgentMode } = useUrgentMode();
  const [page, setPage] = useState(1);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return isUrgentMode ? now : startOfWeek(now, { weekStartsOn: 1 }); // Start from Monday
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
      managerService.getManagerUserRequests(
        page,
        limit,
        apiStartDate,
        apiEndDate
      ),
  });

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy");
    } catch {
      return "Invalid date";
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
                    <td className="border border-black p-1 text-sm">
                      {request.optimizeTimeFrom && request.optimizeTimeTo
                        ? `${new Date(request.optimizeTimeFrom).toISOString().substring(11, 16)} - ${new Date(request.optimizeTimeTo).toISOString().substring(11, 16)}`
                        : "N/A"}
                    </td>
                    <td className="border border-black p-1 text-sm">{request.workType || "N/A"}</td>
                    <td className="border border-black p-1 text-sm">{request.activity || "N/A"}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={8} className="border border-black p-1 text-sm text-center">
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

      <div className="text-[10px] text-gray-600 mt-2 border-t border-black pt-1 text-right">
        © {new Date().getFullYear()} Indian Railways
      </div>
    </div>
  );
}