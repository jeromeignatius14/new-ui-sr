// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useForm, Controller } from "react-hook-form";
// import Select, { MultiValue } from "react-select";
// import { toast } from "react-hot-toast";
// import { format } from "date-fns";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useGenerateReport } from "@/app/service/query/hq";
// import { MajorSection,depot } from "@/app/lib/store";
// import { useSession } from "next-auth/react";
// import { managerService, UserRequest } from "@/app/service/api/manager";
// import { useQuery } from "@tanstack/react-query";
// import dayjs from "dayjs";
// import formatTime from "@/app/utils/formatTime";
// import * as XLSX from "xlsx";

// interface OptionType {
//   value: string;
//   label: string;
// }

// interface FormData {
//   startDate: string;
//   endDate: string;
//   department: OptionType[];
//   blockType: OptionType[];
//   majorSection: OptionType[];
// }

// // Interfaces aligned with the API service
// interface PastBlockSummary {
//   NotAvailedCount?: number;
//   NotGrantedCount?: number;
//   Applied?: number;
//   AppliedCount?: number;
//   GrantedCount?: number;
//   SectionId?: string;
//   Section: string;
//   Demanded: number;
//   Approved: number;
//   Granted: number;
//   Availed: number;
//   Percentage?: number;
//   PercentGranted?: number;
//   PercentAvailed?: number;
//   Department?: String;
//   corridorType?: String;
//   MissionBlock?: String;
//   DemandsCount?: number;
//   ApprovedCount?: number;
//   AvailedCount?: number;
// }

// interface DetailedData {
//   sntDisconnectionRequired?: boolean;
//   powerBlockRequired?: boolean;
//   enggDisconnectionsRequired?: boolean;
//   selectedDepartment?: string;
//   userResponse?: string;
//   useAcceptanceForSanction?: boolean;
//   AvailedTimeTo?: any;
//   DemandedTimeFrom?: any;
//   isApplied?: boolean;
//   AvailedTimeFrom?: any;
//   isGranted?: boolean;
//   isSanctioned?: boolean;
//   Date: string;
//   Section: string;
//   Duration: number;
//   Type: string;
//   Status: string;
// }

// const locationOptions: OptionType[] = [
//   { value: "{userLocations}", label: "{userLocations}" },
//   { value: "SA", label: "SA" },
//   { value: "MCU", label: "MCU" },
//   { value: "TPJ", label: "TPJ" },
//   { value: "PGT", label: "PGT" },
//   { value: "TVC", label: "TVC" },
// ];

// const blockTypeOptions: OptionType[] = [
//   { value: "All", label: "All" },
//   { value: "Corridor", label: "Corridor" },
//   { value: "Non-corridor", label: "Outside corridor" },
//   { value: "Emergency", label: "Emergency" },
//   { value: "Mega", label: "Mega Block" },
// ];

// // Add after your departmentOptions
// const globalFilterOptions = {
//     workType: {
//     'ENGG': [
//       { value: "ALL", label: "ALL" },
//       { value: "Machine", label: "Machine" },
//       { value: "Non-Machine", label: "Non-Machine" },
//     ],
//     'S&T': [
//       { value: "ALL", label: "ALL" },
//       { value: "Gear", label: "Gear" },
    
//     ],
//     'TRD': [
//       { value: "ALL", label: "ALL" },
//      { value: "Tw", label: "Tw" },
//       { value: "Lt", label: "Lt" },
//     ]
//   },
//   activity: {
//     'Gear': ['Point', 'EI', 'Signal', 'DC Track', 'AFTC', 'SSDAC', 'MSDAC', 'Panel', 'LC Gate Mechanical', 'LC Gate ELB', 'Emergency Sliding Boom', 'IPS', 'Conventional power supply equipment', 'System Integrity Test of each PI/EI/RRI stations', 'Cable Insulation testing (cable meggering) for one station.', 'DLBI- SGE', 'TLBI-FM Inst', 'UFSBI', 'Fuse', 'EKT'],
//     'Tw': ['AOH', 'POH', 'IOH', 'RE POH', 'RD WORK', 'TURN OUT CHECKING', 'CROSS OVER CHECKING', 'CROSS TRACK FEEDERS CHECKING', 'GANTRY MAINTENANCE', 'CONTACT WIRE RENEWAL WORK', 'CATENARY WIRE RENEWAL WORK', 'CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)', 'MAST ERECTION(2x25KV WORK)', 'FEEDERS ERECTION(2x25KV WORK)', 'OHE PROFILING', 'OHE/CN WORK', 'OTHER SPECIAL WORKS'],
//     'Lt': ['AOH', 'POH', 'IOH', 'RE POH', 'RD WORK', 'TURN OUT CHECKING', 'CROSS OVER CHECKING', 'CROSS TRACK FEEDERS CHECKING', 'GANTRY MAINTENANCE', 'CONTACT WIRE RENEWAL WORK', 'CATENARY WIRE RENEWAL WORK', 'CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)', 'MAST ERECTION(2x25KV WORK)', 'FEEDERS ERECTION(2x25KV WORK)', 'OHE PROFILING', 'OHE/CN WORK', 'OTHER SPECIAL WORKS'],
//     'Machine': ['BCM', 'DTE', 'CSM', 'DUOMAT', 'UNIMAT', 'MPT', 'BRM', 'TRT', 'UTV', 'DTS', 'T28', 'SQRS', 'RGM working', 'SBCM'],
//     'Non-Machine': ['Rail renewal', 'Welding work', 'Destressing work', 'Switch renewal', 'CMS Crossing renewal', 'SEJ Renewal', 'Glued Joint renewal', 'Dummy Glued Joint removal', 'TRR P 60 Kg', 'TRR S 60 Kg', 'TRR S 60 kg', 'TRR S 52 kg', 'Interchanging', 'Trucking out/Shifting materials', 'TWR with MFBW', 'TBTR (Br sleeper renewal)', 'TSR P 60 Kg', 'TSR S 60 Kg', 'TSR S 52 Kg', 'TTSR work', 'Jt Insp Notes Attn', 'Stretcherbar renewal', 'TFR Work', 'Ballast Unloading', 'Rail unloading', 'Lifting and packing', 'Gauge tie plate renewal', 'Sleeper renewal', 'Fish Plates O&E', 'Preliminary/Post works', 'Trucking out materials', 'Cutting Widening work', 'JCB working', 'Earth work/Muck removal', 'Crane Moving/Working', 'Attention to Track', 'Attention to Fittings', 'Attention to Bridge', 'Attention to Guard rail', 'Attention to Points & Xing', 'Attention to LC', 'Attention to Curve check rail', 'Sheet Piling work', 'Platform work', 'Platform Shelter work', 'ABSS work', 'Erection of Platform shelter purlins work', 'Erection of FOB Girders', 'Other FOB works', 'Other Track works', 'Other Bridge work'],
//   },
// };

// // Helper function to get work types based on selected departments
// const getWorkTypesForDepartments = (departments: string[]): OptionType[] => {
//   if (departments.length === 0) return [{ value: "ALL", label: "ALL" }];
  
//   // If multiple departments selected, combine and deduplicate work types
//   const allWorkTypes = new Map();
  
//   departments.forEach(dept => {
//     const deptWorkTypes = globalFilterOptions.workType[dept as keyof typeof globalFilterOptions.workType] || [];
//     deptWorkTypes.forEach(workType => {
//       if (!allWorkTypes.has(workType.value)) {
//         allWorkTypes.set(workType.value, workType);
//       }
//     });
//   });
  
//   return Array.from(allWorkTypes.values());
// };

// // Helper function to get activities based on work type
// const getActivitiesForWorkType = (workTypeSelected: string): string[] => {
//   if (workTypeSelected === 'ALL') return ['ALL'];
//   return ['ALL', ...(globalFilterOptions.activity[workTypeSelected as keyof typeof globalFilterOptions.activity] || [])];
// };
// // Helper function to get operator symbol for display
// const getOperatorSymbol = (operator: string): string => {
//   const operatorMap: { [key: string]: string } = {
//     ">": ">",
//     ">=": "≥", 
//     "=": "=",
//     "<=": "≤",
//     "<": "<",
//     "ALL": "ALL"
//   };
//   return operatorMap[operator] || operator;
// };

// export default function GenerateReportPage() {
//   const [durationFilter, setDurationFilter] = useState({
//   operator: "ALL", // "ALL", ">", ">=", "=", "<", "<="
//   value: ""
//   });
//   const [pastBlockSummary, setPastBlockSummary] = useState<PastBlockSummary[]>(
//     []
//   );
//   const [activeFilter, setActiveFilter] = useState<"approved" | "granted" | "availed" |"applied" |"demanded"|"notGranted" | "notAvailed" |"all">("all");
//   const [activeSection, setActiveSection] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [reportGenerated, setReportGenerated] = useState(false);
//   const [selectedLocations, setSelectedLocations] = useState<string[]>(["All"]);
//   const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>([
//     "All",
//   ]);
//   const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
//   const [selectedMajorSections, setSelectedMajorSections] = useState<string[]>(
//     []
//   );
//   const [majorSectionOptions, setMajorSectionOptions] = useState<OptionType[]>(
//     []
//   );
//     const [upcomingDivisionIdSearch, setUpcomingDivisionIdSearch] = useState<string>("");
// const [sseFilter, setSseFilter] = useState("All");
// const [sseDropdownOpen, setSseDropdownOpen] = useState(false);
// // Add after your existing state variables
// const [globalWorkTypeFilter, setGlobalWorkTypeFilter] = useState<string>("ALL");
// const [globalActivityFilter, setGlobalActivityFilter] = useState<string>("ALL");

// // Dropdown visibility states
// const [showGlobalWorkTypeDropdown, setShowGlobalWorkTypeDropdown] = useState(false);
// const [showGlobalActivityDropdown, setShowGlobalActivityDropdown] = useState(false);
// const [showDurationDropdown, setShowDurationDropdown] = useState(false);
// const [departmentCountFilter, setDepartmentCountFilter] = useState<{
//   department: string;
//   supportingDepartment: string;
//   filterType: 'requested' | 'sanctioned' | 'availed';
// } | null>(null);
// const durationDropdownRef = useRef<HTMLDivElement>(null);

// // Refs for dropdowns
// const globalWorkTypeDropdownRef = useRef<HTMLDivElement>(null);
// const globalActivityDropdownRef = useRef<HTMLDivElement>(null);
// const sseDropdownRef = useRef<HTMLDivElement>(null);
  
//   const router = useRouter();
//   const {
//     register,
//     handleSubmit,
//     control,
//     watch,
//     formState: { errors },
//   } = useForm<FormData>();
//   const { data: session } = useSession();

//   // Parameters for the query
//   const [queryParams, setQueryParams] = useState({
//     startDate: "",
//     endDate: "",
//     majorSections: [] as string[],
//     department: [] as string[],
//     blockType: ["All"],
//     globalWorkType: "ALL",
//     globalActivity: "ALL", 
//     durationOperator: "ALL",
//   durationValue: "",
//   });

//   // Get user's location and department from session and set up major section options
//   // useEffect(() => {
//   //   if (session?.user?.location) {
//   //     const userLocation = session.user.location;
//   //     setSelectedLocations([userLocation]);

//   //     // Set up major section options based on user's location
//   //     if (MajorSection[userLocation as keyof typeof MajorSection]) {
//   //       const sections =
//   //         MajorSection[userLocation as keyof typeof MajorSection];
//   //       const options = sections.map((section) => ({
//   //         value: section,
//   //         label: section,
//   //       }));
//   //       setMajorSectionOptions([{ value: "All", label: "All" }, ...options]);
//   //     }
//   //   }

//   //   // Set department from session
//   //   if (session?.user?.department) {
//   //     const userDepartment = session.user.department;
//   //     setSelectedDepartments([userDepartment]);
//   //   }
//   // }, [session]);
// // Get user's location and department from session and set up major section options
// useEffect(() => {
//   if (session?.user?.location) {
//     const userLocation = session.user.location;
//     const userDepot = session?.user?.depot;
//     const userDept = session?.user?.department ?? "";

//     setSelectedLocations([userLocation]);

//     // Set up major section options based on user's location and depot
//     if (MajorSection[userLocation as keyof typeof MajorSection]) {
//       const locationSections = MajorSection[userLocation as keyof typeof MajorSection];
      
//       // Filter sections based on depot - modified logic to handle multiple depots
//       const filteredSections = userDepot === "OVERALL" 
//         ? locationSections 
//         : locationSections.filter((section) => {
//             const depotData: any = depot[section as keyof typeof depot];
//             if (!depotData) return false;
//             if (!(userDept in depotData)) return false;
            
//             // Get all depots for this section and department
//             const sectionDepots = depotData[userDept];
            
//             if (userDepot.includes(',')) {
//               const userDepots = userDepot.split(',').map(d => d.trim());
//               return userDepots.some(depot => sectionDepots.includes(depot));
//             }
            
//             // For single depot, check inclusion
//             return sectionDepots.includes(userDepot);
//           });

//       const options = filteredSections.map((section) => ({
//         value: section,
//         label: section,
//       }));
      
//       setMajorSectionOptions([{ value: "All", label: "All" }, ...options]);
//     }
//   }

//   // Set department from session
//   if (session?.user?.department) {
//     const userDepartment = session.user.department;
//     setSelectedDepartments([userDepartment]);
//   }
// }, [session]);
//   // Reset work type filter when departments change
// useEffect(() => {
//   const availableWorkTypes = getWorkTypesForDepartments(selectedDepartments);
//   const currentWorkTypeExists = availableWorkTypes.some(wt => wt.value === globalWorkTypeFilter);
  
//   if (!currentWorkTypeExists) {
//     setGlobalWorkTypeFilter("ALL");
//     setGlobalActivityFilter("ALL");
//   }
// }, [selectedDepartments]);

//   // Add after your existing useEffects
// // Close dropdowns when clicking outside
// useEffect(() => {
//   const handleClickOutside = (event: MouseEvent) => {
//     if (globalWorkTypeDropdownRef.current && !globalWorkTypeDropdownRef.current.contains(event.target as Node)) {
//       setShowGlobalWorkTypeDropdown(false);
//     }
//     if (globalActivityDropdownRef.current && !globalActivityDropdownRef.current.contains(event.target as Node)) {
//       setShowGlobalActivityDropdown(false);
//     }
//     if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target as Node)) {
//       setShowDurationDropdown(false);
//     }
//   };

//   document.addEventListener('mousedown', handleClickOutside);
//   return () => document.removeEventListener('mousedown', handleClickOutside);
// }, []);

//   // Use the react-query hook with enabled: false initially
//   const {
//     data: reportData,
//     isLoading,
//     error,
//     refetch,
//   } = useGenerateReport(queryParams);

//   // Watch for query results and loading state
//   useEffect(() => {
//     setLoading(isLoading);
//     console.log("Full reportData:", reportData);

//     if (reportData && reportData.data) {
//       // Safe access of nested properties with detailed logging
//       console.log(
//         "pastBlockSummary raw data:",
//         reportData.data.pastBlockSummary
//       );
//       console.log("detailedData raw data:", reportData.data.detailedData);

//       // Handle data even if the property names don't exactly match
//       const pastData = reportData.data.pastBlockSummary || [];
//       setPastBlockSummary(pastData);
//       console.log("Set pastBlockSummary to:", pastData);

//       // Set the detailed data directly
//       const detailedData = reportData.data.detailedData || [];
//       console.log("Set upcomingBlocks to:", detailedData);

//       setReportGenerated(true);
//       toast.success(reportData.message || "Report generated successfully");
//     }
//   }, [reportData, isLoading]);

//   // Watch for query errors
//   useEffect(() => {
//     if (error) {
//       console.error("Error fetching report data:", error);
//       toast.error("Failed to generate report");
//       setLoading(false);
//     }
//   }, [error]);

//   // Function to handle row click for section details
//   const handleSectionClick = (section: string) => {
//     toast.success(`Viewing details for section: ${section}`);
//     // In a real implementation, this would navigate to a detail view
//     // router.push(`/dashboard/drm/drm/section-details/${section}`);
//   };

//   // Handler for major section selection
//   const handleMajorSectionChange = (options: MultiValue<OptionType>) => {
//     if (Array.isArray(options) && options.length > 0) {
//       const selectedValues = options.map((option) => option.value);

//       // Check if 'All' is included in the selected options
//       if (selectedValues.includes("All")) {
//         // If 'All' is selected, include all major sections except 'All' itself
//         const allSpecificSections = majorSectionOptions
//           .map((option) => option.value)
//           .filter((value) => value !== "All");
//         setSelectedMajorSections(allSpecificSections);
//       } else {
//         // Otherwise just set the selected values
//         setSelectedMajorSections(selectedValues);
//       }
//     } else {
//       setSelectedMajorSections([]);
//     }
//   };

//   // Toggle selection for buttons
//   const toggleBlockType = (blockType: string) => {
//     if (blockType === "All") {
//       setSelectedBlockTypes(["All"]);
//     } else {
//       const newTypes = selectedBlockTypes.includes(blockType)
//         ? selectedBlockTypes.filter((type) => type !== blockType)
//         : [...selectedBlockTypes.filter((type) => type !== "All"), blockType];
//       setSelectedBlockTypes(newTypes.length > 0 ? newTypes : ["All"]);
//     }
//   };

//   // Remove toggleDepartment function since we're using session department

//   // Replace your existing onSubmit with this:
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

//     // Update query parameters with ALL filters
//     setQueryParams({
//       startDate: formattedStartDate,
//       endDate: formattedEndDate,
//       majorSections: selectedMajorSections,
//       department: selectedDepartments, // Using department from session
//       blockType: selectedBlockTypes,
//       globalWorkType: globalWorkTypeFilter,
//       globalActivity: globalActivityFilter,
   
//       durationOperator: durationFilter.operator,
//       durationValue: durationFilter.value,
//     });

//   } catch (error) {
//     console.error("Error initiating report generation:", error);
//     toast.error("Failed to generate report");
//   }
// };

// // Add this function after onSubmit
// const clearGlobalFilters = () => {
//   setGlobalWorkTypeFilter("ALL");
//   setGlobalActivityFilter("ALL");
//   setDurationFilter({ operator: "ALL", value: "" });
// };

//   const formatDateInput = (value: string) => {
//     // Format as DD/MM/YY
//     if (!value) return "";
//     const [day, month, year] = value.split("/");
//     if (!day || !month || !year) return value;
//     return `${day}/${month}/${year}`;
//   };

//   // Format the selected dates for display
//   const formatDisplayDate = (dateStr: string) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return "";
//     return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
//   };

//   // (B) Summary of Upcoming Blocks
//   const [upcomingSectionFilter, setUpcomingSectionFilter] =
//     useState<string>("All");
//   const sectionOptionsB: string[] = Array.from(
//     new Set(
//       reportData?.data?.detailedData?.map((b: DetailedData) => b.Section) || []
//     )
//   );

// const filterBlocksByDepartmentCount = (block: any): boolean => {
//   if (!departmentCountFilter) return true;
  
//   const { department, supportingDepartment, filterType } = departmentCountFilter;
  
//   // Base department filter
//   if (block.selectedDepartment !== department) return false;
  
//   // Supporting department filters - MATCHING YOUR COUNTING LOGIC EXACTLY
//   if (supportingDepartment === "-") {
//     // No supporting department - only blocks that don't require any support
//     if (department === "ENGG" && (block.sntDisconnectionRequired || block.powerBlockRequired)) return false;
//     if (department === "S&T" && (block.enggDisconnectionsRequired || block.powerBlockRequired)) return false;
//     // TRD doesn't have supporting departments, so all TRD blocks pass
//   } else if (supportingDepartment === "S&T") {
//     // ENGG + S&T - matches your enggWithSnt counting
//     if (!block.sntDisconnectionRequired) return false;
//     if (block.powerBlockRequired) return false; // Matches: enggWithSnt excludes powerBlockRequired
//   } else if (supportingDepartment === "TRD") {
//     if (department === "ENGG") {
//       // ENGG + TRD - matches your enggWithPower counting
//       if (!block.powerBlockRequired) return false;
//       if (block.sntDisconnectionRequired) return false; // Matches: enggWithPower excludes sntDisconnectionRequired
//     } else if (department === "S&T") {
//       // S&T + TRD - matches your sntWithPower counting
//       if (!block.powerBlockRequired) return false;
//       if (block.enggDisconnectionsRequired) return false; // Matches: sntWithPower excludes enggDisconnectionsRequired
//     }
//   } else if (supportingDepartment === "ENGG") {
//     // S&T + ENGG - matches your sntWithEngg counting
//     if (!block.enggDisconnectionsRequired) return false;
//     if (block.powerBlockRequired) return false; // Matches: sntWithEngg excludes powerBlockRequired
//   } else if (supportingDepartment === "S&T and TRD") {
//     // ENGG + S&T + TRD - matches your enggWithSntAndPower counting
//     if (!block.sntDisconnectionRequired || !block.powerBlockRequired) return false;
//   } else if (supportingDepartment === "ENGG and TRD") {
//     // S&T + ENGG + TRD - matches your sntWithEnggAndPower counting
//     if (!block.enggDisconnectionsRequired || !block.powerBlockRequired) return false;
//   }
  
//   // Filter type conditions
//   switch (filterType) {
//     case 'requested':
//       return true;
//     case 'sanctioned':
//       return block.isSanctioned === true;
//     case 'availed':
//       return block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null;
//     default:
//       return true;
//   }
// };

// const filteredUpcomingBlocks: DetailedData[] = (
//   upcomingSectionFilter === "All"
//     ? reportData?.data?.detailedData || []
//     : reportData?.data?.detailedData?.filter(
//       (b: DetailedData) => b.Section === upcomingSectionFilter
//     ) || []
// )
// .filter((block: any) => {
//   // Division ID search filter
//   if (upcomingDivisionIdSearch.trim() !== "") {
//     const divisionId = block.DivisionId || "";
//     if (!divisionId.toLowerCase().includes(upcomingDivisionIdSearch.toLowerCase())) {
//       return false;
//     }
//   }
  
//   // SSE filter
//   if (sseFilter !== "All") {
//     const userName = block.userName || "";
//     if (userName !== sseFilter) {
//       return false;
//     }
//   }
  
//   return true;
// });

// // Use the same data source for both tables
// const detailedData: DetailedData[] = reportData?.data?.detailedData || [];

// // ENGG counts
// const enggTotal = detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === false && block.powerBlockRequired === false).length;
// const enggWithSnt = detailedData.filter(block => 
//   block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true&&block.powerBlockRequired === false
// ).length;
// const enggWithPower = detailedData.filter(block => 
//   block.selectedDepartment === "ENGG" && block.powerBlockRequired === true&& block.sntDisconnectionRequired === false
// ).length;
// const enggWithSntAndPower = detailedData.filter(block => 
//   block.selectedDepartment === "ENGG" && 
//   block.sntDisconnectionRequired === true && 
//   block.powerBlockRequired === true
// ).length;

// // S&T counts
// const sntTotal = detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === false && block.powerBlockRequired === false).length;
// const sntWithPower = detailedData.filter(block => 
//   block.selectedDepartment === "S&T" && block.powerBlockRequired === true&&block.enggDisconnectionsRequired === false
// ).length;
// const sntWithEngg = detailedData.filter(block => 
//   block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true&&block.powerBlockRequired === false
// ).length;
// const sntWithEnggAndPower = detailedData.filter(block => 
//   block.selectedDepartment === "S&T" && 
//   block.enggDisconnectionsRequired === true && 
//   block.powerBlockRequired === true
// ).length;

// // TRD counts
// const trdTotal = detailedData.filter(block => block.selectedDepartment === "TRD").length;

// // Total counts for the bottom row
// const totalRequested = detailedData.length;
// const totalSanctioned = detailedData.filter(block => block.isSanctioned === true).length;
// const totalAvailed = detailedData.filter(block => block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length;

// const filteredBlocks = filteredUpcomingBlocks.filter((block) => {
//    if (activeFilter === "approved" && !block.isSanctioned) return false;
//   if (activeFilter === "granted" && !block.isGranted) return false;
//   if (activeFilter === "applied" && !block.isApplied) return false;

//   if( activeFilter === "availed" && block.AvailedTimeFrom===null) return false;
// if (activeFilter === "demanded" && block.DemandedTimeFrom === null) return false;
//   if (activeFilter === "notGranted" && block.isGranted !== false) return false;
//   if (activeFilter === "notAvailed" && !(
//     (!block.AvailedTimeFrom&&block.isSanctioned) ||
//     (!block.AvailedTimeTo&&block.isSanctioned) ||
//     (block.isApplied === null&&block.isGranted===true) ||
//     (block.isApplied === false) ||
//     (block.userResponse !== "ACCEPTED" && block.useAcceptanceForSanction === false && block.isSanctioned === true)
//   )) return false;
//   // Filter by selected section
//   if (activeSection && block.Section !== activeSection) return false;
//     if (!filterBlocksByDepartmentCount(block)) return false;
//   return true;
// });

//   function formatDateB(dateString: string) {
//     if (!dateString) return "";
//     // Accepts both MM/DD/YYYY and DD/MM/YYYY
//     const parts = dateString.split("/");
//     if (parts.length === 3) {
//       // Try MM/DD/YYYY first
//       const d1 = new Date(dateString);
//       if (!isNaN(d1.getTime())) return d1.toLocaleDateString("en-GB");
//       // Try DD/MM/YYYY
//       const d2 = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
//       if (!isNaN(d2.getTime())) return d2.toLocaleDateString("en-GB");
//     }
//     return dateString;
//   }

//   const upcomingBlocks: DetailedData[] = reportData?.data?.detailedData || [];

//   const [sectionDropdownOpenB, setSectionDropdownOpenB] = useState(false);
//   const sectionDropdownRefB = useRef<HTMLDivElement>(null);

//   // Function to download block summary table as XLSX
//   const handleDownloadSummary = () => {
//     try {
//       if (pastBlockSummary.length === 0) {
//         toast.error("No data available to download");
//         return;
//       }

//       const excelData = pastBlockSummary.map((summary: any) => ({
//         Section: summary.Department || summary.Section || "", // Using the fixed value as in the table
//         Demanded: summary.Demanded?.toFixed(2) || "0.00",
//         Approved: summary.Approved?.toFixed(2) || "0.00",
//         Granted: summary.Granted?.toFixed(2) || "0.00",
//         "% Granted":
//           summary.PercentGranted !== undefined
//             ? summary.PercentGranted.toFixed(2) + "%"
//             : "",
//         Availed: summary.Availed.toFixed(2) || "0.00",
//         "% Availed":
//           summary.PercentAvailed !== undefined
//             ? summary.PercentAvailed.toFixed(2) + "%"
//             : "",
//       }));

//       // Add total row
//       excelData.push({
//         Section: "Total",
//         Demanded: pastBlockSummary
//           .reduce((sum, item) => sum + (item.Demanded || 0), 0)
//           .toFixed(2),
//         Approved: pastBlockSummary
//           .reduce((sum, item) => sum + (item.Approved || 0), 0)
//           .toFixed(2),
//         Granted: String(
//           pastBlockSummary.reduce((sum, item) => sum + (item.Granted || 0), 0).toFixed(2)
//         ),
//         "% Granted":
//           String(
//             pastBlockSummary.reduce(
//               (sum, item) => sum + (item.PercentGranted || 0),
//               0
//             ).toFixed(2)
//           ) + "%",
//         Availed: String(
//           pastBlockSummary.reduce((sum, item) => sum + (item.Availed || 0), 0).toFixed(2)
//         ),
//         "% Availed":
//           String(
//             pastBlockSummary.reduce(
//               (sum, item) => sum + (item.PercentAvailed || 0),
//               0
//             ).toFixed(2)
//           ) + "%",
//       });

//       const workbook = XLSX.utils.book_new();
//       const worksheet = XLSX.utils.json_to_sheet(excelData);

//       // Add title before the data
//       XLSX.utils.sheet_add_aoa(
//         worksheet,
//         [
//           [
//             `(A) Block Summary: ${formatDisplayDate(
//               watch("startDate")
//             )} to ${formatDisplayDate(watch("endDate"))}`,
//           ],
//           [`Department: ${selectedDepartments.join(", ")} (in Hrs)`],
//           [], // Empty row for spacing
//         ],
//         { origin: "A1" }
//       );

//       // Adjust column widths
//       const colWidths = [
//         { wch: 15 }, // Section
//         { wch: 10 }, // Demanded
//         { wch: 10 }, // Approved
//         { wch: 10 }, // Granted
//         { wch: 10 }, // % Granted
//         { wch: 10 }, // Availed
//         { wch: 10 }, // % Availed
//       ];
//       worksheet["!cols"] = colWidths;

//       XLSX.utils.book_append_sheet(workbook, worksheet, "Block Summary");

//       const excelBuffer = XLSX.write(workbook, {
//         bookType: "xlsx",
//         type: "array",
//       });
//       const blob = new Blob([excelBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = `block_summary_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       toast.success("Block summary downloaded successfully");
//     } catch (error) {
//       console.error("Download error:", error);
//       toast.error("Failed to download Excel file. Please try again.");
//     }
//   };

//   // Function to download upcoming blocks table as XLSX
//   const handleDownloadUpcomingBlocks = () => {
//     try {
//       if (filteredUpcomingBlocks.length === 0) {
//         toast.error("No data available to download");
//         return;
//       }

//       const excelData = filteredUpcomingBlocks.map((block: any) => {
//         // Status logic
//         let statusLabel = "";
//         if (block.Status === "APPROVED") {
//           statusLabel = "Pending with Optg";
//         } else if (block.Status === "PENDING") {
//           statusLabel = "Pending with dept control";
//         } else if (block.Status === "REJECTED") {
//           statusLabel = "Returned by Optg";
//         } else {
//           statusLabel = block.Status;
//         }

//         return {
//           Date: formatDateB(block.Date),
//           "Request ID": block.DivisionId || "N/A",
//           "Station ID": block.stationId || "N/A",
//           "Block Section": block.MissionBlock || "N/A",
//           Type: block.Type || "N/A",
//           Duration: block.Duration,
//           Activity: block.Activity || "N/A",
//           Depo:block.selectedDepo||"N/A",
//           "Availed Time":
//             block.AvailedTimeFrom && block.AvailedTimeTo
//               ? `${formatTime(block.AvailedTimeFrom)} to ${formatTime(
//                 block.AvailedTimeTo
//               )}`
//               : "Not Available",
//           Status: statusLabel,
//         };
//       });

//       const workbook = XLSX.utils.book_new();
//       const worksheet = XLSX.utils.json_to_sheet(excelData);

//       // Add title before the data
//       XLSX.utils.sheet_add_aoa(
//         worksheet,
//         [
//           [`(B) Summary of Upcoming Blocks`],
//           [], // Empty row for spacing
//         ],
//         { origin: "A1" }
//       );

//       // Adjust column widths
//       const colWidths = [
//         { wch: 12 }, // Date
//         { wch: 10 }, // ID
//         { wch: 10 }, // Station ID
//         { wch: 20 }, // Block Section
//         { wch: 12 }, // Type
//         { wch: 30 }, // Activity
//         { wch: 20 }, // Demand Time
//         { wch: 20 }, // Sanctioned Time
//         { wch: 20 }, // Availed Time
//         { wch: 20 }, // Status
//       ];
//       worksheet["!cols"] = colWidths;

//       XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming Blocks");

//       const excelBuffer = XLSX.write(workbook, {
//         bookType: "xlsx",
//         type: "array",
//       });
//       const blob = new Blob([excelBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = `upcoming_blocks_${format(
//         new Date(),
//         "dd-MM-yyyy"
//       )}.xlsx`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       toast.success("Upcoming blocks data downloaded successfully");
//     } catch (error) {
//       console.error("Download error:", error);
//       toast.error("Failed to download Excel file. Please try again.");
//     }
//   };

//   // Get unique SSE names from your data
// const sseOptions = [...new Set(
//   reportData?.data?.detailedData
//     ?.map((item: any) => item.userName)
//     .filter(Boolean) // Remove null/undefined
// )].sort();

// const handleDownloadDepartmentCount = () => {
//   try {
//     if (detailedData.length === 0) { // Changed from countBlock to detailedData
//       toast.error("No data available to download");
//       return;
//     }

//     // Prepare the Excel data matching your table structure
//     const excelData = [
//       // ENGG Rows
//       {
//         "Location": "{userLocations}",
//         "Department": "ENGG",
//         "Supporting Department": "-",
//         "Total Block Requested": enggTotal,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.isSanctioned).length,
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length
//       },
//       {
//         "Location": "{userLocations}",
//         "Department": "ENGG",
//         "Supporting Department": "S&T",
//         "Total Block Requested": enggWithSnt,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.isSanctioned),
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
//       {
//         "Location": "{userLocations}",
//         "Department": "ENGG",
//         "Supporting Department": "TRD",
//         "Total Block Requested": enggWithPower,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.isSanctioned),
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
//       {
//         "Location": "{userLocations}",
//         "Department": "ENGG",
//         "Supporting Department": "S&T and TRD",
//         "Total Block Requested": enggWithSntAndPower,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.isSanctioned),
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
      
//       // TRD Rows
//       {
//         "Location": "{userLocations}",
//         "Department": "TRD",
//         "Supporting Department": "-",
//         "Total Block Requested": trdTotal,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "TRD" && block.isSanctioned),
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "TRD" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
      
//       // S&T Rows
//       {
//         "Location": "{userLocations}",
//         "Department": "S&T",
//         "Supporting Department": "-",
//         "Total Block Requested": sntTotal,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.isSanctioned),
//         "Total Block Availed":detailedData.filter(block => block.selectedDepartment === "S&T" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
//       {
//         "Location": "{userLocations}",
//         "Department": "S&T",
//         "Supporting Department": "ENGG",
//         "Total Block Requested": sntWithEngg,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.isSanctioned),
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
//       {
//         "Location": "{userLocations}",
//         "Department": "S&T",
//         "Supporting Department": "TRD",
//         "Total Block Requested": sntWithPower,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.isSanctioned),
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
//       {
//         "Location": "{userLocations}",
//         "Department": "S&T",
//         "Supporting Department": "ENGG and TRD",
//         "Total Block Requested": sntWithEnggAndPower,
//         "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.isSanctioned),
//         "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
//       },
      
//       // Total Row
//       {
//         "Location": "TOTAL",
//         "Department": "",
//         "Supporting Department": "",
//         "Total Block Requested": totalRequested,
//         "Total Block Sanctioned": totalSanctioned,
//         "Total Block Availed": totalAvailed
//       }
//     ];

//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(excelData);

//     // Add title before the data
//     XLSX.utils.sheet_add_aoa(
//       worksheet,
//       [
//         [`Department Wise Request Count`],
//         [], // Empty row for spacing
//       ],
//       { origin: "A1" }
//     );

//     // Adjust column widths for better readability
//     const colWidths = [
//       { wch: 12 }, // Location
//       { wch: 15 }, // Department
//       { wch: 25 }, // Supporting Department
//       { wch: 20 }, // Total Block Requested
//       { wch: 20 }, // Total Block Sanctioned
//       { wch: 20 }, // Total Block Availed
//     ];
//     worksheet["!cols"] = colWidths;

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Department Count");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
    
//     const blob = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });
    
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `department_wise_request_count_${format(
//       new Date(),
//       "dd-MM-yyyy"
//     )}.xlsx`;
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     toast.success("Department wise request count downloaded successfully");
//   } catch (error) {
//     console.error("Download error:", error);
//     toast.error("Failed to download Excel file. Please try again.");
//   }
// };

//   return (
//     <div className="min-h-screen w-full bg-[#fffbe9] flex flex-col items-center">
//       {/* RBMS Header */}
//       <div className="w-full bg-[#fff35c] flex flex-col items-center py-2 rounded-t-2xl">
//         <span className="text-[18px] md:text-[24px] font-extrabold text-[#b07be0] tracking-wide">
//           RBMS-{session?.user?.location}-DIVN
//         </span>
//       </div>
      
//       {/* Block Summary Report Title */}
//       <div className="w-full bg-[#b7e3ee] flex flex-col items-center pt-2 pb-1">
//         <span className="text-[18px] md:text-[24px] font-extrabold text-black text-center px-2">
//             {session?.user?.role === "BRANCH_OFFICER" ? "BRANCH OFFICER" : 
//    session?.user?.role === "JUNIOR_OFFICER" ? "JUNIOR OFFICER" :
//    session?.user?.role === "SENIOR_OFFICER" ? "SENIOR OFFICER" :
//    "OFFICER"}
//         </span>
//         <span className="text-[16px] md:text-[24px] font-bold text-black">BLOCK SUMMARY REPORT(Granted/Availed/Pending)</span>
//         <div className="mt-2 bg-[#7be09b] px-4 md:px-6 py-1 rounded-2xl">
//           <span className="text-[16px] md:text-[24px] font-bold text-white">
//             DEPT:{session?.user?.department} 
//           </span>
//         </div>
//       </div>

//       {/* === FILTERS SECTION === */}
//       <div className="w-full max-w-screen-lg bg-[#fffbe9] px-2 py-2">
//         <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-end w-full">
//           <div className="flex flex-col w-full sm:min-w-[90px] sm:max-w-[110px]">
//             <span className="text-[16px] md:text-[24px] font-bold text-black mb-1 whitespace-nowrap">
//               Choose Section
//             </span>
//             <Select
//               options={majorSectionOptions}
//               isMulti={true}
//               value={majorSectionOptions.filter((opt) =>
//                 selectedMajorSections.includes(opt.value)
//               )}
//               onChange={(opts) => handleMajorSectionChange(opts)}
//               classNamePrefix="section-select"
//               styles={{
//                 container: (base) => ({
//                   ...base,
//                   width: "100%",
//                   maxWidth: "110px",
//                   minWidth: "90px",
//                 }),
//                 control: (base, state) => ({
//                   ...base,
//                   borderColor: "#00bfff",
//                   borderWidth: 2,
//                   borderRadius: 0,
//                   minHeight: 32,
//                   fontSize: 16,
//                   width: "100%",
//                   maxWidth: "110px",
//                   minWidth: "90px",
//                   // Show only the count in the input
//                   "&:after": selectedMajorSections.length > 0 ? {
//                     content: `"${selectedMajorSections.length}"`,
//                     position: 'absolute',
//                     left: 8,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     color: '#000',
//                     fontWeight: 'bold',
//                     pointerEvents: 'none',
//                   } : {},
//                 }),
//                 input: (base) => ({
//                   ...base,
//                   opacity: 0, // Hide the default input
//                   width: 0,
//                 }),
//                 placeholder: (base) => ({
//                   ...base,
//                   display: selectedMajorSections.length > 0 ? 'none' : 'block',
//                 }),
//                 option: (base, state) => ({
//                   ...base,
//                   backgroundColor: state.isSelected ? "#b7e3ee" : "#fff",
//                   color: "#000",
//                   fontWeight: "bold",
//                   fontSize: 16,
//                 }),
//                 menu: (base) => ({ ...base, zIndex: 50 }),
//                 multiValue: (base) => ({
//                   ...base,
//                   backgroundColor: "#e0e0ff",
//                   color: "#000",
//                   display: 'none', // Hide the chips in the input
//                 }),
//                 multiValueLabel: (base) => ({
//                   ...base,
//                   color: "#000",
//                   fontWeight: "bold",
//                 }),
//                 multiValueRemove: (base) => ({
//                   ...base,
//                   color: "#b07be0",
//                   ":hover": { backgroundColor: "#b07be0", color: "white" },
//                 }),
//               }}
//               placeholder="Section"
//               closeMenuOnSelect={false}
//               hideSelectedOptions={false}
//               menuPortalTarget={
//                 typeof window !== "undefined" ? document.body : undefined
//               }
//               menuPosition="fixed"
//             />
//           </div>
          
//           {/* Select Period */}
//           <div className="flex flex-col w-full">
//             <div className="flex justify-center w-full mb-1">
//               <span className="text-[16px] md:text-[24px] font-bold text-black">
//                 Select Period
//               </span>
//             </div>
//             <div className="flex flex-row items-center gap-1 w-full justify-center sm:justify-start">
//               <input
//                 type="date"
//                 className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[100px] md:max-w-[120px] text-[14px] md:text-[24px] font-bold text-center"
//                 style={{ color: "black" }}
//                 {...register("startDate")}
//               />
//               <span className="text-[14px] md:text-base font-bold" style={{ color: "black" }}>
//                 to
//               </span>
//               <input
//                 type="date"
//                 className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[100px] md:max-w-[120px] text-[14px] md:text-[24px] font-bold text-center"
//                 style={{ color: "black" }}
//                 {...register("endDate")}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Block Type Filters */}
//       <div className="w-full max-w-screen-lg flex flex-wrap justify-center gap-2 mt-2 mb-1 px-2">
//         {blockTypeOptions.map((opt) => (
//           <button
//             key={opt.value}
//             className={`rounded-full px-2 py-1 text-[12px] md:text-[24px] font-semibold border border-[#b7e3ee] flex items-center gap-1 transition-colors duration-150 ${
//               selectedBlockTypes.includes(opt.value)
//                 ? "bg-[#b7e3ee] text-black"
//                 : "bg-[#e0e0ff] text-black"
//             }`}
//             onClick={() => toggleBlockType(opt.value)}
//             type="button"
//           >
//             {selectedBlockTypes.includes(opt.value) && (
//               <span className="text-green-600 font-bold">✔</span>
//             )}
//             {opt.label}
//           </button>
//         ))}
//       </div>

//       {/* Department Display (from session) */}
//       <div className="w-full max-w-screen-lg flex flex-wrap justify-center gap-2 mb-2 px-2">
//         <div className={`rounded-full px-2 py-1 text-[12px] md:text-[24px] font-semibold border flex items-center gap-1
//           ${
//             session?.user?.department === "Engineering"
//               ? "bg-[#e49edd] border-[#b07be0] text-black"
//               : session?.user?.department === "ST"
//               ? "bg-[#fff35c] border-[#e0e0e0] text-black"
//               : "bg-[#c7f7c7] border-[#7be09b] text-black"
//           }`}
//         >
//           <span className="text-green-600 font-bold">✔</span>
//           {session?.user?.department}
//         </div>
//       </div>

// {/* === GLOBAL FILTERS SECTION === */}
// <div className="w-full max-w-screen-lg flex flex-wrap justify-center gap-2 mb-4 px-2">
//   {/* Work Type Filter */}
//   <div className="relative" ref={globalWorkTypeDropdownRef}>
//     <button
//       onClick={() => setShowGlobalWorkTypeDropdown(!showGlobalWorkTypeDropdown)}
//       className="px-3 py-1 bg-white border border-black rounded flex items-center gap-2 text-black text-[12px] md:text-[14px]"
//       disabled={selectedDepartments.length === 0}
//     >
//       Work Type: {globalWorkTypeFilter}
//       <span>▼</span>
//     </button>
//     {showGlobalWorkTypeDropdown && selectedDepartments.length > 0 && (
//       <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[150px]">
//         {getWorkTypesForDepartments(selectedDepartments).map((type) => (
//           <button
//             key={type.value}
//             onClick={() => {
//               setGlobalWorkTypeFilter(type.value);
//               setGlobalActivityFilter('ALL');
//               setShowGlobalWorkTypeDropdown(false);
//             }}
//             className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${globalWorkTypeFilter === type.value ? 'bg-blue-100' : ''}`}
//           >
//             {type.label}
//           </button>
//         ))}
//       </div>
//     )}
//   </div>

//   {/* Activity Filter */}
//   <div className="relative" ref={globalActivityDropdownRef}>
//     <button
//       onClick={() => globalWorkTypeFilter !== 'ALL' && setShowGlobalActivityDropdown(!showGlobalActivityDropdown)}
//       className={`px-3 py-1 bg-white border border-black rounded flex items-center gap-2 text-black text-[12px] md:text-[14px] ${
//         globalWorkTypeFilter === 'ALL' || selectedDepartments.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
//       }`}
//       disabled={globalWorkTypeFilter === 'ALL' || selectedDepartments.length === 0}
//     >
//       Activity: {globalActivityFilter}
//       <span>▼</span>
//     </button>
//     {showGlobalActivityDropdown && globalWorkTypeFilter !== 'ALL' && selectedDepartments.length > 0 && (
//       <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
//         {getActivitiesForWorkType(globalWorkTypeFilter).map((activity) => (
//           <button
//             key={activity}
//             onClick={() => {
//               setGlobalActivityFilter(activity);
//               setShowGlobalActivityDropdown(false);
//             }}
//             className={`block w-full text-left px-3 py-2 hover:bg-gray-100 text-black ${globalActivityFilter === activity ? 'bg-blue-100' : ''}`}
//           >
//             {activity}
//           </button>
//         ))}
//       </div>
//     )}
//   </div>

//   {/* Time Slot Filter */}
// {/* Duration Filter */}
// <div className="relative" ref={durationDropdownRef}>
//   <button
//     onClick={() => setShowDurationDropdown(!showDurationDropdown)}
//     className="px-3 py-1 bg-white border border-black rounded flex items-center gap-2 text-black text-[12px] md:text-[14px]"
//   >
//     Duration: {durationFilter.operator === "ALL" 
//       ? "ALL" 
//       : `${getOperatorSymbol(durationFilter.operator)} ${durationFilter.value}h`
//     }
//     <span>▼</span>
//   </button>
  
//   {showDurationDropdown && (
//     <div className="absolute top-full left-0 bg-white border border-black shadow-lg z-50 min-w-[200px] p-3">
//       {/* Operator Selection */}
//       <div className="mb-3">
//         <label className="block text-sm font-medium text-black mb-1">Operator:</label>
//         <div className="grid grid-cols-3 gap-1">
//           {[
//             { value: "ALL", label: "ALL", symbol: "ALL" },
//             { value: ">", label: ">", symbol: "Greater than" },
//             { value: ">=", label: "≥", symbol: "Greater than or equal" },
//             { value: "=", label: "=", symbol: "Equal to" },
//             { value: "<=", label: "≤", symbol: "Less than or equal" },
//             { value: "<", label: "<", symbol: "Less than" }
//           ].map((op) => (
//             <button
//               key={op.value}
//               onClick={() => setDurationFilter(prev => ({ ...prev, operator: op.value }))}
//               className={`p-2 border rounded text-sm ${
//                 durationFilter.operator === op.value 
//                   ? 'bg-blue-500 text-white border-blue-500' 
//                   : 'bg-gray-100 text-black border-gray-300'
//               }`}
//               title={op.symbol}
//             >
//               {op.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Duration Input */}
//       {durationFilter.operator !== "ALL" && (
//         <div className="mb-3">
//           <label className="block text-sm font-medium text-black mb-1">
//             Duration (hours):
//           </label>
//           <input
//             type="number"
//             min="0"
//             max="24"
//             step="0.5"
//             value={durationFilter.value}
//             onChange={(e) => setDurationFilter(prev => ({ 
//               ...prev, 
//               value: e.target.value 
//             }))}
//             className="w-full px-2 py-1 border border-gray-300 rounded text-black"
//             placeholder="Enter hours"
//           />
//           <div className="flex gap-1 mt-1">
//             {[1, 2, 4, 6, 8].map((hours) => (
//               <button
//                 key={hours}
//                 onClick={() => setDurationFilter(prev => ({ 
//                   ...prev, 
//                   value: hours.toString() 
//                 }))}
//                 className="flex-1 px-2 py-1 bg-gray-200 text-black rounded text-xs hover:bg-gray-300"
//               >
//                 {hours}h
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex gap-2">
//         <button
//           onClick={() => {
//             setShowDurationDropdown(false);
//           }}
//           className="flex-1 bg-green-500 text-white py-1 rounded text-sm hover:bg-green-600"
//         >
//           Apply
//         </button>
//         <button
//           onClick={() => {
//             setDurationFilter({ operator: "ALL", value: "" });
//             setShowDurationDropdown(false);
//           }}
//           className="flex-1 bg-red-500 text-white py-1 rounded text-sm hover:bg-red-600"
//         >
//           Clear
//         </button>
//       </div>
//     </div>
//   )}
// </div>

//   {/* Clear Filters Button */}
//   <button
//     onClick={clearGlobalFilters}
//     className="px-3 py-1 bg-red-500 text-white border border-black rounded text-[12px] md:text-[14px]"
//   >
//     Clear Filters
//   </button>
// </div>

//       {/* Submit Button */}
//       <div className="w-full max-w-screen-lg flex justify-center mb-4">
//         <button
//           className="bg-[#7be09b] hover:bg-[#5bc07b] text-white font-bold px-6 md:px-8 py-2 rounded-[50%] shadow border border-[#00b347] text-[16px] md:text-[24px]"
//           onClick={handleSubmit(onSubmit)}
//           disabled={loading}
//         >
//           {loading ? "Loading..." : "Submit"}
//         </button>
//       </div>


//       {/* === PAGE 1: (A) BLOCK SUMMARY TABLE - FULL WIDTH === */}
//       <div className="w-full bg-white flex flex-col py-4">
//         <div className="w-full px-2 md:px-4">
//           <div className="my-2">
//             <button
//               onClick={handleDownloadSummary}
//               className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base flex items-center mx-auto"
//               disabled={pastBlockSummary.length === 0}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-4 w-4 md:h-5 md:w-5 mr-1"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                 />
//               </svg>
//               Download Past Blocks Summary (XLSX)
//             </button>
//           </div>
          
//           <div className="flex flex-col md:flex-row w-full">
//             <div className="bg-[#ff914d] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center">
//               (A) Block Summary:{" "}
//               {formatDisplayDate(watch("startDate")) || "........"} to{" "}
//               {formatDisplayDate(watch("endDate")) || "........"}
//             </div>
//             <div className="bg-[#ff914d] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center md:mt-0 mt-1">
//               Department:{" "}
//               {session?.user?.department || "............."}{" "}
//               (in Hrs)
//             </div>
//           </div>
          
//           <div className="w-full overflow-x-auto">
//             <table className="w-full border-2 border-black min-w-[800px]">
//               <thead>
//                 <tr className="bg-[#f7c7ac] text-black text-[14px] md:text-[24px] font-bold">
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Section</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Demanded (Hrs)/Blocks</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Approved (Hrs)/Blocks</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Applied (Hrs)/Blocks</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Granted (Hrs)/Blocks</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">% Granted</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Availed (Hrs)/Blocks</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">% Availed</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Not Granted</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Not Availed</th>

//                 </tr>
//               </thead>
//               <tbody>
//                 {pastBlockSummary.length === 0 ? (
//                   <tr>
//                     <td colSpan={8} className="text-center py-4 text-black">
//                       No data found.
//                     </td>
//                   </tr>
//                 ) : (
//                   pastBlockSummary.map((summary: any, idx: number) => (
//                     <tr
//                       className={`font-bold ${idx % 2 === 0 ? "bg-[#f4dcf1]" : "bg-white"}`}
//                       key={idx}
//                     >
//                       <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                         {summary.Department || summary.Section || ""}
//                       </td>
//                       <td
//                         className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//                          onClick={() => {
//     setActiveFilter("demanded");
//     setActiveSection(summary.Department || summary.Section);
//   }}
//                       >
//                         {summary.Demanded.toFixed(2)} / {summary.DemandsCount}
//                       </td>
//                       <td
//                         className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//                         onClick={() => {
//                           setActiveFilter("approved");
//                           setActiveSection(summary.Department || summary.Section);
//                         }}
//                       >
//                         {summary.Approved.toFixed(2)} / {summary.ApprovedCount}
//                       </td>
//                       <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//                          onClick={() => {
//                           setActiveFilter("applied");
//                           setActiveSection(summary.Department || summary.Section);
//                         }}
//                       >
//                         {summary.Applied.toFixed(2)} /{summary.AppliedCount}
//                       </td>
//                       <td
//                         className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//                         onClick={() => {
//                           setActiveFilter("granted");
//                           setActiveSection(summary.Department || summary.Section);
//                         }}
//                       >
//                         {summary.Granted.toFixed(2)} /{summary.GrantedCount}
//                       </td>
                    
//                       <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                         {summary.PercentGranted !== undefined
//                           ? summary.PercentGranted.toFixed(2) + "%"
//                           : ""}
//                       </td>
//                       <td
//                         className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//                         onClick={() => {
//                           setActiveFilter("availed");
//                           setActiveSection(summary.Department || summary.Section);
//                         }}
//                       >
//                         {summary.Availed.toFixed(2)} / {summary.AvailedCount}
//                       </td>
//                       <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                         {summary.PercentAvailed !== undefined
//                           ? summary.PercentAvailed.toFixed(2) + "%"
//                           : ""}
//                       </td>
// <td
//   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//   onClick={() => {
//     // You can define what happens when Not Granted is clicked
//     // For example, filter the upcoming blocks to show only not granted requests
//     setActiveFilter("notGranted");
//     setActiveSection(summary.Department || summary.Section);
//     toast.success(`Viewing Not Granted for: ${summary.Department || summary.Section}`);
//   }}
// >
//   {summary.NotGrantedCount}
// </td>
// <td
//   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//   onClick={() => {
//     // You can define what happens when Not Availed is clicked
//     setActiveFilter("notAvailed");
//     setActiveSection(summary.Department || summary.Section);
//     toast.success(`Viewing Not Availed for: ${summary.Department || summary.Section}`);
//   }}
// >
//   {summary.NotAvailedCount}
// </td>
                    
//                     </tr>
//                   ))
//                 )}

//                 {pastBlockSummary.length > 0 && (
//                   <tr className="bg-[#ff914d] text-white font-bold">
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-[12px] md:text-[16px]">Totals</td>
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                       {pastBlockSummary
//                         .reduce((sum, item) => sum + (item.Demanded || 0), 0)
//                         .toFixed(2)}{" "}
//                       /{" "}
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.DemandsCount || 0),
//                         0
//                       )}
//                     </td>
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                       {pastBlockSummary
//                         .reduce((sum, item) => sum + (item.Approved || 0), 0)
//                         .toFixed(2)}{" "}
//                       /{" "}
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.ApprovedCount || 0),
//                         0
//                       )}
//                     </td>
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.Applied || 0),
//                         0
//                       ).toFixed(2)} /{" "}
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.AppliedCount || 0),
//                         0
//                       )}
//                     </td>
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.Granted || 0),
//                         0
//                       ).toFixed(2)} /{" "}
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.GrantedCount || 0),
//                         0
//                       )}
//                     </td>
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.PercentGranted || 0),
//                         0
//                       ).toFixed(2)}
//                     </td>
                    
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.Availed || 0),
//                         0
//                       ).toFixed(2)}{" "}
//                       /{" "}
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.AvailedCount || 0),
//                         0
//                       )}
//                     </td>
//                     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//                       {pastBlockSummary.reduce(
//                         (sum, item) => sum + (item.PercentAvailed || 0),
//                         0
//                       ).toFixed(2)}
//                     </td>
//                   <td
//   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//   onClick={() => {
//     setActiveFilter("notGranted");
//     setActiveSection(null); // Show all sections for total
//     toast.success("Viewing all Not Granted requests");
//   }}
// >
//   {pastBlockSummary.reduce(
//     (sum, item) => sum + (item.NotGrantedCount || 0),
//     0
//   )}
// </td>
// <td
//   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
//   onClick={() => {
//     setActiveFilter("notAvailed");
//     setActiveSection(null); // Show all sections for total
//     toast.success("Viewing all Not Availed requests");
//   }}
// >
//   {pastBlockSummary.reduce(
//     (sum, item) => sum + (item.NotAvailedCount || 0),
//     0
//   )}
// </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>



//   <div className="flex flex-col md:flex-row w-full mt-8 gap-4 mb-2 ">
//   <button
//     onClick={handleDownloadDepartmentCount}
//     className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base flex items-center"
//     disabled={detailedData.length === 0}
//   >
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       className="h-4 w-4 md:h-5 md:w-5 mr-1"
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//       />
//     </svg>
//     Download Count (XLSX)
//   </button>

//   <div className="bg-[#ff914d] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center">
//     Department Wise Request Count
//   </div>
//   {/* Department Count Filter Display */}
// {departmentCountFilter && (
//   <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 my-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//     <div className="bg-blue-100 border border-blue-300 px-4 py-2 rounded-lg">
//       <span className="text-blue-700 font-bold text-sm md:text-base">
//         Filtering: {departmentCountFilter.department} 
//         {departmentCountFilter.supportingDepartment !== "-" ? ` + ${departmentCountFilter.supportingDepartment}` : ''} 
//         ({departmentCountFilter.filterType.toUpperCase()})
//       </span>
//     </div>
//     <button
//       onClick={() => setDepartmentCountFilter(null)}
//       className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
//     >
//       <span>✕</span>
//       Clear Department Filter
//     </button>
//   </div>
// )}
// </div>

// <div className="w-full overflow-x-auto ">
//   <table className="w-full border-2 border-black min-w-[800px]">
//     <thead>
//       <tr className="bg-[#f7c7ac] text-black text-[14px] md:text-[24px] font-bold">
//         <th className="border-2 border-black px-1 md:px-2 py-2">Location</th>
//         <th className="border-2 border-black px-1 md:px-2 py-2">Department</th>
//         <th className="border-2 border-black px-1 md:px-2 py-2">Supporting Department</th>
//         <th className="border-2 border-black px-1 md:px-2 py-2">Total Block Requested</th>
//         <th className="border-2 border-black px-1 md:px-2 py-2">Total Block Sanctioned</th>
//         <th className="border-2 border-black px-1 md:px-2 py-2">Total Block Availed</th>
//       </tr>
//     </thead>
// <tbody>
//   {/* ENGG Rows */}
//   <tr className="bg-white font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">-</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "-",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested ENGG blocks (no supporting departments)");
//       }}
//     >
//       {enggTotal}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "-",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned ENGG blocks (no supporting departments)");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.isSanctioned && block.powerBlockRequired === false && block.sntDisconnectionRequired === false).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "-",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed ENGG blocks (no supporting departments)");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null && block.powerBlockRequired === false && block.sntDisconnectionRequired === false).length}
//     </td>
//   </tr>
  
//   <tr className="bg-[#f4dcf1] font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "S&T",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested ENGG blocks with S&T support");
//       }}
//     >
//       {enggWithSnt}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "S&T",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned ENGG blocks with S&T support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.isSanctioned && block.powerBlockRequired === false && block.enggDisconnectionsRequired === false).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "S&T",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed ENGG blocks with S&T support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null && block.powerBlockRequired === false && block.enggDisconnectionsRequired === false).length}
//     </td>
//   </tr>
  
//   <tr className="bg-white font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">TRD</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "TRD",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested ENGG blocks with TRD support");
//       }}
//     >
//       {enggWithPower}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "TRD",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned ENGG blocks with TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.isSanctioned).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "TRD",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed ENGG blocks with TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length}
//     </td>
//   </tr>
  
//   <tr className="bg-[#f4dcf1] font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T and TRD</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "S&T and TRD",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested ENGG blocks with S&T and TRD support");
//       }}
//     >
//       {enggWithSntAndPower}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "S&T and TRD",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned ENGG blocks with S&T and TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.isSanctioned).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "ENGG",
//           supportingDepartment: "S&T and TRD",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed ENGG blocks with S&T and TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length}
//     </td>
//   </tr>

//   {/* TRD Rows */}
//   <tr className="bg-white font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">TRD</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">-</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "TRD",
//           supportingDepartment: "-",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested TRD blocks");
//       }}
//     >
//       {trdTotal}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "TRD",
//           supportingDepartment: "-",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned TRD blocks");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "TRD" && block.isSanctioned).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "TRD",
//           supportingDepartment: "-",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed TRD blocks");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "TRD" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length}
//     </td>
//   </tr>

//   {/* S&T Rows */}
//   <tr className="bg-[#f4dcf1] font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">-</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "-",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested S&T blocks (no supporting departments)");
//       }}
//     >
//       {sntTotal}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "-",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned S&T blocks (no supporting departments)");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.isSanctioned).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "-",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed S&T blocks (no supporting departments)");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length}
//     </td>
//   </tr>
  
//   <tr className="bg-white font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "ENGG",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested S&T blocks with ENGG support");
//       }}
//     >
//       {sntWithEngg}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "ENGG",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned S&T blocks with ENGG support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.isSanctioned).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "ENGG",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed S&T blocks with ENGG support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length}
//     </td>
//   </tr>
  
//   <tr className="bg-[#f4dcf1] font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">TRD</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "TRD",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested S&T blocks with TRD support");
//       }}
//     >
//       {sntWithPower}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "TRD",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned S&T blocks with TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.isSanctioned).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "TRD",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed S&T blocks with TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length}
//     </td>
//   </tr>
  
//   <tr className="bg-white font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">{userLocations}</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">S&T</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">ENGG and TRD</td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "ENGG and TRD",
//           filterType: 'requested'
//         });
//         toast.success("Showing requested S&T blocks with ENGG and TRD support");
//       }}
//     >
//       {sntWithEnggAndPower}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "ENGG and TRD",
//           filterType: 'sanctioned'
//         });
//         toast.success("Showing sanctioned S&T blocks with ENGG and TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.isSanctioned).length}
//     </td>
//     <td 
//       className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
//       onClick={() => {
//         setDepartmentCountFilter({
//           department: "S&T",
//           supportingDepartment: "ENGG and TRD",
//           filterType: 'availed'
//         });
//         toast.success("Showing availed S&T blocks with ENGG and TRD support");
//       }}
//     >
//       {detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length}
//     </td>
//   </tr>

//   {/* Total Row */}
//   <tr className="bg-[#ff914d] text-white font-bold">
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-[12px] md:text-[16px]" colSpan={3}>Total</td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//       {totalRequested}
//     </td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//       {totalSanctioned}
//     </td>
//     <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
//       {totalAvailed}
//     </td>
//   </tr>
// </tbody>
//   </table>
// </div>


//         </div>
//       </div>

//       {/* === PAGE 2: (B) SUMMARY OF UPCOMING BLOCKS - FULL WIDTH === */}
//       <div className="w-full bg-white flex flex-col py-4">
//         <div className="w-full px-2 md:px-4 flex-1">
//           <div className="my-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
//             <button
//               onClick={handleDownloadUpcomingBlocks}
//               className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base flex items-center"
//               disabled={filteredUpcomingBlocks.length === 0}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-4 w-4 md:h-5 md:w-5 mr-1"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                 />
//               </svg>
//               Download Upcoming Blocks (XLSX)
//             </button>

//             <div className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 shadow border border-green-800 text-[12px] md:text-base">
//               <label className="whitespace-nowrap mr-2 text-[12px] md:text-base">Search ID:</label>
//               <div className="relative">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-3 w-3 md:h-4 md:w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                   />
//                 </svg>
//                 <input
//                   type="text"
//                   value={upcomingDivisionIdSearch}
//                   onChange={(e) => setUpcomingDivisionIdSearch(e.target.value)}
//                   placeholder="Enter ID..."
//                   className="w-24 md:w-40 pl-6 md:pl-8 pr-6 py-1 border border-gray-300 text-black bg-white rounded focus:outline-none focus:ring-1 focus:ring-white text-[12px] md:text-base"
//                 />
//                 {upcomingDivisionIdSearch && (
//                   <button
//                     onClick={() => setUpcomingDivisionIdSearch('')}
//                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-[10px] md:text-sm"
//                   >
//                     ✕
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col md:flex-row w-full items-center gap-2">
//             <div className="bg-[#f1a983] text-[16px] md:text-[24px] font-bold border-2 border-black px-2 py-1 text-center w-full md:w-auto">
//               (B) Summary of Blocks
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="relative inline-block" ref={sectionDropdownRefB}>
//                 <button
//                   onClick={() => setSectionDropdownOpenB((v) => !v)}
//                   className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-[12px] md:text-base min-w-[80px] md:min-w-[100px]"
//                 >
//                   {upcomingSectionFilter === "All" ? "All" : upcomingSectionFilter}
//                   <span className="ml-1">▼</span>
//                 </button>
//                 {sectionDropdownOpenB && (
//                   <div className="absolute z-10 mt-2 w-32 md:w-40 bg-white border-2 border-black rounded shadow-lg max-h-60 overflow-y-auto">
//                     <div
//                       className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[12px] md:text-base"
//                       onClick={() => {
//                         setUpcomingSectionFilter("All");
//                         setSectionDropdownOpenB(false);
//                         setActiveFilter("all")
//                         setActiveSection(null);
//                       }}
//                     >
//                       All
//                     </div>
//                     {sectionOptionsB.map((section: string) => (
//                       <div
//                         key={section}
//                         className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[14px] md:text-[24px]"
//                         onClick={() => {
//                           setUpcomingSectionFilter(section);
//                           setSectionDropdownOpenB(false);
//                         }}
//                       >
//                         {section}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//               <div className="relative inline-block" ref={sseDropdownRef}>
//       <button
//         onClick={() => setSseDropdownOpen((v) => !v)}
//         className="bg-[#B2F3F5] px-3 py-1 rounded-full border-2 border-black font-semibold text-black flex items-center gap-2 text-[12px] md:text-base min-w-[80px] md:min-w-[100px]"
//       >
//         {sseFilter === "All" ? "All SSE" : sseFilter}
//         <span className="ml-1">▼</span>
//       </button>
//       {sseDropdownOpen && (
//         <div className="absolute z-10 mt-2 w-32 md:w-40 bg-white border-2 border-black rounded shadow-lg max-h-60 overflow-y-auto">
//           <div
//             className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[12px] md:text-base"
//             onClick={() => {
//               setSseFilter("All");
//               setSseDropdownOpen(false);
//             }}
//           >
//             All SSE
//           </div>
//           {sseOptions.map((sse: string) => (
//             <div
//               key={sse}
//               className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[14px] md:text-[24px]"
//               onClick={() => {
//                 setSseFilter(sse);
//                 setSseDropdownOpen(false);
//               }}
//             >
//               {sse}
//             </div>
//           ))}
//         </div>
//       )}
 
// </div>
//           </div>

//           <div className="w-full mt-4 overflow-x-auto">
//             <table className="w-full border-2 border-black min-w-[900px] text-[12px] md:text-[20px]">
//               <thead>
//                 <tr className="bg-[#e49edd] text-black text-[12px] md:text-[20px] font-bold">
//                   <th className="border-2 border-black px-1 md:px-2 py-2">S.No</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Date</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Department</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">RequestId</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Block Section</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Depo</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Type</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Activity</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Availed time</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Station ID</th>
//                   <th className="border-2 border-black px-1 md:px-2 py-2">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUpcomingBlocks.length === 0 ? (
//                   <tr className="bg-white">
//                     <td colSpan={9} className="text-center py-4 text-black">
//                       No data found.
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredBlocks.slice(0, 200).map((block: any, idx: number) => {
//                     let statusLabel = "";
//                    let statusStyle = { background: "#fff", color: "#222" };
//                     if (block.overAllStatus==="Sanctioned, Pending with SSE For Acceptance") {
//                       statusLabel = "Sanctioned, Pending with SSE For Acceptance";
//                       statusStyle = { background: "#fff86b", color: "#222" };
//                     }  else if (block.overAllStatus==="Sanctioned and Rejected by SSE") {
//                       statusLabel = "Sanctioned and Accepted by SSE";
//                       statusStyle = { background: "#d47ed4", color: "#222" };
//                     } else if ( block.overAllStatus==="Sanctioned and Rejected by SSE") {
//                       statusLabel = "Sanctioned and Rejected by SSE";
//                       statusStyle = { background: "#ff4e36", color: "#fff" };
//                     } else {
//                       statusLabel = block.overAllStatus || block.Status;
//                     }

//                     const rowBgColor = idx % 2 === 0 ? "bg-white" : "bg-[#f5d0f2]";

//                     return (
//                       <tr key={idx} className={`${rowBgColor} hover:bg-[#F3F3F3]`}>
//                          <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px] text-center">
//                 {idx + 1}
//               </td>
//                         <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
//                           {dayjs(block.Date).format("DD-MM-YY")}
//                         </td>
//                          <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
//                           {block.selectedDepartment}
//                         </td>
//                         <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
//                           <Link
//                             href={`/bo/view-request/${block.id}?from=generate-report`}
//                             className="block w-full h-full"
//                           >
//                             {block.DivisionId}
//                           </Link>
//                         </td>
                        
//                         <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
//                           {block.MissionBlock}
//                         </td>
//                         <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
//                           {block.selectedDepo}
//                         </td>
//                         <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
//                           {block.Type}
//                         </td>
//                         <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
//                           {block.Activity}
//                         </td>
//                         <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
//                           {block.AvailedTimeFrom && block.AvailedTimeTo ? (
//                             <>
//                               {formatTime(block.AvailedTimeFrom)} to{" "}
//                               {formatTime(block.AvailedTimeTo)}
//                             </>
//                           ) : (
//                             "Not Availed Yet"
//                           )}
//                         </td>  
//                         <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
//                           {block.stationId || "N/A"}
//                         </td>
//                         <td
//                           className="border-2 border-black px-1 md:px-2 py-2 font-bold text-center text-black text-[10px] md:text-[14px]"
//                           style={statusStyle}
//                         >
//                           {statusLabel}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* === CENTERED INFO BAR AND NAVIGATION === */}
//         <div className="w-full px-2 md:px-4 flex flex-col items-center justify-center mt-4 md:mt-8 mb-4 space-y-3 md:space-y-4">
//           {/* Centered Info Bar */}
//           <div className="flex items-center gap-2 bg-[#cfd4ff] px-3 md:px-4 py-2 rounded-2xl border-2 max-w-full">
//             <span className="text-[14px] md:text-[24px] font-bold text-black text-center">
//               Click <span className="bg-[#00b347] text-white font-bold px-1 md:px-2 py-1 rounded text-[14px] md:text-[24px] mx-1">RequestId</span> to see further details.
//             </span>
//           </div>
          
//           {/* Centered Back Button */}
//           <div className="flex justify-center">
//             <button
//               className="flex items-center gap-2 bg-[#cfd4ff] border-2 border-black rounded-[50%] px-6 md:px-8 py-2 text-[16px] md:text-[24px] font-bold text-black"
//               onClick={() => router.push("/")}
//             >
//               Back
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // ADDED useSearchParams
import { useGenerateReport } from "@/app/service/query/hq";
import { MajorSection,depot} from "@/app/lib/store";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import formatTime from "@/app/utils/formatTime";
import * as XLSX from "xlsx";

// === LOCALSTORAGE HELPERS ===
const STORAGE_KEY = 'report-data';

const saveReportDataToStorage = (data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      pastBlockSummary: data.pastBlockSummary || [],
      detailedData: data.detailedData || [],
      timestamp: new Date().getTime()
    }));
  }
};

const getReportDataFromStorage = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    }
  }
  return null;
};
// === END LOCALSTORAGE HELPERS ===

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
  sntDisconnectionRequired?: boolean;
  powerBlockRequired?: boolean;
  enggDisconnectionsRequired?: boolean;
  selectedDepartment?: string;
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

// const locationOptions: OptionType[] = [
//   { value: {userLocations}, label: {userLocations} },
//   { value: "SA", label: "SA" },
//   { value: "MCU", label: "MCU" },
//   { value: "TPJ", label: "TPJ" },
//   { value: "PGT", label: "PGT" },
//   { value: "TVC", label: "TVC" },
// ];

const blockTypeOptions: OptionType[] = [
  { value: "All", label: "All" },
  { value: "Corridor", label: "Corridor" },
  { value: "Non-corridor", label: "Outside corridor" },
  { value: "Emergency", label: "Emergency" },
  { value: "Mega", label: "Mega Block" },
];

// Add after your departmentOptions
const globalFilterOptions = {
    workType: {
    'ENGG': [
      { value: "ALL", label: "ALL" },
      { value: "Machine", label: "Machine" },
      { value: "Non-Machine", label: "Non-Machine" },
    ],
    'S&T': [
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
const clearReportDataFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
export default function GenerateReportPage() {
  const searchParams = useSearchParams(); // ADDED
  // const router = useRouter();
    const [upcomingSectionFilter, setUpcomingSectionFilter] = useState<string>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('upcomingSectionFilter') || "All";
  });
  
  // Initialize states from URL parameters
  const [durationFilter, setDurationFilter] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return {
      operator: params.get('durationOperator') || "ALL",
      value: params.get('durationValue') || ""
    };
  });
  
  const [pastBlockSummary, setPastBlockSummary] = useState<PastBlockSummary[]>(
    []
  );
  
  const [activeFilter, setActiveFilter] = useState<"approved" | "granted" | "availed" |"applied" |"demanded"|"notGranted" | "notAvailed" |"all">(() => {
    const params = new URLSearchParams(searchParams);
    return (params.get('activeFilter') as any) || "all";
  });
  
  const [activeSection, setActiveSection] = useState<string | null>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('activeSection') || null;
  });
  
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('locations')?.split(',') || ["All"];
  });
  
  const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('blockTypes')?.split(',') || ["All"];
  });
  
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(() => {
    const params = new URLSearchParams(searchParams);
    // Using session department as fallback
    return params.get('departments')?.split(',') || [];
  });
  
  const [selectedMajorSections, setSelectedMajorSections] = useState<string[]>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('majorSections')?.split(',') || [];
  });
  
  const [majorSectionOptions, setMajorSectionOptions] = useState<OptionType[]>(
    []
  );
  
  const [upcomingDivisionIdSearch, setUpcomingDivisionIdSearch] = useState<string>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('divisionIdSearch') || "";
  });
  
  const [sseFilter, setSseFilter] = useState(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('sseFilter') || "All";
  });
  
  const [sseDropdownOpen, setSseDropdownOpen] = useState(false);
  
  // Add after your existing state variables
  const [globalWorkTypeFilter, setGlobalWorkTypeFilter] = useState<string>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('globalWorkType') || "ALL";
  });
  
  const [globalActivityFilter, setGlobalActivityFilter] = useState<string>(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('globalActivity') || "ALL";
  });

  // Dropdown visibility states
  const [showGlobalWorkTypeDropdown, setShowGlobalWorkTypeDropdown] = useState(false);
  const [showGlobalActivityDropdown, setShowGlobalActivityDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  
  const [departmentCountFilter, setDepartmentCountFilter] = useState<{
    department: string;
    supportingDepartment: string;
    filterType: 'requested' | 'sanctioned' | 'availed';
  } | null>(() => {
    const params = new URLSearchParams(searchParams);
    const deptFilter = params.get('deptFilter');
    if (!deptFilter) return null;
    
    try {
      return JSON.parse(deptFilter);
    } catch {
      return null;
    }
  });
  
  const durationDropdownRef = useRef<HTMLDivElement>(null);

  // Refs for dropdowns
  const globalWorkTypeDropdownRef = useRef<HTMLDivElement>(null);
  const globalActivityDropdownRef = useRef<HTMLDivElement>(null);
  const sseDropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  
  // Add scroll function
  const scrollToUpcomingBlocks = () => {
    const upcomingBlocksTable = document.getElementById('upcoming-blocks-table');
    if (upcomingBlocksTable) {
      upcomingBlocksTable.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue, // ADDED for setting form values from URL
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { // ADDED: Initialize form values from URL
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
    }
  });
  
  const { data: session } = useSession();
const userLocations = session?.user?.location ;

  // Parameters for the query
  const [queryParams, setQueryParams] = useState({
    startDate: "",
    endDate: "",
    majorSections: [] as string[],
    department: [] as string[],
    blockType: ["All"],
    globalWorkType: "ALL",
    globalActivity: "ALL", 
    durationOperator: "ALL",
    durationValue: "",
  });

  // URL Persistence Effect - ADD THIS
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedDepartments.length > 0) {
      params.set('departments', selectedDepartments.join(','));
    }
    
    if (selectedBlockTypes.length > 0) {
      params.set('blockTypes', selectedBlockTypes.join(','));
    }
    
    if (selectedMajorSections.length > 0) {
      params.set('majorSections', selectedMajorSections.join(','));
    }
    
    if (selectedLocations.length > 0) {
      params.set('locations', selectedLocations.join(','));
    }
    
    const startDate = watch("startDate");
    const endDate = watch("endDate");
    
    if (startDate) {
      params.set('startDate', startDate);
    }
    
    if (endDate) {
      params.set('endDate', endDate);
    }
    
    if (globalWorkTypeFilter && globalWorkTypeFilter !== "ALL") {
      params.set('globalWorkType', globalWorkTypeFilter);
    }
    
    if (globalActivityFilter && globalActivityFilter !== "ALL") {
      params.set('globalActivity', globalActivityFilter);
    }
    
    if (durationFilter.operator && durationFilter.operator !== "ALL") {
      params.set('durationOperator', durationFilter.operator);
    }
    
    if (durationFilter.value) {
      params.set('durationValue', durationFilter.value);
    }

    // Add filter states to URL
    if (activeFilter && activeFilter !== "all") {
      params.set('activeFilter', activeFilter);
    }
    
    if (activeSection) {
      params.set('activeSection', activeSection);
    }

    if (upcomingSectionFilter && upcomingSectionFilter !== "All") {
      params.set('upcomingSectionFilter', upcomingSectionFilter);
    }

    if (upcomingDivisionIdSearch) {
      params.set('divisionIdSearch', upcomingDivisionIdSearch);
    }

    if (sseFilter && sseFilter !== "All") {
      params.set('sseFilter', sseFilter);
    }
    
    if (departmentCountFilter) {
      params.set('deptFilter', JSON.stringify(departmentCountFilter));
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [
    selectedDepartments, 
    selectedBlockTypes, 
    selectedMajorSections, 
    selectedLocations,
    watch("startDate"), 
    watch("endDate"),
    globalWorkTypeFilter,
    globalActivityFilter,
    durationFilter,
    activeFilter,
    activeSection,
    upcomingSectionFilter,
    upcomingDivisionIdSearch,
    sseFilter,
    departmentCountFilter
  ]);

  // Get user's location and department from session and set up major section options
useEffect(() => {
  if (session?.user?.location) {
    const userLocation = session.user.location;
    const userDepot = session?.user?.depot;
    const userDept = session?.user?.department ?? "";

    setSelectedLocations([userLocation]);

    // Set up major section options based on user's location and depot
    if (MajorSection[userLocation as keyof typeof MajorSection]) {
      const locationSections = MajorSection[userLocation as keyof typeof MajorSection];
      
      // Filter sections based on depot - modified logic to handle multiple depots
      const filteredSections = userDepot === "OVERALL" 
        ? locationSections 
        : locationSections.filter((section) => {
            const depotData: any = depot[section as keyof typeof depot];
            if (!depotData) return false;
            if (!(userDept in depotData)) return false;
            
            // Get all depots for this section and department
            const sectionDepots = depotData[userDept];
            
            if (userDepot.includes(',')) {
              const userDepots = userDepot.split(',').map(d => d.trim());
              return userDepots.some(depot => sectionDepots.includes(depot));
            }
            
            // For single depot, check inclusion
            return sectionDepots.includes(userDepot);
          });

      const options = filteredSections.map((section) => ({
        value: section,
        label: section,
      }));
      
      setMajorSectionOptions([{ value: "All", label: "All" }, ...options]);
    }
  }

  // Set department from session
  if (session?.user?.department) {
    const userDepartment = session.user.department;
    setSelectedDepartments([userDepartment]);
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
    refetch,
  } = useGenerateReport(queryParams);

  // === AUTO-LOAD FROM LOCALSTORAGE ===
  useEffect(() => {
    const storedData = getReportDataFromStorage();
    if (storedData) {
      if (storedData.pastBlockSummary && storedData.pastBlockSummary.length > 0) {
        setPastBlockSummary(storedData.pastBlockSummary);
      }
      setReportGenerated(true);
      console.log("Loaded data from localStorage");
    }
  }, []);

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
      const detailedData = reportData.data.detailedData || [];
      
      setPastBlockSummary(pastData);
      
      saveReportDataToStorage(reportData.data);
      
      console.log("Set pastBlockSummary to:", pastData);
      console.log("Saved data to localStorage");

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

  // Add department toggle function (removed in original, but needed for URL persistence)
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


  // === DATA SOURCE WITH LOCALSTORAGE FALLBACK ===
  const detailedData: DetailedData[] = (() => {
    if (reportData?.data?.detailedData) {
      return reportData.data.detailedData;
    }
    
    const storedData = getReportDataFromStorage();
    if (storedData && storedData.detailedData) {
      return storedData.detailedData;
    }
    
    return [];
  })();

  const sectionOptionsB: string[] = Array.from(
    new Set(detailedData.map((b: DetailedData) => b.Section) || [])
  );

const filterBlocksByDepartmentCount = (block: any): boolean => {
  if (!departmentCountFilter) return true;
  
  const { department, supportingDepartment, filterType } = departmentCountFilter;
  
  // Base department filter
  if (block.selectedDepartment !== department) return false;
  
  // Supporting department filters - MATCHING YOUR COUNTING LOGIC EXACTLY
  if (supportingDepartment === "-") {
    // No supporting department - only blocks that don't require any support
    if (department === "ENGG" && (block.sntDisconnectionRequired || block.powerBlockRequired)) return false;
    if (department === "S&T" && (block.enggDisconnectionsRequired || block.powerBlockRequired)) return false;
    // TRD doesn't have supporting departments, so all TRD blocks pass
  } else if (supportingDepartment === "S&T") {
    // ENGG + S&T - matches your enggWithSnt counting
    if (!block.sntDisconnectionRequired) return false;
    if (block.powerBlockRequired) return false; // Matches: enggWithSnt excludes powerBlockRequired
  } else if (supportingDepartment === "TRD") {
    if (department === "ENGG") {
      // ENGG + TRD - matches your enggWithPower counting
      if (!block.powerBlockRequired) return false;
      if (block.sntDisconnectionRequired) return false; // Matches: enggWithPower excludes sntDisconnectionRequired
    } else if (department === "S&T") {
      // S&T + TRD - matches your sntWithPower counting
      if (!block.powerBlockRequired) return false;
      if (block.enggDisconnectionsRequired) return false; // Matches: sntWithPower excludes enggDisconnectionsRequired
    }
  } else if (supportingDepartment === "ENGG") {
    // S&T + ENGG - matches your sntWithEngg counting
    if (!block.enggDisconnectionsRequired) return false;
    if (block.powerBlockRequired) return false; // Matches: sntWithEngg excludes powerBlockRequired
  } else if (supportingDepartment === "S&T and TRD") {
    // ENGG + S&T + TRD - matches your enggWithSntAndPower counting
    if (!block.sntDisconnectionRequired || !block.powerBlockRequired) return false;
  } else if (supportingDepartment === "ENGG and TRD") {
    // S&T + ENGG + TRD - matches your sntWithEnggAndPower counting
    if (!block.enggDisconnectionsRequired || !block.powerBlockRequired) return false;
  }
  
  // Filter type conditions
  switch (filterType) {
    case 'requested':
      return true;
    case 'sanctioned':
      return block.isSanctioned === true;
    case 'availed':
      return block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null;
    default:
      return true;
  }
};

const filteredUpcomingBlocks: DetailedData[] = (
  upcomingSectionFilter === "All"
    ? detailedData
    : detailedData.filter(
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

// Use the same data source for both tables
// const detailedData: DetailedData[] = detailedData;

// ENGG counts
const enggTotal = detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === false && block.powerBlockRequired === false).length;
const enggWithSnt = detailedData.filter(block => 
  block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true&&block.powerBlockRequired === false
).length;
const enggWithPower = detailedData.filter(block => 
  block.selectedDepartment === "ENGG" && block.powerBlockRequired === true&& block.sntDisconnectionRequired === false
).length;
const enggWithSntAndPower = detailedData.filter(block => 
  block.selectedDepartment === "ENGG" && 
  block.sntDisconnectionRequired === true && 
  block.powerBlockRequired === true
).length;

// S&T counts
const sntTotal = detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === false && block.powerBlockRequired === false).length;
const sntWithPower = detailedData.filter(block => 
  block.selectedDepartment === "S&T" && block.powerBlockRequired === true&&block.enggDisconnectionsRequired === false
).length;
const sntWithEngg = detailedData.filter(block => 
  block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true&&block.powerBlockRequired === false
).length;
const sntWithEnggAndPower = detailedData.filter(block => 
  block.selectedDepartment === "S&T" && 
  block.enggDisconnectionsRequired === true && 
  block.powerBlockRequired === true
).length;

// TRD counts
const trdTotal = detailedData.filter(block => block.selectedDepartment === "TRD").length;

// Total counts for the bottom row
const totalRequested = detailedData.length;
const totalSanctioned = detailedData.filter(block => block.isSanctioned === true).length;
const totalAvailed = detailedData.filter(block => block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length;

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
    if (!filterBlocksByDepartmentCount(block)) return false;
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

  const upcomingBlocks: DetailedData[] = detailedData;

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
  // const handleDownloadUpcomingBlocks = () => {
  //   try {
  //     if (filteredUpcomingBlocks.length === 0) {
  //       toast.error("No data available to download");
  //       return;
  //     }

  //     const excelData = filteredUpcomingBlocks.map((block: any) => {
  //       // Status logic
  //       let statusLabel = "";
  //       if (block.Status === "APPROVED") {
  //         statusLabel = "Pending with Optg";
  //       } else if (block.Status === "PENDING") {
  //         statusLabel = "Pending with dept control";
  //       } else if (block.Status === "REJECTED") {
  //         statusLabel = "Returned by Optg";
  //       } else {
  //         statusLabel = block.Status;
  //       }

  //       return {
  //         Date: formatDateB(block.Date),
  //         "Request ID": block.DivisionId || "N/A",
  //         "Station ID": block.stationId || "N/A",
  //         "Block Section": block.MissionBlock || "N/A",
  //         Type: block.Type || "N/A",
  //         Duration: block.Duration,
  //         Activity: block.Activity || "N/A",
  //         Depo:block.selectedDepo||"N/A",
  //         "Availed Time":
  //           block.AvailedTimeFrom && block.AvailedTimeTo
  //             ? `${formatTime(block.AvailedTimeFrom)} to ${formatTime(
  //               block.AvailedTimeTo
  //             )}`
  //             : "Not Available",
  //         Status: statusLabel,
  //       };
  //     });

  //     const workbook = XLSX.utils.book_new();
  //     const worksheet = XLSX.utils.json_to_sheet(excelData);

  //     // Add title before the data
  //     XLSX.utils.sheet_add_aoa(
  //       worksheet,
  //       [
  //         [`(B) Summary of Upcoming Blocks`],
  //         [], // Empty row for spacing
  //       ],
  //       { origin: "A1" }
  //     );

  //     // Adjust column widths
  //     const colWidths = [
  //       { wch: 12 }, // Date
  //       { wch: 10 }, // ID
  //       { wch: 10 }, // Station ID
  //       { wch: 20 }, // Block Section
  //       { wch: 12 }, // Type
  //       { wch: 30 }, // Activity
  //       { wch: 20 }, // Demand Time
  //       { wch: 20 }, // Sanctioned Time
  //       { wch: 20 }, // Availed Time
  //       { wch: 20 }, // Status
  //     ];
  //     worksheet["!cols"] = colWidths;

  //     XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming Blocks");

  //     const excelBuffer = XLSX.write(workbook, {
  //       bookType: "xlsx",
  //       type: "array",
  //     });
  //     const blob = new Blob([excelBuffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `upcoming_blocks_${format(
  //       new Date(),
  //       "dd-MM-yyyy"
  //     )}.xlsx`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //     toast.success("Upcoming blocks data downloaded successfully");
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     toast.error("Failed to download Excel file. Please try again.");
  //   }
  // };
const handleDownloadUpcomingBlocks = () => {
  try {
    const dataToDownload = filteredBlocks;

    if (dataToDownload.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const excelData = dataToDownload.map((block: any) => {
      let statusLabel = "";
      if (block.overAllStatus === "Sanctioned, Pending with SSE For Acceptance") {
        statusLabel = "Sanctioned, Pending with SSE For Acceptance";
      } else if (block.overAllStatus === "Sanctioned and Accepted by SSE") {
        statusLabel = "Sanctioned and Accepted by SSE";
      } else if (block.overAllStatus === "Sanctioned and Rejected by SSE") {
        statusLabel = "Sanctioned and Rejected by SSE";
      } else {
        statusLabel = block.overAllStatus || block.Status;
      }

      return {
        "Request ID": block.DivisionId || "N/A",
        "Date": block.Date ? dayjs(block.Date).format("DD-MM-YY") : "N/A",
        "Department": block.selectedDepartment || "N/A",
        "Block Section": block.MissionBlock || "N/A",
        "Depo": block.selectedDepo || "N/A",
        "Type": block.Type || "N/A",
        "Activity": block.Activity || "N/A",
        "Demanded Time": block.DemandedTimeFrom && block.DemandedTimeTo
          ? `${formatTime(block.DemandedTimeFrom)} to ${formatTime(block.DemandedTimeTo)}`
          : "Not Available",
        "Sanctioned Time": block.SanctionedTimeFrom && block.SanctionedTimeTo
          ? `${formatTime(block.SanctionedTimeFrom)} to ${formatTime(block.SanctionedTimeTo)}`
          : "Not Available",
        "Availed Time": block.AvailedTimeFrom && block.AvailedTimeTo
          ? `${formatTime(block.AvailedTimeFrom)} to ${formatTime(block.AvailedTimeTo)}`
          : "Not Available",
        "Status": statusLabel,
        "Station ID": block.stationId || "N/A",
        "Duration": block.Duration || "N/A",
        "Section": block.Section || "N/A",
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Column widths (keep)
    worksheet["!cols"] = [
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 12 },
      { wch: 12 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
      { wch: 35 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Blocks");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    let filename = "blocks";

    link.download = `${filename}_${format(new Date(), "dd-MM-yyyy")}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloaded ${dataToDownload.length} records`);
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download Excel file. Please try again.");
  }
};
  // Get unique SSE names from your data
const sseOptions = [...new Set(
  detailedData
    ?.map((item: any) => item.userName)
    .filter(Boolean) // Remove null/undefined
)].sort();

const handleDownloadDepartmentCount = () => {
  try {
    if (detailedData.length === 0) { // Changed from countBlock to detailedData
      toast.error("No data available to download");
      return;
    }

    // Prepare the Excel data matching your table structure
    const excelData = [
      // ENGG Rows
      {
        "Location": {userLocations},
        "Department": "ENGG",
        "Supporting Department": "-",
        "Total Block Requested": enggTotal,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.isSanctioned).length,
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null).length
      },
      {
        "Location": {userLocations},
        "Department": "ENGG",
        "Supporting Department": "S&T",
        "Total Block Requested": enggWithSnt,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.isSanctioned),
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": {userLocations},
        "Department": "ENGG",
        "Supporting Department": "TRD",
        "Total Block Requested": enggWithPower,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": {userLocations},
        "Department": "ENGG",
        "Supporting Department": "S&T and TRD",
        "Total Block Requested": enggWithSntAndPower,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "ENGG" && block.sntDisconnectionRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      
      // TRD Rows
      {
        "Location": {userLocations},
        "Department": "TRD",
        "Supporting Department": "-",
        "Total Block Requested": trdTotal,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "TRD" && block.isSanctioned),
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "TRD" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      
      // S&T Rows
      {
        "Location": {userLocations},
        "Department": "S&T",
        "Supporting Department": "-",
        "Total Block Requested": sntTotal,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.isSanctioned),
        "Total Block Availed":detailedData.filter(block => block.selectedDepartment === "S&T" && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": {userLocations},
        "Department": "S&T",
        "Supporting Department": "ENGG",
        "Total Block Requested": sntWithEngg,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.isSanctioned),
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": {userLocations},
        "Department": "S&T",
        "Supporting Department": "TRD",
        "Total Block Requested": sntWithPower,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "S&T" && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
      },
      {
        "Location": {userLocations},
        "Department": "S&T",
        "Supporting Department": "ENGG and TRD",
        "Total Block Requested": sntWithEnggAndPower,
        "Total Block Sanctioned": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.isSanctioned),
        "Total Block Availed": detailedData.filter(block => block.selectedDepartment === "S&T" && block.enggDisconnectionsRequired === true && block.powerBlockRequired === true && block.AvailedTimeFrom !== null && block.AvailedTimeTo !== null)
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

  // Add helper function for department filter clicks
  const handleDepartmentFilterClick = (
    department: string, 
    supportingDepartment: string, 
    filterType: 'requested' | 'sanctioned' | 'availed'
  ) => {
    setDepartmentCountFilter({
      department,
      supportingDepartment,
      filterType
    });
    setActiveFilter("all"); // Reset status filter
    setActiveSection(null); // Reset section filter
    scrollToUpcomingBlocks();
    toast.success(`Showing ${filterType} ${department} blocks${supportingDepartment !== "-" ? ` with ${supportingDepartment} support` : ''}`);
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
            {session?.user?.role === "BRANCH_OFFICER" ? "BRANCH OFFICER" : 
   session?.user?.role === "JUNIOR_OFFICER" ? "JUNIOR OFFICER" :
   session?.user?.role === "SENIOR_OFFICER" ? "SENIOR OFFICER" :
   "OFFICER"}
        </span>
        <span className="text-[16px] md:text-[24px] font-bold text-black">BLOCK SUMMARY REPORT(Granted/Availed/Pending)</span>
        <div className="mt-2 bg-[#7be09b] px-4 md:px-6 py-1 rounded-2xl">
          <span className="text-[16px] md:text-[24px] font-bold text-white">
            DEPT:{session?.user?.department} 
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

      {/* Department Display (from session) */}
      <div className="w-full max-w-screen-lg flex flex-wrap justify-center gap-2 mb-2 px-2">
        <div className={`rounded-full px-2 py-1 text-[12px] md:text-[24px] font-semibold border flex items-center gap-1
          ${
            session?.user?.department === "Engineering"
              ? "bg-[#e49edd] border-[#b07be0] text-black"
              : session?.user?.department === "ST"
              ? "bg-[#fff35c] border-[#e0e0e0] text-black"
              : "bg-[#c7f7c7] border-[#7be09b] text-black"
          }`}
        >
          <span className="text-green-600 font-bold">✔</span>
          {session?.user?.department}
        </div>
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
                  {/* <th className="border-2 border-black px-1 md:px-2 py-2">Demanded (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Approved (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Applied (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Granted (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">% Granted</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Availed (Hrs)/Blocks</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">% Availed</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Not Granted</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Not Availed</th> */}
                                    <th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    {/* First line */}
    <div>Demanded</div>
    
    {/* Second line with icon */}
    <div className="relative flex items-center justify-center group">
      (Hrs)/Blocks
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      
      {/* Tooltip */}
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        Blocks demanded by SSE/JE
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>Approved</div>
    <div className="relative flex items-center justify-center group">
      (Hrs)/Blocks
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        Blocks Sanctioned by the Traffic controller
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>Applied</div>
    <div className="relative flex items-center justify-center group">
      (Hrs)/Blocks
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
         Sanctioned blocks applied to a SM in block avail at site
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>Granted</div>
    <div className="relative flex items-center justify-center group">
      (Hrs)/Blocks
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        Applied block Granted  by the station master
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>% Granted</div>
    <div className="relative flex items-center justify-center group">
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
       Total blocks granted / total blocks availed
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>Availed</div>
    <div className="relative flex items-center justify-center group">
      (Hrs)/Blocks
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        Grated blocks availed and closed by the SSE/JE
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>% Availed</div>
    <div className="relative flex items-center justify-center group">
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
         Total blocks availed by total blocks granted
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>Not Granted</div>
    <div className="relative flex items-center justify-center group">
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        Sanctioned blocks applied by SSE/JE but rejected by the station master
      </div>
    </div>
  </div>
</th>

<th className="border-2 border-black px-1 md:px-2 py-2">
  <div className="flex flex-col items-center justify-center">
    <div>Not Availed</div>
    <div className="relative flex items-center justify-center group">
      <span className="inline-flex items-center justify-center ml-1 mt-1 w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded-full cursor-help">
        i
      </span>
      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
        Blocks rejected by SSE/JE after approved or granted
      </div>
    </div>
  </div>
</th>

                </tr>
              </thead>
              <tbody>
                {pastBlockSummary.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-black">
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
    setDepartmentCountFilter(null);
    scrollToUpcomingBlocks(); 
  }}
                      >
                        {summary.Demanded.toFixed(2)} / {summary.DemandsCount}
                      </td>
                      <td
                        className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                        onClick={() => {
                          setActiveFilter("approved");
                          setActiveSection(summary.Department || summary.Section);
                          setDepartmentCountFilter(null);
                          scrollToUpcomingBlocks();
                        }}
                      >
                        {summary.Approved.toFixed(2)} / {summary.ApprovedCount}
                      </td>
                      <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                         onClick={() => {
                          setActiveFilter("applied");
                          setActiveSection(summary.Department || summary.Section);
                          setDepartmentCountFilter(null);
                          scrollToUpcomingBlocks();
                        }}
                      >
                        {summary.Applied.toFixed(2)} /{summary.AppliedCount}
                      </td>
                      <td
                        className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                        onClick={() => {
                          setActiveFilter("granted");
                          setActiveSection(summary.Department || summary.Section);
                          setDepartmentCountFilter(null);
                          scrollToUpcomingBlocks();
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
                          setDepartmentCountFilter(null);
                          scrollToUpcomingBlocks();
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
    setActiveFilter("notGranted");
    setActiveSection(summary.Department || summary.Section);
    setDepartmentCountFilter(null);
    scrollToUpcomingBlocks();
    toast.success(`Viewing Not Granted for: ${summary.Department || summary.Section}`);
  }}
>
  {summary.NotGrantedCount}
</td>
<td
  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
  onClick={() => {
    setActiveFilter("notAvailed");
    setActiveSection(summary.Department || summary.Section);
    setDepartmentCountFilter(null);
    scrollToUpcomingBlocks();
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
                    <td   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"

                         onClick={() => {
        setActiveFilter("demanded");
        setActiveSection(null);
        setDepartmentCountFilter(null);
        scrollToUpcomingBlocks();
      }}
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
                    <td   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                         onClick={() => {
        setActiveFilter("approved");
        setActiveSection(null);
        setDepartmentCountFilter(null);
        scrollToUpcomingBlocks();
      }}>
                      {pastBlockSummary
                        .reduce((sum, item) => sum + (item.Approved || 0), 0)
                        .toFixed(2)}{" "}
                      /{" "}
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.ApprovedCount || 0),
                        0
                      )}
                    </td>
                    <td   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                       onClick={() => {
        setActiveFilter("applied");
        setActiveSection(null);
        setDepartmentCountFilter(null);
        scrollToUpcomingBlocks();
      }}>
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.Applied || 0),
                        0
                      ).toFixed(2)} /{" "}
                      {pastBlockSummary.reduce(
                        (sum, item) => sum + (item.AppliedCount || 0),
                        0
                      )}
                    </td>
                    <td   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                        onClick={() => {
        setActiveFilter("granted");
        setActiveSection(null);
        setDepartmentCountFilter(null);
        scrollToUpcomingBlocks();
      }}>
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
                    
                    <td   className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px]"
                       onClick={() => {
        setActiveFilter("availed");
        setActiveSection(null);
        setDepartmentCountFilter(null);
        scrollToUpcomingBlocks();
      }}>
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
    setActiveSection(null);
    setDepartmentCountFilter(null);
    scrollToUpcomingBlocks();
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
    setActiveSection(null);
    setDepartmentCountFilter(null);
    scrollToUpcomingBlocks();
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
    disabled={detailedData.length === 0}
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
  {/* Department Count Filter Display */}
{departmentCountFilter && (
  <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 my-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="bg-blue-100 border border-blue-300 px-4 py-2 rounded-lg">
      <span className="text-blue-700 font-bold text-sm md:text-base">
        Filtering: {departmentCountFilter.department} 
        {departmentCountFilter.supportingDepartment !== "-" ? ` + ${departmentCountFilter.supportingDepartment}` : ''} 
        ({departmentCountFilter.filterType.toUpperCase()})
      </span>
    </div>
    <button
      onClick={() => setDepartmentCountFilter(null)}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
    >
      <span>✕</span>
      Clear Department Filter
    </button>
  </div>
)}
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
              {session?.user?.department === "ENGG" &&( <tr className="bg-white font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  ENGG
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  -
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "-",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested ENGG blocks (no supporting departments)"
                    );
                  }}
                >
                  {enggTotal}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "-",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned ENGG blocks (no supporting departments)"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.isSanctioned &&
                        block.powerBlockRequired === false &&
                        block.sntDisconnectionRequired === false
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "-",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed ENGG blocks (no supporting departments)"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null &&
                        block.powerBlockRequired === false &&
                        block.sntDisconnectionRequired === false
                    ).length
                  }
                </td>
              </tr>)}
             
{session?.user?.department === "ENGG" && ( <tr className="bg-[#f4dcf1] font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  ENGG
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  S&T
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "S&T",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested ENGG blocks with S&T support"
                    );
                  }}
                >
                  {enggWithSnt}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "S&T",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned ENGG blocks with S&T support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.sntDisconnectionRequired === true &&
                        block.isSanctioned &&
                        block.powerBlockRequired === false &&
                        block.enggDisconnectionsRequired === false
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "S&T",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed ENGG blocks with S&T support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.sntDisconnectionRequired === true &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null &&
                        block.powerBlockRequired === false &&
                        block.enggDisconnectionsRequired === false
                    ).length
                  }
                </td>
              </tr>)}
             
{session?.user?.department === "ENGG" && (
     <tr className="bg-white font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  ENGG
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  TRD
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "TRD",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested ENGG blocks with TRD support"
                    );
                  }}
                >
                  {enggWithPower}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "TRD",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned ENGG blocks with TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.powerBlockRequired === true &&block.sntDisconnectionRequired === false&&
                        block.isSanctioned
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "TRD",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed ENGG blocks with TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.powerBlockRequired === true &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null&&block.sntDisconnectionRequired === false
                    ).length
                  }
                </td>
              </tr>
)}
           
{session?.user?.department === "ENGG" && (
    <tr className="bg-[#f4dcf1] font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  ENGG
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  S&T and TRD
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "S&T and TRD",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested ENGG blocks with S&T and TRD support"
                    );
                  }}
                >
                  {enggWithSntAndPower}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "S&T and TRD",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned ENGG blocks with S&T and TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.sntDisconnectionRequired === true &&
                        block.powerBlockRequired === true &&
                        block.isSanctioned
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "ENGG",
                      supportingDepartment: "S&T and TRD",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed ENGG blocks with S&T and TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "ENGG" &&
                        block.sntDisconnectionRequired === true &&
                        block.powerBlockRequired === true &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null
                    ).length
                  }
                </td>
              </tr>
)}
            {session?.user?.department === "TRD" && (
              <tr className="bg-white font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  TRD
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  -
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "TRD",
                      supportingDepartment: "-",
                      filterType: "requested",
                    });
                    toast.success("Showing requested TRD blocks");
                  }}
                >
                  {trdTotal}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "TRD",
                      supportingDepartment: "-",
                      filterType: "sanctioned",
                    });
                    toast.success("Showing sanctioned TRD blocks");
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "TRD" && block.isSanctioned
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "TRD",
                      supportingDepartment: "-",
                      filterType: "availed",
                    });
                    toast.success("Showing availed TRD blocks");
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "TRD" &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null
                    ).length
                  }
                </td>
              </tr>
            )}

             
              

              {/* S&T Rows */}
              {session?.user?.department === "S&T" && (  <tr className="bg-[#f4dcf1] font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  S&T
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  -
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "-",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested S&T blocks (no supporting departments)"
                    );
                  }}
                >
                  {sntTotal}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "-",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned S&T blocks (no supporting departments)"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" && block.isSanctioned
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "-",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed S&T blocks (no supporting departments)"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null
                    ).length
                  }
                </td>
              </tr>)}
            
{session?.user?.department === "S&T" && ( <tr className="bg-white font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  S&T
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  ENGG
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "ENGG",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested S&T blocks with ENGG support"
                    );
                  }}
                >
                  {sntWithEngg}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "ENGG",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned S&T blocks with ENGG support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" &&
                        block.enggDisconnectionsRequired === true &&
                        block.isSanctioned
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "ENGG",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed S&T blocks with ENGG support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" &&
                        block.enggDisconnectionsRequired === true &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null
                    ).length
                  }
                </td>
              </tr>)}
             
{session?.user?.department === "S&T" && (<tr className="bg-[#f4dcf1] font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  S&T
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  TRD
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "TRD",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested S&T blocks with TRD support"
                    );
                  }}
                >
                  {sntWithPower}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "TRD",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned S&T blocks with TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" &&
                        block.powerBlockRequired === true &&
                        block.isSanctioned
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "TRD",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed S&T blocks with TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" &&
                        block.powerBlockRequired === true &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null
                    ).length
                  }
                </td>
              </tr>)}
              
{session?.user?.department === "S&T" && ( <tr className="bg-white font-bold">
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  {userLocations}
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  S&T
                </td>
                <td className="border-2 border-black px-1 md:px-2 py-2 text-center text-black text-[12px] md:text-[16px]">
                  ENGG and TRD
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "ENGG and TRD",
                      filterType: "requested",
                    });
                    toast.success(
                      "Showing requested S&T blocks with ENGG and TRD support"
                    );
                  }}
                >
                  {sntWithEnggAndPower}
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "ENGG and TRD",
                      filterType: "sanctioned",
                    });
                    toast.success(
                      "Showing sanctioned S&T blocks with ENGG and TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" &&
                        block.enggDisconnectionsRequired === true &&
                        block.powerBlockRequired === true &&
                        block.isSanctioned
                    ).length
                  }
                </td>
                <td
                  className="border-2 border-black px-1 md:px-2 py-2 text-center text-blue-600 underline cursor-pointer text-[12px] md:text-[16px] hover:bg-blue-50"
                  onClick={() => {
                    setDepartmentCountFilter({
                      department: "S&T",
                      supportingDepartment: "ENGG and TRD",
                      filterType: "availed",
                    });
                    toast.success(
                      "Showing availed S&T blocks with ENGG and TRD support"
                    );
                  }}
                >
                  {
                    detailedData.filter(
                      (block) =>
                        block.selectedDepartment === "S&T" &&
                        block.enggDisconnectionsRequired === true &&
                        block.powerBlockRequired === true &&
                        block.AvailedTimeFrom !== null &&
                        block.AvailedTimeTo !== null
                    ).length
                  }
                </td>
              </tr>)}

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
      <div className="w-full bg-white flex flex-col py-4" id="upcoming-blocks-table">
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

          <div className="w-full mt-4 overflow-x-auto" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <table className="w-full border-2 border-black min-w-[900px] text-[12px] md:text-[20px]">
              <thead className="sticky top-0 z-10">
                    <tr className="bg-[#e49edd] text-black text-[12px] md:text-[20px] font-bold">
                  <th className="border-2 border-black px-1 md:px-2 py-2">S.No</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">RequestId</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Date</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Department</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Block Section</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Depo</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Type</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Activity</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Demanded time</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Sanctioned time</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Availed time</th>
                  <th className="border-2 border-black px-1 md:px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcomingBlocks.length === 0 ? (
                  <tr className="bg-white">
                    <td colSpan={11} className="text-center py-4 text-black">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((block: any, idx: number) => {
                    let statusLabel = "";
                  let statusStyle = { background: "#fff", color: "#222" };
                    if (block.overAllStatus==="Sanctioned, Pending with SSE For Acceptance") {
                      statusLabel = "Sanctioned, Pending with SSE For Acceptance";
                      statusStyle = { background: "#fff86b", color: "#222" };
                    }  else if (block.overAllStatus==="Sanctioned and Rejected by SSE") {
                      statusLabel = "Sanctioned and Accepted by SSE";
                      statusStyle = { background: "#d47ed4", color: "#222" };
                    } else if ( block.overAllStatus==="Sanctioned and Rejected by SSE") {
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
                <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
                          <Link
                            href={`/manage/view-request/${block.id}?from=blocks-summary`}
                            className="block w-full h-full"
                          >
                            {block.DivisionId}
                          </Link>
                        </td>
                        <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
                          {dayjs(block.Date).format("DD-MM-YY")}
                        </td>
                         <td className="border-2 border-black px-1 md:px-2 py-2 font-bold text-black text-[10px] md:text-[14px]">
                          {block.selectedDepartment}
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
                                                  {block.DemandedTimeFrom && block.DemandedTimeTo ? (
                                                    <>
                                                      {formatTime(block.DemandedTimeFrom)} to{" "}
                                                      {formatTime(block.DemandedTimeTo)}
                                                    </>
                                                  ) : (
                                                    "Not Availed Yet"
                                                  )}
                                                </td> 
                                                          <td className="border-2 border-black px-1 md:px-2 py-2 text-black text-[10px] md:text-[14px]">
                                                  {block.SanctionedTimeFrom && block.SanctionedTimeTo ? (
                                                    <>
                                                      {formatTime(block.SanctionedTimeFrom)} to{" "}
                                                      {formatTime(block.SanctionedTimeTo)}
                                                    </>
                                                  ) : (
                                                    "Not Availed Yet"
                                                  )}
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
                            onClick={() => {
    clearReportDataFromStorage(); // Clear localStorage
    router.push("/"); // Navigate
  }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}