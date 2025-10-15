// "use client";

// import { useState } from "react";
// import { format } from "date-fns";
// import Link from "next/link";
// import { useSession } from "next-auth/react";
// import { useQuery } from "@tanstack/react-query";
// import { managerService } from "@/app/service/api/manager";
// import dayjs from "dayjs";

// export default function BlockSummaryPage() {
//     const { data: session } = useSession();
//     const [dateRange, setDateRange] = useState({
//         start: '',
//         end: ''
//     });
//     const [showTable, setShowTable] = useState(false);

//     // Fetch all requests beneath this manager (optionally filter by date)
//     const { data, isLoading, error, refetch } = useQuery({
//         queryKey: ["block-summary", dateRange],
//         queryFn: async () => {
//             return await managerService.getUserRequestsByManager(
//                 1,
//                 10000,
//                 dateRange.start || undefined,
//                 dateRange.end || undefined
//             );
//         },
//         enabled: false // Only fetch on submit
//     });

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         setShowTable(true);
//         refetch();
//     };

//     return (
//         <div className="min-h-screen bg-[#FFFDF5] max-w-[1366px] mx-auto px-2 pb-32">
//             {/* Top Bar */}
//             <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
//                 <span className="text-[24px] font-bold text-[#B57CF6] tracking-widest">RBMS-MDU-DIVIN</span>
//             </div>
//             <div className="w-full bg-[#D6F3FF] py-3 flex flex-col items-center border-b-2 border-black">
//                 <span className="text-[24px] md:text-3xl font-bold text-black text-center">Block Summary Report</span>
//             </div>
//             <div className="w-full bg-[#D6F3FF] py-2 flex flex-col items-center">
//                 <span className="text-[24px] font-bold text-black">{session?.user?.department || "..."} Department</span>
//             </div>
//             {/* Date Range Filter */}
//             <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center justify-center mt-6 mb-4">
//                 <label className="text-[20px] font-semibold text-black">From</label>
//                 <input
//                     type="date"
//                     value={dateRange.start}
//                     onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
//                     className="p-1 border border-black text-black bg-white rounded"
//                 />
//                 <label className="text-[20px] font-semibold text-black">To</label>
//                 <input
//                     type="date"
//                     value={dateRange.end}
//                     onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
//                     className="p-1 border border-black text-black bg-white rounded"
//                 />
//                 <button type="submit" className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-[20px] font-bold text-black hover:bg-[#FFA726]">Generate</button>
//             </form>
//             {/* Table */}
//             {showTable && (
//                 <div className="overflow-x-auto rounded-xl mx-2 mb-2 mt-4">
//                     {isLoading ? (
//                         <div className="text-center py-8 text-lg font-bold">Loading...</div>
//                     ) : error ? (
//                         <div className="text-center py-8 text-lg font-bold text-red-600">Error loading data</div>
//                     ) : (
//                         <table className="w-full border border-black rounded-xl overflow-hidden text-[20px]">
//                             <thead>
//                                 <tr className="bg-[#D6F3FF] text-black">
//                                     <th className="border border-black px-2 py-1 whitespace-nowrap">Date</th>
//                                     <th className="border border-black px-2 py-1 whitespace-nowrap">ID</th>
//                                     <th className="border border-black px-2 py-1 whitespace-nowrap">Block Section</th>
//                                     <th className="border border-black px-2 py-1 whitespace-nowrap">Line/Road</th>
//                                     <th className="border border-black px-2 py-1 whitespace-nowrap">Activity</th>
//                                     <th className="border border-black px-2 py-1 whitespace-nowrap">Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {data?.data?.requests?.map((request: any, idx: number) => (
//                                     <tr key={request.id} className={idx % 2 === 0 ? "bg-[#FFF86B]" : "bg-[#E6E6FA]"}>
//                                         <td className="border border-black px-2 py-1 text-center text-black">{dayjs(request.date).format("DD-MM-YY")}</td>
//                                         <td className="border border-black px-2 py-1 text-center text-black">{request.id.slice(-4)}</td>
//                                         <td className="border border-black px-2 py-1 text-black">{request.missionBlock}</td>
//                                         <td className="border border-black px-2 py-1 text-center text-black">{request.processedLineSections?.[0]?.lineName || 'N/A'}</td>
//                                         <td className="border border-black px-2 py-1 text-black">{request.activity}</td>
//                                         <td className="border border-black px-2 py-1 text-center text-black">{request.status}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             )}
//             {/* Footer Buttons */}
//             <div className="flex justify-center gap-3 mb-2 mt-8">
//                 <Link href="/dashboard" className="flex items-center gap-1 bg-lime-300 border border-black px-4 py-1.5 rounded text-lg font-bold" style={{color:"black"}}>
//                     <span className="text-xl">🏠</span> Home
//                 </Link>
//                 <button
//                     onClick={() => window.history.back()}
//                     className="flex items-center gap-1 bg-[#E6E6FA] border border-black px-4 py-1.5 rounded text-lg font-bold" style={{color:"black"}}
//                 >
//                     <span className="text-xl">⬅️</span> Back
//                 </button>
//             </div>
//             <div className="text-[10px] text-gray-600 border-t border-black pt-1 text-right">
//                 © {new Date().getFullYear()} Indian Railways
//             </div>
//         </div>
//     );
// } 



"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGenerateReport } from "@/app/service/query/hq";
import { MajorSection } from "@/app/lib/store";
import { useSession } from "next-auth/react";
import { managerService, UserRequest } from "@/app/service/api/manager";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import formatTime from "@/app/utils/formatTime";
import * as XLSX from "xlsx";

interface OptionType {
  value: string;
  label: string;
}

interface FormData {
  startDate: string;
  endDate: string;
  blockType: OptionType[];
  majorSection: OptionType[];
}

// Interfaces aligned with the API service
interface PastBlockSummary {
  percentAvailed?: any;
  percentGranted?: any;
  SectionId?: string;
  Section: string;
  Demanded: number;
  Approved: number;
  Granted: number;
  Availed: number;
  Percentage?: number;
  PercentGranted?: number;
  PercentAvailed?: number;
  Department?: String;
  corridorType?: String;
  MissionBlock?: String;
    DemandsCount?: number;
  ApprovedCount?: number;
  AvailedCount?: number;
}

interface DetailedData {
  Date: string;
  Section: string;
  Duration: number;
  Type: string;
  Status: string;
}

const locationOptions: OptionType[] = [
  { value: "MAS", label: "MAS" },
  { value: "SA", label: "SA" },
  { value: "MCU", label: "MCU" },
  { value: "TPJ", label: "TPJ" },
  { value: "PGT", label: "PGT" },
  { value: "TVC", label: "TVC" },
];

const blockTypeOptions: OptionType[] = [
  { value: "All", label: "All" },
  { value: "Corridor", label: "Corridor" },
  { value: "Non-corridor", label: "Outside corridor" },
  { value: "Emergency", label: "Emergency" },
  { value: "Mega", label: "Mega Block" },
];



export default function GenerateReportPage() {
  const [pastBlockSummary, setPastBlockSummary] = useState<PastBlockSummary[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["All"]);
  const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>([]);

  const [selectedMajorSections, setSelectedMajorSections] = useState<string[]>(
    []
  );
  const [majorSectionOptions, setMajorSectionOptions] = useState<OptionType[]>(
    []
  );
  const [upcomingDivisionIdSearch, setUpcomingDivisionIdSearch] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  // const []
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const { data: session } = useSession();

  // Parameters for the query
  const [queryParams, setQueryParams] = useState({
    startDate: "",
    endDate: "",
    majorSections: [] as string[],
    department: session?.user?.department ? [session.user.department] : [""],
    blockType: ["All"],
  });

  useEffect(() => {
    const section = searchParams.get("section");
    const blockType = searchParams.get("blockType");
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    if (section) {
      setSelectedMajorSections(section.split(","));
    }
    if (blockType) {
      setSelectedBlockTypes(blockType.split(","));
    }

    // restore start date if exists
    if (start) {
      setValue("startDate", start);
    }

    // restore end date if exists
    if (end) {
      setValue("endDate", end);
    }

    handleSubmit(onSubmit)();
  }, [searchParams, setValue]);


  useEffect(() => {
    if (session?.user?.department) {
      setQueryParams(prev => ({
        ...prev,
        department: [session.user.department]
      }));
    }
  }, [session]);

  // Get user's location and set up major section options
  useEffect(() => {
    if (session?.user?.location) {
      const userLocation = session.user.location;
      setSelectedLocations([userLocation]);

      // Set up major section options based on user's location
      if (MajorSection[userLocation as keyof typeof MajorSection]) {
        const sections =
          MajorSection[userLocation as keyof typeof MajorSection];
        const options = sections.map((section) => ({
          value: section,
          label: section,
        }));
        setMajorSectionOptions([{ value: "All", label: "All" }, ...options]);
      }
    }
  }, [session]);

  // Use the react-query hook with enabled: false initially
  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = useGenerateReport(queryParams);

  // Watch for query results and loading state
  useEffect(() => {
    setLoading(isLoading);
    console.log("Full reportData:", reportData);

    if (reportData && reportData.data) {

      // setHydrated(true);
      // Safe access of nested properties with detailed logging
      console.log(
        "pastBlockSummary raw data:",
        reportData.data.pastBlockSummary
      );
      console.log("detailedData raw data:", reportData.data.detailedData);

      // Handle data even if the property names don't exactly match
      const pastData = reportData.data.pastBlockSummary || [];
      setPastBlockSummary(pastData);
      console.log("Set pastBlockSummary to:", pastData);

      // Set the detailed data directly
      const detailedData = reportData.data.detailedData || [];
      console.log("Set upcomingBlocks to:", detailedData);

      setReportGenerated(true);
      toast.success(reportData.message || "Report generated successfully");
    }
  }, [reportData, isLoading]);

  // Watch for query errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to generate report");
      setLoading(false);
    }
  }, [error]);

  // Function to handle row click for section details
  const handleSectionClick = (section: string) => {
    toast.success(`Viewing details for section: ${section}`);
    // In a real implementation, this would navigate to a detail view
    // router.push(`/dashboard/drm/drm/section-details/${section}`);
  };

  // Handler for major section selection
  const handleMajorSectionChange = (options: MultiValue<OptionType>) => {
    if (Array.isArray(options) && options.length > 0) {
      const selectedValues = options.map((option) => option.value);

      // Check if 'All' is included in the selected options
      if (selectedValues.includes("All")) {
        // If 'All' is selected, include all major sections except 'All' itself
        const allSpecificSections = majorSectionOptions
          .map((option) => option.value)
          .filter((value) => value !== "All");
        setSelectedMajorSections(allSpecificSections);
      } else {
        // Otherwise just set the selected values
        setSelectedMajorSections(selectedValues);
      }
    } else {
      setSelectedMajorSections([]);
    }
  };

  // Toggle selection for buttons
  const toggleBlockType = (blockType: string) => {
    if (blockType === "All") {
      setSelectedBlockTypes(["All"]);
    } else {
      const newTypes = selectedBlockTypes.includes(blockType)
        ? selectedBlockTypes.filter((type) => type !== blockType)
        : [...selectedBlockTypes.filter((type) => type !== "All"), blockType];
      setSelectedBlockTypes(newTypes.length > 0 ? newTypes : ["All"]);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!data.startDate || !data.endDate) {
      toast.error("Please enter both start and end dates");
      return;
    }

    try {
      // API format (dd/MM/yy)
      const startDateApi = format(new Date(data.startDate), "dd/MM/yy");
      const endDateApi = format(new Date(data.endDate), "dd/MM/yy");

      // URL format (yyyy-MM-dd) for restoring later
      const startDateUrl = format(new Date(data.startDate), "yyyy-MM-dd");
      const endDateUrl = format(new Date(data.endDate), "yyyy-MM-dd");

      // Update query params for API call
      setQueryParams({
        startDate: startDateApi,
        endDate: endDateApi,
        majorSections: selectedMajorSections,
        department: session?.user?.department ? [session.user.department] : [""],
        blockType: selectedBlockTypes,
      });

      // ✅ Push search params to URL (yyyy-MM-dd so inputs restore correctly)
      const params = new URLSearchParams();
      params.set("startDate", startDateUrl);
      params.set("endDate", endDateUrl);

      if (selectedMajorSections.length > 0) {
        params.set("section", selectedMajorSections.join(","));
      }
      if (selectedBlockTypes.length > 0) {
        params.set("blockType", selectedBlockTypes.join(","));
      }

      router.push(`?${params.toString()}`);

    // Trigger query
    await refetch();
  } catch (error) {
    console.error("Error initiating report generation:", error);
    toast.error("Failed to generate report");
  }
};

  useEffect(() => {
    const section = searchParams.get("section");
    const blockType = searchParams.get("blockType");
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    if (section) setSelectedMajorSections(section.split(","));
    if (blockType) setSelectedBlockTypes(blockType.split(","));
    if (start && end) {
      setValue("startDate", start);
      setValue("endDate", end);
    }

    // console.log("hydration check - searchParams:", hydrated)
    // if (!hydrated) {
    handleSubmit(onSubmit)(); // ✅ only once
    // setHydrated(true);
    // }

  }, [searchParams]);

  const formatDateInput = (value: string) => {
    // Format as DD/MM/YY
    if (!value) return "";
    const [day, month, year] = value.split("/");
    if (!day || !month || !year) return value;
    return `${day}/${month}/${year}`;
  };

  // Format the selected dates for display
  //   const formatDisplayDate = (dateStr: string) => {
  //     if (!dateStr) return "";
  //     const d = new Date(dateStr);
  //     if (isNaN(d.getTime())) return "";
  //     return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  //   };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }); // Output: DD/MM/YY (e.g., "04/07/25")
  };

  // (B) Summary of Upcoming Blocks
  const [upcomingSectionFilter, setUpcomingSectionFilter] =
    useState<string>("All");
  const sectionOptionsB: string[] = Array.from(
    new Set(
      reportData?.data?.detailedData?.map((b: DetailedData) => b.Section) || []
    )
  );
  // const filteredUpcomingBlocks: DetailedData[] =
  //   upcomingSectionFilter === "All"
  //     ? reportData?.data?.detailedData || []
  //     : reportData?.data?.detailedData?.filter(
  //       (b: DetailedData) => b.Section === upcomingSectionFilter
  //     ) || [];
  const filteredUpcomingBlocks: DetailedData[] = (
  upcomingSectionFilter === "All"
    ? reportData?.data?.detailedData || []
    : reportData?.data?.detailedData?.filter(
      (b: DetailedData) => b.Section === upcomingSectionFilter
    ) || []
).filter((block: any) => {
  // Division ID search filter
  if (upcomingDivisionIdSearch.trim() === "") return true;
  
  const divisionId = block.DivisionId || "";
  return divisionId.toLowerCase().includes(upcomingDivisionIdSearch.toLowerCase());
});
  function formatDateB(dateString: string) {
    if (!dateString) return "";
    // Accepts both MM/DD/YYYY and DD/MM/YYYY
    const parts = dateString.split("/");
    if (parts.length === 3) {
      // Try MM/DD/YYYY first
      const d1 = new Date(dateString);
      if (!isNaN(d1.getTime())) return d1.toLocaleDateString("en-GB");
      // Try DD/MM/YYYY
      const d2 = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
      if (!isNaN(d2.getTime())) return d2.toLocaleDateString("en-GB");
    }
    return dateString;
  }

  const upcomingBlocks: DetailedData[] = reportData?.data?.detailedData || [];

  const [sectionDropdownOpenB, setSectionDropdownOpenB] = useState(false);
  const sectionDropdownRefB = useRef<HTMLDivElement>(null);

  // Function to download block summary table as XLSX
  const handleDownloadSummary = () => {
    try {
      if (pastBlockSummary.length === 0) {
        toast.error("No data available to download");
        return;
      }

      const excelData = pastBlockSummary.map((summary: any) => ({
        Section: summary.Department || summary.Section || "", // Using the fixed value as in the table
        Demanded: summary.Demanded?.toFixed(2) || "0.00",
        Approved: summary.Approved?.toFixed(2) || "0.00",
        Granted: summary.Granted?.toFixed(2) || "0.00",
        "% Granted":
          summary.PercentGranted !== undefined
            ? summary.PercentGranted.toFixed(2) + "%"
            : "",
        Availed: summary.Availed.toFixed(2) || "0.00",
        "% Availed":
          summary.PercentAvailed !== undefined
            ? summary.PercentAvailed.toFixed(2) + "%"
            : "",
      }));

      // Add total row
      excelData.push({
        Section: "Total",
        Demanded: pastBlockSummary
          .reduce((sum, item) => sum + (item.Demanded || 0), 0)
          .toFixed(2),
        Approved: pastBlockSummary
          .reduce((sum, item) => sum + (item.Approved || 0), 0)
          .toFixed(2),
        Granted: String(
          pastBlockSummary.reduce((sum, item) => sum + (item.Granted || 0), 0).toFixed(2)
        ),
        "% Granted":
          String(
            pastBlockSummary.reduce(
              (sum, item) => sum + (item.PercentGranted || 0),
              0
            ).toFixed(2)
          ) + "%",
        Availed: String(
          pastBlockSummary.reduce((sum, item) => sum + (item.Availed || 0), 0).toFixed(2)
        ),
        "% Availed":
          String(
            pastBlockSummary.reduce(
              (sum, item) => sum + (item.PercentAvailed || 0),
              0
            ).toFixed(2)
          ) + "%",
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add title before the data
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          [
            `(A) Block Summary: ${formatDisplayDate(
              watch("startDate")
            )} to ${formatDisplayDate(watch("endDate"))}`,
          ],
          // [`Department: ${selectedDepartments.join(", ")} (in Hrs)`],
          [], // Empty row for spacing
        ],
        { origin: "A1" }
      );

      // Adjust column widths
      const colWidths = [
        { wch: 15 }, // Section
        { wch: 10 }, // Demanded
        { wch: 10 }, // Approved
        { wch: 10 }, // Granted
        { wch: 10 }, // % Granted
        { wch: 10 }, // Availed
        { wch: 10 }, // % Availed
      ];
      worksheet["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Block Summary");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `block_summary_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Block summary downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download Excel file. Please try again.");
    }
  };

  // Function to download upcoming blocks table as XLSX
  const handleDownloadUpcomingBlocks = () => {
    try {
      if (filteredUpcomingBlocks.length === 0) {
        toast.error("No data available to download");
        return;
      }

      const excelData = filteredUpcomingBlocks.map((block: any) => {
        // Status logic
        let statusLabel = "";
        if (block.Status === "APPROVED") {
          statusLabel = "Pending with Optg";
        } else if (block.Status === "PENDING") {
          statusLabel = "Pending with dept control";
        } else if (block.Status === "REJECTED") {
          statusLabel = "Returned by Optg";
        } else {
          statusLabel = block.Status;
        }

        return {
          Date: formatDateB(block.Date),
          "Request ID": block.DivisionId || "N/A",
          "Station ID": block.stationId || "N/A",
          Type: block.Type || "N/A",
          Duration: block.Duration,
          "Availed Time":
            block.AvailedTimeFrom && block.AvailedTimeTo
              ? `${formatTime(block.AvailedTimeFrom)} to ${formatTime(
                block.AvailedTimeTo
              )}`
              : "Not Available",
          Status: statusLabel,
        };
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add title before the data
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          [`(B) Summary of Upcoming Blocks`],
          [], // Empty row for spacing
        ],
        { origin: "A1" }
      );

      // Adjust column widths
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 10 }, // ID
        { wch: 10 }, // Station ID
        { wch: 20 }, // Block Section
        { wch: 12 }, // Type
        { wch: 30 }, // Activity
        { wch: 20 }, // Demand Time
        { wch: 20 }, // Sanctioned Time
        { wch: 20 }, // Availed Time
        { wch: 20 }, // Status
      ];
      worksheet["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming Blocks");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `upcoming_blocks_${format(
        new Date(),
        "dd-MM-yyyy"
      )}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Upcoming blocks data downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download Excel file. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fffbe9] flex flex-col items-center">
      {/* RBMS Header */}
      <div className="w-full bg-[#fff35c] flex flex-col items-center py-2 rounded-t-2xl">
        <span className="text-3xl font-extrabold text-[#b07be0] tracking-wide">
          RBMS-{session?.user?.location}-DIVN
        </span>
      </div>
      {/* Block Summary Report Title */}
      <div className="w-full bg-[#b7e3ee] flex flex-col items-center pt-2 pb-1">
        {/* <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black break-words text-center">
          BO (DESGN)/Division
        </span> */}
        <span className="text-2xl sm:text-2xl md:text-4xl font-extrabold text-black text-center break-all px-2">
          Block Summary Report <br></br>(Granted/Availed/Pending)
        </span>
        {/* <div className="mt-2 bg-[#7be09b] px-6 py-1 rounded-2xl">
          <span className="text-2xl font-bold text-white">
            Deptt:<span className="text-2xl ">{session?.user?.department || ''}</span>
          </span>
        </div> */}
      </div>
      {/* Wrap the main content in a max-w-screen-lg mx-auto w-full container */}
      <div className="max-w-screen-lg mx-auto w-full">
        {/* Filters Section */}
        <div className="w-full bg-[#fffbe9] px-2 py-2">
          <div className="flex flex-row gap-8 items-end w-full flex-wrap">
            {/* Choose Section Dropdown */}
            {/* <div className="flex flex-col flex-1 min-w-[90px] max-w-[110px] w-full">
              <span className="text-[24px] font-bold text-black mb-1 whitespace-nowrap">
                Choose Section
              </span>
              <Select
                options={majorSectionOptions}
                isMulti={true}
                value={majorSectionOptions.filter((opt) =>
                  selectedMajorSections.includes(opt.value)
                )}
                onChange={(opts) => handleMajorSectionChange(opts)}
                classNamePrefix="section-select"
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                    maxWidth: "110px",
                    minWidth: "90px",
                  }),
                  control: (base) => ({
                    ...base,
                    borderColor: "#00bfff",
                    borderWidth: 2,
                    borderRadius: 0,
                    minHeight: 32,
                    fontSize: 24,
                    width: "100%",
                    maxWidth: "110px",
                    minWidth: "90px",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? "#b7e3ee" : "#fff",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: 24,
                  }),
                  menu: (base) => ({ ...base, zIndex: 50 }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#e0e0ff",
                    color: "#000",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#000",
                    fontWeight: "bold",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#b07be0",
                    ":hover": { backgroundColor: "#b07be0", color: "white" },
                  }),
                }}
                placeholder="Section"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : undefined
                }
                menuPosition="fixed"
              />
            </div> */}
            <div className="flex flex-col flex-1 min-w-[90px] max-w-[110px] w-full">
              <span className="text-[24px] font-bold text-black mb-1 whitespace-nowrap">
                Choose Section
              </span>
              <Select
                options={majorSectionOptions}
                isMulti={true}
                value={majorSectionOptions.filter((opt) =>
                  selectedMajorSections.includes(opt.value)
                )}
                onChange={(opts) => handleMajorSectionChange(opts)}
                classNamePrefix="section-select"
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "100%",
                    maxWidth: "110px",
                    minWidth: "90px",
                  }),
                  control: (base, state) => ({
                    ...base,
                    borderColor: "#00bfff",
                    borderWidth: 2,
                    borderRadius: 0,
                    minHeight: 32,
                    fontSize: 24,
                    width: "100%",
                    maxWidth: "110px",
                    minWidth: "90px",
                    // Show only the count in the input
                    "&:after": selectedMajorSections.length > 0 ? {
                      content: `"${selectedMajorSections.length}"`,
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#000',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                    } : {},
                  }),
                  input: (base) => ({
                    ...base,
                    opacity: 0, // Hide the default input
                    width: 0,
                  }),
                  placeholder: (base) => ({
                    ...base,
                    display: selectedMajorSections.length > 0 ? 'none' : 'block',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? "#b7e3ee" : "#fff",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: 24,
                  }),
                  menu: (base) => ({ ...base, zIndex: 50 }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#e0e0ff",
                    color: "#000",
                    display: 'none', // Hide the chips in the input
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#000",
                    fontWeight: "bold",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#b07be0",
                    ":hover": { backgroundColor: "#b07be0", color: "white" },
                  }),
                }}
                placeholder="Section"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : undefined
                }
                menuPosition="fixed"
              />
            </div>
            {/* Select Period */}
            <div className="flex flex-col flex-1 min-w-[180px] w-full">
              <div className="flex justify-center w-full mb-1">
                <span className="text-[24px] font-bold text-black">
                  Select Period
                </span>
              </div>
              <div className="flex flex-row items-center gap-1 w-full">
                <input
                  type="date"
                  className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[120px] text-[24px] font-bold text-center"
                  style={{ color: "black" }}
                  {...register("startDate")}
                />
                <span
                  className="text-base font-bold"
                  style={{ color: "black" }}
                >
                  to
                </span>
                <input
                  type="date"
                  className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[120px] text-[24px] font-bold text-center"
                  style={{ color: "black" }}
                  {...register("endDate")}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Block Type Filters (first line) */}
        <div className="w-full flex flex-wrap justify-center gap-2 mt-2 mb-1">
          {blockTypeOptions.map((opt) => (
            <button
              key={opt.value}
              className={`rounded-full px-3 py-1 text-[24px] font-semibold border border-[#b7e3ee] flex items-center gap-1 transition-colors duration-150 ${selectedBlockTypes.includes(opt.value)
                ? "bg-[#b7e3ee] text-black"
                : "bg-[#e0e0ff] text-black"
                }`}
              onClick={() => toggleBlockType(opt.value)}
              type="button"
            >
              {selectedBlockTypes.includes(opt.value) && (
                <span className="text-green-600 font-bold">✔</span>
              )}
              {opt.label}
            </button>
          ))}
        </div>
        {/* Submit Button */}
        <div className="w-full flex justify-center mb-2">
          <button
            className="bg-[#7be09b] hover:bg-[#5bc07b] text-white font-bold px-8 py-2 rounded-[50%] shadow border border-[#00b347] text-[24px]"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>
        {/* (A) Block Summary Table */}
        <div className="w-full px-8 mt-4">
          <div className="my-2">
            <button
              onClick={handleDownloadSummary}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 ml-2 shadow border border-green-800 text-base flex items-center"
              disabled={pastBlockSummary.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Past Blocks Summary (XLSX)
            </button>
          </div>
          <div className="flex w-full justify-center">
            <div
              className="flex-1 bg-[#cfd4ff] text-[24px] font-bold border-2 border-black px-2 py-1 text-center"
              style={{ color: "black" }}
            >
              (A)Summary of Past Blocks:{" "}
              {formatDisplayDate(watch("startDate")) || "........"} to{" "}
              {formatDisplayDate(watch("endDate")) || "........"}
            </div>
            {/* <div className="flex-1 bg-[#cfd4ff] text-xl font-bold border-2 border-black px-2 py-1" style={{color:"black"}}>
              Department: {selectedDepartments.length > 0 ? selectedDepartments.join(', ') : '.............'} (in Hrs)
            </div> */}
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-2 border-black text-[24px]">
              <thead>
                <tr className="bg-[#e49edd] text-black text-[24px] font-bold">
                  <th className="border-2 border-black px-2 py-1">Section</th>
                  <th className="border-2 border-black px-2 py-1">Demanded / No. of Blocks</th>
                  <th className="border-2 border-black px-2 py-1">Approved / No. of Blocks</th>
                  <th className="border-2 border-black px-2 py-1">Granted</th>
                  <th className="border-2 border-black px-2 py-1">% Granted</th>
                  <th className="border-2 border-black px-2 py-1">Availed / No. of Blocks</th>
                  <th className="border-2 border-black px-2 py-1">% Availed</th>
                </tr>
              </thead>
              <tbody>
                {pastBlockSummary.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-4"
                      style={{ color: "black" }}
                    >
                      No data found.
                    </td>
                  </tr>
                ) : (
                  pastBlockSummary.map((summary: any, idx: number) => (
                    <tr
                      className={`font-bold ${idx % 2 === 0 ? "bg-white" : "bg-[#f4dcf1]"
                        }`}
                      key={idx}
                    >
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Department || summary.Section || ""}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Demanded.toFixed(2)} / {summary.DemandsCount}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Approved.toFixed(2)} / {summary.ApprovedCount}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Granted.toFixed(2)}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.PercentGranted !== undefined
                          ? summary.PercentGranted.toFixed(2) + "%"
                          : ""}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Availed.toFixed(2)} / {summary.AvailedCount}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.PercentAvailed !== undefined
                          ? summary.PercentAvailed.toFixed(2) + "%"
                          : ""}
                      </td>
                    </tr>
                  ))
                )}
                {pastBlockSummary.length > 0 && (
                  <>
                    <tr className="bg-[#ff914d] text-white font-bold">
                      <td className="border-2 border-black px-2 py-1 text-center">Total</td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary
                          .reduce((sum, item) => sum + (item.Demanded || 0), 0)
                          .toFixed(2)}{" "}
                        /{" "}
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.DemandsCount || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary
                          .reduce((sum, item) => sum + (item.Approved || 0), 0)
                          .toFixed(2)}{" "}
                        /{" "}
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.ApprovedCount || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Granted || 0),
                          0
                        ).toFixed(2)}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.PercentGranted || 0),
                          0
                        ).toFixed(2)}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Availed || 0),
                          0
                        ).toFixed(2)}{" "}
                        /{" "}
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.AvailedCount || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.PercentAvailed || 0),
                          0
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* (B) Summary of Upcoming Blocks */}
        <div className="w-full mt-8">
          {/* <div className="my-2">
            <button
              onClick={handleDownloadUpcomingBlocks}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 mr-2 shadow border border-green-800 text-base flex items-center"
              disabled={filteredUpcomingBlocks.length === 0}
            >
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>{" "}
              Download Summary of Upcoming Blocks (XLSX)
            </button>
          </div> */}

   <div className="my-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
    {/* Download Button - No changes */}
    <button
      onClick={handleDownloadUpcomingBlocks}
      className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 mr-2 shadow border border-green-800 text-base flex items-center"
      disabled={filteredUpcomingBlocks.length === 0}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download Summary of Upcoming Blocks (XLSX)
    </button>

    {/* Search Filter - Moves to next line on mobile but doesn't take full width */}
    <div className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-base">
      <label className="whitespace-nowrap mr-2">Search ID:</label>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={upcomingDivisionIdSearch}
          onChange={(e) => setUpcomingDivisionIdSearch(e.target.value)}
          placeholder="Enter ID..."
          className="w-32 sm:w-40 pl-8 pr-6 py-1 border border-gray-300 text-black bg-white rounded focus:outline-none focus:ring-1 focus:ring-white text-base"
        />
        {upcomingDivisionIdSearch && (
          <button
            onClick={() => setUpcomingDivisionIdSearch('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  </div>

          <div className="flex w-full items-center">
            <div className="flex w-full gap-x-3">
              {" "}
              {/* Adds 0.5rem (8px) gap between items */}
              <div className="flex-1 bg-[#f1a983] text-[24px] font-bold border-2 border-black px-2 py-1">
                (B) Summary of Upcoming Blocks
              </div>
              <div className="flex-1 bg-[#83e28e] text-[24px] font-bold border-2 border-black px-2 py-1">
                Choose Section
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="relative inline-block" ref={sectionDropdownRefB}>
                <button
                  onClick={() => setSectionDropdownOpenB((v) => !v)}
                  className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-[24px] min-w-[100px]"
                >
                  {upcomingSectionFilter === "All"
                    ? "All"
                    : upcomingSectionFilter}
                  <span className="ml-1">▼</span>
                </button>
                {sectionDropdownOpenB && (
                  <div className="absolute z-10 mt-2 w-40 bg-white border-2 border-black rounded shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-base"
                      onClick={() => {
                        setUpcomingSectionFilter("All");
                        setSectionDropdownOpenB(false);
                      }}
                    >
                      All
                    </div>
                    {sectionOptionsB.map((section: string) => (
                      <div
                        key={section}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-base"
                        onClick={() => {
                          setUpcomingSectionFilter(section);
                          setSectionDropdownOpenB(false);
                        }}
                      >
                        {section}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full border-2 border-black mt-1 text-[24px]">
              <thead>
                <tr className="bg-[#e49edd] text-black text-[24px] font-bold">
                  <th className="border-2 border-black px-2 py-1">Date</th>
                  <th className="border-2 border-black px-2 py-1">ID</th>
                  <th className="border-2 border-black px-2 py-1">Block Section</th>
                  <th className="border-2 border-black px-2 py-1">Depo</th>
                  <th className="border-2 border-black px-2 py-1">Type</th>
                  <th className="border-2 border-black px-2 py-1">Activity</th>
                  <th className="border-2 border-black px-2 py-1">Demand time</th>
                  <th className="border-2 border-black px-2 py-1">Sanctioned time</th>
                  <th className="border-2 border-black px-2 py-1">
                    Availed time
                  </th>
                  <th className="border-2 border-black px-2 py-1">Station ID</th>
                  <th className="border-2 border-black px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcomingBlocks.length === 0 ? (
                  <tr className="bg-white">
                    <td
                      colSpan={5}
                      className="text-center py-4"
                      style={{ color: "black" }}
                    >
                      No data found.
                    </td>
                  </tr>
                ) : (
                  filteredUpcomingBlocks
                    .slice(0, 200)
                    .map((block: any, idx: number) => {
                      // Status color logic
                      let statusLabel = "";
                      let statusStyle = { background: "#fff", color: "#222" };
                      if (block.overAllStatus === "with optg.") {
                        statusLabel = "Pending with Optg";
                        statusStyle = { background: "#fff86b", color: "#222" };
                      } else if (block.Status === "PENDING") {
                        statusLabel = "Pending with dept control";
                        statusStyle = { background: "#d47ed4", color: "#222" };
                      } else if (block.Status === "REJECTED") {
                        statusLabel = "Returned by Optg";
                        statusStyle = { background: "#ff4e36", color: "#fff" };
                      } else {
                        statusLabel = block.overAllStatus || block.Status;
                      }

                      // Row background alternates between pink and white
                      const rowBgColor =
                        idx % 2 === 0 ? "bg-white" : "bg-[#f5d0f2]";

                      return (
                        <tr
                          key={idx}
                          className={`${rowBgColor} hover:bg-[#F3F3F3]`}
                        >
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {dayjs(block.Date).format("DD-MM-YY")}
                          </td>
                          <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            <Link
                              href={`/manage/view-request/${block.id}?from=block-summary`}
                              className="block w-full h-full"
                            >
                              {block.DivisionId}
                            </Link>
                          </td>
                          <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            {block.MissionBlock}
                          </td>
                          <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            {block.selectedDepo || "N/A"}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {block.Type}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {block.Activity}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {formatTime(block.DemandedTimeFrom)} to{" "}
                            {formatTime(block.DemandedTimeTo)}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {block.SanctionedTimeFrom &&
                              block.SanctionedTimeTo ? (
                              <>
                                {formatTime(block.SanctionedTimeFrom)} to{" "}
                                {formatTime(block.SanctionedTimeTo)}
                              </>
                            ) : (
                              "Not Optimized Yet"
                            )}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {block.AvailedTimeFrom && block.AvailedTimeTo ? (
                              <>
                                {formatTime(block.AvailedTimeFrom)} to{" "}
                                {formatTime(block.AvailedTimeTo)}
                              </>
                            ) : (
                              "Not Availed Yet"
                            )}
                          </td>
                                                    <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            {block.stationId || "N/A"}
                          </td>
                          <td
                            className="border-2 border-black px-2 py-1 font-bold text-center text-black"
                            style={statusStyle}
                          >
                            {statusLabel}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Info Bar and Navigation */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mt-8 mb-4 px-2">
          <div className="flex items-center gap-2 bg-[#cfd4ff] px-4 py-2 rounded-2xl border-2 ">
            <span className="text-[24px] font-bold text-black">Click</span>
            <span className="bg-[#00b347] text-white font-bold text-[24px] px-2 py-1 rounded">
              ID
            </span>
            <span className="text-[24px] font-bold text-black">
              to see further details.
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/dashboard">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 bg-[#cfd4ff] border-2 border-black rounded-[50%] px-8 py-2 text-lg font-bold text-black"
              >
                Back
              </button>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
