// "use client";

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { managerService, UserRequest } from "@/app/service/api/manager";
// import {
//   format,
//   parseISO,
//   addDays,
//   subDays,
//   startOfWeek,
//   endOfWeek,
//   isAfter,
//   isBefore,
//   isEqual,
// } from "date-fns";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useUrgentMode } from "@/app/context/UrgentModeContext";
// import { WeeklySwitcher } from "@/app/components/ui/WeeklySwitcher";
// import { useSession } from "next-auth/react";
// import { useRef } from "react";

// export default function ManagerRequestTablePage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const queryClient = useQueryClient();
//   const { isUrgentMode } = useUrgentMode();
//   const { data: session } = useSession();
//   const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
//     new Set()
//   );
//   const [dateRange, setDateRange] = useState({
//     startDate: format(new Date(), "dd-MM-yy"),
//     endDate: format(new Date(), "dd-MM-yy"),
//   });
//   const [selectedSection, setSelectedSection] = useState("All");
//   const [selectedSSE, setSelectedSSE] = useState("All");
//   const [selectedType, setSelectedType] = useState("All");

//   // Initialize currentWeekStart from URL parameter or default to current date
//   const [currentWeekStart, setCurrentWeekStart] = useState(() => {
//     const dateParam = searchParams.get("date");
//     if (dateParam) {
//       const parsedDate = new Date(dateParam);
//       if (!isNaN(parsedDate.getTime())) {
//         return parsedDate;
//       }
//     }
//     const today = new Date();
//     const lastSaturday = subDays(today, (today.getDay() + 1) % 7);
//     return startOfWeek(lastSaturday, { weekStartsOn: 6 });
//   });

//   // Filters
//   const [filters, setFilters] = useState({
//     status: "ALL",
//     department: "ALL",
//     section: "ALL",
//     workType: "ALL",
//     corridorType: "ALL",
//     blockType: "All",
//     sse: "ALL", // Added SSE to filters
//   });

//   // Dropdown open states
//   const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
//   const [sseDropdownOpen, setSseDropdownOpen] = useState(false);
//   const [blockTypeDropdownOpen, setBlockTypeDropdownOpen] = useState(false);

//   // Multi-select state
//   const [selectedSections, setSelectedSections] = useState<string[]>([]);
//   const [selectedSSEs, setSelectedSSEs] = useState<string[]>([]);

//   // Date range state
//   const [customDateRange, setCustomDateRange] = useState({
//     start: "",
//     end: "",
//   });

//   // Calculate week range
//   const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 6 });
//   const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 6 });

//   // Fetch all requests initially (no date filter)
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["requests", filters],
//     queryFn: () =>
//       managerService.getUserRequestsByManager(
//         1,
//         10000, // Large limit to fetch all
//         undefined,
//         undefined,
//         filters.status !== "ALL" ? filters.status : undefined
//       ),
//   });

//   // Section options
//   const sectionOptions = Array.from(
//     new Set(
//       data?.data?.requests?.map((r: UserRequest) => r.selectedSection) || []
//     )
//   );
//   // SSE options
//   const sseOptions = Array.from(
//     new Set(data?.data?.requests?.map((r: UserRequest) => r.user?.name) || [])
//   );
//   // Block type options
//   const blockTypeOptions = [
//     { label: "All", value: "All" },
//     { label: "Corridor (C)", value: "CORRIDOR" },
//     { label: "Non-corridor(NC)", value: "NON_CORRIDOR" },
//     { label: "Emergency (E)", value: "EMERGENCY" },
//     { label: "Mega Block (M)", value: "MEGA_BLOCK" },
//   ];

//   // Format date
//   const formatDate = (dateString: string) => {
//     try {
//       return format(parseISO(dateString), "dd-MM-yyyy");
//     } catch {
//       return "Invalid date";
//     }
//   };

//   // Format time
//   const formatTime = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "N/A";

//       // Format as 24-hour time (HH:mm) using UTC
//       const hours = date.getUTCHours().toString().padStart(2, "0");
//       const minutes = date.getUTCMinutes().toString().padStart(2, "0");
//       return `${hours}:${minutes}`;
//     } catch (error) {
//       console.error("Error formatting time:", error, dateString);
//       return "N/A";
//     }
//   };

//   // Status mapping function for table display
//   function getDisplayStatus(request: UserRequest) {
//     // Sanctioned (light green)
//     if (request.status === "APPROVED" && request.isSanctioned) {
//       return {
//         label: "Sanctioned",
//         style: { background: "#d6ecd2", color: "#11332b" },
//       };
//     }
//     // Pending with OPTG (yellow)
//     if (request.status === "APPROVED" && !request.isSanctioned) {
//       return {
//         label: "Pending with Optg",
//         style: { background: "#fff86b", color: "#222" },
//       };
//     }
//     // Returned by Optg (red)
//     if (
//       request.status === "REJECTED" &&
//       request.adminRequestStatus === "REJECTED"
//     ) {
//       return {
//         label: "Returned by Optg",
//         style: { background: "#ff4e36", color: "#fff" },
//       };
//     }
//     // Not-availed/availed/cancelled (white)
//     if (["NOT_AVAILED", "AVAILED", "CANCELLED"].includes(request.userStatus)) {
//       return {
//         label: "Not-availed/availed/cancelled",
//         style: { background: "#fff", color: "#222" },
//       };
//     }
//     // Returned to applicant (light blue)
//     if (request.status === "REJECTED" && request.managerAcceptance === false) {
//       return {
//         label: "Returned to applicant",
//         style: { background: "#8ee0ef", color: "#11332b" },
//       };
//     }
//     // Pending with me (purple)
//     if (request.status === "PENDING" && request.managerAcceptance === false) {
//       return {
//         label: "Pending with me",
//         style: { background: "#d47ed4", color: "#222" },
//       };
//     }
//     // Burst (orange)
//     if (request.status === "BURST") {
//       return {
//         label: "Burst",
//         style: { background: "#ff944c", color: "#fff" },
//       };
//     }
//     // Default fallback (white)
//     return {
//       label: request.status,
//       style: { background: "#fff", color: "#222" },
//     };
//   }

//   // Handle week/day navigation
//   const handleWeekChange = (direction: "prev" | "next") => {
//     setCurrentWeekStart((prev) => {
//       if (isUrgentMode) {
//         // For urgent mode, move by one day
//         const newDate =
//           direction === "prev" ? subDays(prev, 1) : addDays(prev, 1);
//         return newDate;
//       } else {
//         // For normal mode, move by one week
//         return direction === "prev" ? subDays(prev, 7) : addDays(prev, 7);
//       }
//     });
//   };

//   // Handle block type filter
//   const handleBlockTypeFilter = (type: string) => {
//     setFilters((prev) => ({
//       ...prev,
//       blockType: type,
//     }));
//   };

//   // Handle section filter
//   const handleSectionFilter = (section: string) => {
//     setFilters((prev) => ({
//       ...prev,
//       section: section,
//     }));
//   };

//   // Handle SSE filter
//   const handleSSEFilter = (sse: string) => {
//     setFilters((prev) => ({
//       ...prev,
//       sse: sse,
//     }));
//   };

//   // Date filter logic (frontend)
//   const applyDateFilter = (requests: UserRequest[]) => {
//     if (!customDateRange.start && !customDateRange.end) return requests;
//     return requests.filter((request) => {
//       const reqDate = parseISO(request.date);
//       const start = customDateRange.start
//         ? parseISO(customDateRange.start)
//         : undefined;
//       const end = customDateRange.end
//         ? parseISO(customDateRange.end)
//         : undefined;
//       if (start && end) {
//         return (
//           (isAfter(reqDate, start) || isEqual(reqDate, start)) &&
//           (isBefore(reqDate, end) || isEqual(reqDate, end))
//         );
//       } else if (start) {
//         return isAfter(reqDate, start) || isEqual(reqDate, start);
//       } else if (end) {
//         return isBefore(reqDate, end) || isEqual(reqDate, end);
//       }
//       return true;
//     });
//   };

//   // Filter requests based on all filters (except date)
//   const filteredRequests =
//     data?.data?.requests?.filter((request: UserRequest) => {
//       const statusMatch =
//         filters.status === "ALL" || request.status === filters.status;
//       const departmentMatch =
//         filters.department === "ALL" ||
//         request.selectedDepartment === filters.department;
//       const sectionMatch =
//         selectedSections.length === 0 ||
//         selectedSections.includes(request.selectedSection);
//       const workTypeMatch =
//         filters.workType === "ALL" || request.workType === filters.workType;
//       const corridorTypeMatch =
//         filters.corridorType === "ALL" ||
//         request.corridorType === filters.corridorType;
//       const blockTypeMatch =
//         filters.blockType === "All" ||
//         (filters.blockType === "CORRIDOR" &&
//           request.corridorType === "CORRIDOR") ||
//         (filters.blockType === "NON_CORRIDOR" &&
//           request.corridorType === "NON_CORRIDOR") ||
//         (filters.blockType === "EMERGENCY" &&
//           request.corridorType === "EMERGENCY") ||
//         (filters.blockType === "MEGA_BLOCK" &&
//           request.corridorType === "MEGA_BLOCK");
//       const sseMatch =
//         selectedSSEs.length === 0 || selectedSSEs.includes(request.user?.name);
//       return (
//         statusMatch &&
//         departmentMatch &&
//         sectionMatch &&
//         workTypeMatch &&
//         corridorTypeMatch &&
//         blockTypeMatch &&
//         sseMatch
//       );
//     }) || [];

//   // Apply date filter last
//   const dateFilteredRequests = applyDateFilter(filteredRequests);

//   // Bulk approve mutation
//   const approveMutation = useMutation({
//     mutationFn: async (requestIds: string[]) => {
//       const promises = requestIds.map((id) =>
//         managerService.acceptUserRequest(id, true)
//       );
//       await Promise.all(promises);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["requests"] });
//       setSelectedRequests(new Set());
//     },
//   });

//   // Handle select all
//   const handleSelectAll = () => {
//     const selectableRequests = dateFilteredRequests.filter(
//       (request) => request.status === "PENDING" && !request.managerAcceptance
//     );
//     if (selectedRequests.size === selectableRequests.length) {
//       setSelectedRequests(new Set());
//     } else {
//       setSelectedRequests(new Set(selectableRequests.map((r) => r.id)));
//     }
//   };

//   // Handle individual selection
//   const handleSelectRequest = (requestId: string) => {
//     const request = dateFilteredRequests.find((r) => r.id === requestId);
//     if (request && request.status === "PENDING" && !request.managerAcceptance) {
//       const newSelected = new Set(selectedRequests);
//       if (newSelected.has(requestId)) {
//         newSelected.delete(requestId);
//       } else {
//         newSelected.add(requestId);
//       }
//       setSelectedRequests(newSelected);
//     }
//   };

//   // Handle bulk approve
//   const handleBulkApprove = () => {
//     if (selectedRequests.size > 0) {
//       if (
//         confirm(
//           `Are you sure you want to approve ${selectedRequests.size} requests?`
//         )
//       ) {
//         approveMutation.mutate(Array.from(selectedRequests));
//       }
//     }
//   };

//   // Handlers for multi-select
//   const handleSectionToggle = (section: string) => {
//     setSelectedSections((prev) =>
//       prev.includes(section)
//         ? prev.filter((s) => s !== section)
//         : [...prev, section]
//     );
//   };
//   const handleSSEToggle = (sse: string) => {
//     setSelectedSSEs((prev) =>
//       prev.includes(sse) ? prev.filter((s) => s !== sse) : [...prev, sse]
//     );
//   };
//   // Handler for block type radio
//   const handleBlockTypeRadio = (type: string) => {
//     setFilters((prev) => ({ ...prev, blockType: type }));
//     setBlockTypeDropdownOpen(false);
//   };
//   // Handler for date pickers
//   const handleDateChange = (field: "start" | "end", value: string) => {
//     setCustomDateRange((prev) => ({ ...prev, [field]: value }));
//   };

//   // Update filters when multi-select changes
//   useEffect(() => {
//     setFilters((prev) => ({
//       ...prev,
//       section:
//         selectedSections.length === 0 ? "ALL" : selectedSections.join(","),
//       sse: selectedSSEs.length === 0 ? "ALL" : selectedSSEs.join(","),
//     }));
//   }, [selectedSections, selectedSSEs]);
//   // Update filters when date changes
//   useEffect(() => {
//     if (customDateRange.start && customDateRange.end) {
//       setFilters((prev) => ({
//         ...prev,
//         startDate: customDateRange.start,
//         endDate: customDateRange.end,
//       }));
//     }
//   }, [customDateRange]);

//   // Calculate pending with me count
//   const pendingWithMeCount = (data?.data?.requests || []).filter(
//     (r: UserRequest) => r.status === "PENDING" && r.managerAcceptance === false
//   ).length;

//   if (isLoading) {
//     return (
//       <div className="bg-white p-3 border border-black mb-3">
//         <div className="text-center py-5">Loading requests...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-white p-3 border border-black mb-3">
//         <div className="text-center py-5 text-red-600">
//           Error loading requests. Please try again.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FFFDF5]">
//       {/* Top Yellow Bar */}
//       <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
//         <span className="text-4xl font-bold text-[#B57CF6] tracking-widest">
//           RBMS
//         </span>
//       </div>

//       {/* Main Title on Light Blue */}
//       <div className="w-full bg-[#D6F3FF] py-3 flex flex-col items-center border-b-2 border-black">
//         <span className="text-2xl md:text-3xl font-bold text-black text-center">
//           Departmental Control
//         </span>
//       </div>

//       {/* Department Name */}
//       <div className="w-full bg-[#D6F3FF] py-2 flex flex-col items-center">
//         <span className="text-xl font-bold text-black">
//           {session?.user?.department || "..."} Department
//         </span>
//       </div>

//       {/* View Block Details Button */}
//       <div className="w-full flex justify-center mt-4">
//         <button className="bg-[#FFF86B] px-8 py-2 rounded-full border-4 border-[#13529e] text-lg font-bold text-[#13529e] shadow-md hover:bg-[#B57CF6] hover:text-white transition-colors">
//           View Block Details
//         </button>
//       </div>

//       {/* Pending Requests Section */}
//       <div className="mx-4 mt-6">
//         <div className="bg-[#FF6B6B] grid grid-cols-3 gap-0 border-2 border-black">
//           <div className="p-3 text-black font-bold border-r-2 border-black">
//             REQUESTS PENDING WITH ME
//           </div>
//           <div className="p-3 text-black font-bold border-r-2 border-black text-center">
//             Nos. {pendingWithMeCount}
//           </div>
//           <Link
//             href="/manage/pending-requests"
//             className="p-3 text-black font-bold text-center hover:bg-[#FF5555]"
//           >
//             Click to View
//           </Link>
//         </div>
//       </div>

//       {/* Filters Row: All filters in a single row */}
//       <div className="mx-4 mt-4 flex flex-wrap gap-2 items-center justify-between bg-[#D6F3FF] p-2 rounded-md border border-black">
//         {/* Date Range */}
//         <div className="flex items-center gap-1">
//           <span className="bg-[#E6E6FA] px-2 py-1 border border-black font-bold text-black rounded-l-md text-xs">
//             Custom view
//           </span>
//           <input
//             type="date"
//             value={customDateRange.start}
//             onChange={(e) => handleDateChange("start", e.target.value)}
//             className="p-1 border border-black text-black bg-white w-28 focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-xs"
//           />
//           <span className="px-1 text-black text-xs">to</span>
//           <input
//             type="date"
//             value={customDateRange.end}
//             onChange={(e) => handleDateChange("end", e.target.value)}
//             className="p-1 border border-black text-black bg-white w-28 focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-xs"
//           />
//         </div>
//         {/* Block Type Dropdown (Radio) */}
//         <div className="relative inline-block">
//           <button
//             onClick={() => setBlockTypeDropdownOpen((v) => !v)}
//             className="bg-[#E6E6FA] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-xs"
//           >
//             {blockTypeOptions.find((opt) => opt.value === filters.blockType)
//               ?.label || "Block Type"}
//             <span className="ml-1">▼</span>
//           </button>
//           {blockTypeDropdownOpen && (
//             <div className="absolute z-10 mt-2 w-40 bg-white border-2 border-black rounded shadow-lg">
//               {blockTypeOptions.map((opt) => (
//                 <label
//                   key={opt.value}
//                   className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-xs"
//                 >
//                   <input
//                     type="radio"
//                     name="blockType"
//                     checked={filters.blockType === opt.value}
//                     onChange={() => handleBlockTypeRadio(opt.value)}
//                     className="mr-2 accent-[#B57CF6]"
//                   />
//                   {opt.label}
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>
//         {/* Section Dropdown (Multi-select) */}
//         <div className="relative inline-block">
//           <button
//             onClick={() => setSectionDropdownOpen((v) => !v)}
//             className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-xs"
//           >
//             Section:{" "}
//             {selectedSections.length === 0
//               ? "All"
//               : `${selectedSections.length} selected`}
//             <span className="ml-1">▼</span>
//           </button>
//           {sectionDropdownOpen && (
//             <div className="absolute z-10 mt-2 w-40 bg-white border-2 border-black rounded shadow-lg max-h-60 overflow-y-auto">
//               {sectionOptions.map((section) => (
//                 <label
//                   key={section}
//                   className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-xs"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedSections.includes(section)}
//                     onChange={() => handleSectionToggle(section)}
//                     className="mr-2 accent-[#B57CF6]"
//                   />
//                   {section}
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>
//         {/* SSE Dropdown (Multi-select) */}
//         <div className="relative inline-block">
//           <button
//             onClick={() => setSseDropdownOpen((v) => !v)}
//             className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-xs"
//           >
//             SSE:{" "}
//             {selectedSSEs.length === 0
//               ? "All"
//               : `${selectedSSEs.length} selected`}
//             <span className="ml-1">▼</span>
//           </button>
//           {sseDropdownOpen && (
//             <div className="absolute z-10 mt-2 w-40 bg-white border-2 border-black rounded shadow-lg max-h-60 overflow-y-auto">
//               {sseOptions.map((sse) => (
//                 <label
//                   key={sse}
//                   className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-xs"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedSSEs.includes(sse)}
//                     onChange={() => handleSSEToggle(sse)}
//                     className="mr-2 accent-[#B57CF6]"
//                   />
//                   {sse}
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="text-center">
//         <h1
//           style={{
//             background: "#a0d815",
//             color: "white",
//             width: "96%",
//             margin: "0 auto",
//             padding: "0 10px",
//             borderRadius: "3px"
//           }}
//         >
//           Block Summary
//         </h1>
//       </div>
// <div className="mx-2 overflow-x-auto">
//   <div className="max-h-[60vh] overflow-y-auto border-2 border-black rounded-lg bg-white">
//     <table className="w-full text-black text-2xl relative">
//       <thead>
//         <tr className="bg-[#E8F4F8] text-black">
//           <th className="border-2 border-black p-1">Date</th>
//           <th className="border-2 border-black p-1">ID</th>
//           <th className="border-2 border-black p-1">Block Section</th>
//           <th className="border-2 border-black p-1">
//             UP/DN/SL/RO AD NO.
//           </th>
//           <th className="border-2 border-black p-1">Duration</th>
//           <th className="border-2 border-black p-1">Activity</th>
//           <th className="border-2 border-black p-1 sticky right-0 z-10 bg-[#E8F4F8]">
//             Status
//           </th>
//         </tr>
//       </thead>
//       <tbody>
//         {dateFilteredRequests.map((request: UserRequest, index: number) => {
//           const status = getDisplayStatus(request);
//           // Determine background color based on index (even or odd)
//           const rowBgColor = index % 2 === 0 ? 'bg-[#FFE5EC]' : 'bg-white';

//           return (
//             <tr
//               key={request.id}
//               className={`${rowBgColor} hover:bg-[#F3F3F3]`}
//             >
//               <td className="border border-black p-1 text-center">
//                 {formatDate(request.date)}
//               </td>
//               <td className="border border-black p-1 text-center">
//                 <Link
//                   href={`/manage/view-request/${request.id}?from=request-table`}
//                   className="text-[#13529e] hover:underline font-semibold"
//                 >
//                   {request.id}
//                 </Link>
//               </td>
//               <td className="border border-black p-1">
//                 {request.selectedSection}
//               </td>
//               <td className="border border-black p-1 text-center">
//                 {request.processedLineSections?.[0]?.lineName || "N/A"}
//               </td>
//               <td className="border border-black p-1 text-center">
//                 {formatTime(request.demandTimeFrom)} -{" "}
//                 {formatTime(request.demandTimeTo)}
//               </td>
//               <td className="border border-black p-1">
//                 {request.workType}
//               </td>
//               <td
//                 className="border border-black p-1 sticky right-0 z-10 text-center font-bold"
//                 style={status.style}
//               >
//                 <span className="w-full block text-base">
//                   {status.label}
//                 </span>
//               </td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>
//   </div>
// </div>
//       <div className="text-center">
//         <h3 className="inline-flex bg-[#cfd4ff]  py-1 px-6 rounded-full" style={{color:"black"}}>
//           Click ID to see details of a Block.
//         </h3>
//         <h3 className="bg-[#cfd4ff]  mt-1 rounded-full py-2" style={{color:"black"}}>
//           For printing the complete table, click to download in{" "}
//           <span className="font-bold" style={{ color: "#5ec4e2" }}>
//             .csv format
//           </span>
//         </h3>
//       </div>

//       {/* Action Buttons below the scrollable window */}
//       <div className="mx-4 mt-6 mb-8 flex justify-center gap-4">
//         <button className="bg-[#FFA07A] px-8 py-2 rounded-lg border-2 border-black font-bold">
//           Download
//         </button>
//         <Link
//           href="/dashboard"
//           className="bg-[#90EE90] px-8 py-2 rounded-lg border-2 border-black font-bold"
//         >
//           Home
//         </Link>
//       </div>
//     </div>
//   );
// }

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

  // Fetch all requests initially (no date filter)
  const { data, isLoading, error } = useQuery({
    queryKey: ["requests", customDateRange],
    queryFn: () =>
      managerService.getUserRequestsByManager(
        1,
        10000, // Large limit to fetch all
        customDateRange.start || undefined,
        customDateRange.end || undefined
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
    updateQueryParams({ startDate: updated.start, endDate: updated.end });
    return updated;
  });
};

useEffect(() => {
  const section = searchParams.get("section");
  const sse = searchParams.get("sse");
  const blockType = searchParams.get("blockType");
  const start = searchParams.get("startDate");
  const end = searchParams.get("endDate");

  if (section) setSelectedSections(section.split(","));
  if (sse) setSelectedSSEs(sse.split(","));
  if (blockType) setBlockType(blockType.split(","));
  if (start || end) setCustomDateRange({ start: start || "", end: end || "" });
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
      ];

      // Map data to Excel rows
      const rows = filteredRequests.map((request) => {
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
        ];
      });

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Block Requests");

      // Generate Excel file and trigger download
      const dateString = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `block_requests_${dateString}.xlsx`);
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
<div className="flex justify-center mb-8 mt-2 bg-[#E8E0FF] rounded-2xl">
  <div className="w-full max-w-6xl rounded-t-2xl rounded-b-xl   p-0">
    {/* Header */}
    <div className="bg-[#B57CF6] text-white text-center p-3 rounded-xl">
      <h1 className="text-2xl font-bold tracking-wide">View Summary of Sanctioned Blocks</h1>
    </div>
    
    {/* Filters Section */}
    <div className="px-6 py-4 ">
      <div className="flex flex-wrap gap-3 items-center justify-between bg-[#F8F0FF] p-3 rounded-lg border-2 border-[#B57CF6]">
        {/* Date Range */}
        <div className="flex flex-col items-center gap-2">
          <input
            type="date"
            value={customDateRange.start}
            onChange={(e) =>
              setCustomDateRange((r) => ({ ...r, start: e.target.value }))
            }
            className="p-2 border-2 border-[#B57CF6] text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-2xl"
          />
          <span className="px-1 text-black font-medium">to</span>
          <input
            type="date"
            value={customDateRange.end}
            onChange={(e) =>
              setCustomDateRange((r) => ({ ...r, end: e.target.value }))
            }
            className="p-2 border-2 border-[#B57CF6] text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-2xl"
          />
        </div>

        {/* Section Dropdown */}

        
        <div className="relative text-2xl">
          <button
            onClick={() => setSectionDropdownOpen((v) => !v)}
            className="bg-[#D6C2FF] px-4 py-2 rounded-lg border-2 border-[#B57CF6] font-semibold text-black flex items-center gap-2 hover:bg-[#C9B2FF] transition"
          >
            Section: {selectedSections.length === 0 ? "All" : `${selectedSections.length} selected`}
            <span className="ml-1">▼</span>
          </button>
          {sectionDropdownOpen && (
            <div className="absolute z-50 mt-1 w-48 bg-white border-2 border-[#B57CF6] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {sectionOptions.map((section) => (
                <label
                  key={section}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#F0E6FF] text-black"
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section)}
                    onChange={() =>
                      setSelectedSections((prev) =>
                        prev.includes(section)
                          ? prev.filter((s) => s !== section)
                          : [...prev, section]
                      )
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
        <div className="relative text-2xl">
          <button
            onClick={() => setSseDropdownOpen((v) => !v)}
            className="bg-[#D6C2FF] px-4 py-2 rounded-lg border-2 border-[#B57CF6] font-semibold text-black flex items-center gap-2 hover:bg-[#C9B2FF] transition"
          >
            SSE: {selectedSSEs.length === 0 ? "All" : `${selectedSSEs.length} selected`}
            <span className="ml-1">▼</span>
          </button>
          {sseDropdownOpen && (
            <div className="absolute z-10 mt-1 w-48 bg-white border-2 border-[#B57CF6] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {sseOptions.map((sse) => (
                <label
                  key={sse}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#F0E6FF] text-black"
                >
                  <input
                    type="checkbox"
                    checked={selectedSSEs.includes(sse)}
                    onChange={() =>
                      setSelectedSSEs((prev) =>
                        prev.includes(sse)
                          ? prev.filter((s) => s !== sse)
                          : [...prev, sse]
                      )
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
        <div className="relative text-2xl">
          <button
            onClick={() => setBlockTypeDropdownOpen((v) => !v)}
            className="bg-[#E6D6FF] px-4 py-2 rounded-lg border-2 border-[#B57CF6] font-semibold text-black flex items-center gap-2 hover:bg-[#D9C4FF] transition"
          >
            Block Type: {blockType.length === 0 ? "All" : `${blockType.length} selected`}
            <span className="ml-1">▼</span>
          </button>
          {blockTypeDropdownOpen && (
            <div className="absolute z-50 mt-1 w-48 bg-white border-2 border-[#B57CF6] rounded-lg shadow-lg">
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

        <button
          onClick={() => setFiltersApplied(true)}
          className="text-2xl mx-auto bg-[#B57CF6] px-6 py-2 rounded-[50%] border-2 border-[#8E44AD] font-bold text-white hover:bg-[#A56CE6] transition shadow-md"
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



