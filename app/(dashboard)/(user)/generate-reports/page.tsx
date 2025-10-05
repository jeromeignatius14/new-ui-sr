// "use client";

// export default function GenerateReports() {
//     return (
//         <div>GenerateReports</div>
//     )
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MajorSection } from "@/app/lib/store";
import { useSession } from "next-auth/react";
import { managerService, UserRequest } from "@/app/service/api/manager";
import { useQuery } from "@tanstack/react-query";
import { useUserGenerateReport } from "@/app/service/query/user-generate-report";
import formatTime from "@/app/utils/formatTime";
import * as XLSX from "xlsx";

interface OptionType {
  value: string;
  label: string;
}

interface FormData {
  startDate: string;
  endDate: string;
  department: OptionType[];
  blockType: OptionType[];
  majorSection: OptionType[];
}

// Interfaces aligned with the API service
interface PastBlockSummary {
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
  userId?: string;
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

const departmentOptions: OptionType[] = [
  { value: "Engineering", label: "Engineering" },
  { value: "ST", label: "S & T" },
  { value: "TRD", label: "TRD" },
];

export default function GenerateReportPage() {
  const [pastBlockSummary, setPastBlockSummary] = useState<PastBlockSummary[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["All"]);
  const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedMajorSections, setSelectedMajorSections] = useState<string[]>([
    "MAS-GDR",
  ]);
  const [majorSectionOptions, setMajorSectionOptions] = useState<OptionType[]>(
    []
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hydrated, setHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.department) {
      setSelectedDepartments([session.user.department]);
    }
  }, [session]);

  useEffect(() => {
    const section = searchParams.get("section");
    const blockType = searchParams.get("blockType");
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    if (section) setSelectedMajorSections(section.split(","));
    if (blockType) {
      setSelectedBlockTypes(blockType.split(","));
    }

    if (start && end) {
      setValue("startDate", start); // yyyy-MM-dd works with <input type="date">
      setValue("endDate", end);
    }

    if (!hydrated) {
      handleSubmit(onSubmit)(); // ✅ only once
    }
  }, [searchParams]);

  // Parameters for the query
  const [queryParams, setQueryParams] = useState({
    startDate: "",
    endDate: "",
    majorSections: [] as string[],
    department: ["Engineering"],
    blockType: ["All"],
    userId: session?.user?.id || "",
  });

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
  } = useUserGenerateReport(queryParams);

  // Watch for query results and loading state
  useEffect(() => {
    setLoading(isLoading);
    console.log("Full reportData:", reportData);

    if (reportData && reportData.data) {
      setHydrated(true); // Mark as hydrated when data is received
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

  const toggleDepartment = (department: string) => {
    if (selectedDepartments.includes(department)) {
      if (selectedDepartments.length > 1) {
        setSelectedDepartments(
          selectedDepartments.filter((dept) => dept !== department)
        );
      }
    } else {
      setSelectedDepartments([...selectedDepartments, department]);
    }
  };

  const onSubmit = async (data: FormData) => {
    // if (!hydrated) {
    //   console.log("wait for hydration");
    // }
    if (!data.startDate || !data.endDate) {
      toast.error("Please enter both start and end dates");
      return;
    }

    try {
      // Keep raw yyyy-MM-dd for URL and form
      const startDateRaw = data.startDate;
      const endDateRaw = data.endDate;
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      const formattedStartDate = format(startDate, "dd/MM/yy");
      const formattedEndDate = format(endDate, "dd/MM/yy");

      // Update query parameters
      setQueryParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        majorSections: majorSectionOptions.map((opt) => opt.value),
        department: selectedDepartments,
        blockType: selectedBlockTypes,
        userId: session?.user?.id || "",
      });

      // ✅ Keep yyyy-MM-dd in URL for reloads
      const params = new URLSearchParams();
      params.set("startDate", startDateRaw);
      params.set("endDate", endDateRaw);
      if (selectedMajorSections.length > 0) {
        params.set("section", selectedMajorSections.join(","));
      }
      if (selectedBlockTypes.length > 0) {
        params.set("blockType", selectedBlockTypes.join(","));
      }
      if (selectedDepartments.length > 0) {
        params.set("department", selectedDepartments.join(","));
      }

      router.push(`?${params.toString()}`);

      // await refetch();
    } catch (error) {
      console.error("Error initiating report generation:", error);
      toast.error("Failed to generate report");
    }
  };

  const formatDateInput = (value: string) => {
    // Format as DD/MM/YY
    if (!value) return "";
    const [day, month, year] = value.split("/");
    if (!day || !month || !year) return value;
    return `${day}/${month}/${year}`;
  };

  // Format the selected dates for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  // (B) Summary of Upcoming Blocks
  const [upcomingSectionFilter, setUpcomingSectionFilter] =
    useState<string>("All");
  const sectionOptionsB: string[] = Array.from(
    new Set(
      reportData?.data?.detailedData
        ?.filter((b: DetailedData) => b.userId === session?.user?.id)
        .map((b: DetailedData) => b.Section) || []
    )
  );
  const filteredUpcomingBlocks: DetailedData[] =
    upcomingSectionFilter === "All"
      ? reportData?.data?.detailedData || []
      : reportData?.data?.detailedData?.filter(
        (b: DetailedData) => b.Section === upcomingSectionFilter
      ) || [];
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
          [`Department: ${selectedDepartments.join(", ")} (in Hrs)`],
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
          ID: block.DivisionId || "N/A",
          "Station ID": block.stationId || "N/A",
          "Block Section": block.MissionBlock || "N/A",
          Type: block.Type || "N/A",
          Activity: block.Activity || "N/A",
          "Demand Time": `${formatTime(block.DemandedTimeFrom)} to ${formatTime(
            block.DemandedTimeTo
          )}`,
          "Sanctioned Time":
            block.SanctionedTimeFrom && block.SanctionedTimeTo
              ? `${formatTime(block.SanctionedTimeFrom)} to ${formatTime(
                block.SanctionedTimeTo
              )}`
              : "Not Optimized Yet",
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
        <span className="text-[24px] font-extrabold text-[#b07be0] tracking-wide">
          RBMS-{session?.user?.location}-DIVN
        </span>
      </div>
      {/* Block Summary Report Title */}
      <div className="w-full bg-[#b7e3ee] flex flex-col items-center pt-2 pb-1">
        <span className="text-[24px] font-extrabold text-black">
          Block Summary Report
        </span>
        <span className="text-[24px] font-bold text-black">
          {session?.user?.name}
        </span>
        <div className="mt-2 bg-[#7be09b] px-6 py-1 rounded-2xl">
          <span className="text-[24px] font-bold text-white">
            Blocks Granted/Availed/Pending
          </span>
        </div>
      </div>
      {/* Wrap the main content in a max-w-screen-lg mx-auto w-full container */}
      <div className=" mx-auto w-full px-4">
        {/* Filters Section */}

        {/* Block Type Filters (first line) */}
        <div className="w-full flex flex-wrap justify-center gap-2 mt-2 mb-1">
          {blockTypeOptions.map((opt) => (
            <button
              key={opt.value}
              className={`rounded-full px-3 py-1 text-base font-semibold border border-[#b7e3ee] flex items-center gap-1 transition-colors duration-150 ${selectedBlockTypes.includes(opt.value)
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
        {/* Department Filters (second line) */}
        {/* Submit Button */}
        <div className="flex flex-col flex-1 min-w-[180px] w-full">
          <div className="flex justify-center w-full mb-1">
            <span className="text-[24px] font-bold text-black">
              Select Period
            </span>
          </div>
          <div className="flex flex-row items-center justify-center gap-1 mb-1 w-full">
            <input
              type="date"
              className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[120px] text-base font-bold text-center"
              style={{ color: "black" }}
              {...register("startDate")}
            />
            <span className="text-base font-bold" style={{ color: "black" }}>
              to
            </span>
            <input
              type="date"
              className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[120px] text-base font-bold text-center"
              style={{ color: "black" }}
              {...register("endDate")}
            />
          </div>
        </div>
        <div className="w-full flex justify-center mb-2">
          <button
            className="bg-[#7be09b] hover:bg-[#5bc07b] text-white font-bold px-8 py-2 rounded-lg shadow border border-[#00b347] text-[24px]"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </div>
        {/* (A) Block Summary Table */}
        <div className="w-full mt-4">
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
          <div className="flex w-full">
            <div
              className="flex-1 bg-[#ff914d] text-[24px] font-bold border-2 border-black px-2 py-1"
              style={{ color: "black" }}
            >
              (A)Block Summary:{" "}
              {formatDisplayDate(watch("startDate")) || "........"} to{" "}
              {formatDisplayDate(watch("endDate")) || "........"}
            </div>
            <div
              className="flex-1 bg-[#ff914d] text-[24px] font-bold border-2 border-black px-2 py-1"
              style={{ color: "black" }}
            >
              Department:{" "}
              {selectedDepartments.length > 0
                ? selectedDepartments.join(", ")
                : "............."}{" "}
              (in Hrs)
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-2 border-black">
              <thead>
                <tr className="bg-[#f7c7ac] text-black text-[24px] font-bold">
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
                      className={`font-bold ${idx % 2 === 0 ? "bg-[#f4dcf1]" : "bg-white"
                        }`}
                      key={idx}
                    >
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Department || summary.Section || ""}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Demanded.toFixed(2)} / {summary.DemandsCount}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Approved.toFixed(2)} / {summary.ApprovedCount}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Granted.toFixed(2)}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.PercentGranted !== undefined
                          ? summary.PercentGranted.toFixed(2) + "%"
                          : ""}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Availed.toFixed(2)} / {summary.AvailedCount}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
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
                      <td className="border-2 border-black px-2 py-1 text-center">
                        Total
                      </td>
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
          <div className="my-2">
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
          </div>
          <div className="flex w-full items-center">
            <div className="flex-1 bg-[#f1a983] text-[24px] font-bold border-2 border-black px-2 py-1">
              (B) Summary of Upcoming Blocks
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="relative inline-block" ref={sectionDropdownRefB}>
                <button
                  onClick={() => setSectionDropdownOpenB((v) => !v)}
                  className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-base min-w-[100px]"
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
            {/* <table className="w-full border-2 border-black mt-1 text-sm">
              <thead>
                <tr className="bg-[#e49edd] text-black text-lg font-bold">
                  <th className="border-2 border-black px-2 py-1">Section</th>
                  <th className="border-2 border-black px-2 py-1">Date</th>
                  <th className="border-2 border-black px-2 py-1">Type</th>
                  <th className="border-2 border-black px-2 py-1">Duration</th>
                  <th className="border-2 border-black px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcomingBlocks.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4" style={{color:"black"}}>No data found.</td></tr>
                ) : filteredUpcomingBlocks.slice(0, 200).map((block: DetailedData, idx: number) => {
                  // Status color logic
                  let statusLabel = '';
                  let statusStyle = { background: '#fff', color: '#222' };
                  if (block.Status === 'APPROVED') {
                    statusLabel = 'Pending with Optg';
                    statusStyle = { background: '#fff86b', color: '#222' };
                  } else if (block.Status === 'PENDING') {
                    statusLabel = 'Pending with dept control';
                    statusStyle = { background: '#d47ed4', color: '#222' };
                  } else if (block.Status === 'REJECTED') {
                    statusLabel = 'Returned by Optg';
                    statusStyle = { background: '#ff4e36', color: '#fff' };
                  } else {
                    statusLabel = block.Status;
                  }
                  return (
                    <tr key={idx} className="bg-white hover:bg-[#F3F3F3]">
                      <td className="border-2 border-black px-2 py-1 font-bold text-black">{block.Section}</td>
                      <td className="border-2 border-black px-2 py-1 text-black">{formatDateB(block.Date)}</td>
                      <td className="border-2 border-black px-2 py-1 text-black">{block.Type}</td>
                      <td className="border-2 border-black px-2 py-1 text-black">{block.Duration}</td>
                      <td className="border-2 border-black px-2 py-1 font-bold text-center text-black" style={statusStyle}>{statusLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table> */}

            <table className="w-full border-2 border-black mt-1 text-[24px]">
              <thead>
                <tr className="bg-[#e49edd] text-black text-lg font-bold">
                  <th className="border-2 border-black px-2 py-1">Date</th>
                  <th className="border-2 border-black px-2 py-1">ID</th>
                  <th className="border-2 border-black px-2 py-1">
                    Block Section
                  </th>
                  <th className="border-2 border-black px-2 py-1">Type</th>
                  <th className="border-2 border-black px-2 py-1">Activity</th>
                  <th className="border-2 border-black px-2 py-1">
                    Demand time
                  </th>
                  <th className="border-2 border-black px-2 py-1">
                    Sanctioned time
                  </th>
                  <th className="border-2 border-black px-2 py-1">
                    Availed time
                  </th>
                  <th className="border-2 border-black px-2 py-1">
                    Station ID
                  </th>
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
                      if (block.Status === "APPROVED") {
                        statusLabel = "Pending with Optg";
                        statusStyle = { background: "#fff86b", color: "#222" };
                      } else if (block.Status === "PENDING") {
                        statusLabel = "Pending with dept control";
                        statusStyle = { background: "#d47ed4", color: "#222" };
                      } else if (block.Status === "REJECTED") {
                        statusLabel = "Returned by Optg";
                        statusStyle = { background: "#ff4e36", color: "#fff" };
                      } else {
                        statusLabel = block.Status;
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
                            {formatDateB(block.Date)}
                          </td>
                          <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            <Link
                              href={`/view-request/${block.id}`}
                              className="block w-full h-full"
                            >
                              {block.DivisionId}
                            </Link>
                          </td>
                          <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            {block.MissionBlock}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {block.Type}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black max-w-[200px] break-words">
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
            <span className="bg-[#00b347] text-white font-bold px-2 py-1 rounded text-[24px]">
              Section/Block ID
            </span>
            <span className="text-lg font-bold text-black text-[24px]">
              to see further details.
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              className="flex items-center gap-2 bg-[#cfd4ff] border-2 border-black rounded-[50%] px-6 py-2 text-[24px] font-bold text-black"
              onClick={() => router.push("/")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
