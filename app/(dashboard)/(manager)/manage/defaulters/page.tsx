"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useDefaulters } from "@/app/service/query/analytics";
import * as XLSX from "xlsx";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DefaulterRow {
    divisionId: string;
    missionBlock: string;
    blockDate: string;
    section: string;
    depot: string;
    department: string;
    workType: string;
    demandTime: string;
    applicantName: string;
    applicantPhone: string;
    sanctionedAt: string | null;
    hoursSinceSanctioned: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtHours(h: number | null) {
    if (h === null || h === undefined) return "—";
    if (h < 1) return "< 1 hr";
    if (h < 24) return `${Math.round(h)} hrs`;
    const days = Math.floor(h / 24);
    const rem = Math.round(h % 24);
    return rem > 0 ? `${days}d ${rem}h` : `${days} days`;
}

function urgencyColor(h: number | null) {
    if (h === null) return "text-gray-500";
    if (h > 72) return "text-red-600 font-bold";
    if (h > 24) return "text-orange-500 font-semibold";
    return "text-amber-600";
}

function downloadExcel(rows: DefaulterRow[], label: string) {
    if (!rows.length) { alert("No data to download."); return; }
    const data = rows.map((r) => ({
        "Division ID":        r.divisionId,
        "Mission Block":      r.missionBlock,
        "Block Date":         r.blockDate,
        "Section":            r.section,
        "Depot":              r.depot,
        "Department":         r.department,
        "Work Type":          r.workType,
        "Demand Time":        r.demandTime,
        "Applicant Name":     r.applicantName,
        "Applicant Phone":    r.applicantPhone,
        "Sanctioned On":      r.sanctionedAt ?? "—",
        "Elapsed":            fmtHours(r.hoursSinceSanctioned),
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map((k) => ({
        wch: Math.min(Math.max(k.length, ...data.map((r) => String(r[k as keyof typeof r] ?? "").length)) + 2, 40),
    }));
    XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
    XLSX.writeFile(wb, `RBMS_Defaulters_${label.replace(/\s/g, "_")}_${data.length}rows.xlsx`);
}

// ── Table component ───────────────────────────────────────────────────────────
function DefaulterTable({
    rows,
    elapsedLabel,
    emptyMessage,
}: {
    rows: DefaulterRow[];
    elapsedLabel: string;
    emptyMessage: string;
}) {
    if (!rows.length) {
        return (
            <div className="text-center py-10 text-gray-500 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-2xl mb-1">✓</div>
                <div className="font-medium text-green-700">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        <th className="px-3 py-3">Division ID</th>
                        <th className="px-3 py-3">Mission Block</th>
                        <th className="px-3 py-3">Block Date</th>
                        <th className="px-3 py-3">Section / Depot</th>
                        <th className="px-3 py-3">Work Type</th>
                        <th className="px-3 py-3">Demand Time</th>
                        <th className="px-3 py-3">Applicant</th>
                        <th className="px-3 py-3">Sanctioned On</th>
                        <th className="px-3 py-3">{elapsedLabel}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-mono text-xs font-semibold text-indigo-700 whitespace-nowrap">
                                {r.divisionId}
                            </td>
                            <td className="px-3 py-3 font-medium whitespace-nowrap">{r.missionBlock || "—"}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-gray-600">{r.blockDate}</td>
                            <td className="px-3 py-3 text-gray-700">
                                <div>{r.section}</div>
                                <div className="text-xs text-gray-500">{r.depot}</div>
                            </td>
                            <td className="px-3 py-3 text-gray-600">{r.workType}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap text-xs">{r.demandTime}</td>
                            <td className="px-3 py-3">
                                <div className="font-medium">{r.applicantName}</div>
                                <div className="text-xs text-gray-500">{r.applicantPhone}</div>
                            </td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap text-xs">
                                {r.sanctionedAt ?? "—"}
                            </td>
                            <td className={`px-3 py-3 whitespace-nowrap ${urgencyColor(r.hoursSinceSanctioned)}`}>
                                {fmtHours(r.hoursSinceSanctioned)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DefaultersPage() {
    const { data: session } = useSession();
    const userDept = (session?.user as { department?: string })?.department ?? "";

    const today = new Date().toISOString().slice(0, 10);
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState(threeMonthsAgo);
    const [endDate, setEndDate]     = useState(today);

    const filters = useMemo(
        () => ({ startDate, endDate, department: userDept }),
        [startDate, endDate, userDept],
    );

    const { data, isLoading, isError, refetch } = useDefaulters(filters);

    const notAcknowledged: DefaulterRow[] = data?.data?.notAcknowledged ?? [];
    const notApplied: DefaulterRow[]      = data?.data?.notApplied ?? [];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => window.history.back()}
                    className="text-sm text-indigo-600 hover:underline mb-3 inline-block"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Defaulters List</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {userDept ? `Department: ${userDept}` : "All departments"} — blocks that are stuck after sanctioning
                </p>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Block Working Date — From</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Block Working Date — To</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    onClick={() => refetch()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    Apply
                </button>
            </div>

            {isLoading && (
                <div className="text-center py-16 text-gray-500">Loading defaulters...</div>
            )}
            {isError && (
                <div className="text-center py-10 text-red-600 bg-red-50 border border-red-200 rounded-xl">
                    Failed to load data. Please try again.
                </div>
            )}

            {!isLoading && !isError && (
                <>
                    {/* Group 1 */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Group 1 — Sanctioned but not yet acknowledged by SSE
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Block was sanctioned. SSE/JE has not accepted or rejected it.
                                    {notAcknowledged.length > 0 && (
                                        <span className="ml-2 font-semibold text-red-600">
                                            {notAcknowledged.length} pending
                                        </span>
                                    )}
                                </p>
                            </div>
                            {notAcknowledged.length > 0 && (
                                <button
                                    onClick={() => downloadExcel(notAcknowledged, "Not_Acknowledged")}
                                    className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-sm px-3 py-2 rounded-lg font-medium"
                                >
                                    ↓ Excel
                                </button>
                            )}
                        </div>
                        <DefaulterTable
                            rows={notAcknowledged}
                            elapsedLabel="Elapsed Since Sanctioned"
                            emptyMessage="No pending acknowledgements — all clear!"
                        />
                    </div>

                    {/* Group 2 */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Group 2 — Acknowledged but not applied for availing
                                </h2>
                                <p className="text-sm text-gray-500">
                                    SSE/JE accepted the sanction but has not submitted for availing nor exited.
                                    {notApplied.length > 0 && (
                                        <span className="ml-2 font-semibold text-red-600">
                                            {notApplied.length} pending
                                        </span>
                                    )}
                                </p>
                            </div>
                            {notApplied.length > 0 && (
                                <button
                                    onClick={() => downloadExcel(notApplied, "Not_Applied")}
                                    className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-sm px-3 py-2 rounded-lg font-medium"
                                >
                                    ↓ Excel
                                </button>
                            )}
                        </div>
                        <DefaulterTable
                            rows={notApplied}
                            elapsedLabel="Elapsed Since Sanctioned"
                            emptyMessage="No pending avail applications — all clear!"
                        />
                    </div>
                </>
            )}
        </div>
    );
}
