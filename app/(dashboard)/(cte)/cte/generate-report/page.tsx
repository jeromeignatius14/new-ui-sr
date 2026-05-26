"use client";

import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Loader } from "@/app/components/ui/Loader";
import Link from "next/link";

// ── Role → fixed department mapping ──────────────────────────────────────────
const ROLE_DEPT: Record<string, string> = {
  CTE:  "ENGG",
  CEDE: "TRD",
  CSE:  "S&T",
};

const ROLE_LABEL: Record<string, string> = {
  CTE:  "CTE — Engineering",
  CEDE: "CEDE — TRD",
  CSE:  "CSE — S&T",
};

const ALL_DIVISIONS = ["MAS", "MDU", "SA", "PGT", "TPJ", "TVC"];

const DIVISION_FULL: Record<string, string> = {
  MAS: "MAS — Chennai",
  MDU: "MDU — Madurai",
  SA:  "SA — Salem",
  PGT: "PGT — Palakkad",
  TPJ: "TPJ — Tiruchirapalli",
  TVC: "TVC — Trivandrum",
};

interface DivisionRow {
  Division: string;
  Department: string;
  DemandsCount: number;
  ApprovedCount: number;
  AppliedCount: number;
  GrantedCount: number;
  AvailedCount: number;
  NotSanctionedCount: number;
  NotGrantedCount: number;
  NotAvailedCount: number;
  Demanded: number;
  Sanctioned: number;
  Granted: number;
  Availed: number;
  PercentSanctioned: number;
  PercentGranted: number;
  PercentAvailed: number;
}

interface DetailedRow {
  Division: string;
  Department: string;
  Section: string;
  Date: string;
  isSanctioned: boolean;
  isGranted: boolean;
  isApplied: boolean;
  userAcceptanceForSanction: boolean;
  overAllStatus: string;
  workType: string;
  Activity: string;
  divisionId: string;
  missionBlock: string;
  selectedDepo: string;
  DemandedTimeFrom: string;
  DemandedTimeTo: string;
  SanctionedTimeFrom: string;
  SanctionedTimeTo: string;
  AvailedTimeFrom: string;
  AvailedTimeTo: string;
  userName: string;
}

type CountFilter = "all" | "demanded" | "approved" | "applied" | "granted" | "availed"
  | "notSanctioned" | "notGranted" | "notAvailed";

export default function CteGenerateReportPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { window.location.href = "/auth/login"; },
  });

  const role = session?.user?.role ?? "";
  const dept = ROLE_DEPT[role] ?? "ENGG";

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const defaultStart = "2026-04-01";

  const [startDate, setStartDate]           = useState(defaultStart);
  const [endDate, setEndDate]               = useState(todayStr);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([...ALL_DIVISIONS]);
  const [blockType, setBlockType]           = useState("All");
  const [loading, setLoading]               = useState(false);
  const [divisionSummary, setDivisionSummary] = useState<DivisionRow[]>([]);
  const [detailedData, setDetailedData]     = useState<DetailedRow[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [activeFilter, setActiveFilter]     = useState<CountFilter>("all");
  const [activeDivision, setActiveDivision] = useState<string | null>(null);

  const toggleDivision = (div: string) => {
    setSelectedDivisions((prev) =>
      prev.includes(div) ? prev.filter((d) => d !== div) : [...prev, div],
    );
  };

  const generate = async () => {
    if (!startDate || !endDate || selectedDivisions.length === 0) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate, endDate,
        divisions: selectedDivisions.join(","),
        department: dept,
        blockType,
      });
      const res  = await fetch(`/api/combined-division-report?${params.toString()}`);
      const json = await res.json();
      setDivisionSummary(json?.data?.divisionSummary ?? []);
      setDetailedData(json?.data?.detailedData ?? []);
      setReportGenerated(true);
      setActiveFilter("all");
      setActiveDivision(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Totals row
  const totals = useMemo<Omit<DivisionRow, "Division" | "Department">>(() => {
    const t: any = {
      DemandsCount: 0, ApprovedCount: 0, AppliedCount: 0, GrantedCount: 0, AvailedCount: 0,
      NotSanctionedCount: 0, NotGrantedCount: 0, NotAvailedCount: 0,
      Demanded: 0, Sanctioned: 0, Granted: 0, Availed: 0,
    };
    divisionSummary.forEach((r) => {
      Object.keys(t).forEach((k) => { t[k] += (r as any)[k] ?? 0; });
    });
    t.PercentSanctioned = t.DemandsCount > 0 ? parseFloat(((t.ApprovedCount / t.DemandsCount) * 100).toFixed(2)) : 0;
    t.PercentGranted    = t.AppliedCount  > 0 ? parseFloat(((t.GrantedCount  / t.AppliedCount) * 100).toFixed(2)) : 0;
    t.PercentAvailed    = t.GrantedCount  > 0 ? parseFloat(((t.AvailedCount  / t.GrantedCount) * 100).toFixed(2)) : 0;
    t.Demanded   = parseFloat(t.Demanded.toFixed(2));
    t.Sanctioned = parseFloat(t.Sanctioned.toFixed(2));
    t.Granted    = parseFloat(t.Granted.toFixed(2));
    t.Availed    = parseFloat(t.Availed.toFixed(2));
    return t;
  }, [divisionSummary]);

  // Filtered detail rows
  const filteredDetail = useMemo(() => {
    let rows = detailedData;
    if (activeDivision) rows = rows.filter((r) => r.Division?.toUpperCase() === activeDivision);
    switch (activeFilter) {
      case "demanded":     return rows;
      case "approved":     return rows.filter((r) => r.isSanctioned);
      case "applied":      return rows.filter((r) => r.isApplied && r.isSanctioned && r.userAcceptanceForSanction);
      case "granted":      return rows.filter((r) => r.isGranted && r.isSanctioned);
      case "availed":      return rows.filter((r) => !!r.AvailedTimeFrom);
      case "notSanctioned":return rows.filter((r) => r.isSanctioned === false);
      case "notGranted":   return rows.filter((r) => r.isGranted === false && r.isApplied && r.isSanctioned);
      case "notAvailed":   return rows.filter((r) => r.isSanctioned && r.userAcceptanceForSanction && r.isApplied && r.isGranted && !r.AvailedTimeFrom);
      default:             return rows;
    }
  }, [detailedData, activeFilter, activeDivision]);

  const handleCountClick = (div: string, filter: CountFilter) => {
    setActiveDivision(div === activeDivision && filter === activeFilter ? null : div);
    setActiveFilter(filter);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const summaryWs = XLSX.utils.json_to_sheet(divisionSummary);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Division Summary");
    const detailWs = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, detailWs, "Detailed Data");
    XLSX.writeFile(wb, `${dept}_division_report_${startDate}_to_${endDate}.xlsx`);
  };

  const fmtHrs = (h: number) => `${h.toFixed(1)}h`;

  if (status === "loading") return <Loader name="page" />;

  return (
    <div className="min-h-screen bg-[#fffbe9] text-black">
      {/* Header */}
      <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 56 }}>
        <Link href="/dashboard" className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-black border border-black rounded px-2 py-1">← Home</Link>
        <span className="text-xl font-bold text-black">{ROLE_LABEL[role] ?? role} — Division Report</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filter Panel */}
        <div className="bg-white border border-black rounded-xl p-4 mb-6 shadow-sm">
          <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Report Filters</div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-600 font-semibold block mb-1">From Date</label>
              <input type="date" value={startDate} min="2026-04-01" max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-semibold block mb-1">To Date</label>
              <input type="date" value={endDate} min={startDate} max={todayStr}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-semibold block mb-1">Department (fixed)</label>
            <div className="inline-block border-2 border-indigo-400 rounded-lg px-4 py-2 text-sm font-extrabold text-indigo-700 bg-indigo-50">{dept}</div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-semibold block mb-2">Select Divisions</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DIVISIONS.map((div) => (
                <button key={div}
                  onClick={() => toggleDivision(div)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-colors ${
                    selectedDivisions.includes(div)
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-indigo-300"
                  }`}>
                  {DIVISION_FULL[div]}
                </button>
              ))}
              <button onClick={() => setSelectedDivisions([...ALL_DIVISIONS])}
                className="px-3 py-1 text-xs font-bold text-indigo-600 border border-indigo-300 rounded-full hover:bg-indigo-50">
                All
              </button>
              <button onClick={() => setSelectedDivisions([])}
                className="px-3 py-1 text-xs font-bold text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50">
                None
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-600 font-semibold block mb-1">Block Type</label>
            <select value={blockType} onChange={(e) => setBlockType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="All">All</option>
              <option value="Corridor">Corridor</option>
              <option value="Non-corridor">Outside Corridor</option>
              <option value="Emergency">Emergency</option>
              <option value="Mega">Mega Block</option>
            </select>
          </div>

          <button onClick={generate} disabled={loading || selectedDivisions.length === 0}
            className="w-full py-3 bg-indigo-600 text-white font-extrabold rounded-xl text-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? "Generating…" : "GENERATE REPORT"}
          </button>
        </div>

        {/* Results */}
        {reportGenerated && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-700">
                {dept} Department — {startDate} to {endDate} — {divisionSummary.length} division(s)
              </div>
              <button onClick={exportExcel}
                className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">
                Export Excel
              </button>
            </div>

            {/* Summary Table */}
            <div className="bg-white border border-black rounded-xl overflow-x-auto mb-6 shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 border-b border-black">
                  <tr>
                    {["Division","Demanded","Sanctioned","% Sanc","Applied","Granted","% Granted","Availed","% Availed"].map((h) => (
                      <th key={h} className="px-3 py-2 font-bold text-gray-700 text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {divisionSummary.map((row) => (
                    <tr key={row.Division} className="border-b border-gray-100 hover:bg-blue-50">
                      <td className="px-3 py-2 font-bold text-center text-indigo-700">{row.Division}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleCountClick(row.Division, "demanded")}
                          className="font-bold text-blue-700 hover:underline">{row.DemandsCount}</button>
                        <div className="text-gray-400">{fmtHrs(row.Demanded)}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleCountClick(row.Division, "approved")}
                          className="font-bold text-green-700 hover:underline">{row.ApprovedCount}</button>
                        <div className="text-gray-400">{fmtHrs(row.Sanctioned)}</div>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{row.PercentSanctioned}%</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleCountClick(row.Division, "applied")}
                          className="font-bold text-orange-600 hover:underline">{row.AppliedCount}</button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleCountClick(row.Division, "granted")}
                          className="font-bold text-purple-700 hover:underline">{row.GrantedCount}</button>
                        <div className="text-gray-400">{fmtHrs(row.Granted)}</div>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{row.PercentGranted}%</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleCountClick(row.Division, "availed")}
                          className="font-bold text-teal-700 hover:underline">{row.AvailedCount}</button>
                        <div className="text-gray-400">{fmtHrs(row.Availed)}</div>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{row.PercentAvailed}%</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-yellow-50 border-t-2 border-black font-bold">
                    <td className="px-3 py-2 text-center font-extrabold">TOTAL</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => { setActiveDivision(null); setActiveFilter("demanded"); }}
                        className="font-extrabold text-blue-700 hover:underline">{totals.DemandsCount}</button>
                      <div className="text-gray-500 text-xs">{fmtHrs(totals.Demanded)}</div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => { setActiveDivision(null); setActiveFilter("approved"); }}
                        className="font-extrabold text-green-700 hover:underline">{totals.ApprovedCount}</button>
                      <div className="text-gray-500 text-xs">{fmtHrs(totals.Sanctioned)}</div>
                    </td>
                    <td className="px-3 py-2 text-center">{totals.PercentSanctioned}%</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => { setActiveDivision(null); setActiveFilter("applied"); }}
                        className="font-extrabold text-orange-600 hover:underline">{totals.AppliedCount}</button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => { setActiveDivision(null); setActiveFilter("granted"); }}
                        className="font-extrabold text-purple-700 hover:underline">{totals.GrantedCount}</button>
                      <div className="text-gray-500 text-xs">{fmtHrs(totals.Granted)}</div>
                    </td>
                    <td className="px-3 py-2 text-center">{totals.PercentGranted}%</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => { setActiveDivision(null); setActiveFilter("availed"); }}
                        className="font-extrabold text-teal-700 hover:underline">{totals.AvailedCount}</button>
                      <div className="text-gray-500 text-xs">{fmtHrs(totals.Availed)}</div>
                    </td>
                    <td className="px-3 py-2 text-center">{totals.PercentAvailed}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed rows panel */}
            {(activeDivision || activeFilter !== "all") && filteredDetail.length > 0 && (
              <div className="bg-white border border-black rounded-xl overflow-x-auto shadow-sm mb-6">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-700">
                    {activeDivision ? `${activeDivision} — ` : "All Divisions — "}
                    {activeFilter} ({filteredDetail.length} requests)
                  </span>
                  <button onClick={() => { setActiveDivision(null); setActiveFilter("all"); }}
                    className="text-xs text-gray-400 hover:text-gray-700">✕ Close</button>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {["Div","Section","Date","Dept","Status","Work Type","Activity","Demanded From","Demanded To","Sanctioned From","Sanctioned To","Availed From","Availed To","User"].map((h) => (
                          <th key={h} className="px-2 py-1.5 font-bold text-gray-600 text-left whitespace-nowrap border-b">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDetail.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-yellow-50">
                          <td className="px-2 py-1.5 font-bold text-indigo-700 whitespace-nowrap">{row.Division}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.Section ?? "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.Date ? new Date(row.Date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.Department}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-xs max-w-[120px] truncate" title={row.overAllStatus}>{row.overAllStatus}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.workType ?? "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap max-w-[100px] truncate" title={row.Activity}>{row.Activity ?? "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.DemandedTimeFrom ? new Date(row.DemandedTimeFrom).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:false}) : "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.DemandedTimeTo   ? new Date(row.DemandedTimeTo).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}) : "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.SanctionedTimeFrom ? new Date(row.SanctionedTimeFrom).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}) : "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.SanctionedTimeTo   ? new Date(row.SanctionedTimeTo).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}) : "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.AvailedTimeFrom ? new Date(row.AvailedTimeFrom).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}) : "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.AvailedTimeTo   ? new Date(row.AvailedTimeTo).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}) : "—"}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{row.userName ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Logout */}
        <div className="flex justify-center mt-4">
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="bg-[#FFB74D] border border-black px-6 py-1.5 rounded text-lg font-bold text-black">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
