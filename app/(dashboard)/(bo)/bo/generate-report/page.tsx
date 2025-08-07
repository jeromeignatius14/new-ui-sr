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
}

interface DetailedData {
  Date: string;
  Section: string;
  Duration: number;
  Type: string;
  Status: string;
  DivisionId?: string;
  MissionBlock?: string;
  id?: string;
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
  const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>([
    "All",
  ]);

  const [selectedMajorSections, setSelectedMajorSections] = useState<string[]>(
    []
  );
  const [majorSectionOptions, setMajorSectionOptions] = useState<OptionType[]>(
    []
  );
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
    department: session?.user?.department ? [session.user.department] : [""],
    blockType: ["All"],
  });




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
        department: session?.user?.department ? [session.user.department] : [""],
        blockType: selectedBlockTypes,
      });

      // Trigger the query - react-query will handle the loading state
      await refetch();
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

  return (
    <div className="min-h-screen w-full bg-[#fffbe9] flex flex-col items-center">
      {/* RBMS Header */}
      <div className="w-full bg-[#fff35c] flex flex-col items-center py-2 rounded-t-2xl">
        <span className="text-5xl font-extrabold text-[#b07be0] tracking-wide">
        RBMS-{session?.user?.location}-DIVN
        </span>
      </div>
      {/* Block Summary Report Title */}
      <div className="w-full bg-[#b7e3ee] flex flex-col items-center pt-2 pb-1">
        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black break-words text-center">
          BRANCH OFFICER
        </span>
        <span className="text-xl sm:text-2xl md:text-4xl font-extrabold text-black text-center break-all px-2">
          Block Summary Report (Granted/Availed/Pending)
        </span>
        <div className="mt-2 bg-[#7be09b] px-6 py-1 rounded-2xl">
          <span className="text-xl font-bold text-white">
            Deptt: {session?.user?.department || "DEPT"}
          </span>
        </div>
      </div>
      {/* Wrap the main content in a max-w-screen-lg mx-auto w-full container */}
      <div className="max-w-screen-lg mx-auto w-full">
        {/* Filters Section */}
        <div className="w-full bg-[#fffbe9] px-2 py-2">
          <div className="flex flex-row gap-8 items-end w-full flex-wrap">
            {/* Choose Section Dropdown */}
            {/* <div className="flex flex-col flex-1 min-w-[90px] max-w-[110px] w-full">
              <span className="text-lg font-bold text-black mb-1 whitespace-nowrap">
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
                    fontSize: 14,
                    width: "100%",
                    maxWidth: "110px",
                    minWidth: "90px",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? "#b7e3ee" : "#fff",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: 14,
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
                <span className="text-lg font-bold text-black">
                  Select Period
                </span>
              </div>
              <div className="flex flex-row items-center gap-1 w-full">
                <input
                  type="date"
                  className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[120px] text-base font-bold text-center"
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
                  className="border-2 border-[#e57373] rounded-md px-1 py-1 w-full max-w-[120px] text-base font-bold text-center"
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
              className={`rounded-full px-3 py-1 text-base font-semibold border border-[#b7e3ee] flex items-center gap-1 transition-colors duration-150 ${
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
        {/* Submit Button */}
        <div className="w-full flex justify-center mb-2">
          <button
            className="bg-[#7be09b] hover:bg-[#5bc07b] text-white font-bold px-8 py-2 rounded-lg shadow border border-[#00b347] text-lg"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>
        {/* (A) Block Summary Table */}
        <div className="w-full mt-4">
          <div className="flex w-full justify-center">
            <div
              className="flex-1 bg-[#cfd4ff] text-xl font-bold border-2 border-black px-2 py-1 text-center"
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
            <table className="w-full border-2 border-black">
              <thead>
                <tr className="bg-[#e49edd] text-black text-lg font-bold">
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
                      className={`font-bold ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#f4dcf1]"
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
                        {summary.Demanded}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Approved}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Granted}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.PercentGranted !== undefined
                          ? summary.PercentGranted + "%"
                          : ""}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {summary.Availed}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
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
                      <td className="border-2 border-black px-2 py-1">Total</td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Demanded || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Approved || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Granted || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.percentGranted || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.Availed || 0),
                          0
                        )}
                      </td>
                      <td
                        className="border-2 border-black px-2 py-1"
                        style={{ color: "black" }}
                      >
                        {pastBlockSummary.reduce(
                          (sum, item) => sum + (item.percentAvailed || 0),
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
        {/* (B) Summary of Upcoming Blocks */}
        <div className="w-full max-w-4xl mt-8">
          <div className="flex w-full items-center">
            <div className="flex w-full gap-x-3">
              {" "}
              {/* Adds 0.5rem (8px) gap between items */}
              <div className="flex-1 bg-[#f1a983] text-xl font-bold border-2 border-black px-2 py-1">
                (B) Summary of Upcoming Blocks
              </div>
              <div className="flex-1 bg-[#83e28e] text-xl font-bold border-2 border-black px-2 py-1">
                Choose Section
              </div>
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
            <table className="w-full border-2 border-black mt-1 text-sm">
              <thead>
                <tr className="bg-[#e49edd] text-black text-lg font-bold">
                  <th className="border-2 border-black px-2 py-1">Date</th>
                  <th className="border-2 border-black px-2 py-1">DivisionId</th>
                  <th className="border-2 border-black px-2 py-1">Major section</th>
                  <th className="border-2 border-black px-2 py-1">Block Section</th>
                  <th className="border-2 border-black px-2 py-1">Type</th>
                  <th className="border-2 border-black px-2 py-1">Duration</th>
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
                    .map((block: DetailedData, idx: number) => {
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
    href={``}
    className="block w-full h-full"
  >
    {block.DivisionId}
  </Link>
</td>
                          <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            {block.Section}
                          </td>
                           <td className="border-2 border-black px-2 py-1 font-bold text-black">
                            {block.MissionBlock}
                          </td>
                          
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {block.Type}
                          </td>
                          <td className="border-2 border-black px-2 py-1 text-black">
                            {block.Duration}
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
            <span className="text-lg font-bold text-black">Click</span>
            <span className="bg-[#00b347] text-white font-bold px-2 py-1 rounded">
              ID
            </span>
            <span className="text-lg font-bold text-black">
              to see further details.
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              className="flex items-center gap-2 bg-[#cfd4ff] border-2 border-black rounded-[50%] px-8 py-2 text-lg font-bold text-black"
              onClick={() => router.back()}
            >
              Back
            </button>
            <Link href="/drm">
              <button className="flex items-center gap-2 bg-[#a0d815] border-2 border-black rounded-[50%] px-8 py-2 text-lg font-bold text-black">
                Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
