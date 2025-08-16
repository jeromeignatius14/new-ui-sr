"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MajorSection } from "@/app/lib/store";
import { useSession, signOut } from "next-auth/react";
import { managerService, UserRequest } from "@/app/service/api/manager";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

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
  
  // Missing state variables for the summary section
  const [pendingSummaryFilters, setPendingSummaryFilters] = useState({
    start: '',
    end: '',
    blockType: [] as string[],
    section: [] as string[],
    dept: ''
  });
  const [showTable, setShowTable] = useState(false);
  const [sanctionedRequests, setSanctionedRequests] = useState<UserRequest[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [blockTypeDropdownOpen, setBlockTypeDropdownOpen] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  
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

  // Use manager service to get user requests data
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await managerService.getUserRequestsByManager(1, 1000, queryParams.startDate, queryParams.endDate);
      setReportData({ data: { detailedData: response.data.requests } });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

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

      // Update query parameters
      setQueryParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        majorSections: selectedMajorSections,
        department: selectedDepartments,
        blockType: selectedBlockTypes,
      });

      // Trigger the data fetch
      await fetchReportData();
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
      reportData?.data?.detailedData?.map((b: DetailedData) => b.Section) || []
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

  // Missing handler functions
  const handlePendingDateChange = (type: 'start' | 'end', value: string) => {
    setPendingSummaryFilters(prev => ({ ...prev, [type]: value }));
  };

  const handlePendingBlockTypeChange = (value: string) => {
    if (value === 'ALL') {
      const allTypes = blockTypeOptions.slice(1).map(opt => opt.value);
      setPendingSummaryFilters(prev => ({ ...prev, blockType: allTypes }));
    } else {
      setPendingSummaryFilters(prev => ({
        ...prev,
        blockType: prev.blockType.includes(value)
          ? prev.blockType.filter(t => t !== value)
          : [...prev.blockType, value]
      }));
    }
  };

  const handlePendingDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingSummaryFilters(prev => ({ ...prev, dept: e.target.value }));
  };

  const handleApplySummaryFilters = () => {
    setShowTable(true);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return dayjs(time).format('HH:mm');
  };

  const getStatusDisplay = (request: UserRequest) => {
    return {
      label: request.status || 'Pending',
      style: { backgroundColor: '#90EE90' }
    };
  };

  const handleDownloadExcel = (data: UserRequest[]) => {
    // Simple CSV download implementation
    const headers = ['Date', 'ID', 'Block Section', 'Demanded', 'Offered', 'Block Type', 'Line/Road', 'Activity', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(request => [
        dayjs(request.date).format('DD-MM-YY'),
        request.divisionId || request.id,
        request.missionBlock || '',
        `${formatTime(request.demandTimeFrom)} - ${formatTime(request.demandTimeTo)}`,
        `${formatTime(request.sanctionedTimeFrom || request.optimizeTimeFrom)} - ${formatTime(request.sanctionedTimeTo || request.optimizeTimeTo)}`,
        request.corridorType || '',
        request.processedLineSections?.[0]?.lineName || request.processedLineSections?.[0]?.road || 'N/A',
        request.activity || '',
        request.status || 'Pending'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanctioned-blocks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <span className="text-[24px] font-bold text-black">DRM/ADRM/SrDOM</span>
        <div className="mt-2 bg-[#7be09b] px-6 py-1 rounded-2xl">
          <span className="text-[24px] font-bold text-white">
            Blocks Granted/Availed/Pending
          </span>
        </div>
      </div>
      {/* Wrap the main content in a max-w-screen-lg mx-auto w-full container */}
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
        {/* Department Filters (second line) */}
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
            {loading ? "Loading..." : "Submit"}
          </button>
        </div>
        {/* (A) Block Summary Table */}
        <div className="w-full mt-4">
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
                        {summary.Demanded}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Approved}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Granted}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.PercentGranted !== undefined
                          ? summary.PercentGranted + "%"
                          : ""}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.Availed}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {summary.PercentAvailed !== undefined
                          ? summary.PercentAvailed + "%"
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
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Demanded || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Approved || 0),
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
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.PercentGranted || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1 text-center"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Availed || 0),
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
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Summary of Upcoming Blocks CTA */}
      <div className="flex justify-center mb-8 w-full mt-12">
        <div className="w-full max-w-[1200px] rounded-2xl border-4 border-[#00B4D8] bg-[#CAF0F8] shadow-lg p-0">
          <div className="text-[24px] font-bold text-[#0077B6] text-center py-3 tracking-wide">
            View Summary of Sanctioned Blocks
          </div>
          <div className="px-2 pb-4">
            {/* Filters Row: All filters in a single row */}
            <div className="flex flex-wrap gap-2 items-center justify-between bg-[#D6F3FF] p-2 rounded-md border border-[#00B4D8] mb-2">
              {/* Date Range */}
              <div className="flex items-center flex-wrap gap-1">
                <span className="bg-[#E6E6FA] px-2 py-1 border border-[#00B4D8] font-bold text-black rounded-l-md text-[24px]">
                  date
                </span>
                <input
                  type="date"
                  value={pendingSummaryFilters.start}
                  onChange={(e) =>
                    handlePendingDateChange("start", e.target.value)
                  }
                  className="p-1 border border-[#00B4D8] text-black bg-white w-28 focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-[24px]"
                />
                <span className="px-1 text-black text-[24px]">to</span>
                <input
                  type="date"
                  value={pendingSummaryFilters.end}
                  onChange={(e) =>
                    handlePendingDateChange("end", e.target.value)
                  }
                  className="p-1 border border-[#00B4D8] text-black bg-white w-28 focus:outline-none focus:ring-2 focus:ring-[#B57CF6] text-[24px]"
                />
              </div>
              {/* Block Type Dropdown (Radio) */}
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
              {/* Section Dropdown (Multi-select) */}
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
                    {/* Add ALL option at the top */}
                    <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#D6F3FF] text-black text-[20px] border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={
                          pendingSummaryFilters.section.length === sectionOptions.length ||
                          (sectionOptions.length === 0 && pendingSummaryFilters.section.length > 0)
                        }
                        onChange={() => {
                          if (pendingSummaryFilters.section.length === sectionOptions.length) {
                            // If all are selected, deselect all
                            setPendingSummaryFilters(prev => ({
                              ...prev,
                              section: []
                            }));
                          } else {
                            // Select all available sections
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
              {/* Click to View Button (moved here) */}
              <div className="flex-grow flex justify-center">
                <button
                  className="bg-[#00B4D8] border-2 border-[#0077B6] px-6 py-2 rounded-[50%] text-[24px] font-bold text-white hover:bg-[#48CAE4] shadow transition "
                  onClick={handleApplySummaryFilters}
                >
                  Click to View
                </button>
              </div>
            </div>
            {/* Table only shows after clicking Click to View */}
            {showTable && (
              <div className="mx-1 sm:mx-2 overflow-x-auto">
                <div className="max-h-[400px] sm:max-h-[600px] lg:max-h-[800px] overflow-y-auto border-2 border-[#00B4D8] rounded-lg bg-white">
                  <table className="w-full text-black text-xs sm:text-sm md:text-base lg:text-lg relative min-w-[800px]">
                    <thead>
                      <tr className="bg-[#e49edd] text-black">
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">Date</th>
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">ID</th>
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">
                          Block Section
                        </th>
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">Demanded</th>
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">Offered</th>
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">
                          Block Type
                        </th>
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">Line/Road</th>
                        <th className="border-2 border-black p-1 sm:p-2 text-xs sm:text-sm font-bold">Activity</th>
                        <th className="border-2 border-black p-1 sm:p-2 sticky right-0 z-10 bg-[#e49edd] text-xs sm:text-sm font-bold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sanctionedRequests.sort((a: any, b: any) => {
                        // First sort by date
                        const dateA = new Date(a.date).getTime();
                        const dateB = new Date(b.date).getTime();
                        if (dateA !== dateB) return dateA - dateB;
                        
                        // Then sort by offered time (sanctioned/optimized time)
                        const offeredTimeA = new Date(a.sanctionedTimeFrom || a.optimizeTimeFrom).getTime();
                        const offeredTimeB = new Date(b.sanctionedTimeFrom || b.optimizeTimeFrom).getTime();
                        return offeredTimeA - offeredTimeB;
                      }).map(
                        (request: UserRequest, idx: number) => {
                          const status = getStatusDisplay(request);
                          return (
                            <tr
                              key={request.id}
                              className={
                                idx % 2 === 0 ? "bg-[#FFC0CB]" : "bg-white"
                              }
                            >
                              <td className="border border-black p-1 sm:p-2 text-center text-xs sm:text-sm">
                                {dayjs(request.date).format("DD-MM-YY")}
                              </td>
                              <td className="border border-black p-1 sm:p-2 text-center text-xs sm:text-sm">
                                <Link
                                  href={`/admin/view-request/${request.id}?from=request-table`}
                                  className="text-[#13529e] hover:underline font-semibold break-all"
                                >
                                  {request.divisionId || request.id}
                                </Link>
                              </td>
                              <td className="border border-black p-1 sm:p-2 text-xs sm:text-sm max-w-[120px] truncate" title={request.missionBlock}>
                                {request.missionBlock}
                              </td>
                              <td className="border border-black p-1 sm:p-2 text-xs sm:text-sm whitespace-nowrap">
                                {formatTime(request.demandTimeFrom)} -{" "}
                                {formatTime(request.demandTimeTo)}
                              </td>
                              <td className="border border-black p-1 sm:p-2 text-xs sm:text-sm whitespace-nowrap">
                                {`${formatTime(
                                  request.sanctionedTimeFrom ||
                                  request.optimizeTimeFrom
                                )} - ${formatTime(
                                  request.sanctionedTimeTo ||
                                  request.optimizeTimeTo
                                )}`}
                              </td>
                              <td className="border border-black p-1 sm:p-2 text-xs sm:text-sm max-w-[80px] truncate" title={request.corridorType}>
                                {request.corridorType}
                              </td>
                              <td className="border border-black p-1 sm:p-2 text-center text-xs sm:text-sm">
                                {request.processedLineSections?.[0]?.lineName ||
                                  request.processedLineSections?.[0]?.road ||
                                  "N/A"}
                              </td>
                              <td className="border border-black p-1 sm:p-2 text-xs sm:text-sm max-w-[120px] break-words">
                                {request.activity}
                              </td>
                              <td
                                className="border border-black p-1 sm:p-2 sticky right-0 z-10 text-center font-bold text-xs sm:text-sm"
                                style={status.style}
                              >
                                <span className="w-full block">
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
            <div className="text-center mt-2 mb-4 px-2">
              <h3 className="py-1 px-2 sm:px-6 rounded-full text-black text-xs sm:text-sm font-medium mb-2">
                Click ID to see details of a Block.
              </h3>
              <h3 className="rounded-full pb-2 px-2 sm:px-4 text-black text-xs sm:text-sm font-medium mb-3">
                For printing the complete table, click to download in{" "}
                <span className="font-bold text-[#00B4D8]">
                  .xlsx format
                </span>
              </h3>
              <button
                onClick={() => handleDownloadExcel(sanctionedRequests)}
                className="w-full sm:w-fit bg-[#FFA07A] hover:bg-[#FFBFAE] px-6 sm:px-12 py-2 sm:py-3 rounded-[50%] border-2 border-[#FF6B6B] font-bold text-lg sm:text-xl text-[#5D3587] shadow transition"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Logout Button */}
        <div className="w-full flex justify-center mt-8 mb-4 px-2">
          <button
            className="flex items-center gap-2 bg-[#ff4d4d] border-2 border-black rounded-[50%] px-6 py-2 text-[24px] font-bold text-white hover:bg-[#ff3333]"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
