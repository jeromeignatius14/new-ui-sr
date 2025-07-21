"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/app/service/api/admin";
import { format, parseISO, isAfter, isToday } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

const ACTIONS = [
    { key: "continue", label: "Stop train and continue the block", color: "#1dcaff" },
    { key: "prepone", label: "Prepone the block", color: "#b6e23a" },
    { key: "cancel", label: "Cancel the block", color: "#1dcaff" },
    { key: "postpone", label: "Postpone the block", color: "#1dcaff" },
];

export default function ReviseBlockPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
    const [selectedSection, setSelectedSection] = useState<string>('All');
    const [activeAction, setActiveAction] = useState<string>('');
    const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
    const [reviseFromDate, setReviseFromDate] = useState('');
    const [reviseFromTime, setReviseFromTime] = useState('');
    const [reviseToDate, setReviseToDate] = useState('');
    const [reviseToTime, setReviseToTime] = useState('');
    const queryClient = useQueryClient();
  const { data: session } = useSession();

    // Fetch block data for the selected date
    const { data, isLoading, error } = useQuery({
        queryKey: ["revise-blocks", selectedDate],
        queryFn: () => adminService.getApprovedRequests(selectedDate, selectedDate, 5000),
        enabled: !!selectedDate,
    });

    // Extract unique sections
    const sectionOptions: string[] = useMemo(() => {
        const reqs = data?.data?.requests || [];
        const sections = Array.from(new Set(reqs.map((r: any) => r.selectedSection).filter(Boolean))) as string[];
        return ["All", ...sections];
    }, [data]);

    // Filter requests for selected section, today, and after current time
    const filteredRequests = useMemo(() => {
        const now = new Date();
        const requests = (data?.data?.requests || []).filter((block: any) => {
            if (selectedSection !== 'All' && block.selectedSection !== selectedSection) return false;
            // Only show blocks for today and after current time
            const blockDate = parseISO(block.date);
            if (!isToday(blockDate)) return false;
            // Only show blocks whose slot is after now
            const slotFrom = block.sanctionedTimeFrom || block.optimizeTimeFrom;
            if (slotFrom && isAfter(parseISO(slotFrom), now)) return true;
            return false;
        });

        // Debug: Log the first block to see available fields
        if (requests.length > 0) {
            console.log('Sample block data:', requests[0]);
        }

        return requests;
    }, [data, selectedSection]);

    // Handle checkbox selection
    const toggleBlock = (id: string) => {
        setSelectedBlocks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    const allSelected = filteredRequests.length > 0 && filteredRequests.every((b: any) => selectedBlocks.has(b.id));
    const toggleAll = () => {
        if (allSelected) setSelectedBlocks(new Set());
        else setSelectedBlocks(new Set(filteredRequests.map((b: any) => b.id)));
    };

    // Bulk revise mutation (dummy, implement as needed)
    const bulkReviseMutation = useMutation({
        mutationFn: async () => {
            // Here you would call your API to revise all selected blocks
            // with the new timing and action
            // For now, just simulate
            return new Promise((resolve) => setTimeout(resolve, 1000));
        },
        onSuccess: () => {
            alert("Blocks revised and notified!");
            setSelectedBlocks(new Set());
            setReviseFromDate(''); setReviseFromTime(''); setReviseToDate(''); setReviseToTime('');
            queryClient.invalidateQueries({ queryKey: ["revise-blocks", selectedDate] });
        }
    });

    // Helper functions
    const formatDate = (dateString: string) => {
        try { return format(parseISO(dateString), "dd-MM-yyyy"); } catch { return "Invalid date"; }
    };
    const formatTime = (dateString: string) => {
        try { const d = new Date(dateString); return d.toISOString().slice(11, 16); } catch { return "N/A"; }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen text-black bg-white p-3 border border-black flex items-center justify-center">
        <div className="text-center py-5">Loading approved requests...</div>
      </div>
    );
  }

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
        <div className="min-h-screen bg-[#FFFDF5] max-w-[1366px] mx-auto px-2 pb-32">
            {/* Top Yellow Bar */}
            <div className="w-full bg-[#FFF86B] py-2 flex flex-col items-center">
                <span className="text-[24px] font-bold text-[#B57CF6] tracking-widest">
          RBMS-{session?.user?.location}-DIVN
                </span>
            </div>
            {/* Main Title on Light Blue */}
            <div className="w-full bg-[#D6F3FF] py-3 flex flex-col items-center border-b-2 border-black">
                <span className="text-[24px] md:text-3xl font-bold text-black text-center">
                    Traffic Controller(Blocks)
                </span>
                <div className="w-full flex justify-center mt-3">
                    <h1
                        className="bg-[#cfd4ff] py-1 px-6 rounded-full font-bold text-center"
                        style={{ width: "600px", color: 'black' ,fontSize:"24px"}}
                    >
                        Revise the block for the day
                    </h1>
                </div>
            </div>

            {/* Section Row (no date picker) */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6 mb-2">
                <div className="flex items-center gap-2 bg-white border border-black rounded-lg px-4 py-2">
                    <span className="font-bold text-black text-[24px]">Section:</span>
                    <select
                        className="bg-[#e6f7fa] border border-black rounded px-2 py-1 font-bold text-black"
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                    >
                        {sectionOptions.map((sec: string) => (
                            <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sanctioned request count */}
            <div className="w-full flex justify-center mt-2 mb-4">
                <div className="bg-[#ffb366] text-black font-bold px-8 py-3 rounded shadow border border-black text-[20px]">
                    Sanctioned request for today in <span className="text-[#13529e]">{selectedSection}</span> is {filteredRequests.length}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mx-auto mb-6">
                {ACTIONS.map((action) => (
                    <button
                        key={action.key}
                        className={`py-4 rounded-lg font-bold text-[20px] border-2 border-black transition-colors text-black ${activeAction === action.key ? 'bg-[#7be09b]' : 'bg-[#1dcaff]'}`}
                        onClick={() => setActiveAction(action.key)}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Bulk revise area or cancel message */}
            {activeAction === 'cancel' && selectedBlocks.size > 0 && (
                <div className="w-full max-w-3xl mx-auto bg-[#ffe066] border-2 border-black rounded-lg p-4 mb-6 flex flex-col items-center gap-2 text-black font-bold text-[20px]">
                    You are cancelling {selectedBlocks.size} block{selectedBlocks.size > 1 ? 's' : ''}.
                </div>
            )}
            {(activeAction === 'prepone' || activeAction === 'postpone') && selectedBlocks.size > 0 && (
                <div className="w-full max-w-3xl mx-auto bg-[#ffe066] border-2 border-black rounded-lg p-4 mb-6 flex flex-col md:flex-row items-center gap-4 text-[20px]">
                    <div className="font-bold text-lg mb-2 md:mb-0 text-black">Revised date and time</div>
                    <div className="flex flex-wrap gap-2 items-center text-black">
                        <span className="font-bold">From</span>
                        <input type="date" className="bg-white border border-black rounded px-2 py-1 text-black" value={reviseFromDate} onChange={e => setReviseFromDate(e.target.value)} />
                        <input type="time" className="bg-white border border-black rounded px-2 py-1 text-black" value={reviseFromTime} onChange={e => setReviseFromTime(e.target.value)} />
                        <span className="font-bold">To</span>
                        <input type="date" className="bg-white border border-black rounded px-2 py-1 text-black" value={reviseToDate} onChange={e => setReviseToDate(e.target.value)} />
                        <input type="time" className="bg-white border border-black rounded px-2 py-1 text-black" value={reviseToTime} onChange={e => setReviseToTime(e.target.value)} />
                    </div>
                </div>
            )}

            {/* Blocks Table */}
            <div className="mx-2 overflow-x-auto">
                <table className="w-full text-black text-sm relative rounded-lg overflow-hidden text-[20px]">
                    <thead>
                        <tr className="bg-[#e49edd] text-black">
                            <th className="border-2 border-black p-1"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                            <th className="border-2 border-black p-1">Date</th>
                            <th className="border-2 border-black p-1">ID</th>
                            <th className="border-2 border-black p-1">Block Section/Yard</th>
                            <th className="border-2 border-black p-1">Demanded<br />From</th>
                            <th className="border-2 border-black p-1">Demanded<br />To</th>
                            <th className="border-2 border-black p-1">Slot allotted<br />From</th>
                            <th className="border-2 border-black p-1">Slot allotted<br />To</th>
                            <th className="border-2 border-black p-1">Type: C/NC</th>
                            <th className="border-2 border-black p-1">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map((block: any, idx: number) => (
                            <tr key={block.id as string} className={idx % 2 === 0 ? "bg-[#FFC0CB]" : "bg-white"}>
                                <td className="border border-black p-1 text-center">
                                    <input type="checkbox" checked={selectedBlocks.has(block.id)} onChange={() => toggleBlock(block.id)} />
                                </td>
                                <td className="border border-black p-1 text-center">{dayjs(block.date).format("DD-MM-YY")}</td>
                                <td className="border border-black p-1 text-center">{block.divisionId || block.id}</td>
                                <td className="border border-black p-1 text-center">
                                    {block.blockSection ||
                                        block.yard ||
                                        block.selectedSection ||
                                        block.section ||
                                        block.blockSectionName ||
                                        (block.blockSection && block.yard ? `${block.blockSection}/${block.yard}` : '') ||
                                        'N/A'}
                                </td>
                                <td className="border border-black p-1 text-center">{formatTime(block.demandTimeFrom)}</td>
                                <td className="border border-black p-1 text-center">{formatTime(block.demandTimeTo)}</td>
                                <td className="border border-black p-1 text-center">{formatTime(block.sanctionedTimeFrom || block.optimizeTimeFrom)}</td>
                                <td className="border border-black p-1 text-center">{formatTime(block.sanctionedTimeTo || block.optimizeTimeTo)}</td>
                                <td className="border border-black p-1 text-center">{block.corridorType}</td>
                                <td className="border border-black p-1 text-center">
                                    <span className="px-2 py-1 rounded text-xs font-bold" style={{
                                        background: block.status === "APPROVED" ? "#d6ecd2" :
                                            block.status === "REJECTED" ? "#ff4e36" :
                                                block.status === "PENDING" ? "#fff86b" :
                                                    block.status === "AVAILED" ? "#b7e3ee" :
                                                        block.status === "NOT_AVAILED" ? "#e0e0e0" :
                                                            block.status === "BURST" ? "#ffb366" : "#fff",
                                        color: block.status === "REJECTED" ? "#fff" : "#222"
                                    }}>{
                                            block.status === "APPROVED" ? "Sanctioned" :
                                                block.status === "REJECTED" ? "Rejected" :
                                                    block.status === "PENDING" ? "Pending" :
                                                        block.status === "AVAILED" ? "Availed" :
                                                            block.status === "NOT_AVAILED" ? "Not-availed" :
                                                                block.status === "BURST" ? "Burst" : block.status
                                        }</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Revise and Notify All Button */}
            {(activeAction === 'prepone' || activeAction === 'postpone') && selectedBlocks.size > 0 && (
                <div className="flex justify-center mt-8">
                    <button
                        className="bg-[#b7eeb7] border border-black px-10 py-3 rounded-2xl text-2xl font-extrabold text-black shadow hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={async () => {
                            // Validate that all fields are filled
                            if (!reviseFromDate || !reviseFromTime || !reviseToDate || !reviseToTime) {
                                alert("Please fill in all revised date and time fields.");
                                return;
                            }

                            // Create Date objects and validate them
                            const fromDateTime = new Date(`${reviseFromDate}T${reviseFromTime}:00`);
                            const toDateTime = new Date(`${reviseToDate}T${reviseToTime}:00`);

                            if (isNaN(fromDateTime.getTime()) || isNaN(toDateTime.getTime())) {
                                alert("Invalid date or time value.");
                                return;
                            }

                            // Bulk update optimizeTimeFrom and optimizeTimeTo for selected blocks using updateOptimizeTimes
                            try {
                                console.log('Starting bulk update for', selectedBlocks.size, 'blocks');
                                console.log('From DateTime:', fromDateTime.toISOString());
                                console.log('To DateTime:', toDateTime.toISOString());

                                for (const blockId of selectedBlocks) {
                                    console.log('Updating block:', blockId);
                                    await adminService.updateOptimizeTimes({
                                        requestId: blockId,
                                        optimizeTimeFrom: fromDateTime.toISOString(),
                                        optimizeTimeTo: toDateTime.toISOString(),
                                    });
                                    console.log('Successfully updated block:', blockId);
                                }
                                alert("Blocks revised and notified!");
                                setSelectedBlocks(new Set());
                                setReviseFromDate(''); setReviseFromTime(''); setReviseToDate(''); setReviseToTime('');
                                queryClient.invalidateQueries({ queryKey: ["revise-blocks", selectedDate] });
                            } catch (error: any) {
                                console.error('Error updating blocks:', error);
                                if (error.message?.includes('401') || error.response?.status === 401) {
                                    alert("Authentication error. Please log in again.");
                                } else {
                                    alert(`Error updating blocks: ${error.message || 'Unknown error'}`);
                                }
                            }
                        }}
                        disabled={
                            bulkReviseMutation.isPending ||
                            !reviseFromDate || !reviseFromTime || !reviseToDate || !reviseToTime
                        }
                    >
                        {bulkReviseMutation.isPending ? "Revising..." : "Revise and Notify All"}
                    </button>
                </div>
            )}

            <div className="text-[10px] text-gray-600 mt-8 border-t border-black pt-1 text-right">
                © {new Date().getFullYear()} Indian Railways
            </div>
        </div>
    );
} 