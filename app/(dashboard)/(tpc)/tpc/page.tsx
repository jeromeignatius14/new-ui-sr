"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Loader } from "@/app/components/ui/Loader";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import { format, addDays, parseISO } from "date-fns";
import { useBoardControllerRequests } from "@/app/service/query/boardController";
import { toast, Toaster } from "react-hot-toast";

export default function TpcDashboard() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            window.location.href = "/auth/login";
        },
    });

    const [currentTab, setCurrentTab] = useState<"24hrs" | "16hrs" | "8hrs">("8hrs");
    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    });
    const [filterOpen, setFilterOpen] = useState(false);
    const [sectionFilter, setSectionFilter] = useState("");
    const [lineFilter, setLineFilter] = useState("");
    const [workTypeFilter, setWorkTypeFilter] = useState("");

    // Fetch requests using the query hook
    const {
        data: requestsData,
        isLoading,
        isError,
        error
    } = useBoardControllerRequests(currentTab);

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/auth/login" });
    };

    const handleTabChange = (tab: "8hrs" | "16hrs" | "24hrs") => {
        setCurrentTab(tab);
    };

    const formatTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const timePart = dateString.includes("T")
        ? dateString.split("T")[1]
        : dateString;
      const [hours, minutes] = timePart.split(":");
      return `${hours.padStart(2, "0")}:${(minutes || "00")
        .padStart(2, "0")
        .substring(0, 2)}`;
    } catch {
      return "Invalid time";
    }
  };

    const formatDate = (dateString: string) => {
      try {
        return format(parseISO(dateString), "dd-MM-yyyy");
      } catch {
        return "Invalid date";
      }
    };

    // Render table for a specific line type
    const renderLineTable = (sectionKey: string, lineType: string, data: any[]) => {
        // Format line type name for display (e.g., upSlow -> Up Slow)
        const getDisplayLineType = (type: string) => {
            if (type === 'upSlow') return 'Up Slow Line';
            if (type === 'downSlow') return 'Down Slow Line';
            if (type === 'upFast') return 'Up Fast Line';
            if (type === 'downFast') return 'Down Fast Line';
            if (type === 'upLine') return 'Up Line';
            if (type === 'downLine') return 'Down Line';
            if (type === 'singleLine') return 'Single Line';

            return type.charAt(0).toUpperCase() +
                type.slice(1).replace(/([A-Z])/g, ' $1');
        };

        const displayLineType = getDisplayLineType(lineType);

        // Check if data is a valid array
        if (!Array.isArray(data)) {
            console.error(`Data for ${sectionKey} - ${lineType} is not an array:`, data);
            return null;
        }

        return (
            <>
                <h3 className="bg-yellow-100 p-2 text-base font-semibold text-black border-y-2 border-black">
                    Line - {displayLineType}
                </h3>
                <div className="overflow-x-auto w-full">
                    <table className="w-full table-fixed divide-y divide-gray-300 border">
                        <colgroup>
                            <col width="120" />
                            <col width="150" />
                            <col width="180" />
                            <col width="150" />
                            <col width="200" />
                            <col width="100" />
                            <col width="100" />
                        </colgroup>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-black border-r whitespace-nowrap">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-black border-r whitespace-nowrap">Block Section</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-black border-r whitespace-nowrap">Sanctioned Time</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-black border-r whitespace-nowrap">Work Type</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-black border-r whitespace-nowrap">Activity</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-black border-r whitespace-nowrap">Status</th>
                                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-black whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-300">
                            {data.length > 0 ?
                                data.map((req: any, idx: number) => {
                                    // Generate a unique key in case id is missing
                                    const key = req.id || `${sectionKey}-${lineType}-${req.section || ''}-${req.time || ''}-${idx}`;

                                    // Format date - use current date if missing
                                    const displayDate = req.date && req.date !== '-'
                                        ? req.date
                                        : format(new Date(), 'dd/MM/yyyy');

                                    return (
                                        <tr key={key} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-black border-black border-r truncate">{formatDate(req.date)}</td>
                                            <td className="px-4 py-2 text-sm text-black border-black border-r truncate">{req.missionBlock || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-black border-black border-r">
                                                {req.sanctionedTimeFrom && req.sanctionedTimeTo
                                                    ? `${formatTime(req.sanctionedTimeFrom)} - ${formatTime(req.sanctionedTimeTo)}`
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-black border-black border-r truncate">{req.workType || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-black border-black border-r truncate">{req.activity || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-black border-black border-r truncate">{req.overAllStatus || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-center">
                                                {req.id ? (
                                                    <Link href={`/tpc/view-request/${req.id}`} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 inline-flex items-center text-xs">
                                                        <FaEye className="mr-1" size={12} /> View
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">No ID</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) :
                                [...Array(1)].map((_, idx) => (
                                    <tr key={`empty-${sectionKey}-${lineType}-${idx}`} className="h-12 hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-black border-black border-r">&nbsp;</td>
                                        <td className="px-4 py-2 text-sm text-black border-black border-r">&nbsp;</td>
                                        <td className="px-4 py-2 text-sm text-black border-black border-r">&nbsp;</td>
                                        <td className="px-4 py-2 text-sm text-black border-black border-r">&nbsp;</td>
                                        <td className="px-4 py-2 text-sm text-black border-black border-r">&nbsp;</td>
                                        <td className="px-4 py-2 text-sm text-black border-black border-r">&nbsp;</td>
                                        <td className="px-4 py-2 text-sm text-center">&nbsp;</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    // Render a section with all its line types
    const renderSection = (sectionKey: string, sectionData: any) => {
        if (!sectionData) {
            console.log(`Section data for ${sectionKey} is empty or undefined`);
            return null;
        }

        const formattedSectionName = sectionKey.replace('_', '-');

        // Get line types that have data arrays
        const lineTypes = Object.keys(sectionData).filter(key => {
            return Array.isArray(sectionData[key]);
        });

        if (lineTypes.length === 0) {
            console.log(`No valid line types found in section ${sectionKey}`);
            return null;
        }

        // Count total requests in this section
        let totalRequests = 0;
        lineTypes.forEach(lineType => {
            if (Array.isArray(sectionData[lineType])) {
                totalRequests += sectionData[lineType].length;
            }
        });

        // Don't render sections with no data
        if (totalRequests === 0) {
            return null;
        }

        return (
            <div className="mb-8 border-2 border-black">
                <h2 className="bg-yellow-100 p-2 text-lg text-black font-semibold border-b-2 border-black">
                    Major Section - {formattedSectionName}
                </h2>

                {lineTypes.map(lineType => (
                    <div key={`${sectionKey}-${lineType}`}>
                        {renderLineTable(sectionKey, lineType, sectionData[lineType])}
                    </div>
                ))}
            </div>
        );
    };

    if (status === "loading" || isLoading) {
        return <Loader name="page" />;
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-lg text-red-600">Error loading data. Please try again later.</p>
                <p className="text-sm text-gray-600">{(error as any)?.message}</p>
                {process.env.NODE_ENV === "development" && (
                    <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-xs text-left">
                        {JSON.stringify(error, null, 2)}
                    </pre>
                )}
            </div>
        );
    }

    // Log data for debugging
    console.log("Raw response data:", requestsData);

    // Extract all sections from the data
    const sections = requestsData?.data ? Object.keys(requestsData.data) : [];
    console.log("Available sections:", sections);

    return (
        <div className="container mx-auto px-4 py-6 max-w-full bg-[#fffbe9] min-h-screen">
            <Toaster position="top-right" />
            {/* Header with Logout */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex w-full justify-center items-center flex-col">
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800">Board Controller</h1>
                    <div className="flex justify-center mt-3">
                        <span className="bg-[#FFB74D] border-2 border-black px-5 py-2 font-bold text-xl text-black">
                            DESGN: {session?.user?.name}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-700 text-black font-bold py-1 px-3 sm:py-2 sm:px-4 border-2 border-black"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Tab Selector for time windows */}
            <div className="flex border-b-2 border-gray-600 mb-6">
                <button
                    className={`py-2 px-4 font-bold ${currentTab === "8hrs"
                        ? "border-r-2 border-l-2 border-t-2 border-black text-black bg-blue-500"
                        : "text-gray-500 hover:text-gray-700 bg-blue-200"
                        }`}
                    onClick={() => handleTabChange("8hrs")}
                >
                    Next - 8 hrs
                </button>
                <button
                    className={`py-2 px-4 font-bold ${currentTab === "16hrs"
                        ? "border-r-2 border-l-2 border-t-2 border-black text-black bg-blue-500"
                        : "text-gray-500 hover:text-gray-700 bg-blue-200"
                        }`}
                    onClick={() => handleTabChange("16hrs")}
                >
                    Next - 16 hrs
                </button>
                <button
                    className={`py-2 px-4 font-bold ${currentTab === "24hrs"
                        ? "border-r-2 border-l-2 border-t-2 border-black text-black bg-blue-500"
                        : "text-gray-500 hover:text-gray-700 bg-blue-200"
                        }`}
                    onClick={() => handleTabChange("24hrs")}
                >
                    Next - 24 hrs
                </button>
            </div>


            {/* Render all sections dynamically */}
            {sections.length > 0 ? (
                <>
                    {/* Track if any sections actually have data */}
                    {(() => {
                        // Count sections with actual data
                        let sectionsWithData = 0;

                        // Render all sections that have data
                        const renderedSections = sections.map(sectionKey => {
                            const renderedSection = renderSection(sectionKey, requestsData?.data[sectionKey]);
                            if (renderedSection) sectionsWithData++;
                            return (
                                <React.Fragment key={sectionKey}>
                                    {renderedSection}
                                </React.Fragment>
                            );
                        });

                        // If no sections have data, show a message
                        return sectionsWithData > 0 ? (
                            renderedSections
                        ) : (
                            <div className="text-center py-10 border-2 border-black rounded-lg bg-white my-4">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No Maintenance Requests</h3>
                                <p className="mt-1 text-sm text-gray-500">There are no maintenance requests found for the selected time period.</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleTabChange("24hrs")}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                    >
                                        Try 24 Hour View
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </>
            ) : (
                <div className="text-center py-10 border-2 border-black rounded-lg bg-white">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Sections Available</h3>
                    <p className="mt-1 text-sm text-gray-500">No section data found for the selected time period.</p>
                </div>
            )}
        </div>
    );
}
