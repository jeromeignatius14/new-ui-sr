"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useDefaulters } from "@/app/service/query/analytics";
import * as XLSX from "xlsx";

interface DefaulterRow {
    divisionId: string;
    missionBlock: string;
    blockDate: string;
    section: string;
    depot: string;
    department: string;
    workType: string;
    demandTime: string;
    sanctionedTime: string | null;
    sanctionedTimeModified: boolean;
    applicantName: string;
    applicantPhone: string;
    sanctionedAt: string | null;
    hoursSinceSanctioned: number | null;
}

interface LateExitRow extends DefaulterRow {
    exitedAt: string | null;
    exitReason: string | null;
    hoursBeforeCommencement: number | null;
}

function fmtHours(h: number | null) {
    if (h === null || h === undefined) return "—";
    if (h < 1) return "< 1 hr";
    if (h < 24) return `${Math.round(h)} hrs`;
    const days = Math.floor(h / 24);
    const rem  = Math.round(h % 24);
    return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

function fmtHoursShort(h: number | null) {
    if (h === null || h === undefined) return "—";
    if (h < 1) return `${Math.round(h * 60)} min`;
    return `${h.toFixed(1)} hrs`;
}

function urgencyBadge(h: number | null) {
    if (h === null) return { bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
    if (h > 72) return { bg: "bg-red-100 text-red-700 font-bold",    dot: "bg-red-500" };
    if (h > 24) return { bg: "bg-orange-100 text-orange-700 font-semibold", dot: "bg-orange-500" };
    return       { bg: "bg-amber-100 text-amber-700 font-semibold",  dot: "bg-amber-500" };
}

function downloadExcel(rows: DefaulterRow[], label: string) {
    if (!rows.length) { alert("No data to download."); return; }
    const data = rows.map((r) => ({
        "Division ID":     r.divisionId,
        "Mission Block":   r.missionBlock,
        "Section":         r.section,
        "Depot":           r.depot,
        "Department":      r.department,
        "Work Type":       r.workType,
        "Demanded Time":   r.demandTime,
        "Sanctioned Time": r.sanctionedTime ?? "—",
        "Applicant Name":  r.applicantName,
        "Applicant Phone": r.applicantPhone,
        "Sanctioned On":   r.sanctionedAt ?? "—",
        "Elapsed":         fmtHours(r.hoursSinceSanctioned),
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map((k) => ({
        wch: Math.min(Math.max(k.length, ...data.map((r) => String(r[k as keyof typeof r] ?? "").length)) + 2, 40),
    }));
    XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
    XLSX.writeFile(wb, `RBMS_Defaulters_${label.replace(/\s/g, "_")}_${data.length}rows.xlsx`);
}

function downloadLateExitsExcel(rows: LateExitRow[]) {
    if (!rows.length) { alert("No data to download."); return; }
    const data = rows.map((r) => ({
        "Division ID":             r.divisionId,
        "Mission Block":           r.missionBlock,
        "Section":                 r.section,
        "Depot":                   r.depot,
        "Department":              r.department,
        "Work Type":               r.workType,
        "Demanded Time":           r.demandTime,
        "Sanctioned Start Time":   r.sanctionedTime ?? "—",
        "Exited At":               r.exitedAt ?? "—",
        "Hrs Before Commencement": r.hoursBeforeCommencement !== null ? r.hoursBeforeCommencement.toFixed(1) : "—",
        "Exit Reason":             r.exitReason ?? "—",
        "Applicant Name":          r.applicantName,
        "Applicant Phone":         r.applicantPhone,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map((k) => ({
        wch: Math.min(Math.max(k.length, ...data.map((r) => String(r[k as keyof typeof r] ?? "").length)) + 2, 40),
    }));
    XLSX.utils.book_append_sheet(wb, ws, "Late_Exits");
    XLSX.writeFile(wb, `RBMS_LateExits_${data.length}rows.xlsx`);
}

function SectionHeader({
    number, title, subtitle, count, color, onDownload,
}: {
    number: string; title: string; subtitle: string;
    count: number; color: "red" | "amber" | "purple"; onDownload: () => void;
}) {
    const colors = {
        red:    { border: "border-red-400",    bg: "bg-red-50",    badge: "bg-red-500",    text: "text-red-700",    num: "bg-red-600" },
        amber:  { border: "border-amber-400",  bg: "bg-amber-50",  badge: "bg-amber-500",  text: "text-amber-700",  num: "bg-amber-600" },
        purple: { border: "border-purple-400", bg: "bg-purple-50", badge: "bg-purple-500", text: "text-purple-700", num: "bg-purple-600" },
    }[color];

    return (
        <div className={`flex items-start justify-between p-4 rounded-xl border-2 ${colors.border} ${colors.bg} mb-4`}>
            <div className="flex items-start gap-3">
                <div className={`${colors.num} text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {number}
                </div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className={`text-base font-bold ${colors.text}`}>{title}</h2>
                        {count > 0 && (
                            <span className={`${colors.badge} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                                {count} pending
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                </div>
            </div>
            {count > 0 && (
                <button
                    onClick={onDownload}
                    className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg font-medium shadow-sm transition flex-shrink-0 ml-4"
                >
                    <span>↓</span> Excel
                </button>
            )}
        </div>
    );
}

function DefaulterTable({ rows, emptyMessage }: { rows: DefaulterRow[]; emptyMessage: string }) {
    if (!rows.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-green-50 border-2 border-green-200 border-dashed rounded-xl">
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold text-green-700 text-base">{emptyMessage}</div>
                <div className="text-sm text-green-600 mt-1">No defaulters in this category</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
            <table className="w-full text-sm min-w-[1000px]">
                <thead>
                    <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 text-left font-semibold">Division ID</th>
                        <th className="px-4 py-3 text-left font-semibold">Mission Block</th>
                        <th className="px-4 py-3 text-left font-semibold">Dept</th>
                        <th className="px-4 py-3 text-left font-semibold">Section / Depot</th>
                        <th className="px-4 py-3 text-left font-semibold">Work Type</th>
                        <th className="px-4 py-3 text-left font-semibold">Demanded Time</th>
                        <th className="px-4 py-3 text-left font-semibold">Sanctioned Time</th>
                        <th className="px-4 py-3 text-left font-semibold">Applicant</th>
                        <th className="px-4 py-3 text-left font-semibold">Sanctioned On</th>
                        <th className="px-4 py-3 text-left font-semibold">Elapsed</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => {
                        const badge = urgencyBadge(r.hoursSinceSanctioned);
                        return (
                            <tr
                                key={i}
                                className={`border-b border-gray-100 transition-colors ${
                                    i % 2 === 0 ? "bg-white hover:bg-indigo-50" : "bg-gray-50 hover:bg-indigo-50"
                                }`}
                            >
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                        {r.divisionId}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap max-w-[140px] truncate" title={r.missionBlock}>
                                    {r.missionBlock || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">
                                        {r.department}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-700">{r.section}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{r.depot}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                                        {r.workType}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-semibold text-gray-800 bg-yellow-50 border border-yellow-300 px-2 py-1 rounded whitespace-nowrap">
                                        {r.demandTime}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {r.sanctionedTime ? (
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                                                r.sanctionedTimeModified
                                                    ? "text-green-800 bg-green-100 border border-green-400"
                                                    : "text-gray-700 bg-gray-100 border border-gray-300"
                                            }`}>
                                                {r.sanctionedTime}
                                            </span>
                                            {r.sanctionedTimeModified && (
                                                <span className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">
                                                    ✎ Modified by admin
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-gray-800 text-sm">{r.applicantName}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{r.applicantPhone}</div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                    {r.sanctionedAt ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${badge.bg}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} flex-shrink-0`} />
                                        {fmtHours(r.hoursSinceSanctioned)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function LateExitTable({ rows }: { rows: LateExitRow[] }) {
    if (!rows.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-green-50 border-2 border-green-200 border-dashed rounded-xl">
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold text-green-700 text-base">No last-minute exits in this period</div>
                <div className="text-sm text-green-600 mt-1">No blocks were exited not before 4 hours of commencement</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
            <table className="w-full text-sm min-w-[1100px]">
                <thead>
                    <tr className="bg-purple-900 text-white text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 text-left font-semibold">Division ID</th>
                        <th className="px-4 py-3 text-left font-semibold">Mission Block</th>
                        <th className="px-4 py-3 text-left font-semibold">Dept</th>
                        <th className="px-4 py-3 text-left font-semibold">Section / Depot</th>
                        <th className="px-4 py-3 text-left font-semibold">Work Type</th>
                        <th className="px-4 py-3 text-left font-semibold">Sanctioned Start</th>
                        <th className="px-4 py-3 text-left font-semibold">Exited At</th>
                        <th className="px-4 py-3 text-left font-semibold">Time Before Start</th>
                        <th className="px-4 py-3 text-left font-semibold">Exit Reason</th>
                        <th className="px-4 py-3 text-left font-semibold">Applicant</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => {
                        const h = r.hoursBeforeCommencement;
                        const urgency =
                            h !== null && h < 1
                                ? "bg-red-100 text-red-800 font-bold"
                                : h !== null && h < 2
                                ? "bg-orange-100 text-orange-800 font-semibold"
                                : "bg-purple-100 text-purple-800 font-semibold";
                        return (
                            <tr
                                key={i}
                                className={`border-b border-gray-100 transition-colors ${
                                    i % 2 === 0 ? "bg-white hover:bg-purple-50" : "bg-gray-50 hover:bg-purple-50"
                                }`}
                            >
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                                        {r.divisionId}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap max-w-[140px] truncate" title={r.missionBlock}>
                                    {r.missionBlock || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">
                                        {r.department}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-700">{r.section}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{r.depot}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                                        {r.workType}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-semibold text-gray-800 bg-yellow-50 border border-yellow-300 px-2 py-1 rounded whitespace-nowrap">
                                        {r.sanctionedTime ?? "—"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap font-medium">
                                    {r.exitedAt ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${urgency}`}>
                                        ⚠ {fmtHoursShort(h)} before start
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px]">
                                    {r.exitReason ? (
                                        <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded text-xs">
                                            {r.exitReason}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">No reason given</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-gray-800 text-sm">{r.applicantName}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{r.applicantPhone}</div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default function PunctualityControllerDefaultersPage() {
    const { data: session } = useSession();
    const userDept = (session?.user as { department?: string })?.department ?? "";

    const today = new Date().toISOString().slice(0, 10);
    const [startDate, setStartDate] = useState(today);
    const [endDate,   setEndDate]   = useState(today);
    const [applied,   setApplied]   = useState({ startDate: today, endDate: today, department: userDept });

    const filters = useMemo(() => applied, [applied]);

    const { data, isLoading, isError } = useDefaulters(filters);

    const notAcknowledged: DefaulterRow[] = data?.data?.notAcknowledged ?? [];
    const notApplied:      DefaulterRow[] = data?.data?.notApplied      ?? [];
    const lateExits:       LateExitRow[]  = data?.data?.lateExits       ?? [];
    const totalPending = notAcknowledged.length + notApplied.length + lateExits.length;

    function applyFilter() {
        setApplied({ startDate, endDate, department: userDept });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => window.history.back()}
                    className="text-gray-500 hover:text-gray-800 transition p-1 rounded hover:bg-gray-100"
                >
                    ← Back
                </button>
                <div className="h-5 w-px bg-gray-300" />
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">Defaulters List</h1>
                    <p className="text-xs text-gray-500">
                        {userDept ? `${userDept} Department` : "All Departments"} — blocks pending action after sanctioning
                    </p>
                </div>
                {totalPending > 0 && !isLoading && (
                    <span className="ml-auto bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                        {totalPending} total pending
                    </span>
                )}
            </div>

            <div className="px-4 py-5 max-w-screen-xl mx-auto">
                {/* Filter card */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-5 mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Filter by Demanded Working Date</p>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border-2 border-gray-400 bg-gray-50 hover:border-indigo-400 focus:border-indigo-600 focus:bg-white rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none transition shadow-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border-2 border-gray-400 bg-gray-50 hover:border-indigo-400 focus:border-indigo-600 focus:bg-white rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none transition shadow-sm"
                            />
                        </div>
                        {userDept && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Department</label>
                                <div className="border-2 border-gray-300 bg-gray-100 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 min-w-[160px]">
                                    {userDept}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={applyFilter}
                            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow transition"
                        >
                            Apply Filter
                        </button>
                        {isLoading && (
                            <span className="text-sm text-gray-500 italic self-center">Loading…</span>
                        )}
                    </div>
                </div>

                {isError && (
                    <div className="bg-red-50 border-2 border-red-300 text-red-700 rounded-xl p-4 mb-6 font-medium">
                        Failed to load data. Please try again.
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="space-y-8">
                        <div>
                            <SectionHeader
                                number="1"
                                title="Sanctioned — but SSE/JE has not acknowledged or rejected"
                                subtitle="Block was sanctioned by admin. The SSE/JE has not accepted or rejected it yet."
                                count={notAcknowledged.length}
                                color="red"
                                onDownload={() => downloadExcel(notAcknowledged, "Not_Acknowledged")}
                            />
                            <DefaulterTable
                                rows={notAcknowledged}
                                emptyMessage="All SSEs have acknowledged their sanctioned blocks"
                            />
                        </div>

                        <div>
                            <SectionHeader
                                number="2"
                                title="Acknowledged — but no avail application filed"
                                subtitle="SSE/JE accepted the sanction but has not submitted for availing and has not exited."
                                count={notApplied.length}
                                color="amber"
                                onDownload={() => downloadExcel(notApplied, "Not_Applied")}
                            />
                            <DefaulterTable
                                rows={notApplied}
                                emptyMessage="All acknowledged blocks have avail applications filed"
                            />
                        </div>

                        <div>
                            <SectionHeader
                                number="3"
                                title="Exited not before 4 hours of block commencement"
                                subtitle="Block was cancelled or exited less than 4 hours before the sanctioned start time."
                                count={lateExits.length}
                                color="purple"
                                onDownload={() => downloadLateExitsExcel(lateExits)}
                            />
                            <LateExitTable rows={lateExits} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
