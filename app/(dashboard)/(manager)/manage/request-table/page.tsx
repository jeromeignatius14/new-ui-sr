"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService, UserRequest } from "@/app/service/api/manager";
import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  isEqual,
} from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUrgentMode } from "@/app/context/UrgentModeContext";
import { WeeklySwitcher } from "@/app/components/ui/WeeklySwitcher";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import dayjs from "dayjs";
import { request } from "http";

export default function ManagerRequestTablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isUrgentMode } = useUrgentMode();
  const { data: session } = useSession();
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set()
  );
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), "dd-MM-yy"),
    endDate: format(new Date(), "dd-MM-yy"),
  });

  // Dropdown states
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [sseDropdownOpen, setSseDropdownOpen] = useState(false);
  const [blockTypeDropdownOpen, setBlockTypeDropdownOpen] = useState(false);

  // Selected filters
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSSEs, setSelectedSSEs] = useState<string[]>([]);
  const [blockType, setBlockType] = useState<string[]>([]);
  const [type, setType] = useState<string[]>([]);
  const [section, setSection] = useState<string[]>([]);
  const [sse, setSse] = useState<string[]>([]);

  const [divisionIdSearch, setDivisionIdSearch] = useState<string>("");


  // Sync derived states
  useEffect(() => {
    setType(blockType);
  }, [blockType]);

  useEffect(() => {
    setSection(selectedSections);
  }, [selectedSections]);

  useEffect(() => {
    setSse(selectedSSEs);
  }, [selectedSSEs]);

  // Initialize currentWeekStart from URL parameter or default to current date
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    const today = new Date();
    const lastSaturday = subDays(today, (today.getDay() + 1) % 7);
    return startOfWeek(lastSaturday, { weekStartsOn: 6 });
  });

  // Date range state
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });

  // Calculate week range
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 6 });
  const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 6 });
let someId=""
if(session?.user?.id!=="852e95b1-a568-4571-99e4-96bf7e02ba01"&&session?.user.department==="ENGG"&&session?.user.role==="DEPT_CONTROLLER")
  {
    someId="852e95b1-a568-4571-99e4-96bf7e02ba01"
  }
  if(session?.user?.id!=="596aad5b-1e8b-42c1-ad1c-244d8774dedc"&&session?.user.department==="TRD"&&session?.user.role==="DEPT_CONTROLLER")
  {
    someId="596aad5b-1e8b-42c1-ad1c-244d8774dedc"
  }
  if(session?.user?.id!=="78a2a1d7-037a-4948-aa86-a33adf1a6596"&&session?.user.department==="S&T"&&session?.user.role==="DEPT_CONTROLLER")
  {
    someId="78a2a1d7-037a-4948-aa86-a33adf1a6596"
  }
  // Fetch all requests initially (no date filter)
  const { data, isLoading, error } = useQuery({
    queryKey: ["requests", customDateRange],
    queryFn: () =>
      managerService.getUserRequestsByManager(
        1,
        10000, 
        customDateRange.start || undefined,
        customDateRange.end || undefined,
        undefined,      
        someId || undefined
      ),
  });

  // Section options
  const sectionOptions = Array.from(
    new Set(
      data?.data?.requests?.map((r: UserRequest) => r.selectedSection) || []
    )
  );
  // SSE options
  const sseOptions = Array.from(
    new Set(data?.data?.requests?.map((r: UserRequest) => r.user?.name) || [])
  );
  // Block type options
  const blockTypeOptions = [
    { label: "Corridor (C)", value: "Corridor" },
    { label: "Non-corridor(NC)", value: "Outside Corridor" },
    { label: "Emergency (E)", value: "Urgent Block" },
    { label: "Mega Block (M)", value: "MEGA_BLOCK" },
  ];

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      // Format as 24-hour time (HH:mm) using UTC
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time:", error, dateString);
      return "N/A";
    }
  };

  const handleDateChange = (key: "start" | "end", value: string) => {    
  setCustomDateRange((prev) => {
    const updated = { ...prev, [key]: value };
    updateQueryParams({ startDate: updated.start, endDate: updated.end, section:[]  , sse : [], blockType : [] });
    setSelectedSections([]);
    setSelectedSSEs([]);
    setBlockType([]);
    return updated;
  });
};

useEffect(() => {
  const section = searchParams.get("section");
  const sse = searchParams.get("sse");
  const blockType = searchParams.get("blockType");
  const start = searchParams.get("startDate");
  const end = searchParams.get("endDate");
  const search = searchParams.get("search");


  if (section) setSelectedSections(section.split(","));
  if (sse) setSelectedSSEs(sse.split(","));
  if (blockType) setBlockType(blockType.split(","));
  if (start || end) setCustomDateRange({ start: start || "", end: end || "" });
  if (search) setDivisionIdSearch(search);

}, [searchParams]);

const updateQueryParams = (updates: Record<string, string | string[] | null>) => {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else {
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  });

  router.replace(`?${params.toString()}`);
};
 const handleSearchChange = (value: string) => {
    setDivisionIdSearch(value);
    updateQueryParams({ search: value || null });
  };

  // Clear search
  const clearSearch = () => {
    setDivisionIdSearch("");
    updateQueryParams({ search: null });
  };
  // Status mapping function for table display
  function getDisplayStatus(request: UserRequest) {
    // Sanctioned (light green)
    if (request.status === "APPROVED" && request.isSanctioned) {
      return {
        label: "Sanctioned",
        style: { background: "#B2FBA5", color: "#11332b" },
      };
    }
    // Pending with OPTG (yellow)
    if (request.status === "APPROVED" && !request.isSanctioned) {
      return {
        label: "Pending with Optg",
        style: { background: "#fff86b", color: "#222" },
      };
    }
    // Returned by Optg (red)
    if (
      request.status === "REJECTED" &&
      request.adminRequestStatus === "REJECTED"
    ) {
      return {
        label: "Returned by Optg",
        style: { background: "#ff4e36", color: "#fff" },
      };
    }
    // Not-availed/availed/cancelled (white)
    if (["NOT_AVAILED", "AVAILED", "CANCELLED"].includes(request.userStatus)) {
      return {
        label: "Not-availed/availed/cancelled",
        style: { background: "#fff", color: "#222" },
      };
    }
    // Returned to applicant (light blue)
    if (request.status === "REJECTED" && request.managerAcceptance === false) {
      return {
        label: "Returned to applicant",
        style: { background: "#8ee0ef", color: "#11332b" },
      };
    }
    // Pending with me (purple)
    if (request.status === "PENDING" && request.managerAcceptance === false) {
      return {
        label: "Pending with me",
        style: { background: "#f69697", color: "#222" },
      };
    }
    // Burst (orange)
    if (request.status === "BURST") {
      return {
        label: "Burst",
        style: { background: "#ff944c", color: "#fff" },
      };
    }
    // Default fallback (white)
    return {
      label: request.status,
      style: { background: "#fff", color: "#222" },
    };
  }

  // Filter requests based on selected filters
  let filteredRequests = data?.data?.requests || [];
  let filteredRequestsNoChange = data?.data?.requests || [];

  if (selectedSections.length > 0) {
    filteredRequests = filteredRequests.filter((r) =>
      selectedSections.includes(r.selectedSection)
    );
  }

  if (selectedSSEs.length > 0) {
    filteredRequests = filteredRequests.filter((r) =>
      selectedSSEs.includes(r.user?.name)
    );
  }

  if (blockType.length > 0) {
    filteredRequests = filteredRequests.filter((r) =>
      blockType.includes(r.corridorType)
    );
  }

 if (divisionIdSearch.trim() !== "") {
    filteredRequests = filteredRequests.filter((r) => {
      const divisionId = r.divisionId || r.id || "";
      return divisionId.toLowerCase().includes(divisionIdSearch.toLowerCase());
    });
  }
  // Calculate pending with me count
  const pendingWithMeCountNoChange = filteredRequestsNoChange.filter(
    (r: UserRequest) => r.status === "PENDING" && r.managerAcceptance === false
  ).length;
  
  // Calculate pending with me count
  const pendingWithMeCount = filteredRequests.filter(
    (r: UserRequest) => r.status === "PENDING" && r.managerAcceptance === false
  ).length;


  const handleDownloadExcel = async () => {
    try {
      if (!filteredRequests || filteredRequests.length === 0) {
        alert("No data available to download!");
        return;
      }

      // Import xlsx library dynamically to reduce bundle size
      const XLSX = await import("xlsx");

      // Define Excel headers
      const headers = [
        "Date",
        "Request ID",
        "Block Section",
        "Line/Road",
        "Activity",
        "Status",
        "Start Time (HH:MM)",
        "End Time (HH:MM)",
        "sanctionedTimeFrom",
        "sanctionedTimeTo",
        "Corridor Type",
        "SSE Name",
        "Work Location",
        "Remarks",
        "overAll Status",
      ];

      // Map data to Excel rows
      const rows = filteredRequests.filter(request=>request.isSanctioned===true && request.overAllStatus==="Sanctioned").map((request) => {
        // Function to get exact time as stored in DB
        const getExactTime = (dateString: string | null) => {
          if (!dateString) return "N/A";

          try {
            // Extract exactly what's after 'T' and before '.'
            const isoString = new Date(dateString).toISOString();
            const timePart = isoString.split("T")[1].split(".")[0];
            return timePart.substring(0, 5); // Get HH:MM
          } catch {
            return "N/A";
          }
        };

        return [
          formatDate(request.date),
          request.divisionId || request.id,
          request.missionBlock,
          request.processedLineSections?.[0]?.road ||
            request.processedLineSections?.[0]?.lineName,
          request.activity,
          request.status || "N/A", // Added status which was in headers but missing in rows
          getExactTime(request.demandTimeFrom),
          getExactTime(request.demandTimeTo),
          getExactTime(request.sanctionedTimeFrom ?? null) || getExactTime(request.optimizeTimeFrom ?? null) || "N/A",
          getExactTime(request.sanctionedTimeTo ?? null) || getExactTime(request.optimizeTimeTo ?? null) || "N/A",

          request.corridorType,
          request.user?.name || "N/A",
          request.workLocationFrom,
          request.requestremarks,
          request.overAllStatus || "N/A", // Added overall status
        ];
      });

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Block Requests");
  const formatDateForFilename = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}/${month}/${year}`;
    };

    // Generate filename based on selected date range
    let filename;
    if (customDateRange.start && customDateRange.end) {
      const startDate = formatDateForFilename(customDateRange.start);
      const endDate = formatDateForFilename(customDateRange.end);
      filename = `block_requests_${startDate}_to_${endDate}.xlsx`;
    } else if (customDateRange.start) {
      filename = `block_requests_${formatDateForFilename(customDateRange.start)}.xlsx`;
    } else if (customDateRange.end) {
      filename = `block_requests_${formatDateForFilename(customDateRange.end)}.xlsx`;
    } else {
      filename = `block_requests_${formatDateForFilename(new Date().toISOString())}.xlsx`;
    }

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate Excel file. Please check console for details.");
    }
  };
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen text-black bg-white p-3 border border-black flex items-center justify-center">
  //       <div className="text-center py-5">Loading approved requests...</div>
  //     </div>
  //   );
  // }

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
    <div className="min-h-screen bg-[#FFFDF5]">
      

      {/* Top Yellow Bar */}
      <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
        <span className="text-[9vw] min-[430px]:text-4xl font-bold text-[#B57CF6] tracking-widest">
            RBMS-{session?.user?.location}-DIVN
        </span>
      </div>

      {/* Department Name */}
      <div className="w-full bg-[#D6F3FF] py-2 flex flex-col items-center">
        <span className="text-[24px] font-bold text-black">
          {session?.user?.department || "..."} Controller
        </span>
      </div>
<div className="mx-4">
  
<div className="flex justify-center mt-8 mb-6">
  <div className="w-full max-w-2xl rounded-2xl  bg-[#FFE5E5] shadow p-0 transform hover:scale-[1.02] transition-all duration-300">
    {/* Header */}
    <div className="text-[28px] bg-[#FF8989] rounded-2xl font-bold text-black text-center py-3 tracking-wide ">
      REQUEST WITH ME
    </div>
    
    {/* Content */}
    <div className="text-center text-[26px] text-[#B22222] pt-3 font-semibold">
      Total: <span className="text-[32px]">{pendingWithMeCountNoChange}</span>
    </div>
    
    {/* Button */}
    <div className="flex justify-center py-4">
      <Link 
        href="/manage/pending-requests" 
        className="mx-auto w-fit flex items-center gap-2 bg-[#FF8989] text-white font-bold px-8 py-3 mb-6 rounded-[50%] shadow hover:shadow-xl hover:scale-105 transition-all duration-300 text-[22px]"
      >
        Click To View
      </Link>
    </div>
  </div>
</div>
 </div>
      {/* <div className="w-full flex justify-center mt-4">
        <button className="bg-[#FFF86B] px-8 py-2 rounded-full border-4 border-[#13529e] text-lg font-bold text-[#13529e] shadow-md hover:bg-[#B57CF6] hover:text-white transition-colors">
          View Block Details
        </button>
      </div> */}
<div className="mx-4">
<div className="flex justify-center mb-8 mt-2 bg-[#E8E0FF] rounded-2xl relative">

{isLoading && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full text-black bg-white/90 p-3 border flex items-center justify-center z-50">
        <div className="text-center py-5">Loading approved requests...</div>
        
        
        

      </div>
)}
  <div className="w-full px-4 rounded-t-2xl rounded-b-xl   p-0">
    {/* Header */}
    <div className="bg-[#B57CF6] text-white text-center p-3 rounded-xl">
      <h1 className="text-2xl font-bold tracking-wide">View Summary of Sanctioned Blocks</h1>
    </div>
    
    {/* Filters Section */}
   <div className="px-4 sm:px-6 py-4">
  {/* Search Field - Outside on mobile, inside on desktop */}
  <div className="block sm:hidden mb-3">
    <div className="flex items-center gap-2 bg-[#F8F0FF] p-2 rounded-lg border-2 border-[#B57CF6] w-full">
      <label className="text-lg font-semibold text-black whitespace-nowrap">
        Search ID:
      </label>
      <div className="relative flex-1">
        <input
          type="text"
          value={divisionIdSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Enter ID..."
          className="w-full p-2 border-2 border-[#B57CF6] text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-lg pr-8"
        />
        {divisionIdSearch && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  </div>

  <div className="flex flex-wrap gap-3 items-center justify-between bg-[#F8F0FF] p-3 rounded-lg border-2 border-[#B57CF6]">
    {/* Date Range */}
    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
      <input
        type="date"
        value={customDateRange.start}
        onChange={(e) => handleDateChange("start", e.target.value)}
        className="w-full sm:w-auto p-2 border-2 border-[#B57CF6] text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-lg sm:text-2xl"
      />
      <span className="px-1 text-black font-medium">to</span>
      <input
        type="date"
        value={customDateRange.end}
        onChange={(e) => handleDateChange("end", e.target.value)}
        className="w-full sm:w-auto p-2 border-2 border-[#B57CF6] text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-lg sm:text-2xl"
      />
    </div>

    {/* Section Dropdown */}
    <div className="relative text-lg sm:text-2xl w-full sm:w-auto">
      <button
        onClick={() => setSectionDropdownOpen((v) => !v)}
        className="w-full sm:w-auto bg-[#D6C2FF] px-4 py-2 rounded-lg border-2 border-[#B57CF6] font-semibold text-black flex items-center justify-between sm:justify-center gap-2 hover:bg-[#C9B2FF] transition"
      >
        <span>Section: {selectedSections.length === 0 ? "All" : `${selectedSections.length} selected`}</span>
        <span className="ml-1">▼</span>
      </button>
      {sectionDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full sm:w-48 bg-white border-2 border-[#B57CF6] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {sectionOptions.map((section) => (
            <label
              key={section}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#F0E6FF] text-black"
            >
              <input
                type="checkbox"
                checked={selectedSections.includes(section)}
                onChange={() =>
                  setSelectedSections((prev) => {
                    const updated = prev.includes(section)
                      ? prev.filter((s) => s !== section)
                      : [...prev, section];

                    updateQueryParams({ section: updated });
                    return updated;
                  })
                }
                className="mr-2 accent-[#B57CF6]"
              />
              {section}
            </label>
          ))}
        </div>
      )}
    </div>

    {/* SSE Dropdown */}
    <div className="relative text-lg sm:text-2xl w-full sm:w-auto">
      <button
        onClick={() => setSseDropdownOpen((v) => !v)}
        className="w-full sm:w-auto bg-[#D6C2FF] px-4 py-2 rounded-lg border-2 border-[#B57CF6] font-semibold text-black flex items-center justify-between sm:justify-center gap-2 hover:bg-[#C9B2FF] transition"
      >
        <span>SSE: {selectedSSEs.length === 0 ? "All" : `${selectedSSEs.length} selected`}</span>
        <span className="ml-1">▼</span>
      </button>
      {sseDropdownOpen && (
        <div className="absolute z-40 mt-1 w-full sm:w-48 bg-white border-2 border-[#B57CF6] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {sseOptions.map((sse) => (
            <label
              key={sse}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#F0E6FF] text-black"
            >
              <input
                type="checkbox"
                checked={selectedSSEs.includes(sse)}
                onChange={() =>
                  setSelectedSSEs((prev) => {
                    const updated = prev.includes(sse)
                      ? prev.filter((s) => s !== sse)
                      : [...prev, sse];

                    updateQueryParams({ sse: updated });
                    return updated;
                  })
                }
                className="mr-2 accent-[#B57CF6]"
              />
              {sse}
            </label>
          ))}
        </div>
      )}
    </div>

    {/* Block Type Dropdown */}
    <div className="relative text-lg sm:text-2xl w-full sm:w-auto">
      <button
        onClick={() => setBlockTypeDropdownOpen((v) => !v)}
        className="w-full sm:w-auto bg-[#E6D6FF] px-4 py-2 rounded-lg border-2 border-[#B57CF6] font-semibold text-black flex items-center justify-between sm:justify-center gap-2 hover:bg-[#D9C4FF] transition"
      >
        <span>Block Type: {blockType.length === 0 ? "All" : `${blockType.length} selected`}</span>
        <span className="ml-1">▼</span>
      </button>
      {blockTypeDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full sm:w-48 bg-white border-2 border-[#B57CF6] rounded-lg shadow-lg">
          {blockTypeOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#F0E6FF] text-black"
            >
              <input
                type="checkbox"
                checked={blockType.includes(opt.value)}
                onChange={() =>
                  setBlockType((prev) => {
                    const updated = prev.includes(opt.value)
                      ? prev.filter((s) => s !== opt.value)
                      : [...prev, opt.value];

                    updateQueryParams({ blockType: updated });
                    return updated;
                  })
                }
                className="mr-2 accent-[#B57CF6]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>

    {/* Search Field - Hidden on mobile, shown on desktop */}
    <div className="hidden sm:flex items-center gap-2 bg-[#F8F0FF] p-2 rounded-lg border-2 border-[#B57CF6]">
      <label className="text-xl font-semibold text-black whitespace-nowrap">
        Search ID:
      </label>
      <div className="relative">
        <input
          type="text"
          value={divisionIdSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Enter ID..."
          className="w-48 p-1 border-2 border-[#B57CF6] text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-xl pr-8"
        />
        {divisionIdSearch && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        )}
      </div>
    </div>

    {/* Apply Filters Button */}
    <button
      onClick={() => setFiltersApplied(true)}
      className="text-lg sm:text-2xl w-full sm:w-auto mx-auto bg-[#B57CF6] px-6 py-2 rounded-[50%] border-2 border-[#8E44AD] font-bold text-white hover:bg-[#A56CE6] transition shadow-md"
    >
      click to view
    </button>
  </div>
</div>

    {/* Requests Table */}
    {filtersApplied&&(

 <div className="px-6 py-4 text-2xl">
      <div className="overflow-x-auto">
        <div className="max-h-[695px] min-h-[100px] overflow-y-auto border-2 border-[#B57CF6] rounded-lg bg-white shadow-inner">
          <table className="w-full text-black relative">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#E8D6FF] text-black">
                <th className="border-2 border-[#B57CF6] p-2">Date</th>
                <th className="border-2 border-[#B57CF6] p-2">ID</th>
                <th className="border-2 border-[#B57CF6] p-2">Block Section</th>
                <th className="border-2 border-[#B57CF6] p-2">Line/Road</th>
                <th className="border-2 border-[#B57CF6] p-2">Demanded</th>
                <th className="border-2 border-[#B57CF6] p-2">Sanctioned</th>
                <th className="border-2 border-[#B57CF6] p-2">Activity</th>
                <th className="border-2 border-[#B57CF6] p-2 sticky right-0 z-10 bg-[#E8D6FF]">
                  Status
                </th>
              </tr>
            </thead>
<tbody>
  {isLoading ? (
    <tr>
      <td colSpan={7} className="text-center py-4 border border-black">
        Loading approved requests...
      </td>
    </tr>
  ) : (
    filteredRequests.filter((request: UserRequest) => request.isSanctioned === true).length > 0 ? (
    filteredRequests
      .filter((request: UserRequest) => request.isSanctioned === true)
      .sort((a, b) => new Date(a.sanctionedTimeFrom || a.optimizeTimeFrom || a.demandTimeFrom).getTime() - new Date(b.sanctionedTimeFrom || b.optimizeTimeFrom || b.demandTimeTo).getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((request: UserRequest, index: number) => {
        const status = getDisplayStatus(request);
        const rowBgColor = index % 2 === 0 ? "bg-[#F5EEFF]" : "bg-white";

        return (
          <tr
            key={request.id}
            className={`${rowBgColor} hover:bg-[#EDE4FF]`}
          >
            <td className="border border-[#B57CF6] p-2 text-center">
              {dayjs(request.date).format("DD-MM-YY")}
            </td>
            <td className="border border-[#B57CF6] p-2 text-center">
              <Link
                href={`/manage/view-request/${request.id}?from=request-table`}
                className="text-[#6C3483] hover:underline font-semibold"
              >
                {request.divisionId || request.id}
              </Link>
            </td>
            <td className="border border-[#B57CF6] p-2 text-center">
              {request.missionBlock}
            </td>
            <td className="border border-[#B57CF6] p-2 text-center">
              {request.processedLineSections?.[0]?.lineName ||
                request.processedLineSections?.[0]?.road ||
                "N/A"}
            </td>
            <td className="border border-[#B57CF6] p-2 text-center">
              {formatTime(request.demandTimeFrom)} -{" "}
              {formatTime(request.demandTimeTo)}
            </td>
  <td className="border border-[#B57CF6] p-2 text-center">
  {request.sanctionedTimeFrom && request.sanctionedTimeTo
    ? `${formatTime(request.sanctionedTimeFrom)} - ${formatTime(request.sanctionedTimeTo)}`
    : `${formatTime(request.optimizeTimeFrom!)} - ${formatTime(request.optimizeTimeTo!)}`}
</td>


            <td className="border border-[#B57CF6] p-2">
              {request.activity}
            </td>
            <td
              className="border border-[#B57CF6] p-2 sticky right-0 z-10 text-center font-bold"
              style={status.style}
            >
              <span className="w-full block">{status.label}</span>
            </td>
          </tr>
        );
      })
  ) : (
    <tr className="min-h-[100px]">
      <td colSpan={7} className="border border-[#B57CF6] text-center text-gray-500 align-middle">
        <div className="flex items-center justify-center h-full">
          No sanctioned requests available
        </div>
      </td>
    </tr>
  )
  )}
</tbody>
          </table>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="text-center mt-4 space-y-2">
        <p className="text-2xl text-gray-700">
          Click ID to see details of a Block.
        </p>
        <p className="text-2xl text-gray-700">
          For printing the complete table, click to download in{" "}
          <span className="font-bold text-[#B57CF6]">.xlsx format</span>
        </p>
        <button
          onClick={handleDownloadExcel}
          className="mt-3 bg-[#B57CF6] hover:bg-[#9B59B6] px-6 py-2 rounded-[50%] border-2 border-[#8E44AD] font-bold text-white transition shadow-md"
        >
          Download
        </button>
      </div>
    </div>

    )}
   
  </div>
</div>
</div>
<div className="flex flex-col items-center gap-6 pb-6"> {/* Added padding-bottom and gap */}
 

  

<Link href="/manage/block-summary">
  <button className="w-fit px-16 rounded-full bg-[#ffd180] border-2 border-black py-6 text-2xl font-extrabold text-black text-center shadow-lg hover:scale-105 transition min-w-[320px]">
    GENERATE REPORTS
  </button>
</Link>
<Link href="/manage/manage-users">
  <button className="w-fit px-16 rounded-full bg-[#ffd180] border-2 border-black py-6 text-2xl font-extrabold text-black text-center shadow-lg hover:scale-105 transition min-w-[320px]">
    MANAGE USERS
  </button>
</Link>
  <button
    onClick={async () => {
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: true, callbackUrl: "/auth/login" });
    }}
    className="w-fit bg-[#FFB74D] border border-black px-10 py-1.5 rounded-[50%] text-2xl font-bold text-black mt-4"
  >
    Logout
  </button>
</div>
    </div>
  );
}



