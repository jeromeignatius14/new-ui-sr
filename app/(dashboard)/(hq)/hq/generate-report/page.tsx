"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGenerateReport } from "@/app/service/query/drm";
import { useSession } from "next-auth/react";

interface OptionType {
  value: string;
  label: string;
}

interface FormData {
  startDate: string;
  endDate: string;
  location: OptionType[];
  department: OptionType[];
  blockType: OptionType[];
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
  const [upcomingBlocks, setUpcomingBlocks] = useState<DetailedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["All"]);
  const [selectedBlockTypes, setSelectedBlockTypes] = useState<string[]>([
    "All",
  ]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    "Engineering",
  ]);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();

  // Parameters for the query
  const [queryParams, setQueryParams] = useState({
    startDate: "",
    endDate: "",
    location: ["All"],
    department: ["Engineering"],
    blockType: ["All"],
  });
    const { data: session } = useSession();

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
      setUpcomingBlocks(detailedData);
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

  // Toggle selection for buttons
  const toggleLocation = (location: string) => {
    // For single selection, simply set the selected location
    setSelectedLocations([location]);
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
        location: selectedLocations,
        department: selectedDepartments,
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

  return (
    <div className="max-w-7xl mx-auto bg-white">
      <div className="bg-yellow-100 text-center pt-3 rounded-t-md">
        <h1 className="text-3xl font-bold text-purple-600">

            RBMS-{session?.user?.location}-DIVN

        </h1>
        <div className="flex flex-col bg-green-200">
          <h2 className="text-xl font-semibold text-black">
            Block Summary(Past/Upcoming)
          </h2>
          <div className="text-md text-black font-bold">Headquarter</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-b-md mb-4 border-2 border-gray-300 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <div className="text-center font-semibold mb-4 text-black">
              Select Period
            </div>
            <div className="flex justify-center items-center gap-4 mb-4">
              <div>
                <label className="block text-black font-medium mb-1">
                  From
                </label>
                <input
                  {...register("startDate", {
                    required: "Start date is required",
                    // Removed onChange handler to prevent API calls when date changes
                  })}
                  type="date"
                  className="px-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                  disabled={loading}
                />
                {errors.startDate && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-black font-medium mb-1 ml-1">
                  To
                </label>
                <input
                  {...register("endDate", {
                    required: "End date is required",
                    // Removed onChange handler to prevent API calls when date changes
                  })}
                  type="date"
                  className="px-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                  disabled={loading}
                />
                {errors.endDate && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedLocations.includes("All")
                    ? "bg-blue-300"
                    : "bg-blue-100"
                } border border-blue-400`}
                onClick={() => toggleLocation("All")}
              >
                {selectedLocations.includes("All") && (
                  <span className="mr-1">✓</span>
                )}
                All
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedLocations.includes("MAS")
                    ? "bg-blue-300"
                    : "bg-blue-100"
                } border border-blue-400`}
                onClick={() => toggleLocation("MAS")}
              >
                {selectedLocations.includes("MAS") && (
                  <span className="mr-1">✓</span>
                )}
                MAS
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedLocations.includes("SA")
                    ? "bg-blue-300"
                    : "bg-blue-100"
                } border border-blue-400`}
                onClick={() => toggleLocation("SA")}
              >
                {selectedLocations.includes("SA") && (
                  <span className="mr-1">✓</span>
                )}
                SA
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedLocations.includes("MCU")
                    ? "bg-orange-300"
                    : "bg-orange-100"
                } border border-orange-400`}
                onClick={() => toggleLocation("MCU")}
              >
                {selectedLocations.includes("MCU") && (
                  <span className="mr-1">✓</span>
                )}
                MCU
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedLocations.includes("TPJ")
                    ? "bg-green-300"
                    : "bg-green-100"
                } border border-green-400`}
                onClick={() => toggleLocation("TPJ")}
              >
                {selectedLocations.includes("TPJ") && (
                  <span className="mr-1">✓</span>
                )}
                TPJ
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedLocations.includes("PGT")
                    ? "bg-yellow-300"
                    : "bg-yellow-100"
                } border border-yellow-400`}
                onClick={() => toggleLocation("PGT")}
              >
                {selectedLocations.includes("PGT") && (
                  <span className="mr-1">✓</span>
                )}
                PGT
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedLocations.includes("TVC")
                    ? "bg-purple-300"
                    : "bg-purple-100"
                } border border-purple-400`}
                onClick={() => toggleLocation("TVC")}
              >
                {selectedLocations.includes("TVC") && (
                  <span className="mr-1">✓</span>
                )}
                TVC
              </button>
            </div>

            {/* Block Type buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedBlockTypes.includes("All")
                    ? "bg-blue-300"
                    : "bg-[#cfd4ff]"
                }`}
                onClick={() => toggleBlockType("All")}
              >
                {selectedBlockTypes.includes("All") && (
                  <span className="mr-1">✓</span>
                )}
                All
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedBlockTypes.includes("Corridor")
                    ? "bg-indigo-300"
                    : "bg-[#cfd4ff]"
                }`}
                onClick={() => toggleBlockType("Corridor")}
              >
                {selectedBlockTypes.includes("Corridor") && (
                  <span className="mr-1">✓</span>
                )}
                Corridor
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedBlockTypes.includes("Non-corridor")
                    ? "bg-cyan-300"
                    : "bg-[#cfd4ff]"
                }`}
                onClick={() => toggleBlockType("Non-corridor")}
              >
                {selectedBlockTypes.includes("Non-corridor") && (
                  <span className="mr-1">✓</span>
                )}
                Outside corridor
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedBlockTypes.includes("Emergency")
                    ? "bg-red-300"
                    : "bg-[#cfd4ff]"
                }`}
                onClick={() => toggleBlockType("Emergency")}
              >
                {selectedBlockTypes.includes("Emergency") && (
                  <span className="mr-1">✓</span>
                )}
                Emergency
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedBlockTypes.includes("Mega")
                    ? "bg-amber-300"
                    : "bg-[#cfd4ff]"
                } `}
                onClick={() => toggleBlockType("Mega")}
              >
                {selectedBlockTypes.includes("Mega") && (
                  <span className="mr-1">✓</span>
                )}
                Mega Block
              </button>
            </div>

            {/* Department buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedDepartments.includes("Engineering")
                    ? "bg-green-300"
                    : "bg-green-100"
                } border border-green-400`}
                onClick={() => toggleDepartment("Engineering")}
              >
                {selectedDepartments.includes("Engineering") && (
                  <span className="mr-1">✓</span>
                )}
                Engineering
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedDepartments.includes("ST")
                    ? "bg-blue-300"
                    : "bg-blue-100"
                } border border-blue-400`}
                onClick={() => toggleDepartment("ST")}
              >
                {selectedDepartments.includes("ST") && (
                  <span className="mr-1">✓</span>
                )}
                S & T
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-sm rounded-full text-black ${
                  selectedDepartments.includes("TRD")
                    ? "bg-yellow-300"
                    : "bg-yellow-100"
                } border border-yellow-400`}
                onClick={() => toggleDepartment("TRD")}
              >
                {selectedDepartments.includes("TRD") && (
                  <span className="mr-1">✓</span>
                )}
                TRD
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 shadow-md transition-all font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate Report"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Past Block Summary Table */}
      <div className="mb-6">
        <div className="bg-[#ff914d] p-2 font-semibold text-black">
          (A)Past Block Summary:....... to .......Division
          Department:.............(In Hrs)
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-b">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-[#f7c7ac]">
                <th className="border px-4 py-2 text-left text-black">
                  Section
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  Demanded
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  Approved
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  Granted
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  % Granted
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  Availed
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  % Availed
                </th>
              </tr>
            </thead>
            <tbody className="text-black">
              {pastBlockSummary.length > 0 &&
                pastBlockSummary.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-[#f4dcf1]" : "bg-white"
                    } hover:bg-gray-50 transition-colors text-black`}
                  >
                    <td
                      className="border px-4 py-2 cursor-pointer hover:bg-purple-100"
                      onClick={() => handleSectionClick(item.Section)}
                    >
                      <span className="text-blue-600 font-medium underline">
                        {item.Department && item.Department} -{" "}
                        {item.corridorType && item.corridorType}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {item.Demanded}
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {item.Approved}
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {item.Granted}
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {item.PercentGranted}%
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {item.Availed}
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {item.PercentAvailed}%
                    </td>
                  </tr>
                ))}

              {pastBlockSummary.length > 0 && (
                <tr className="bg-[#ff914d] font-semibold text-black">
                  <td className="border px-4 py-2 text-center text-black">
                    Total
                  </td>
                  <td className="border px-4 py-2 text-center text-black">
                    {pastBlockSummary.length > 0
                      ? pastBlockSummary.reduce(
                          (sum, item) => sum + item.Demanded,
                          0
                        )
                      : "0"}
                  </td>
                  <td className="border px-4 py-2 text-center text-black">
                    {pastBlockSummary.length > 0
                      ? pastBlockSummary.reduce(
                          (sum, item) => sum + item.Approved,
                          0
                        )
                      : "0"}
                  </td>
                  <td className="border px-4 py-2 text-center text-black">
                    {pastBlockSummary.length > 0
                      ? pastBlockSummary.reduce(
                          (sum, item) => sum + item.Granted,
                          0
                        )
                      : "0"}
                  </td>
                  <td className="border px-4 py-2 text-center text-black">
                    {pastBlockSummary.reduce(
                      (sum, item) => sum + (item.PercentGranted || 0),
                      0
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center text-black">
                    {pastBlockSummary.length > 0
                      ? pastBlockSummary.reduce(
                          (sum, item) => sum + item.Availed,
                          0
                        )
                      : "0"}
                  </td>
                  <td className="border px-4 py-2 text-center text-black">
                    {pastBlockSummary.reduce(
                      (sum, item) => sum + (item.PercentAvailed || 0),
                      0
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {pastBlockSummary.length === 0 && (
            <div className="bg-white hover:bg-gray-50 text-black border border-black w-full py-2 text-center">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Blocks Table */}
      <div className="mb-6">
        <div className="bg-[#ffc000] p-2 font-semibold text-black">
          (B) Upcoming Blocks (Summary):...... Division ...... Department.......
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-b">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-[#f7c7ac]">
                <th className="border px-4 py-2 text-center text-black">
                  Date
                </th>
                <th className="border px-4 py-2 text-left text-black">
                  Section
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  Duration (Hours)
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  Type
                </th>
                <th className="border px-4 py-2 text-center text-black">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {upcomingBlocks.length > 0 &&
                upcomingBlocks.map((block, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-[#f4dcf1]" : "bg-white"
                    } hover:bg-gray-50 transition-colors text-black `}
                  >
                    <td className="border px-4 py-2 text-center text-black">
                      {block.Date}
                    </td>
                    <td
                      className="border px-4 py-2 cursor-pointer hover:bg-purple-100"
                      onClick={() => handleSectionClick(block.Section)}
                    >
                      <span className="text-blue-600 font-medium underline">
                        {block.Section}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {block.Duration}
                    </td>
                    <td className="border px-4 py-2 text-center text-black">
                      {block.Type}
                    </td>
                    <td
                      className={`border px-4 py-2 text-center ${
                        block.Status === "Pending"
                          ? "bg-yellow-100 text-black"
                          : block.Status === "Sanctioned"
                          ? "bg-green-100 text-black"
                          : block.Status === "Rejected"
                          ? "bg-red-100 text-black"
                          : ""
                      }`}
                    >
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium `}
                      >
                        {block.Status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {upcomingBlocks.length === 0 && (
            <div className="bg-white hover:bg-gray-50 text-black border border-black w-full py-2 text-center">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Click SectionBlock ID Info Section */}
      <div className="mt-6 mb-4 p-4 bg-blue-100 rounded-md flex items-center justify-center">
        <div className="bg-[#cfd4ff] px-6 py-3 rounded-md border border-blue-300 shadow-sm text-center">
          <span className="font-bold text-black">Click</span>
          <span className="mx-1 px-4 py-1 bg-[#0da84a] rounded-md font-bold text-black">
            SectionBlock ID
          </span>
          <span className="text-black">
            to see further details of datewise details of blocks in the division
          </span>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded flex justify-center items-center gap-6 border-2 border-gray-300">
        <button
          onClick={() => router.back()}
          className="bg-[#cfd4ff] text-black px-8 py-2 rounded-md hover:bg-gray-300 shadow-md transition-all border border-gray-400"
        >
          Back
        </button>
        <Link href="/drm">
          <button className="bg-[#a0d815] text-black px-8 py-2 rounded-md hover:bg-gray-300 shadow-md transition-all border border-gray-400">
            Home
          </button>
        </Link>
      </div>
    </div>
  );
}
