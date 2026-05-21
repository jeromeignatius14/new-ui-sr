"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useAnalyticsSummary } from "@/app/service/query/analytics";
import { analyticsService, AnalyticsFilters } from "@/app/service/api/analytics";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList,
} from "recharts";

// ── Palette ───────────────────────────────────────────────────────────────────
const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#06b6d4"];
const GREEN  = "#10b981";
const AMBER  = "#f59e0b";
const RED    = "#ef4444";
const INDIGO = "#6366f1";
const BLUE   = "#3b82f6";

// ── Plain-English status explanations ────────────────────────────────────────
// Maps every raw overAllStatus string → what it actually means for a manager
const STATUS_LABEL: Record<string, { label: string; severity: "red" | "amber" | "blue" | "green" }> = {
  // ── Pre-sanction / Pending
  "No Status":                                    { label: "Request created but not yet submitted",                        severity: "blue"  },
  "with Dept Controller":                         { label: "Waiting for Department Controller to approve",                 severity: "amber" },
  "Pending Manager Approval":                     { label: "Waiting for Line Manager to review",                           severity: "amber" },
  "Pending with manager":                         { label: "Waiting for Line Manager to review",                           severity: "amber" },

  // ── Rejections
  "return to applicant by Dept controller":       { label: "Rejected by Department Controller — sent back to applicant",   severity: "red"   },
  "return to applicant by optg":                  { label: "Rejected by Operating Dept — sent back to applicant",          severity: "red"   },
  "return to applicant by S&T disconnection":     { label: "Rejected by S&T (disconnection conflict)",                     severity: "red"   },
  "return to applicant by TRD disconnection":     { label: "Rejected by TRD (disconnection conflict)",                     severity: "red"   },
  "return to applicant by ENGG disconnection":    { label: "Rejected by ENGG (disconnection conflict)",                    severity: "red"   },
  "return to applicant by disconnection":         { label: "Rejected due to disconnection conflict",                       severity: "red"   },
  "Sanctioned and Rejected by SSE":               { label: "Admin sanctioned, but SSE rejected — block stuck here",        severity: "red"   },

  // ── Sanctioned / SSE
  "Sanctioned, Pending with SSE For Acceptance":  { label: "Sanctioned by admin — SSE hasn't acknowledged it yet",             severity: "amber" },
  "Sanctioned":                                   { label: "Sanctioned — nobody has applied for availing yet",             severity: "amber" },
  "Sanctioned And Accepted By SSE":               { label: "SSE acknowledged — but nobody applied for block availing",         severity: "amber" },
  "Sanctioned and Accepted by SSE":               { label: "SSE acknowledged — but nobody applied for block availing",         severity: "amber" },

  // ── Avail pipeline
  "Pending Concurrences":                         { label: "Waiting for TRD / S&T / ENGG concurrences before SM can act", severity: "amber" },
  "Pending SM Approval":                          { label: "Waiting for Station Master to approve the avail request",      severity: "amber" },
  "Pending TRD Controller Permit":                { label: "Waiting for TRD Controller to issue the permit",               severity: "amber" },
  "SM Approved":                                  { label: "SM approved — SSE hasn't acknowledged to start availing",      severity: "amber" },
  "Availing Active":                              { label: "Block being availed — participants haven't filed closure yet",  severity: "amber" },
  "All Closures Submitted":                       { label: "All participants closed — SM hasn't acknowledged yet",         severity: "amber" },
  "Block Closed":                                 { label: "Successfully closed ✓",                                        severity: "green" },
  "Availing Cancelled":                           { label: "Exited without availing the block",                                                                 severity: "red"   },
  "SM Rejected":                                  { label: "Station Master rejected the avail request — block not granted",                                      severity: "red"   },
};

function explainStatus(raw: string): { label: string; severity: "red" | "amber" | "blue" | "green" } {
  return STATUS_LABEL[raw] ?? { label: raw, severity: "blue" };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtMin(min: number | null) {
  if (min === null || min === undefined) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
function pct(num: number, den: number) {
  return den > 0 ? Math.round((num / den) * 100) : 0;
}

// ── Excel download helper ─────────────────────────────────────────────────────
async function downloadGapExcel(
  filters: AnalyticsFilters,
  gapKey: string,
  rawStatus: string,
) {
  const res = await analyticsService.exportGap(filters, gapKey, rawStatus);
  const rows: Record<string, unknown>[] = res?.data ?? [];
  if (!rows.length) { alert("No data to download."); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  // Auto column widths
  const maxLen = (key: string) => Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length));
  ws["!cols"] = Object.keys(rows[0]).map((k) => ({ wch: Math.min(maxLen(k) + 2, 40) }));
  XLSX.utils.book_append_sheet(wb, ws, "Requests");
  const statusSlug = rawStatus.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  const from = filters.startDate ?? "all";
  const to   = filters.endDate   ?? "today";
  XLSX.writeFile(wb, `RBMS_${gapKey}_${statusSlug}_${from}_to_${to}_${rows.length}rows.xlsx`);
}

// ── Gap breakdown panel ───────────────────────────────────────────────────────
function GapBreakdown({ gapKey, rows, total, filters }: {
  gapKey: string;
  rows: { status: string; count: number }[];
  total: number;
  filters: AnalyticsFilters;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const severityColor = { red: RED, amber: AMBER, blue: INDIGO, green: GREEN };
  const severityBg    = { red: "bg-red-50 border-red-100", amber: "bg-amber-50 border-amber-100", blue: "bg-indigo-50 border-indigo-100", green: "bg-green-50 border-green-100" };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
        Where are these {total} requests? — click ⬇ to download that group as Excel
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const { label, severity } = explainStatus(r.status);
          const p     = total > 0 ? Math.round((r.count / total) * 100) : 0;
          const color = severityColor[severity];
          const isDownloading = loading === r.status;
          return (
            <div key={i} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${severityBg[severity]}`}>
              <div className="flex-1 text-xs font-semibold text-gray-800 leading-snug">{label}</div>
              <div className="text-lg font-extrabold shrink-0" style={{ color }}>{r.count}</div>
              <div className="text-xs text-gray-400 shrink-0 w-8 text-right">{p}%</div>
              <button
                disabled={isDownloading}
                onClick={async () => {
                  setLoading(r.status);
                  try { await downloadGapExcel(filters, gapKey, r.status); }
                  finally { setLoading(null); }
                }}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-xs font-bold transition-all disabled:opacity-50"
                title={`Download these ${r.count} requests as Excel`}
              >
                {isDownloading ? "..." : "⬇ Excel"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Wait time pills ───────────────────────────────────────────────────────────
function WaitPills({ lt1h, h1_4, h4_24, gt24h }: { lt1h: number; h1_4: number; h4_24?: number; gt24h?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">&lt;1 hr: {lt1h}</span>
      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">1–4 hr: {h1_4}</span>
      {h4_24 !== undefined && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">4–24 hr: {h4_24}</span>}
      {gt24h  !== undefined && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">&gt;24 hr: {gt24h}</span>}
    </div>
  );
}

// ── Pipeline Stage Card ───────────────────────────────────────────────────────
function StageCard({
  icon, title, count, prev, color, children,
}: {
  icon: string; title: string; count: number; prev?: number;
  color: string; children?: React.ReactNode;
}) {
  const rate      = prev != null && prev > 0 ? Math.round((count / prev) * 100) : null;
  const rateColor = rate == null ? INDIGO : rate >= 70 ? GREEN : rate >= 40 ? AMBER : RED;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-4" style={{ borderLeft: `5px solid ${color}` }}>
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">{title}</div>
          {rate != null && (
            <div className="text-xs text-gray-400 mt-0.5">
              <span className="font-bold" style={{ color: rateColor }}>{rate}%</span> of previous stage made it here
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-4xl font-black leading-none" style={{ color }}>{count.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-0.5">requests</div>
        </div>
      </div>
      {children != null && (
        <div className="px-5 pb-4 pt-3 border-t border-gray-100 space-y-2.5 bg-gray-50/40">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Alert pill ────────────────────────────────────────────────────────────────
function Alert({ children, severity = "red" }: { children: React.ReactNode; severity?: "red" | "amber" }) {
  const cls = severity === "red"
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-amber-50 border-amber-200 text-amber-700";
  return (
    <div className={`text-xs font-semibold border rounded-lg px-3 py-2 leading-snug ${cls}`}>
      {children}
    </div>
  );
}

// ── Gap Connector ─────────────────────────────────────────────────────────────
function GapConnector({
  dropped, label, gapKey, rows, activeGap, setActiveGap, filters,
}: {
  dropped: number; label: string; gapKey: string;
  rows: { status: string; count: number }[];
  activeGap: string | null;
  setActiveGap: (k: string | null) => void;
  filters: AnalyticsFilters;
}) {
  const isOpen = activeGap === gapKey;
  const total  = rows.reduce((s, r) => s + r.count, 0);
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-px h-6 bg-gray-300" />
      {dropped > 0 ? (
        <button
          onClick={() => setActiveGap(isOpen ? null : gapKey)}
          className={`flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-bold border-2 transition-all ${
            isOpen
              ? "bg-red-500 border-red-500 text-white shadow-lg"
              : "bg-white border-red-200 text-red-500 hover:border-red-400 hover:bg-red-50 shadow-sm"
          }`}
        >
          <span className="font-black text-lg">{dropped.toLocaleString()}</span>
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-xs opacity-60 font-normal">{isOpen ? "▲ hide" : "▼ where are they?"}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-400 text-xs font-semibold">
          ✓ 0 lost here
        </div>
      )}
      {isOpen && total > 0 && (
        <div className="w-full mt-2">
          <GapBreakdown gapKey={gapKey} rows={rows} total={total} filters={filters} />
        </div>
      )}
      <div className="w-px h-6 bg-gray-300" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalystDashboard() {
  const { data: session } = useSession({ required: true, onUnauthenticated() { window.location.href = "/auth/login"; } });

  const today    = new Date();
  // MAS (Chennai) went live 1 Apr 2026; all other divisions went live 21 May 2026.
  const getAppStart = (loc: string) =>
    (loc === "" || loc.toUpperCase() === "MAS") ? "2026-04-01" : "2026-05-21";

  const [filters, setFilters] = useState({
    startDate: getAppStart(""),
    endDate:   today.toISOString().split("T")[0],
    department: "", location: "",
  });
  const [draft,        setDraft]        = useState({ ...filters });
  const [activeGap,    setActiveGap]    = useState<string | null>(null);
  const [dateWarning,  setDateWarning]  = useState(false);

  const { data: raw, isLoading, isError, refetch } = useAnalyticsSummary(filters);
  const d = raw?.data;

  const appStart = getAppStart(draft.location);

  const applyFilters = () => {
    if (draft.startDate < appStart) { setDateWarning(true); return; }
    setDateWarning(false);
    setFilters({ ...draft });
    setActiveGap(null);
  };
  const resetFilters = () => {
    const r = { startDate: getAppStart(""), endDate: today.toISOString().split("T")[0], department: "", location: "" };
    setDraft(r); setFilters(r); setActiveGap(null); setDateWarning(false);
  };

  const f      = d?.funnel;
  const ap     = d?.availPipeline;
  const sr     = d?.stuckRequests;
  const gaps   = d?.funnelGaps;
  const delays = d?.stageDelays ?? {};
  const maxDelay = Math.max(...(Object.values(delays).filter((v) => v !== null) as number[]), 600);

  return (
    <div className="min-h-screen bg-[#f0f2f8] text-black">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">A</span>
          </div>
          <div>
            <div className="font-extrabold text-gray-900 text-sm">RBMS Analytics</div>
            <div className="text-xs text-gray-400">{session?.user?.name} · {session?.user?.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const role = session?.user?.role;
              const back = role === "DRM" ? "/drm/generate-report"
                : role === "HQ"  ? "/hq/generate-report"
                : role === "PUNCTUALITY_CONTROLLER" ? "/dashboard"
                : "/dashboard";
              window.location.href = back;
            }}
            className="text-xs font-bold text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
            ← Back
          </button>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-xs font-bold text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Filters ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Filters</div>
          {dateWarning && (
            <div className="mb-3 flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
              <span className="text-amber-500 text-lg shrink-0">⚠</span>
              <div>
                <div className="text-sm font-bold text-amber-800">
                  No data before {appStart === "2026-04-01" ? "1 April 2026" : "21 May 2026"}
                </div>
                <div className="text-xs text-amber-700 mt-0.5">
                  {appStart === "2026-04-01"
                    ? <>MAS (Chennai) went live on <strong>1 Apr 2026</strong>. Please set the &quot;From&quot; date to 1 Apr 2026 or later.</>
                    : <>This division went live on <strong>21 May 2026</strong>. Please set the &quot;From&quot; date to 21 May 2026 or later.</>}
                </div>
              </div>
              <button onClick={() => { setDraft(p => ({ ...p, startDate: appStart })); setDateWarning(false); }}
                className="ml-auto shrink-0 text-xs font-bold text-amber-700 hover:text-amber-900 border border-amber-300 rounded-lg px-2.5 py-1 bg-white">
                Reset date
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Division</label>
              <select value={draft.location}
                onChange={(e) => {
                  const loc = e.target.value;
                  const newStart = getAppStart(loc);
                  setDraft((p) => ({ ...p, location: loc, startDate: newStart }));
                  setDateWarning(false);
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">All Divisions</option>
                <option value="MAS">MAS — Chennai</option>
                <option value="MDU">MDU — Madurai</option>
                <option value="PGT">PGT — Palakkad</option>
                <option value="SA">SA — Salem</option>
                <option value="TPJ">TPJ — Tiruchirapalli</option>
                <option value="TVC">TVC — Trivandrum</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">From</label>
              <input type="date" value={draft.startDate} min={appStart}
                onChange={(e) => { setDraft((p) => ({ ...p, startDate: e.target.value })); setDateWarning(false); }}
                className={`border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300 ${draft.startDate < appStart ? "border-amber-400 bg-amber-50" : "border-gray-200"}`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">To</label>
              <input type="date" value={draft.endDate}
                onChange={(e) => setDraft((p) => ({ ...p, endDate: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Department</label>
              <select value={draft.department} onChange={(e) => setDraft((p) => ({ ...p, department: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">All</option>
                <option value="TRD">TRD</option>
                <option value="S&T">S&T</option>
                <option value="ENGG">ENGG</option>
              </select>
            </div>
            <button onClick={applyFilters}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors">Apply</button>
            <button onClick={resetFilters}
              className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Reset</button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 font-semibold">
            Failed to load analytics data.{" "}
            <button onClick={() => refetch()} className="underline">Retry</button>
          </div>
        )}

        {d && f && (
          <>
            {/* ── KPI Summary strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Requests", v: f.totalRequests, color: INDIGO,    sub: "created in this period" },
                { label: "Sanctioned",     v: f.sanctioned,    color: AMBER,     sub: `${pct(f.sanctioned, f.totalRequests)}% of total approved` },
                { label: "Avail Applied",  v: f.availApplied,  color: "#8b5cf6", sub: `only ${pct(f.availApplied, f.sanctioned)}% of sanctioned` },
                { label: "Block Closed",   v: f.closed,        color: GREEN,     sub: `${pct(f.closed, f.availApplied)}% of applied blocks` },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</div>
                  <div className="text-3xl font-extrabold mt-0.5" style={{ color: item.color }}>{item.v.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
              ))}
            </div>

            {/* ── PIPELINE FLOW ── */}
            <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
              Request Lifecycle — tap any red badge to see where those requests are stuck
            </div>

            {/* Stage 1 — Created */}
            <StageCard icon="📋" title="Block Requests Created" count={f.totalRequests} color={INDIGO} />

            {/* Gap 1 — not sanctioned */}
            <GapConnector
              dropped={f.totalRequests - f.sanctioned}
              label="not sanctioned"
              gapKey="notSanctioned"
              rows={gaps?.notSanctioned ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
              filters={filters}
            />

            {/* Stage 2 — Sanctioned */}
            <StageCard icon="✅" title="Sanctioned" count={f.sanctioned} prev={f.totalRequests} color={AMBER} />

            {/* Gap 2 — SSE not accepted */}
            <GapConnector
              dropped={f.dropSanctionToAcceptance}
              label="sanctioned but SSE hasn't accepted"
              gapKey="sseNotAccepted"
              rows={gaps?.sseNotAccepted ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
              filters={filters}
            />

            {/* Stage 3 — SSE Accepted */}
            <StageCard icon="📡" title="Acknowledged by SSE" count={f.acceptedBySse} prev={f.sanctioned} color="#f97316">
              {sr?.sseNotAcceptingSanction > 0 && (
                <Alert severity="red">
                  ⚠ {sr.sseNotAcceptingSanction} blocks sanctioned but SSE hasn&apos;t accepted in over 72 hours — follow up with field staff
                </Alert>
              )}
            </StageCard>

            {/* Gap 3 — never applied for avail */}
            <GapConnector
              dropped={f.dropAcceptanceToApplied}
              label="SSE accepted but nobody applied for block availing"
              gapKey="notAvailApplied"
              rows={gaps?.notAvailApplied ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
              filters={filters}
            />

            {/* Stage 4 — Avail Applied */}
            <StageCard icon="🚦" title="Applied for Block Availing" count={f.availApplied} prev={f.acceptedBySse} color="#8b5cf6">
              {ap && (
                <>
                  {/* Live snapshot — 4 buckets, plain labels */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Waiting for SM to approve",       v: ap.stageCounts.pendingSmApproval,   color: AMBER, warn: sr?.smNotActing > 0 },
                      { label: "Waiting for dept concurrences",   v: ap.stageCounts.pendingConcurrences,  color: BLUE  },
                      { label: "Waiting for TRD permit",          v: ap.stageCounts.pendingTrdPermit,     color: "#8b5cf6" },
                      { label: "Block currently being availed",   v: ap.stageCounts.availingActive,       color: GREEN },
                    ].map((item, i) => (
                      <div key={i} className={`rounded-lg px-3 py-2 flex items-center gap-3 border ${(item as any).warn ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"}`}>
                        <div className="text-2xl font-extrabold leading-none shrink-0" style={{ color: item.color }}>{item.v}</div>
                        <div className="text-xs text-gray-600 font-semibold leading-tight">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* SM wait time — only if requests are waiting */}
                  {ap.stageCounts.pendingSmApproval > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <div className="text-xs font-bold text-amber-800 mb-1.5">
                        How long have SM approval requests been waiting?
                      </div>
                      <WaitPills lt1h={ap.smApprovalWait.lt1h} h1_4={ap.smApprovalWait.h1_4} h4_24={ap.smApprovalWait.h4_24} gt24h={ap.smApprovalWait.gt24h} />
                      {ap.smApprovalWait.gt24h > 0 && (
                        <div className="text-xs text-red-600 font-bold mt-1.5">
                          ⚠ {ap.smApprovalWait.gt24h} waiting over 24 hours — Station Masters need to log in and act
                        </div>
                      )}
                    </div>
                  )}

                  {/* Concurrence detail — only if pending */}
                  {ap.stageCounts.pendingConcurrences > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <div className="text-xs font-bold text-blue-800 mb-1.5">Which departments haven&apos;t given concurrence?</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { dept: "TRD",  p: ap.concurrenceBreakdown.trdPending,  r: ap.concurrenceBreakdown.trdRejected  },
                          { dept: "S&T",  p: ap.concurrenceBreakdown.sntPending,  r: ap.concurrenceBreakdown.sntRejected  },
                          { dept: "ENGG", p: ap.concurrenceBreakdown.enggPending, r: ap.concurrenceBreakdown.enggRejected },
                        ].filter(row => row.p > 0 || row.r > 0).map((row, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            <span className="font-extrabold text-blue-700">{row.dept}:</span>
                            {row.p > 0 && <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">{row.p} pending</span>}
                            {row.r > 0 && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{row.r} rejected</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </StageCard>

            {/* Gap 4 — SM not approving */}
            <GapConnector
              dropped={f.dropAppliedToSmApproved}
              label="applied but SM hasn't approved"
              gapKey="smNotApproved"
              rows={gaps?.smNotApproved ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
              filters={filters}
            />

            {/* Stage 5 — SM Approved */}
            <StageCard icon="👮" title="SM Approved" count={f.smApproved} prev={f.availApplied} color="#ec4899">
              {ap?.stageCounts.smApprovedAckPending > 0 && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg px-3 py-2">
                  <div className="text-xs font-bold text-pink-800 mb-1.5">
                    {ap.stageCounts.smApprovedAckPending} blocks approved — SSE hasn&apos;t acknowledged to start availing
                  </div>
                  <WaitPills lt1h={ap.sseAckWait.lt1h} h1_4={ap.sseAckWait.h1_4} gt24h={ap.sseAckWait.gt4h} />
                  {ap.sseAckWait.gt4h > 0 && (
                    <div className="text-xs text-red-600 font-bold mt-1">
                      ⚠ {ap.sseAckWait.gt4h} waiting over 4 hours — SSE must acknowledge to proceed
                    </div>
                  )}
                </div>
              )}
            </StageCard>

            {/* Gap 5 — not closed */}
            <GapConnector
              dropped={(f.smApproved ?? 0) - f.closed}
              label="SM approved but block not yet closed"
              gapKey="smApprovedNotClosed"
              rows={gaps?.smApprovedNotClosed ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
              filters={filters}
            />

            {/* Stage 6 — Block Closed */}
            <StageCard icon="🏁" title="Block Closed" count={f.closed} prev={f.smApproved} color={GREEN}>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center gap-3">
                  <div className="text-2xl font-extrabold text-green-600">{d.burstStats?.onTime ?? 0}</div>
                  <div className="text-xs text-green-700 font-semibold">Closed within granted time</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-3">
                  <div className="text-2xl font-extrabold text-red-500">{d.burstStats?.burst ?? 0}</div>
                  <div className="text-xs text-red-600 font-semibold">Ran over granted time ({d.burstStats?.burstRate ?? 0}% overrun rate)</div>
                </div>
              </div>
            </StageCard>

            {/* ── STAGE DELAYS ── */}
            <div className="mt-8 mb-2 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Average Time Spent at Each Stage</div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-3">Red bars = bottlenecks (over 6 hours average). Shows where time is being lost.</p>
              <div className="space-y-2">
                {([
                  { label: "Creation → Manager review",         key: "creationToManager"  },
                  { label: "Manager → Admin approval",          key: "managerToAdmin"      },
                  { label: "Admin → Sanctioned",                key: "adminToSanction"     },
                  { label: "Sanctioned → Avail applied",        key: "sanctionToApply"     },
                  { label: "Avail applied → SM approval",       key: "applyToSmApproval"   },
                  { label: "SM approved → Availing started",    key: "smApprovalToStart"   },
                  { label: "Availing start → Closure filed",    key: "startToClosure"      },
                  { label: "Closure filed → SM acknowledges",   key: "closureToSmAck"      },
                ] as { label: string; key: keyof typeof delays }[]).map(({ label, key }, i) => {
                  const min = delays[key];
                  const p   = min ? Math.min((min / maxDelay) * 100, 100) : 0;
                  const c   = min === null ? "#d1d5db" : min < 60 ? GREEN : min < 360 ? AMBER : RED;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-52 text-xs font-semibold text-gray-600 shrink-0">{label}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p}%`, background: c }} />
                      </div>
                      <div className="text-xs font-bold text-gray-700 w-20 text-right shrink-0">{fmtMin(min)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── SUPPORTING CHARTS ── */}
            {d.monthlyTrend?.length > 0 && (
              <>
                <div className="mt-8 mb-2 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Monthly Trend</div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={d.monthlyTrend} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="total"      stroke={INDIGO}  strokeWidth={2} dot={false} name="Total" />
                      <Line type="monotone" dataKey="sanctioned" stroke={AMBER}   strokeWidth={2} dot={false} name="Sanctioned" />
                      <Line type="monotone" dataKey="availed"    stroke="#8b5cf6" strokeWidth={2} dot={false} name="Avail Applied" />
                      <Line type="monotone" dataKey="closed"     stroke={GREEN}   strokeWidth={2} dot={false} name="Closed" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Department Breakdown</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={d.deptBreakdown} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="total"     fill={INDIGO} name="Total"     radius={[4,4,0,0]} />
                    <Bar dataKey="closed"    fill={GREEN}  name="Closed"    radius={[4,4,0,0]} />
                    <Bar dataKey="cancelled" fill={RED}    name="Cancelled" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Status Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={d.statusDist.slice(0,8)} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75}
                      label={({ percent }) => (percent ?? 0) > 0.06 ? `${((percent ?? 0)*100).toFixed(0)}%` : ""}>
                      {d.statusDist.slice(0,8).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {d.sectionBreakdown?.length > 0 && (
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Top Sections by Volume</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={d.sectionBreakdown.slice(0,10)} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="section" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill={INDIGO} radius={[0,4,4,0]}>
                      <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 700 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {d.depotBreakdown?.length > 0 && (
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Depot-wise Performance</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={d.depotBreakdown.slice(0,12)} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="depot" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="total"  fill={INDIGO} name="Total"  radius={[4,4,0,0]} />
                    <Bar dataKey="closed" fill={GREEN}  name="Closed" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Exit without availing records ── */}
            {d.exitWithoutAvailingRecords?.length > 0 && (
              <div className="mt-8">
                <div className="mb-2 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Blocks Exited Without Availing</div>
                <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
                    <div className="font-extrabold text-red-700 text-sm">
                      ⛔ {d.exitWithoutAvailingRecords.length} block{d.exitWithoutAvailingRecords.length !== 1 ? "s" : ""} exited without availing
                    </div>
                    <div className="text-xs text-red-500 font-semibold">
                      Reason, who & when — all recorded
                    </div>
                  </div>

                  {/* Reason summary pills */}
                  <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-gray-100">
                    {Object.entries(
                      d.exitWithoutAvailingRecords.reduce((acc: Record<string, number>, r: any) => {
                        acc[r.reason] = (acc[r.reason] ?? 0) + 1;
                        return acc;
                      }, {})
                    ).map(([reason, count]) => (
                      <span key={reason} className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                        {reason}: {count as number}
                      </span>
                    ))}
                  </div>

                  {/* Detail table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-extrabold uppercase text-left">
                          <th className="px-4 py-2">Block ID</th>
                          <th className="px-4 py-2">Mission Block</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Reason</th>
                          <th className="px-4 py-2">Exited By</th>
                          <th className="px-4 py-2">Exited At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.exitWithoutAvailingRecords.map((r: any, i: number) => (
                          <tr key={i} className="border-t border-gray-100 hover:bg-red-50">
                            <td className="px-4 py-2 font-bold text-gray-800">{r.divisionId ?? "—"}</td>
                            <td className="px-4 py-2 font-semibold text-gray-700">{r.missionBlock ?? "—"}</td>
                            <td className="px-4 py-2 text-gray-600">{r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}</td>
                            <td className="px-4 py-2">
                              <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">{r.reason}</span>
                            </td>
                            <td className="px-4 py-2 font-semibold text-gray-700">
                              {r.exitedByName ?? "—"}
                              {r.exitedByPhone && <span className="text-gray-400 ml-1">({r.exitedByPhone})</span>}
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {r.exitedAt ? new Date(r.exitedAt).toLocaleString("en-IN") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Action summary ── */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="font-extrabold text-amber-800 mb-3 text-sm">📋 What Needs Immediate Attention</div>
              <ul className="text-sm text-amber-700 space-y-1.5 font-semibold">
                {pct(f.availApplied, f.sanctioned) < 5 && (
                  <li>🔴 Only <strong>{pct(f.availApplied, f.sanctioned)}%</strong> of sanctioned blocks are being applied for availing — {(f.sanctioned - f.availApplied).toLocaleString()} sanctioned blocks are going completely unused.</li>
                )}
                {sr?.smNotActing > 0 && (
                  <li>🔴 <strong>{sr.smNotActing}</strong> avail requests waiting for SM action over 1 hour — Station Masters need to log in and respond.</li>
                )}
                {sr?.sseNotAcceptingSanction > 0 && (
                  <li>🟠 <strong>{sr.sseNotAcceptingSanction}</strong> sanctioned blocks not acknowledged by SSE in over 72 hours.</li>
                )}
                {ap?.smApprovalWait?.gt24h > 0 && (
                  <li>🔴 <strong>{ap.smApprovalWait.gt24h}</strong> requests waiting SM approval for over 24 hours — escalate to divisional management.</li>
                )}
                {sr?.activeNotClosed > 0 && (
                  <li>🟡 <strong>{sr.activeNotClosed}</strong> active blocks with no closure filed — field staff must submit closures on the app.</li>
                )}
                {d.burstStats?.burstRate > 20 && (
                  <li>🟠 <strong>{d.burstStats.burstRate}%</strong> of closed blocks ran over their granted time window.</li>
                )}
                {d.exitWithoutAvailingRecords?.length > 0 && (
                  <li>🔴 <strong>{d.exitWithoutAvailingRecords.length}</strong> block{d.exitWithoutAvailingRecords.length !== 1 ? "s" : ""} exited without availing — review reasons and take corrective action.</li>
                )}
              </ul>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
