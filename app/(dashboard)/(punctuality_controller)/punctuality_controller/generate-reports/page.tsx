"use client";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGenerateReport } from "@/app/service/query/hq";
import { Activity, MajorSection } from "@/app/lib/store";
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
  department: OptionType[];
  blockType: OptionType[];
  majorSection: OptionType[];
}

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
  Department?: string;
  corridorType?: string;
  MissionBlock?: string;
  MissionBlockCount?: number;
}

interface DetailedData {
  Date: string;
  Section: string;
  Duration: number;
  Type: string;
  Status: string;
  DivisionId?: string;
  Activity?: string;
  AvailedTimeFrom?: string;
  AvailedTimeTo?: string;
  stationId?: string;
  overAllStatus?: string;
}

const blockTypeOptions = [
  { label: "All", value: "ALL" },
  { label: "Corridor (C)", value: "Corridor" },
  { label: "Non-corridor(NC)", value: "Outside Corridor" },
  { label: "Emergency (E)", value: "Urgent Block" },
  { label: "Mega Block (M)", value: "MEGA_BLOCK" },
];

const departmentOptions: OptionType[] = [
  { value: "Engineering", label: "Engineering" },
  { value: "ST", label: "S & T" },
  { value: "TRD", label: "TRD" },
];

export default function GenerateReportPage() {
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [showTimeSlotDropdown, setShowTimeSlotDropdown] = useState(false);
  const [timeSlotFilter, setTimeSlotFilter] = useState<string>('ALL');
  const [blockTypeDropdownOpen, setBlockTypeDropdownOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [blockType, setBlockType] = useState<string[]>([]);
  const [type, setType] = useState<string[]>([]);
  const [section, setSection] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);

  type SummaryFilters = {
    start: string;
    end: string;
    blockType: string[];
    section: string[];
    activity: string[];
    dept: string;
    line: string;
  };

  const [pendingSummaryFilters, setPendingSummaryFilters] = useState<SummaryFilters>({
    start: "",
    end: "",
    blockType: [],
    section: [],
    activity: [],
    dept: "",
    line: "",
  });

  const [activeSummaryFilters, setActiveSummaryFilters] = useState<SummaryFilters>({
    start: "",
    end: "",
    blockType: [],
    section: [],
    activity: [],
    dept: "",
    line: "",
  });

  const [pastBlockSummary, setPastBlockSummary] = useState<PastBlockSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["All"]);
  const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>(["All"]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(["Engineering"]);
  const [selectedMajorSections, setSelectedMajorSections] = useState<string[]>([]);
  const [majorSectionOptions, setMajorSectionOptions] = useState<OptionType[]>([]);

  const router = useRouter();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>();
  const { data: session } = useSession();

  const [queryParams, setQueryParams] = useState({
    startDate: "",
    endDate: "",
    majorSections: [] as string[],
    department: ["Engineering"],
    blockType: ["All"],
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-requests", customDateRange],
    queryFn: () =>
      managerService.getUserRequestsByAdmin(
        1,
        10000,
        customDateRange.start || undefined,
        customDateRange.end || undefined,
        undefined,
        "632e3c5d-518b-4f12-998e-7155f3d5da99",
      ),
  });

  const { data: reportData, refetch } = useGenerateReport(queryParams);

  useEffect(() => {
    setType(blockType);
  }, [blockType]);

  useEffect(() => {
    setSection(selectedSections);
  }, [selectedSections]);

  useEffect(() => {
    if (session?.user?.location) {
      const userLocation = session.user.location;
      setSelectedLocations([userLocation]);

      if (MajorSection[userLocation as keyof typeof MajorSection]) {
        const sections = MajorSection[userLocation as keyof typeof MajorSection];
        const options = sections.map((section) => ({
          value: section,
          label: section,
        }));
        setMajorSectionOptions([{ value: "All", label: "All" }, ...options]);
      }
    }
  }, [session]);

  useEffect(() => {
    setLoading(isLoading);
    if (reportData && reportData.data) {
      const pastData = reportData.data.pastBlockSummary || [];
      setPastBlockSummary(pastData);
      setReportGenerated(true);
      toast.success(reportData.message || "Report generated successfully");
    }
  }, [reportData, isLoading]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to generate report");
      setLoading(false);
    }
  }, [error]);

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
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "N/A";
    }
  };

  const sectionOptions = Array.from(
    new Set(
      data?.data?.requests
        ?.map((r: UserRequest) => r.selectedSection)
        .filter(Boolean) || []
    )
  );
  const activityOptions = Array.from(
    new Set(
      data?.data?.requests
        ?.map((r: UserRequest) => r.activity)
        .filter(Boolean) || []
    )
  );
  const handleDownloadExcel = async (rowsToDownload: UserRequest[]) => {
    try {
      if (!rowsToDownload || rowsToDownload.length === 0) {
        alert("No data available to download!");
        return;
      }
      const XLSX = await import('xlsx');

      const headers = [
        "Date",
        "Request ID",
        "Block Section",
        "Line/Road",
        "Activity",
        "Status",
        "Demanded From Time (HH:MM)",
        "Demanded To Time (HH:MM)",
        "Sanctioned From Time (HH:MM)",
        "Sanctioned To Time (HH:MM)",
        "Corridor Type",
        "Department",
        "SSE Name",
        "Work Location",
        "Remarks",
        "OverAllStatus"
      ];

      const rows = rowsToDownload.map((request) => {
        const startTime = request.demandTimeFrom
          ? new Date(request.demandTimeFrom).toISOString().slice(11, 16)
          : "N/A";

        const endTime = request.demandTimeTo
          ? new Date(request.demandTimeTo).toISOString().slice(11, 16)
          : "N/A";

        const sanctionedFrom = request.sanctionedTimeFrom
          ? new Date(request.sanctionedTimeFrom).toISOString().slice(11, 16)
          : request.optimizeTimeFrom
            ? new Date(request.optimizeTimeFrom).toISOString().slice(11, 16)
            : "N/A";

        const sanctionedTo = request.sanctionedTimeTo
          ? new Date(request.sanctionedTimeTo).toISOString().slice(11, 16)
          : request.optimizeTimeTo
            ? new Date(request.optimizeTimeTo).toISOString().slice(11, 16)
            : "N/A";

        return [
          formatDate(request.date),
          request.divisionId || request.id,
          request.missionBlock,
          request.processedLineSections?.[0]?.road || request.processedLineSections?.[0]?.lineName,
          request.activity,
          getStatusDisplay(request).label,
          startTime,
          endTime,
          sanctionedFrom,
          sanctionedTo,
          request.corridorType,
          request.user?.department || request.selectedDepartment || "N/A",
          request.user?.name || "N/A",
          request.workLocationFrom,
          request.requestremarks,
          request.overAllStatus || "N/A"
        ];
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Block Requests");

      const formatDateForFilename = (dateString: string) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        } catch {
          return "";
        }
      };

      let filename;
      if (activeSummaryFilters.start && activeSummaryFilters.end) {
        const startDate = formatDateForFilename(activeSummaryFilters.start);
        const endDate = formatDateForFilename(activeSummaryFilters.end);
        filename = `block_requests_${startDate}_to_${endDate}.xlsx`;
      } else if (activeSummaryFilters.start) {
        filename = `block_requests_${formatDateForFilename(activeSummaryFilters.start)}.xlsx`;
      } else if (activeSummaryFilters.end) {
        filename = `block_requests_${formatDateForFilename(activeSummaryFilters.end)}.xlsx`;
      } else {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        filename = `block_requests_${day}-${month}-${year}.xlsx`;
      }

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate Excel file. Please check console for details.");
    }
  };

  function getStatusDisplay(request: UserRequest) {
    if (request.status === "APPROVED" && request.isSanctioned) {
      return {
        label: "Sanctioned",
        style: { background: "#d6ecd2", color: "#11332b" },
      };
    }
    if (request.status === "APPROVED" && !request.isSanctioned && request.adminRequestStatus !== "REJECTED") {
      return {
        label: "Pending with me",
        style: { background: "#d47ed4", color: "#222" },
      };
    }
    if (request.status === "REJECTED" || request.adminRequestStatus === "REJECTED") {
      return {
        label: "Return to Applicant",
        style: { background: "#ff4e36", color: "#fff" },
      };
    }
    if (["NOT_AVAILED", "AVAILED", "CANCELLED"].includes(request.userStatus)) {
      return {
        label: request.userStatus.replace("_", "-").toLowerCase(),
        style: { background: "#fff", color: "#222" },
      };
    }
    if (request.status === "BURST") {
      return {
        label: "Burst",
        style: { background: "#ff944c", color: "#fff" },
      };
    }
    return {
      label: request.status,
      style: { background: "#fff", color: "#222" },
    };
  }

  const handlePendingDateChange = (field: "start" | "end", value: string) => {
    setPendingSummaryFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handlePendingBlockTypeChange = (value: string) => {
    setPendingSummaryFilters((prev) => {
      const allBlockTypeValues = blockTypeOptions.slice(1).map(opt => opt.value);

      if (value === "ALL") {
        const shouldSelectAll = prev.blockType.length < allBlockTypeValues.length;
        return {
          ...prev,
          blockType: shouldSelectAll ? [...allBlockTypeValues] : []
        };
      } else {
        let newBlockTypes;
        if (prev.blockType.includes(value)) {
          newBlockTypes = prev.blockType.filter(v => v !== value);
        } else {
          newBlockTypes = [...prev.blockType, value];
        }

        return {
          ...prev,
          blockType: newBlockTypes
        };
      }
    });
  }

  const handlePendingSectionChange = (value: string) => {
    setPendingSummaryFilters((prev) => ({
      ...prev,
      section: prev.section.includes(value)
        ? prev.section.filter((v) => v !== value)
        : [...prev.section, value],
    }));
  };
  const matchesTimeSlot = (request: UserRequest): boolean => {
    if (timeSlotFilter === 'ALL') return true;
    const demandTime = new Date(request.demandTimeFrom);
    const hour = demandTime.getUTCHours();

    switch (timeSlotFilter) {
      case 'Morning': return hour >= 4 && hour < 12;
      case 'Afternoon': return hour >= 12 && hour < 20;
      case 'Night': return hour >= 20 || hour < 4;
      default: return true;
    }
  };

  const handlePendingDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingSummaryFilters((prev) => ({ ...prev, dept: e.target.value }));
  };

  const handlePendingLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingSummaryFilters((prev) => ({ ...prev, line: e.target.value }));
  };

  const handleApplySummaryFilters = () => {
    setActiveSummaryFilters({ ...pendingSummaryFilters });
    setShowTable(true);
  };

  let summaryFilteredRequests = data?.data?.requests || [];

  if (activeSummaryFilters.start) {
    const startDate = new Date(activeSummaryFilters.start);
    summaryFilteredRequests = summaryFilteredRequests.filter((r) => {
      const requestDate = new Date(r.date);
      return requestDate >= startDate;
    });
  }

  if (activeSummaryFilters.end) {
    const endDate = new Date(activeSummaryFilters.end);
    summaryFilteredRequests = summaryFilteredRequests.filter((r) => {
      const requestDate = new Date(r.date);
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      return requestDate < endOfDay;
    });
  }

  if (activeSummaryFilters.blockType.length > 0) {
    const allTypesSelected = activeSummaryFilters.blockType.length === blockTypeOptions.length - 1;
    if (!allTypesSelected) {
      summaryFilteredRequests = summaryFilteredRequests.filter((r) =>
        activeSummaryFilters.blockType.includes(r.corridorType)
      );
    }
  }

  if (activeSummaryFilters.section.length > 0) {
    const allSectionsSelected = activeSummaryFilters.section.length === sectionOptions.length;
    if (!allSectionsSelected) {
      summaryFilteredRequests = summaryFilteredRequests.filter((r) =>
        activeSummaryFilters.section.includes(r.selectedSection)
      );
    }
  }


  if (activeSummaryFilters.activity.length > 0) {
    const allSectionsSelected = activeSummaryFilters.activity.length === activityOptions.length;
    if (!allSectionsSelected) {
      summaryFilteredRequests = summaryFilteredRequests.filter((r) =>
        activeSummaryFilters.activity.includes(r.activity)
      );
    }
  }

  if (activeSummaryFilters.dept) {
    summaryFilteredRequests = summaryFilteredRequests.filter((r) => r.selectedDepartment === activeSummaryFilters.dept);
  }

  if (activeSummaryFilters.line) {
    summaryFilteredRequests = summaryFilteredRequests.filter((r) => r.selectedLine === activeSummaryFilters.line);
  }
  if (activeSummaryFilters.activity) {
    summaryFilteredRequests = summaryFilteredRequests.filter(matchesTimeSlot);

  }
  let sanctionedRequests = summaryFilteredRequests.filter((r) => r.isSanctioned);

  const handleMajorSectionChange = (options: MultiValue<OptionType>) => {
    if (Array.isArray(options) && options.length > 0) {
      const selectedValues = options.map((option) => option.value);

      if (selectedValues.includes("All")) {
        const allSpecificSections = majorSectionOptions
          .map((option) => option.value)
          .filter((value) => value !== "All");
        setSelectedMajorSections(allSpecificSections);
      } else {
        setSelectedMajorSections(selectedValues);
      }
    } else {
      setSelectedMajorSections([]);
    }
  };

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
    if (!data.startDate || !data.endDate) {
      toast.error("Please enter both start and end dates");
      return;
    }

    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      const formattedStartDate = format(startDate, "dd/MM/yy");
      const formattedEndDate = format(endDate, "dd/MM/yy");

      setQueryParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        majorSections: selectedMajorSections,
        department: selectedDepartments,
        blockType: selectedBlockTypes,
      });

      await refetch();
    } catch (error) {
      console.error("Error initiating report generation:", error);
      toast.error("Failed to generate report");
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB");
  };

  const [upcomingSectionFilter, setUpcomingSectionFilter] = useState<string>("All");
  const sectionOptionsB: string[] = Array.from(
    new Set(
      reportData?.data?.detailedData?.map((b: DetailedData) => b.Section) || []
    )
  );

  const filteredUpcomingBlocks: DetailedData[] =
    upcomingSectionFilter === "All"
      ? reportData?.data?.detailedData || []
      : reportData?.data?.detailedData?.filter(
        (b: DetailedData) => b.Section === upcomingSectionFilter
      ) || [];

  const [sectionDropdownOpenB, setSectionDropdownOpenB] = useState(false);
  const sectionDropdownRefB = useRef<HTMLDivElement>(null);

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
          Date: formatDate(block.Date),
          "Request ID": block.DivisionId || "N/A",
          "Station ID": block.stationId || "N/A",
          Type: block.Type || "N/A",
          Activity: block.Activity || "N/A",
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

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen text-black bg-white p-3 border border-black flex items-center justify-center">
  //       <div className="text-center py-5">Loading approved requests...</div>
  //     </div>
  //   );
  // }

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
        <span className="text-[24px] font-bold text-black">{session?.user?.name}</span>
        <div className="mt-2 bg-[#7be09b] px-6 py-1 rounded-2xl">
          <span className="text-[24px] font-bold text-white">
            Blocks Granted/Availed/Pending
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto w-full px-3">
        {/* Filters Section */}
        <div className="w-full bg-[#fffbe9] px-2 py-2">
          <div className="flex flex-row gap-8 items-end w-full flex-wrap">
            {/* Choose Section Dropdown */}
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
                    opacity: 0,
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
                    display: 'none',
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
                <span className="text-base font-bold" style={{ color: "black" }}>
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

        {/* Block Type Filters */}
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

        {/* Department Filters */}
        <div className="w-full flex flex-wrap justify-center gap-2 mb-2">
          {departmentOptions.map((opt) => (
            <button
              key={opt.value}
              className={`rounded-full px-3 py-1 text-[24px] font-semibold border flex items-center gap-1 transition-colors duration-150
                ${opt.value === "Engineering"
                  ? selectedDepartments.includes(opt.value)
                    ? "bg-[#e49edd] border-[#b07be0] text-black"
                    : "bg-[#f3e6f7] border-[#b07be0] text-black"
                  : opt.value === "ST"
                    ? selectedDepartments.includes(opt.value)
                      ? "bg-[#fff35c] border-[#e0e0e0] text-black"
                      : "bg-[#fffbe9] border-[#e0e0e0] text-black"
                    : selectedDepartments.includes(opt.value)
                      ? "bg-[#c7f7c7] border-[#7be09b] text-black"
                      : "bg-[#e0fff0] border-[#7be09b] text-black"
                }`}
              onClick={() => toggleDepartment(opt.value)}
              type="button"
            >
              {selectedDepartments.includes(opt.value) && (
                <span className="text-green-600 font-bold">✔</span>
              )}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-center mb-2">
          <button
            className="bg-[#7be09b] hover:bg-[#5bc07b] text-white font-bold px-8 py-2 rounded-lg shadow border border-[#00b347] text-[24px]"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {/* (A) Block Summary Table */}
        {/* <div className="w-full mt-4">
          <div className="flex w-full">
            <div className="flex-1 bg-[#ff914d] text-[24px] font-bold border-2 border-black px-2 py-1" style={{ color: "black" }}>
              (A)Block Summary: {formatDisplayDate(watch("startDate")) || "........"} to {formatDisplayDate(watch("endDate")) || "........"}
            </div>
            <div className="flex-1 bg-[#ff914d] text-[24px] font-bold border-2 border-black px-2 py-1" style={{ color: "black" }}>
              Department: {selectedDepartments.length > 0 ? selectedDepartments.join(", ") : "............."} (in Hrs)
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-2 border-black">
              <thead>
                <tr className="bg-[#f7c7ac] text-black text-[24px] font-bold">
                  <th className="border-2 border-black px-2 py-1">Section</th>
                  <th className="border-2 border-black px-2 py-1">Demanded</th>
                  <th className="border-2 border-black px-2 py-1">Approved</th>
                  <th className="border-2 border-black px-2 py-1">Granted</th>
                  <th className="border-2 border-black px-2 py-1">% Granted</th>
                  <th className="border-2 border-black px-2 py-1">Availed</th>
                  <th className="border-2 border-black px-2 py-1">% Availed</th>
                </tr>
              </thead>
              <tbody>
                {pastBlockSummary.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4" style={{ color: "black" }}>
                      No data found.
                    </td>
                  </tr>
                ) : (
                  pastBlockSummary.map((summary: any, idx: number) => (
                    <tr className={`font-bold ${idx % 2 === 0 ? "bg-[#f4dcf1]" : "bg-white"}`} key={idx}>
                      <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                        {summary.Department || summary.Section || ""}
                      </td>
                      <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                        {summary.Demanded}
                      </td>
                      <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                        {summary.Approved}
                      </td>
                      <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                        {summary.Granted}
                      </td>
                      <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                        {summary.PercentGranted !== undefined ? summary.PercentGranted + "%" : ""}
                      </td>
                      <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                        {summary.Availed}
                      </td>
                      <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                        {summary.PercentAvailed !== undefined ? summary.PercentAvailed + "%" : ""}
                      </td>
                    </tr>
                  ))
                )}

                {pastBlockSummary.length > 0 && (
                  <tr className="bg-[#ff914d] text-white font-bold">
                    <td className="border-2 border-black px-2 py-1 text-center">Total</td>
                    <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                      {pastBlockSummary.reduce((sum, item) => sum + (item.Demanded || 0), 0)}
                    </td>
                    <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                      {pastBlockSummary.reduce((sum, item) => sum + (item.Approved || 0), 0)}
                    </td>
                    <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                      {pastBlockSummary.reduce((sum, item) => sum + (item.Granted || 0), 0)}
                    </td>
                    <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                      {pastBlockSummary.reduce((sum, item) => sum + (item.PercentGranted || 0), 0)}
                    </td>
                    <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                      {pastBlockSummary.reduce((sum, item) => sum + (item.Availed || 0), 0)}
                    </td>
                    <td className="border-2 border-black px-2 py-1 text-center" style={{ color: "black" }}>
                      {pastBlockSummary.reduce((sum, item) => sum + (item.PercentAvailed || 0), 0)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* (B) Summary of Upcoming Blocks */}
        <div className="w-full max-w-4xl mt-8">
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
                  {upcomingSectionFilter === "All" ? "All" : upcomingSectionFilter}
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
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[24px]"
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
                  <th className="border-2 border-black px-2 py-1">RequestID</th>
                  <th className="border-2 border-black px-2 py-1">Type</th>
                  <th className="border-2 border-black px-2 py-1">Activity</th>
                  <th className="border-2 border-black px-2 py-1">Duration</th>
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
                    <td colSpan={5} className="text-center py-4" style={{ color: "black" }}>
                      No data found.
                    </td>
                  </tr>
                ) : (
                  filteredUpcomingBlocks.slice(0, 200).map((block: DetailedData, idx: number) => {
                    let statusLabel = "";
                    let statusStyle = { background: "#fff", color: "#222" };
                    if (block.overAllStatus === "Sanctioned") {
                      statusLabel = "Sanctioned";
                      statusStyle = { background: "#fff86b", color: "#222" };
                    } else if (block.overAllStatus === "with optg.") {
                      statusLabel = "with optg.";
                      statusStyle = { background: "#d47ed4", color: "#222" };
                    } else if (block.Status === "PENDING") {
                      statusLabel = "Pending with dept control";
                      statusStyle = { background: "#d47ed4", color: "#222" };
                    } else if (block.Status === "REJECTED") {
                      statusLabel = "Returned by Optg";
                      statusStyle = { background: "#ff4e36", color: "#fff" };
                    } else {
                      statusLabel = block.overAllStatus || block.Status;
                    }

                    const rowBgColor = idx % 2 === 0 ? "bg-white" : "bg-[#f5d0f2]";

                    return (
                      <tr key={idx} className={`${rowBgColor} hover:bg-[#F3F3F3]`}>
                        <td className="border-2 border-black px-2 py-1 text-black">
                          {dayjs(block.Date).format("DD-MM-YY")}
                        </td>
                        <td className="border-2 border-black px-2 py-1 font-bold text-black">
                          {block.DivisionId}
                        </td>
                        <td className="border-2 border-black px-2 py-1 text-black">
                          {block.Type}
                        </td>
                        <td className="border-2 border-black px-2 py-1 text-black">
                          {block.Activity}
                        </td>
                        <td className="border-2 border-black px-2 py-1 text-black">
                          {block.Duration}
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

        {/* View Summary of Sanctioned Blocks */}
        <div className="flex justify-center mb-8 mt-7 max-w-[2000px]">
          <div className="max-w-[2000px] max-w-6xl rounded-2xl border-4 border-[#00B4D8] bg-[#CAF0F8] shadow-lg p-0">
            <div className="text-[24px] font-bold text-[#0077B6] text-center py-3 tracking-wide">
              View Summary of Sanctioned Blocks
            </div>
            <div className="px-2 pb-4">
              {/* Filters Row */}
              <div className="flex flex-wrap gap-2 items-center justify-between bg-[#D6F3FF] p-2 rounded-md border border-[#00B4D8] mb-2">
                {/* Date Range */}
                <div className="flex items-center flex-wrap gap-1">
                  <span className="bg-[#E6E6FA] px-2 py-1 border border-[#00B4D8] font-bold text-black rounded-l-md text-[24px]">
                    date
                  </span>
                  <input
                    type="date"
                    value={pendingSummaryFilters.start}
                    onChange={(e) => handlePendingDateChange("start", e.target.value)}
                    className="p-1 border border-[#00B4D8] text-black bg-white w-28 focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-[24px]"
                  />
                  <span className="px-1 text-black text-[24px]">to</span>
                  <input
                    type="date"
                    value={pendingSummaryFilters.end}
                    onChange={(e) => handlePendingDateChange("end", e.target.value)}
                    className="p-1 border border-[#00B4D8] text-black bg-white w-28 focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-[24px]"
                  />
                </div>



                <div className="relative">
                  <button
                    onClick={() => setShowTimeSlotDropdown(!showTimeSlotDropdown)}
                    className="bg-[#E6E6FA] px-3 py-1 rounded-full border-2 border-[#00B4D8] font-semibold text-black flex items-center gap-2 text-[24px]"
                  >
                    Time Slot
                    <span className="ml-1 text-sm">▼</span>
                  </button>
                  {showTimeSlotDropdown && (
                    <div className="absolute z-10 mt-2 w-60 bg-white border-2 border-[#00B4D8] rounded shadow-lg">
                      {[
                        { key: 'ALL', label: 'ALL' },
                        { key: 'Morning', label: 'Morning (4:00-12:00)' },
                        { key: 'Afternoon', label: 'Afternoon (12:00-20:00)' },
                        { key: 'Night', label: 'Night (20:00-4:00)' }
                      ].map((slot) => (
                        <button
                          key={slot.key}
                          onClick={() => {
                            setTimeSlotFilter(slot.key);
                            setShowTimeSlotDropdown(false);
                          }}
                          className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black text-[20px] ${timeSlotFilter === slot.key ? 'bg-blue-100' : ''
                            }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Block Type Dropdown */}
                <div className="relative inline-block">
                  <button
                    onClick={() => setBlockTypeDropdownOpen((v) => !v)}
                    className="bg-[#E6E6FA] px-3 py-1 rounded-full border-2 border-[#00B4D8] font-semibold text-black flex items-center gap-2 text-[24px]"
                  >
                    Type
                    <span className="ml-1 text-sm">▼</span>
                  </button>
                  {blockTypeDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-40 bg-white border-2 border-[#00B4D8] rounded shadow-lg">
                      {blockTypeOptions.map((opt) => {
                        const allBlockTypeValues = blockTypeOptions.slice(1).map(o => o.value);
                        const allSelected = allBlockTypeValues.every(val =>
                          pendingSummaryFilters.blockType.includes(val)
                        );

                        return (
                          <label
                            key={opt.value}
                            className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[20px]"
                          >
                            <input
                              type="checkbox"
                              checked={
                                opt.value === "ALL"
                                  ? allSelected
                                  : pendingSummaryFilters.blockType.includes(opt.value)
                              }
                              onChange={() => {
                                handlePendingBlockTypeChange(opt.value);
                                setBlockTypeDropdownOpen(false);
                              }}
                              className="mr-2 accent-[#B57CF6]"
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section Dropdown */}
                <div className="relative inline-block">
                  <button
                    onClick={() => setSectionDropdownOpen((v) => !v)}
                    className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-[#00B4D8] font-semibold text-black flex items-center gap-2 text-[24px]"
                  >
                    Section
                    <span className="ml-1 text-sm">▼</span>
                  </button>
                  {sectionDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-40 bg-white border-2 border-[#00B4D8] rounded shadow-lg max-h-60 overflow-y-auto">
                      <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[20px] border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={
                            pendingSummaryFilters.section.length === sectionOptions.length ||
                            (sectionOptions.length === 0 && pendingSummaryFilters.section.length > 0)
                          }
                          onChange={() => {
                            if (pendingSummaryFilters.section.length === sectionOptions.length) {
                              setPendingSummaryFilters(prev => ({
                                ...prev,
                                section: []
                              }));
                            } else {
                              setPendingSummaryFilters(prev => ({
                                ...prev,
                                section: [...sectionOptions]
                              }));
                            }
                            setSectionDropdownOpen(false);
                          }}
                          className="mr-2 accent-[#B57CF6]"
                        />
                        ALL
                      </label>

                      {sectionOptions.map((section) => (
                        <label
                          key={section}
                          className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[20px]"
                        >
                          <input
                            type="checkbox"
                            checked={pendingSummaryFilters.section.includes(section)}
                            onChange={() => {
                              setPendingSummaryFilters(prev => {
                                const newSections = prev.section.includes(section)
                                  ? prev.section.filter(s => s !== section)
                                  : [...prev.section, section];

                                return {
                                  ...prev,
                                  section: newSections
                                };
                              });
                              setSectionDropdownOpen(false);
                            }}
                            className="mr-2 accent-[#B57CF6]"
                          />
                          {section}
                        </label>
                      ))}
                    </div>
                  )}
                </div>





                <div className="relative inline-block">
                  <button
                    onClick={() => setActivityDropdownOpen((v) => !v)}
                    className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-[#00B4D8] font-semibold text-black flex items-center gap-2 text-[24px]"
                  >
                    Activity
                    <span className="ml-1 text-sm">▼</span>
                  </button>
                  {activityDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-40 bg-white border-2 border-[#00B4D8] rounded shadow-lg max-h-60 overflow-y-auto">
                      <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[20px] border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={
                            pendingSummaryFilters.activity.length === activityOptions.length ||
                            (activityOptions.length === 0 && pendingSummaryFilters.activity.length > 0)
                          }
                          onChange={() => {
                            if (pendingSummaryFilters.activity.length === activityOptions.length) {
                              setPendingSummaryFilters(prev => ({
                                ...prev,
                                section: []
                              }));
                            } else {
                              setPendingSummaryFilters(prev => ({
                                ...prev,
                                section: [...activityOptions]
                              }));
                            }
                            setSectionDropdownOpen(false);
                          }}
                          className="mr-2 accent-[#B57CF6]"
                        />
                        ALL
                      </label>

                      {activityOptions.map((activity) => (
                        <label
                          key={activity}
                          className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[20px]"
                        >
                          <input
                            type="checkbox"
                            checked={pendingSummaryFilters.activity.includes(activity)}
                            onChange={() => {
                              setPendingSummaryFilters(prev => {
                                const newActivity = prev.activity.includes(activity)
                                  ? prev.activity.filter(s => s !== activity)
                                  : [...prev.activity, activity];

                                return {
                                  ...prev,
                                  activity: newActivity
                                };
                              });
                              setSectionDropdownOpen(false);
                            }}
                            className="mr-2 accent-[#B57CF6]"
                          />
                          {activity}
                        </label>
                      ))}
                    </div>
                  )}
                </div>



                {/* Dept Dropdown */}
                <div className="relative inline-block">
                  <select
                    className="bg-[#00B4D8] border-2 border-[#00B4D8] px-2 py-1 rounded-full text-[24px] font-semibold cursor-pointer focus:outline-none appearance-none pr-6 text-white min-w-[80px]"
                    value={pendingSummaryFilters.dept}
                    onChange={handlePendingDeptChange}
                  >
                    <option value="">DEPT</option>
                    <option value="ENGG">ENGG</option>
                    <option value="S&T">S&T</option>
                    <option value="TRD">TRD</option>
                  </select>
                  <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs">
                    ▼
                  </div>
                </div>

                {/* Click to View Button */}
                <div className="flex-grow flex justify-center">
                  <button
                    className="bg-[#00B4D8] border-2 border-[#0077B6] px-6 py-2 rounded-[50%] text-[24px] font-bold text-white hover:bg-[#48CAE4] shadow transition"
                    onClick={handleApplySummaryFilters}
                  >
                    Click to View
                  </button>
                </div>
              </div>

              {/* Table */}
              {showTable && (
                <div className="mx-2 overflow-x-auto">
                  <div className="max-h-[1000px] overflow-y-auto border-2 border-[#00B4D8] rounded-lg bg-white">
                    <table className="w-full text-black text-[24px] relative">
                      <thead>
                        <tr className="bg-[#e49edd] text-black">
                          <th className="border-2 border-black p-1">Date</th>
                          <th className="border-2 border-black p-1">ID</th>
                          <th className="border-2 border-black p-1">Block Section</th>
                          <th className="border-2 border-black p-1">Demanded</th>
                          <th className="border-2 border-black p-1">Offered</th>
                          <th className="border-2 border-black p-1">Block Type</th>
                          <th className="border-2 border-black p-1">Line/Road</th>
                          <th className="border-2 border-black p-1">Activity</th>
                          <th className="border-2 border-black p-1 sticky right-0 z-10 bg-[#e49edd]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sanctionedRequests.sort((a: any, b: any) => new Date(a.sanctionedTimeFrom || a.optimizeTimeFrom || a.demandTimeFrom).getTime() - new Date(b.sanctionedTimeTo || b.optimizeTimeTo || b.demandTimeTo).getTime()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(
                          (request: UserRequest, idx: number) => {
                            const status = getStatusDisplay(request);
                            return (
                              <tr
                                key={request.id}
                                className={idx % 2 === 0 ? "bg-[#FFC0CB]" : "bg-white"}
                              >
                                <td className="border border-black p-1 text-center">
                                  {dayjs(request.date).format("DD-MM-YY")}
                                </td>
                                <td className="border border-black p-1 text-center">
                                  <Link
                                    href={`/admin/optimise-table?id=${request.id}`}
                                    className="text-[#13529e] hover:underline font-semibold"
                                  >
                                    {request.divisionId || request.id}
                                  </Link>
                                </td>
                                <td className="border border-black p-1">
                                  {request.missionBlock}
                                </td>
                                <td className="border border-black p-1">
                                  {formatTime(request.demandTimeFrom)} -{" "}
                                  {formatTime(request.demandTimeTo)}
                                </td>
                                <td className="border border-black p-1">
                                  {`${formatTime(
                                    request.sanctionedTimeFrom ||
                                    request.optimizeTimeFrom
                                  )} - ${formatTime(
                                    request.sanctionedTimeTo ||
                                    request.optimizeTimeTo
                                  )}`}
                                </td>
                                <td className="border border-black p-1">
                                  {request.corridorType}
                                </td>
                                <td className="border border-black p-1 text-center">
                                  {request.processedLineSections?.[0]?.lineName ||
                                    request.processedLineSections?.[0]?.road ||
                                    "N/A"}
                                </td>
                                <td className="border border-black p-1">
                                  {request.activity}
                                </td>
                                <td
                                  className="border border-black p-1 sticky right-0 z-10 text-center font-bold"
                                  style={status.style}
                                >
                                  <span className="w-full block text-base">
                                    {status.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Info Texts */}
              <div className="text-center mt-1 mb-3">
                <h3 className="inline-flex py-1 px-6 rounded-full text-black text-base font-medium text-[14px]">
                  Click ID to see details of a Block.
                </h3>
                <h3 className="rounded-full pb-2 px-4 text-black text-[14px] font-medium">
                  For printing the complete table, click to download in{" "}
                  <span className="font-bold text-[#00B4D8] text-[14px]">
                    .xlsx format
                  </span>
                </h3>
                <button
                  onClick={() => handleDownloadExcel(sanctionedRequests)}
                  className="w-fit bg-[#FFA07A] hover:bg-[#FFBFAE] px-12 py-3 rounded-[50%] border-2 border-[#FF6B6B] font-bold text-[24px] text-[#5D3587] shadow transition"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" w-full bg-white border-t-2 border-[#A084E8] py-4 flex flex-col justify-center items-center gap-8 z-50 ">
        <button
          onClick={async () => {
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
          }}
          className="w-fit bg-[#FFB74D] border border-black px-10 py-1.5 rounded-[50%] text-2xl font-bold text-black"
        >
          Logout
        </button>

      </div>
    </div>
  );
}