"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGenerateReport } from "@/app/service/query/hq";
import { MajorSection } from "@/app/lib/store";
import { useSession } from "next-auth/react";
import { managerService, UserRequest } from "@/app/service/api/manager";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  NotAvailedCount?: number;
  NotGrantedCount?: number;
  Applied?: number;
  AppliedCount?: number;
  GrantedCount?: number;
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
  userResponse?: string;
  useAcceptanceForSanction?: boolean;
  AvailedTimeTo?: any;
  DemandedTimeFrom?: any;
  isApplied?: boolean;
  AvailedTimeFrom?: any;
  isGranted?: boolean;
  isSanctioned?: boolean;
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

const departmentOptions: OptionType[] = [
  { value: "Engineering", label: "Engineering" },
  { value: "ST", label: "S & T" },
  { value: "TRD", label: "TRD" },
];
// Add after your departmentOptions
const globalFilterOptions = {
    workType: {
    'Engineering': [
      { value: "ALL", label: "ALL" },
      { value: "Machine", label: "Machine" },
      { value: "Non-Machine", label: "Non-Machine" },
    ],
    'ST': [
      { value: "ALL", label: "ALL" },
      { value: "Gear", label: "Gear" },
    
    ],
    'TRD': [
      { value: "ALL", label: "ALL" },
     { value: "Tw", label: "Tw" },
      { value: "Lt", label: "Lt" },
    ]
  },
  activity: {
    'Gear': ['Point', 'EI', 'Signal', 'DC Track', 'AFTC', 'SSDAC', 'MSDAC', 'Panel', 'LC Gate Mechanical', 'LC Gate ELB', 'Emergency Sliding Boom', 'IPS', 'Conventional power supply equipment', 'System Integrity Test of each PI/EI/RRI stations', 'Cable Insulation testing (cable meggering) for one station.', 'DLBI- SGE', 'TLBI-FM Inst', 'UFSBI', 'Fuse', 'EKT'],
    'Tw': ['AOH', 'POH', 'IOH', 'RE POH', 'RD WORK', 'TURN OUT CHECKING', 'CROSS OVER CHECKING', 'CROSS TRACK FEEDERS CHECKING', 'GANTRY MAINTENANCE', 'CONTACT WIRE RENEWAL WORK', 'CATENARY WIRE RENEWAL WORK', 'CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)', 'MAST ERECTION(2x25KV WORK)', 'FEEDERS ERECTION(2x25KV WORK)', 'OHE PROFILING', 'OHE/CN WORK', 'OTHER SPECIAL WORKS'],
    'Lt': ['AOH', 'POH', 'IOH', 'RE POH', 'RD WORK', 'TURN OUT CHECKING', 'CROSS OVER CHECKING', 'CROSS TRACK FEEDERS CHECKING', 'GANTRY MAINTENANCE', 'CONTACT WIRE RENEWAL WORK', 'CATENARY WIRE RENEWAL WORK', 'CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)', 'MAST ERECTION(2x25KV WORK)', 'FEEDERS ERECTION(2x25KV WORK)', 'OHE PROFILING', 'OHE/CN WORK', 'OTHER SPECIAL WORKS'],
    'Machine': ['BCM', 'DTE', 'CSM', 'DUOMAT', 'UNIMAT', 'MPT', 'BRM', 'TRT', 'UTV', 'DTS', 'T28', 'SQRS', 'RGM working', 'SBCM'],
    'Non-Machine': ['Rail renewal', 'Welding work', 'Destressing work', 'Switch renewal', 'CMS Crossing renewal', 'SEJ Renewal', 'Glued Joint renewal', 'Dummy Glued Joint removal', 'TRR P 60 Kg', 'TRR S 60 Kg', 'TRR S 60 kg', 'TRR S 52 kg', 'Interchanging', 'Trucking out/Shifting materials', 'TWR with MFBW', 'TBTR (Br sleeper renewal)', 'TSR P 60 Kg', 'TSR S 60 Kg', 'TSR S 52 Kg', 'TTSR work', 'Jt Insp Notes Attn', 'Stretcherbar renewal', 'TFR Work', 'Ballast Unloading', 'Rail unloading', 'Lifting and packing', 'Gauge tie plate renewal', 'Sleeper renewal', 'Fish Plates O&E', 'Preliminary/Post works', 'Trucking out materials', 'Cutting Widening work', 'JCB working', 'Earth work/Muck removal', 'Crane Moving/Working', 'Attention to Track', 'Attention to Fittings', 'Attention to Bridge', 'Attention to Guard rail', 'Attention to Points & Xing', 'Attention to LC', 'Attention to Curve check rail', 'Sheet Piling work', 'Platform work', 'Platform Shelter work', 'ABSS work', 'Erection of Platform shelter purlins work', 'Erection of FOB Girders', 'Other FOB works', 'Other Track works', 'Other Bridge work'],
  },
};


// Helper function to get work types based on selected departments
const getWorkTypesForDepartments = (departments: string[]): OptionType[] => {
  if (departments.length === 0) return [{ value: "ALL", label: "ALL" }];
  
  // If multiple departments selected, combine and deduplicate work types
  const allWorkTypes = new Map();
  
  departments.forEach(dept => {
    const deptWorkTypes = globalFilterOptions.workType[dept as keyof typeof globalFilterOptions.workType] || [];
    deptWorkTypes.forEach(workType => {
      if (!allWorkTypes.has(workType.value)) {
        allWorkTypes.set(workType.value, workType);
      }
    });
  });
  
  return Array.from(allWorkTypes.values());
};

// Helper function to get activities based on work type
const getActivitiesForWorkType = (workTypeSelected: string): string[] => {
  if (workTypeSelected === 'ALL') return ['ALL'];
  return ['ALL', ...(globalFilterOptions.activity[workTypeSelected as keyof typeof globalFilterOptions.activity] || [])];
};
// Helper function to get operator symbol for display
const getOperatorSymbol = (operator: string): string => {
  const operatorMap: { [key: string]: string } = {
    ">": ">",
    ">=": "≥", 
    "=": "=",
    "<=": "≤",
    "<": "<",
    "ALL": "ALL"
  };
  return operatorMap[operator] || operator;
};

export default function GenerateReportPage() {
  const [durationFilter, setDurationFilter] = useState({
  operator: "ALL", // "ALL", ">", ">=", "=", "<", "<="
  value: ""
  });
  const [pastBlockSummary, setPastBlockSummary] = useState<PastBlockSummary[]>(
    []
  );
  const [activeFilter, setActiveFilter] = useState<"approved" | "granted" | "availed" |"applied" |"demanded"|"notGranted" | "notAvailed" |"all">("all");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["All"]);
  const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>([
    "All",
  ]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    "Engineering",
  ]);
  const [selectedMajorSections, setSelectedMajorSections] = useState<string[]>(
    []
  );
  const [majorSectionOptions, setMajorSectionOptions] = useState<OptionType[]>(
    []
  );
    const [upcomingDivisionIdSearch, setUpcomingDivisionIdSearch] = useState<string>("");
const [sseFilter, setSseFilter] = useState("All");
const [sseDropdownOpen, setSseDropdownOpen] = useState(false);
// Add after your existing state variables
const [globalWorkTypeFilter, setGlobalWorkTypeFilter] = useState<string>("ALL");
const [globalActivityFilter, setGlobalActivityFilter] = useState<string>("ALL");

// Dropdown visibility states
const [showGlobalWorkTypeDropdown, setShowGlobalWorkTypeDropdown] = useState(false);
const [showGlobalActivityDropdown, setShowGlobalActivityDropdown] = useState(false);
const [showDurationDropdown, setShowDurationDropdown] = useState(false);
const durationDropdownRef = useRef<HTMLDivElement>(null);

// Refs for dropdowns
const globalWorkTypeDropdownRef = useRef<HTMLDivElement>(null);
const globalActivityDropdownRef = useRef<HTMLDivElement>(null);
const sseDropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const { data: session } = useSession();

  // Parameters for the query
  const [queryParams, setQueryParams] = useState({
    startDate: "",
    endDate: "",
    majorSections: [] as string[],
    department: ["Engineering"],
    blockType: ["All"],
    globalWorkType: "ALL",
    globalActivity: "ALL", 
    durationOperator: "ALL",
  durationValue: "",
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
  // Reset work type filter when departments change
useEffect(() => {
  const availableWorkTypes = getWorkTypesForDepartments(selectedDepartments);
  const currentWorkTypeExists = availableWorkTypes.some(wt => wt.value === globalWorkTypeFilter);
  
  if (!currentWorkTypeExists) {
    setGlobalWorkTypeFilter("ALL");
    setGlobalActivityFilter("ALL");
  }
}, [selectedDepartments]);
  // Add after your existing useEffects
// Close dropdowns when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (globalWorkTypeDropdownRef.current && !globalWorkTypeDropdownRef.current.contains(event.target as Node)) {
      setShowGlobalWorkTypeDropdown(false);
    }
    if (globalActivityDropdownRef.current && !globalActivityDropdownRef.current.contains(event.target as Node)) {
      setShowGlobalActivityDropdown(false);
    }
    if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target as Node)) {
      setShowDurationDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
  // Use the react-query hook with enabled: false initially
  const {
    data: reportData,
    isLoading,
    error,
    // refetch,
  } = useGenerateReport(queryParams);

  // Watch for query results and loading state
  useEffect(() => {
    setLoading(isLoading);
    console.log("Full reportData:", reportData);

    if (reportData && reportData.data) {
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

  // const onSubmit = async (data: FormData) => {
  //   // Validate dates
  //   if (!data.startDate || !data.endDate) {
  //     toast.error("Please enter both start and end dates");
  //     return;
  //   }

  //   try {
  //     // Format dates to DD/MM/YY format for API
  //     const startDate = new Date(data.startDate);
  //     const endDate = new Date(data.endDate);

  //     const formattedStartDate = format(startDate, "dd/MM/yy");
  //     const formattedEndDate = format(endDate, "dd/MM/yy");

  //     // Update query parameters
  //     setQueryParams({
  //       startDate: formattedStartDate,
  //       endDate: formattedEndDate,
  //       majorSections: selectedMajorSections,
  //       department: selectedDepartments,
  //       blockType: selectedBlockTypes,
  //     });

  //     // Trigger the query - react-query will handle the loading state
  //     // await refetch();
  //   } catch (error) {
  //     console.error("Error initiating report generation:", error);
  //     toast.error("Failed to generate report");
  //   }
  // };

  // Replace your existing onSubmit with this:
const onSubmit = async (data: FormData) => {
  // Validate dates
  if (!data.startDate || !data.endDate) {
    toast.error("Please enter both start and end dates");
    return;
  }

  try {
    // Format dates to DD/MM/YY format for API
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const formattedStartDate = format(startDate, "dd/MM/yy");
    const formattedEndDate = format(endDate, "dd/MM/yy");

    // Update query parameters with ALL filters
    setQueryParams({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      majorSections: selectedMajorSections,
      department: selectedDepartments,
      blockType: selectedBlockTypes,
      globalWorkType: globalWorkTypeFilter,
      globalActivity: globalActivityFilter,
   
      durationOperator: durationFilter.operator,
      durationValue: durationFilter.value,
    });

  } catch (error) {
    console.error("Error initiating report generation:", error);
    toast.error("Failed to generate report");
  }
};
// Add this function after onSubmit
const clearGlobalFilters = () => {
  setGlobalWorkTypeFilter("ALL");
  setGlobalActivityFilter("ALL");
  setDurationFilter({ operator: "ALL", value: "" });
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
      reportData?.data?.detailedData?.map((b: DetailedData) => b.Section) || []
    )
  );
//    const filteredUpcomingBlocks: DetailedData[] = (
//   upcomingSectionFilter === "All"
//     ? reportData?.data?.detailedData || []
//     : reportData?.data?.detailedData?.filter(
//       (b: DetailedData) => b.Section === upcomingSectionFilter
//     ) || []
// ).filter((block: any) => {
//   // Division ID search filter
//   if (upcomingDivisionIdSearch.trim() === "") return true;
  
//   const divisionId = block.DivisionId || "";
//   return divisionId.toLowerCase().includes(upcomingDivisionIdSearch.toLowerCase());
// });

const filteredUpcomingBlocks: DetailedData[] = (
  upcomingSectionFilter === "All"
    ? reportData?.data?.detailedData || []
    : reportData?.data?.detailedData?.filter(
      (b: DetailedData) => b.Section === upcomingSectionFilter
    ) || []
)
.filter((block: any) => {
  // Division ID search filter
  if (upcomingDivisionIdSearch.trim() !== "") {
    const divisionId = block.DivisionId || "";
    if (!divisionId.toLowerCase().includes(upcomingDivisionIdSearch.toLowerCase())) {
      return false;
    }
  }
  
  // SSE filter
  if (sseFilter !== "All") {
    const userName = block.userName || "";
    if (userName !== sseFilter) {
      return false;
    }
  }
  
  return true;
});

const countBlock: DetailedData[] = reportData?.data?.detailedData || [];

const getCount = (criteria: (block: any) => boolean) => {
  return countBlock.filter(criteria).length;
};

// ENGG counts
const enggTotal = getCount(block => block.selectedDepartment === "ENGG"&&block.sntDisconnectionRequired === false && block.powerBlockRequired === false);
const enggWithSnt = getCount(block => 
  block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true
);
const enggWithPower = getCount(block => 
  block.selectedDepartment === "ENGG" && block.powerBlockRequired === true
);
const enggWithSntAndPower = getCount(block => 
  block.selectedDepartment === "ENGG" && 
  block.sntDisconnectionRequired === true && 
  block.powerBlockRequired === true
);

// S&T counts
const sntTotal = getCount(block => block.selectedDepartment === "S&T"&&block.enggDisconnectionsRequired === false && block.powerBlockRequired === false);
const sntWithPower = getCount(block => 
  block.selectedDepartment === "S&T" && block.powerBlockRequired === true
);
const sntWithEngg = getCount(block => 
  block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true
);
const sntWithEnggAndPower = getCount(block => 
  block.selectedDepartment === "S&T" && 
  block.enggDisconnectionsRequired === true && 
  block.powerBlockRequired === true
);

// TRD counts
const trdTotal = getCount(block => block.selectedDepartment === "TRD");

// Total counts for the bottom row
const totalRequested = countBlock.length;
const totalSanctioned = getCount(block => block.isSanctioned === true);
const totalAvailed = getCount(block => block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null);
// ===== END COUNTING LOGIC =====

const filteredBlocks = filteredUpcomingBlocks.filter((block) => {
   if (activeFilter === "approved" && !block.isSanctioned) return false;
  if (activeFilter === "granted" && !block.isGranted) return false;
  if (activeFilter === "applied" && !block.isApplied) return false;

  if( activeFilter === "availed" && block.AvailedTimeFrom===null) return false;
if (activeFilter === "demanded" && block.DemandedTimeFrom === null) return false;
  if (activeFilter === "notGranted" && block.isGranted !== false) return false;
  if (activeFilter === "notAvailed" && !(
    (!block.AvailedTimeFrom&&block.isSanctioned) ||
    (!block.AvailedTimeTo&&block.isSanctioned) ||
    (block.isApplied === null&&block.isGranted===true) ||
    (block.isApplied === false) ||
    (block.userResponse !== "ACCEPTED" && block.useAcceptanceForSanction === false && block.isSanctioned === true)
  )) return false;
  // Filter by selected section
  if (activeSection && block.Section !== activeSection) return false;
  return true;
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
          "Request ID": block.DivisionId || "N/A",
          "Station ID": block.stationId || "N/A",
          "Block Section": block.MissionBlock || "N/A",
          Type: block.Type || "N/A",
          Duration: block.Duration,
          Activity: block.Activity || "N/A",
          Depo:block.selectedDepo||"N/A",
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
  // Get unique SSE names from your data
const sseOptions = [...new Set(
  reportData?.data?.detailedData
    ?.map((item: any) => item.userName)
    .filter(Boolean) // Remove null/undefined
)].sort();
const handleDownloadDepartmentCount = () => {
  try {
    if (countBlock.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Prepare the Excel data matching your table structure
    const excelData = [
      // ENGG Rows
      {
        "Location": "MAS",
        "Department": "ENGG",
        "Supporting Department": "-",
        "Total Block Requested": enggTotal,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "ENGG" && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "ENGG" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": "MAS",
        "Department": "ENGG",
        "Supporting Department": "S&T",
        "Total Block Requested": enggWithSnt,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": "MAS",
        "Department": "ENGG",
        "Supporting Department": "TRD",
        "Total Block Requested": enggWithPower,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": "MAS",
        "Department": "ENGG",
        "Supporting Department": "S&T and TRD",
        "Total Block Requested": enggWithSntAndPower,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      
      // TRD Rows
      {
        "Location": "MAS",
        "Department": "TRD",
        "Supporting Department": "-",
        "Total Block Requested": trdTotal,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "TRD" && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "TRD" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      
      // S&T Rows
      {
        "Location": "MAS",
        "Department": "S&T",
        "Supporting Department": "-",
        "Total Block Requested": sntTotal,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "S&T" && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "S&T" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": "MAS",
        "Department": "S&T",
        "Supporting Department": "ENGG",
        "Total Block Requested": sntWithEngg,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": "MAS",
        "Department": "S&T",
        "Supporting Department": "TRD",
        "Total Block Requested": sntWithPower,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": "MAS",
        "Department": "S&T",
        "Supporting Department": "ENGG and TRD",
        "Total Block Requested": sntWithEnggAndPower,
        "Total Block Sanctioned": getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      
      // Total Row
      {
        "Location": "TOTAL",
        "Department": "",
        "Supporting Department": "",
        "Total Block Requested": totalRequested,
        "Total Block Sanctioned": totalSanctioned,
        "Total Block Availed": totalAvailed
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add title before the data
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [`Department Wise Request Count`],
        [], // Empty row for spacing
      ],
      { origin: "A1" }
    );

    // Adjust column widths for better readability
    const colWidths = [
      { wch: 12 }, // Location
      { wch: 15 }, // Department
      { wch: 25 }, // Supporting Department
      { wch: 20 }, // Total Block Requested
      { wch: 20 }, // Total Block Sanctioned
      { wch: 20 }, // Total Block Availed
    ];
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Department Count");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `department_wise_request_count_${format(
      new Date(),
      "dd-MM-yyyy"
    )}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Department wise request count downloaded successfully");
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download Excel file. Please try again.");
  }
};
  return (
    <div className="min-h-screen w-full bg-[#fffbe9] flex flex-col items-center">
      {/* RBMS Header */}
      <div className="w-full bg-[#fff35c] flex flex-col items-center py-2 rounded-t-2xl">
        <span className="text-[18px] md:text-[24px] font-extrabold text-[#b07be0] tracking-wide">
          RBMS-{session?.user?.location}-DIVN
        </span>
      </div>
      
      {/* Block Summary Report Title */}
      <div className="w-full bg-[#b7e3ee] flex flex-col items-center pt-2 pb-1">
        <span className="text-[18px] md:text-[24px] font-extrabold text-black text-center px-2">
          Block Summary Report
        </span>
        <span className="text-[16px] md:text-[24px] font-bold text-black">DRM/ADRM/SrDOM</span>
        <div className="mt-2 bg-[#7be09b] px-4 md:px-6 py-1 rounded-2xl">
          <span className="text-[16px] md:text-[24px] font-bold text-white">
            Blocks Granted/Availed/Pending
          </span>
        </div>
      </div>

      {/* === FILTERS SECTION === */}
      <div className="w-full max-w-screen-lg bg-[#fffbe9] px-2 py-2">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-end w-full">
          <div className="flex flex-col w-full sm:min-w-[90px] sm:max-w-[110px]">
            <span className="text-[16px] md:text-[24px] font-bold text-black mb-1 whitespace-nowrap">
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
                  fontSize: 16,
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
                  fontSize: 16,
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
          <div className="flex flex-col w-full">
            <div className="flex justify-center w-full mb-1">
              <span className="text-[16px] md:text-[24px] font-bold text-black">
                Select Period
              </span>
            </div>
            <div className="flex flex-row items-center gap-1 w-full justify-center sm:justify-start">
              <input
                type="date"
                className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[100px] md:max-w-[120px] text-[14px] md:text-[24px] font-bold text-center"
                style={{ color: "black" }}
                {...register("startDate")}
              />
              <span className="text-[14px] md:text-base font-bold" style={{ color: "black" }}>
                to
              </span>
              <input
                type="date"
                className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[100px] md:max-w-[120px] text-[14px] md:text-[24px] font-bold text-center"
                style={{ color: "black" }}
                {...register("endDate")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Block Type Filters */}
      <div className="w-full max-w-screen-lg flex flex-wrap justify-center gap-2 mt-2 mb-1 px-2">
        {blockTypeOptions.map((opt) => (
          <button
            key={opt.value}
            className={`rounded-full px-2 py-1 text-[12px] md:text-[24px] font-semibold border border-[#b7e3ee] flex items-center gap-1 transition-colors duration-150 ${
              selectedBlockTypes.includes(opt.value)
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
      <div className="w-full max-w-screen-lg flex flex-wrap justify-center gap-2 mb-2 px-2">
        {departmentOptions.map((opt) => (
          <button
            key={opt.value}
            className={`rounded-full px-2 py-1 text-[12px] md:text-[24px] font-semibold border flex items-center gap-1 transition-colors duration-150
              ${
                opt.value === "Engineering"
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
{/* === GLOBAL FILTERS SECTION === */}
<div className="w-full max-w-screen-lg flex flex-wrap justify-center gap-2 mb-4 px-2">
  {/* Work Type Filter */}
  <div className="relative" ref={globalWorkTypeDropdownRef}>
    <button
      onClick={() => setShowGlobalWorkTypeDropdown(!showGlobalWorkTypeDropdown)}
      className="px-3 py-1 bg-white border border-black rounded flex items-center gap-2 text-black text-[12px] md:text-[14px]"
      disabled={selectedDepartments.length === 0}
    >
      Work Type: {globalWorkTypeFilter}
      <span>▼</span>
    </button>
    {showGlobalWorkTypeDropdown && selectedDepartments.length > 0 && (
      <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[150px]">
        {getWorkTypesForDepartments(selectedDepartments).map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setGlobalWorkTypeFilter(type.value);
              setGlobalActivityFilter('ALL');
              setShowGlobalWorkTypeDropdown(false);
            }}
            className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${globalWorkTypeFilter === type.value ? 'bg-blue-100' : ''}`}
          >
            {type.label}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Activity Filter */}
  <div className="relative" ref={globalActivityDropdownRef}>
    <button
      onClick={() => globalWorkTypeFilter !== 'ALL' && setShowGlobalActivityDropdown(!showGlobalActivityDropdown)}
      className={`px-3 py-1 bg-white border border-black rounded flex items-center gap-2 text-black text-[12px] md:text-[14px] ${
        globalWorkTypeFilter === 'ALL' || selectedDepartments.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      disabled={globalWorkTypeFilter === 'ALL' || selectedDepartments.length === 0}
    >
      Activity: {globalActivityFilter}
      <span>▼</span>
    </button>
    {showGlobalActivityDropdown && globalWorkTypeFilter !== 'ALL' && selectedDepartments.length > 0 && (
      <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
        {getActivitiesForWorkType(globalWorkTypeFilter).map((activity) => (
          <button
            key={activity}
            onClick={() => {
              setGlobalActivityFilter(activity);
              setShowGlobalActivityDropdown(false);
            }}
            className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${globalActivityFilter === activity ? 'bg-blue-100' : ''}`}
          >
            {activity}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Time Slot Filter */}
{/* Duration Filter */}
<div className="relative" ref={durationDropdownRef}>
  <button
    onClick={() => setShowDurationDropdown(!showDurationDropdown)}
    className="px-3 py-1 bg-white border border-black rounded flex items-center gap-2 text-black text-[12px] md:text-[14px]"
  >
    Duration: {durationFilter.operator === "ALL" 
      ? "ALL" 
      : `${getOperatorSymbol(durationFilter.operator)} ${durationFilter.value}h`
    }
    <span>▼</span>
  </button>
  
  {showDurationDropdown && (
    <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[200px] p-3">
      {/* Operator Selection */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-black mb-1">Operator:</label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { value: "ALL", label: "ALL", symbol: "ALL" },
            { value: ">", label: ">", symbol: "Greater than" },
            { value: ">=", label: "≥", symbol: "Greater than or equal" },
            { value: "=", label: "=", symbol: "Equal to" },
            { value: "<=", label: "≤", symbol: "Less than or equal" },
            { value: "<", label: "<", symbol: "Less than" }
          ].map((op) => (
            <button
              key={op.value}
              onClick={() => setDurationFilter(prev => ({ ...prev, operator: op.value }))}
              className={`p-2 border rounded text-sm ${
                durationFilter.operator === op.value 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-gray-100 text-black border-gray-300'
              }`}
              title={op.symbol}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Input */}
      {durationFilter.operator !== "ALL" && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-black mb-1">
            Duration (hours):
          </label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={durationFilter.value}
            onChange={(e) => setDurationFilter(prev => ({ 
              ...prev, 
              value: e.target.value 
            }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-black"
            placeholder="Enter hours"
          />
          <div className="flex gap-1 mt-1">
            {[1, 2, 4, 6, 8].map((hours) => (
              <button
                key={hours}
                onClick={() => setDurationFilter(prev => ({ 
                  ...prev, 
                  value: hours.toString() 
                }))}
                className="flex-1 px-2 py-1 bg-gray-200 text-black rounded text-xs hover:bg-gray-300"
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setShowDurationDropdown(false);
          }}
          className="flex-1 bg-green-500 text-white py-1 rounded text-sm hover:bg-green-600"
        >
          Apply
        </button>
        <button
          onClick={() => {
            setDurationFilter({ operator: "ALL", value: "" });
            setShowDurationDropdown(false);
          }}
          className="flex-1 bg-red-500 text-white py-1 rounded text-sm hover:bg-red-600"
        >
          Clear
        </button>
      </div>
    </div>
  )}
</div>

  {/* Clear Filters Button */}
  <button
    onClick={clearGlobalFilters}
    className="px-3 py-1 bg-red-500 text-white border border-black rounded text-[12px] md:text-[14px]"
  >
    Clear Filters
  </button>
</div>

      {/* Submit Button */}
      <div className="w-full max-w-screen-lg flex justify-center mb-4">
        <button
          className="bg-[#7be09b] hover:bg-[#5bc07b] text-white font-bold px-6 md:px-8 py-2 rounded-[50%] shadow border border-[#00b347] text-[16px] md:text-[24px]"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>


      {/* === PAGE 1: (A) BLOCK SUMMARY TABLE - FULL WIDTH === */}
      <div className="w-full bg-white flex flex-col py-4">
        <div className="w-full px-2 md:px-4">
          <div className="my-2">
            <button
              onClick={handleDownloadSummary}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base flex items-center mx-auto"
              disabled={pastBlockSummary.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5 mr-1"
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
          
          <div className="flex flex-col md:flex-row w-full">
            <div className="bg-[#ff914d] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center">
              (A) Block Summary:{" "}
              {formatDisplayDate(watch("startDate")) || "........"} to{" "}
              {formatDisplayDate(watch("endDate")) || "........"}
            </div>
            <div className="bg-[#ff914d] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center md:mt-0 mt-1">
              Department:{" "}
              {selectedDepartments.length > 0
                ? selectedDepartments.join(", ")
                : "............."}{" "}
              (in Hrs)
            </div>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full border-2 border-black min-w-[800px]">
              <thead>
                <tr className="bg-[#f7c7ac] text-black text-[14px] md:text-[24px] font-bold">
                  <th className="border-2 border-black px-1 md:px-2 py-2">Section</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Demanded (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Approved (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Applied (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Granted (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">% Granted</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Availed (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">% Availed</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Not Granted</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Not Availed</th>

                </tr>
              </thead>
              <tbody>
                {pastBlockSummary.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-black">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  pastBlockSummary.map((summary: any, idx: number) => (
                    <tr
                      className={`font-bold ${idx % 2 === 0 ? "bg-[#f4dcf1]" : "bg-white"}`}
                      key={idx}
                    >
                      <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                        {summary.Department || summary.Section || ""}
                      </td>
                      <td
                        className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                         onClick={() => {
    setActiveFilter("demanded");
    setActiveSection(summary.Department || summary.Section);
  }}
                      >
                        {summary.Demanded.toFixed(2)} / {summary.DemandsCount}
                      </td>
                      <td
                        className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                        onClick={() => {
                          setActiveFilter("approved");
                          setActiveSection(summary.Department || summary.Section);
                        }}
                      >
                        {summary.Approved.toFixed(2)} / {summary.ApprovedCount}
                      </td>
                      <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                         onClick={() => {
                          setActiveFilter("applied");
                          setActiveSection(summary.Department || summary.Section);
                        }}
                      >
                        {summary.Applied.toFixed(2)} /{summary.AppliedCount}
                      </td>
                      <td
                        className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                        onClick={() => {
                          setActiveFilter("granted");
                          setActiveSection(summary.Department || summary.Section);
                        }}
                      >
                        {summary.Granted.toFixed(2)} /{summary.GrantedCount}
                      </td>
                    
                      <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                        {summary.PercentGranted !== undefined
                          ? summary.PercentGranted.toFixed(2) + "%"
                          : ""}
                      </td>
                      <td
                        className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                        onClick={() => {
                          setActiveFilter("availed");
                          setActiveSection(summary.Department || summary.Section);
                        }}
                      >
                        {summary.Availed.toFixed(2)} / {summary.AvailedCount}
                      </td>
                      <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                        {summary.PercentAvailed !== undefined
                          ? summary.PercentAvailed.toFixed(2) + "%"
                          : ""}
                      </td>
<td
  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
  onClick={() => {
    // You can define what happens when Not Granted is clicked
    // For example, filter the upcoming blocks to show only not granted requests
    setActiveFilter("notGranted");
    setActiveSection(summary.Department || summary.Section);
    toast.success(`Viewing Not Granted for: ${summary.Department || summary.Section}`);
  }}
>
  {summary.NotGrantedCount}
</td>
<td
  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
  onClick={() => {
    // You can define what happens when Not Availed is clicked
    setActiveFilter("notAvailed");
    setActiveSection(summary.Department || summary.Section);
    toast.success(`Viewing Not Availed for: ${summary.Department || summary.Section}`);
  }}
>
  {summary.NotAvailedCount}
</td>
                    
                    </tr>
                  ))
                )}

                {pastBlockSummary.length > 0 && (
                  <tr className="bg-[#ff914d] text-white font-bold">
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-[12px] md:text-[16px]">Totals</td>
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                      {pastBlockSummary
                        .reduce((sum, item) => sum + (item.Demanded || 0), 0)
                        .toFixed(2)}{" "}
                      /{" "}
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.DemandsCount || 0),
                        0
                      )}
                    </td>
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                      {pastBlockSummary
                        .reduce((sum, item) => sum + (item.Approved || 0), 0)
                        .toFixed(2)}{" "}
                      /{" "}
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.ApprovedCount || 0),
                        0
                      )}
                    </td>
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.Applied || 0),
                        0
                      ).toFixed(2)} /{" "}
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.AppliedCount || 0),
                        0
                      )}
                    </td>
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.Granted || 0),
                        0
                      ).toFixed(2)} /{" "}
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.GrantedCount || 0),
                        0
                      )}
                    </td>
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.PercentGranted || 0),
                        0
                      ).toFixed(2)}
                    </td>
                    
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
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
                    <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.PercentAvailed || 0),
                        0
                      ).toFixed(2)}
                    </td>
                  <td
  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
  onClick={() => {
    setActiveFilter("notGranted");
    setActiveSection(null); // Show all sections for total
    toast.success("Viewing all Not Granted requests");
  }}
>
  {pastBlockSummary.reduce(
    (sum, item) => sum + (item.NotGrantedCount || 0),
    0
  )}
</td>
<td
  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
  onClick={() => {
    setActiveFilter("notAvailed");
    setActiveSection(null); // Show all sections for total
    toast.success("Viewing all Not Availed requests");
  }}
>
  {pastBlockSummary.reduce(
    (sum, item) => sum + (item.NotAvailedCount || 0),
    0
  )}
</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>



  <div className="flex flex-col md:flex-row w-full mt-8 gap-4 mb-2 ">
  <button
    onClick={handleDownloadDepartmentCount}
    className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base flex items-center"
    disabled={countBlock.length === 0}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 md:h-5 md:w-5 mr-1"
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
    Download Count (XLSX)
  </button>

  <div className="bg-[#ff914d] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center">
    Department Wise Request Count
  </div>
</div>

<div className="w-full overflow-x-auto ">
  <table className="w-full border-2 border-black min-w-[800px]">
    <thead>
      <tr className="bg-[#f7c7ac] text-black text-[14px] md:text-[24px] font-bold">
        <th className="border-2 border-black px-1 md:px-2 py-2">Location</th>
        <th className="border-2 border-black px-1 md:px-2 py-2">Department</th>
        <th className="border-2 border-black px-1 md:px-2 py-2">Supporting Department</th>
        <th className="border-2 border-black px-1 md:px-2 py-2">Total Block Requested</th>
        <th className="border-2 border-black px-1 md:px-2 py-2">Total Block Sanctioned</th>
        <th className="border-2 border-black px-1 md:px-2 py-2">Total Block Availed</th>
      </tr>
    </thead>
    <tbody>
      {/* ENGG Rows */}
      <tr className="bg-white font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">-</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {enggTotal}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.isSanctioned&&block.powerBlockRequired===false&&block.sntDisconnectionRequired===false)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null&&block.powerBlockRequired===false&&block.sntDisconnectionRequired===false)}
        </td>
      </tr>
      <tr className="bg-[#f4dcf1] font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {enggWithSnt}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.isSanctioned&&block.powerBlockRequired===false&&block.enggDisconnectionsRequired===false)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null&&block.powerBlockRequired===false&&block.enggDisconnectionsRequired===false)}
        </td>
      </tr>
      <tr className="bg-white font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">TRD</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {enggWithPower}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.isSanctioned)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)}
        </td>
      </tr>
      <tr className="bg-[#f4dcf1] font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T and TRD</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {enggWithSntAndPower}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.isSanctioned)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)}
        </td>
      </tr>

      {/* TRD Rows */}
      <tr className="bg-white font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">TRD</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">-</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {trdTotal}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "TRD" && block.isSanctioned)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "TRD" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)}
        </td>
      </tr>

      {/* S&T Rows */}
      <tr className="bg-[#f4dcf1] font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">-</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {sntTotal}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.isSanctioned)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)}
        </td>
      </tr>
      <tr className="bg-white font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {sntWithEngg}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.isSanctioned)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)}
        </td>
      </tr>
      <tr className="bg-[#f4dcf1] font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">TRD</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {sntWithPower}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.isSanctioned)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)}
        </td>
      </tr>
      <tr className="bg-white font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">MAS</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG and TRD</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {sntWithEnggAndPower}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.isSanctioned)}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]">
          {getCount(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)}
        </td>
      </tr>

      {/* Total Row */}
      <tr className="bg-[#ff914d] text-white font-bold">
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-[12px] md:text-[16px]" colSpan={3}>Total</td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
          {totalRequested}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
          {totalSanctioned}
        </td>
        <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
          {totalAvailed}
        </td>
      </tr>
    </tbody>
  </table>
</div>


        </div>
      </div>

      {/* === PAGE 2: (B) SUMMARY OF UPCOMING BLOCKS - FULL WIDTH === */}
      <div className="w-full bg-white flex flex-col py-4">
        <div className="w-full px-2 md:px-4 flex-1">
          <div className="my-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <button
              onClick={handleDownloadUpcomingBlocks}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base flex items-center"
              disabled={filteredUpcomingBlocks.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5 mr-1"
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
              Download Upcoming Blocks (XLSX)
            </button>

            <div className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base">
              <label className="whitespace-nowrap mr-2 text-[12px] md:text-base">Search ID:</label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 md:h-4 md:w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
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
                  className="w-24 md:w-40 pl-6 md:pl-8 pr-6 py-1 border border-gray-300 text-black bg-white rounded focus:outline-none focus:ring-1 focus:ring-white text-[12px] md:text-base"
                />
                {upcomingDivisionIdSearch && (
                  <button
                    onClick={() => setUpcomingDivisionIdSearch('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-[10px] md:text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full items-center gap-2">
            <div className="bg-[#f1a983] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center w-full md:w-auto">
              (B) Summary of Blocks
            </div>
            <div className="flex items-center gap-2">
              <div className="relative inline-block" ref={sectionDropdownRefB}>
                <button
                  onClick={() => setSectionDropdownOpenB((v) => !v)}
                  className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-[12px] md:text-base min-w-[80px] md:min-w-[100px]"
                >
                  {upcomingSectionFilter === "All" ? "All" : upcomingSectionFilter}
                  <span className="ml-1">▼</span>
                </button>
                {sectionDropdownOpenB && (
                  <div className="absolute z-10 mt-2 w-32 md:w-40 bg-white border-2 border-black rounded shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[12px] md:text-base"
                      onClick={() => {
                        setUpcomingSectionFilter("All");
                        setSectionDropdownOpenB(false);
                        setActiveFilter("all")
                        setActiveSection(null);
                      }}
                    >
                      All
                    </div>
                    {sectionOptionsB.map((section: string) => (
                      <div
                        key={section}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[14px] md:text-[24px]"
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
              <div className="relative inline-block" ref={sseDropdownRef}>
      <button
        onClick={() => setSseDropdownOpen((v) => !v)}
        className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-[12px] md:text-base min-w-[80px] md:min-w-[100px]"
      >
        {sseFilter === "All" ? "All SSE" : sseFilter}
        <span className="ml-1">▼</span>
      </button>
      {sseDropdownOpen && (
        <div className="absolute z-10 mt-2 w-32 md:w-40 bg-white border-2 border-black rounded shadow-lg max-h-60 overflow-y-auto">
          <div
            className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[12px] md:text-base"
            onClick={() => {
              setSseFilter("All");
              setSseDropdownOpen(false);
            }}
          >
            All SSE
          </div>
          {sseOptions.map((sse: string) => (
            <div
              key={sse}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[14px] md:text-[24px]"
              onClick={() => {
                setSseFilter(sse);
                setSseDropdownOpen(false);
              }}
            >
              {sse}
            </div>
          ))}
        </div>
      )}
 
</div>
          </div>

          <div className="w-full mt-4 overflow-x-auto">
            <table className="w-full border-2 border-black min-w-[900px] text-[12px] md:text-[20px]">
              <thead>
                <tr className="bg-[#e49edd] text-black text-[12px] md:text-[20px] font-bold">
                  <th className="border-2 border-black px-1 md:px-2 py-2">S.No</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Date</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Department</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">RequestId</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Block Section</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Depo</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Type</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Activity</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Availed time</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Station ID</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcomingBlocks.length === 0 ? (
                  <tr className="bg-white">
                    <td colSpan={9} className="text-center py-4 text-black">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.slice(0, 200).map((block: any, idx: number) => {
                    let statusLabel = "";
                    let statusStyle = { background: "#fff", color: "#222" };
                    if (block.Status === "APPROVED" && block.isSanctioned&&block.userResponse===null) {
                      statusLabel = "Sanctioned Pending with SSE";
                      statusStyle = { background: "#fff86b", color: "#222" };
                    }  else if (block.userResponse === "ACCEPTED"|| block.overAllStatus === "Sanctioned and Accepted") {
                      statusLabel = "Sanctioned and Accepted by SSE";
                      statusStyle = { background: "#d47ed4", color: "#222" };
                    } else if ( block.isSanctioned === true&&block.userAcceptanceForSanction===false&&block.userResponse!=="ACCEPTED" ) {
                      statusLabel = "Sanctioned and Rejected by SSE";
                      statusStyle = { background: "#ff4e36", color: "#fff" };
                    } else {
                      statusLabel = block.overAllStatus || block.Status;
                    }

                    const rowBgColor = idx % 2 === 0 ? "bg-white" : "bg-[#f5d0f2]";

                    return (
                      <tr key={idx} className={`${rowBgColor} hover:bg-[#F3F3F3]`}>
                         <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px] text-center">
                {idx + 1}
              </td>
                        <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
                          {dayjs(block.Date).format("DD-MM-YY")}
                        </td>
                         <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
                          {block.selectedDepartment}
                        </td>
                        <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
                          <Link
                            href={`/admin/view-request/${block.id}?from=sanction-table-data`}
                            className="block w-full h-full"
                          >
                            {block.DivisionId}
                          </Link>
                        </td>
                        
                        <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
                          {block.MissionBlock}
                        </td>
                        <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
                          {block.selectedDepo}
                        </td>
                        <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
                          {block.Type}
                        </td>
                        <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
                          {block.Activity}
                        </td>
                        <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
                          {block.AvailedTimeFrom && block.AvailedTimeTo ? (
                            <>
                              {formatTime(block.AvailedTimeFrom)} to{" "}
                              {formatTime(block.AvailedTimeTo)}
                            </>
                          ) : (
                            "Not Availed Yet"
                          )}
                        </td>  
                        <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
                          {block.stationId || "N/A"}
                        </td>
                        <td
                          className="border-2 border-black px-1 md:px-2 py-2 font-bold text-center text-black text-[10px] md:text-[14px]"
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

        {/* === CENTERED INFO BAR AND NAVIGATION === */}
        <div className="w-full px-2 md:px-4 flex flex-col items-center justify-center mt-4 md:mt-8 mb-4 space-y-3 md:space-y-4">
          {/* Centered Info Bar */}
          <div className="flex items-center gap-2 bg-[#cfd4ff] px-3 md:px-4 py-2 rounded-2xl border-2 max-w-full">
            <span className="text-[14px] md:text-[24px] font-bold text-black text-center">
              Click <span className="bg-[#00b347] text-white font-bold px-1 md:px-2 py-1 rounded text-[14px] md:text-[24px] mx-1">RequestId</span> to see further details.
            </span>
          </div>
          
          {/* Centered Back Button */}
          <div className="flex justify-center">
            <button
              className="flex items-center gap-2 bg-[#cfd4ff] border-2 border-black rounded-[50%] px-6 md:px-8 py-2 text-[16px] md:text-[24px] font-bold text-black"
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