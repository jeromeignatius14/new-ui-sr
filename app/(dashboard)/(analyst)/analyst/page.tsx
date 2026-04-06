"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useAnalyticsSummary } from "@/app/service/query/analytics";
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

// ── Gap breakdown panel ───────────────────────────────────────────────────────
function GapBreakdown({ title, rows, total }: {
  title: string;
  rows: { status: string; count: number }[];
  total: number;
}) {
  const isRejected = (s: string) => /reject|return to|cancelled|disconnection/i.test(s);
  const isPending  = (s: string) => /pending|waiting|not yet/i.test(s);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
        📍 {title} — {total} requests
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const p = total > 0 ? Math.round((r.count / total) * 100) : 0;
          const color = isRejected(r.status) ? RED : isPending(r.status) ? AMBER : INDIGO;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 text-xs font-semibold text-gray-700 min-w-0 truncate" title={r.status}>{r.status}</div>
              <div className="text-sm font-extrabold w-8 text-right shrink-0" style={{ color }}>{r.count}</div>
              <div className="w-24 bg-gray-100 rounded-full h-2 shrink-0">
                <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
              </div>
              <div className="text-xs text-gray-400 w-7 text-right shrink-0">{p}%</div>
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
  const rate       = prev != null && prev > 0 ? Math.round((count / prev) * 100) : null;
  const rateColor  = rate == null ? INDIGO : rate >= 70 ? GREEN : rate >= 40 ? AMBER : RED;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-4" style={{ borderLeft: `5px solid ${color}` }}>
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">{title}</div>
          {rate != null && (
            <div className="text-xs text-gray-400 mt-0.5">
              <span className="font-bold" style={{ color: rateColor }}>{rate}%</span> conversion from previous stage
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-4xl font-black leading-none" style={{ color }}>{count.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-0.5">requests</div>
        </div>
      </div>
      {children != null && (
        <div className="px-5 pb-4 pt-3 border-t border-gray-100 space-y-3 bg-gray-50/40">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Gap Connector ─────────────────────────────────────────────────────────────
function GapConnector({
  dropped, label, gapKey, title, rows, activeGap, setActiveGap,
}: {
  dropped: number; label: string; gapKey: string; title: string;
  rows: { status: string; count: number }[];
  activeGap: string | null;
  setActiveGap: (k: string | null) => void;
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
          <GapBreakdown title={title} rows={rows} total={total} />
        </div>
      )}
      <div className="w-px h-6 bg-gray-300" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalystDashboard() {
  const { data: session } = useSession({ required: true, onUnauthenticated() { window.location.href = "/auth/login"; } });

  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  const [filters, setFilters] = useState({
    startDate: sixMonthsAgo.toISOString().split("T")[0],
    endDate:   today.toISOString().split("T")[0],
    department: "", location: "",
  });
  const [draft,     setDraft]     = useState({ ...filters });
  const [activeGap, setActiveGap] = useState<string | null>(null);

  const { data: raw, isLoading, isError, refetch } = useAnalyticsSummary(filters);
  const d = raw?.data;

  const applyFilters = () => { setFilters({ ...draft }); setActiveGap(null); };
  const resetFilters = () => {
    const r = {
      startDate: sixMonthsAgo.toISOString().split("T")[0],
      endDate:   today.toISOString().split("T")[0],
      department: "", location: "",
    };
    setDraft(r); setFilters(r); setActiveGap(null);
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
            <div className="text-xs text-gray-400">{session?.user?.name} · ANALYST</div>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="text-xs font-bold text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Filters ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Filters</div>
          <div className="flex flex-wrap gap-3 items-end">
            {([
              { label: "From", type: "date", val: draft.startDate, key: "startDate" },
              { label: "To",   type: "date", val: draft.endDate,   key: "endDate"   },
            ] as { label: string; type: string; val: string; key: string }[]).map(({ label, type, val, key }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-semibold">{label}</label>
                <input type={type} value={val}
                  onChange={(e) => setDraft((p) => ({ ...p, [key as string]: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            ))}
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
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Depot</label>
              <input type="text" placeholder="e.g. TVC" value={draft.location}
                onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300 w-28" />
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
                { label: "Total Requests", v: f.totalRequests, color: INDIGO,     sub: "all block requests" },
                { label: "Sanctioned",     v: f.sanctioned,    color: AMBER,      sub: `${pct(f.sanctioned, f.totalRequests)}% of total` },
                { label: "Avail Applied",  v: f.availApplied,  color: "#8b5cf6",  sub: `${pct(f.availApplied, f.sanctioned)}% of sanctioned` },
                { label: "Block Closed",   v: f.closed,        color: GREEN,      sub: `${pct(f.closed, f.availApplied)}% of applied` },
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
              Request Lifecycle Pipeline — click any red badge to see where those requests are
            </div>

            {/* Stage 1 — Created */}
            <StageCard icon="📋" title="Block Requests Created" count={f.totalRequests} color={INDIGO}>
              {d.monthlyTrend?.length > 0 && (
                <div className="text-xs text-gray-500">
                  Avg <strong>{Math.round(f.totalRequests / Math.max(d.monthlyTrend.length, 1))}</strong> requests/month over the last <strong>{d.monthlyTrend.length}</strong> months
                </div>
              )}
            </StageCard>

            {/* Gap 1 — not sanctioned */}
            <GapConnector
              dropped={f.totalRequests - f.sanctioned}
              label="not sanctioned"
              gapKey="notSanctioned"
              title="Where are the unsanctioned requests?"
              rows={gaps?.notSanctioned ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
            />

            {/* Stage 2 — Sanctioned */}
            <StageCard icon="✅" title="Sanctioned" count={f.sanctioned} prev={f.totalRequests} color={AMBER}>
              {d.rejectionReasons?.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1.5">Top rejection reasons for others:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.rejectionReasons.slice(0, 4).map((r: any, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full font-semibold">
                        {r.reason}: {r.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {sr?.sseNotAcceptingSanction > 0 && (
                <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  ⚠ {sr.sseNotAcceptingSanction} sanctioned blocks not accepted by SSE in &gt;72 hours
                </div>
              )}
            </StageCard>

            {/* Gap 2 — SSE not accepted */}
            <GapConnector
              dropped={f.dropSanctionToAcceptance}
              label="sanctioned but SSE hasn't accepted"
              gapKey="sseNotAccepted"
              title="Sanctioned — waiting for SSE acceptance"
              rows={gaps?.sseNotAccepted ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
            />

            {/* Stage 3 — SSE Accepted */}
            <StageCard icon="📡" title="Accepted by SSE" count={f.acceptedBySse} prev={f.sanctioned} color="#f97316">
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                {(delays as any).adminToSanction != null && (
                  <span>Avg time to accept: <strong>{fmtMin((delays as any).adminToSanction)}</strong></span>
                )}
                {(delays as any).sanctionToApply != null && (
                  <span>Avg time sanction → apply: <strong>{fmtMin((delays as any).sanctionToApply)}</strong></span>
                )}
              </div>
              {pct(f.availApplied, f.acceptedBySse) < 10 && f.acceptedBySse > 0 && (
                <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  ⚠ Only {pct(f.availApplied, f.acceptedBySse)}% of SSE-accepted blocks ever get applied for availing — this is the biggest gap in the system
                </div>
              )}
            </StageCard>

            {/* Gap 3 — never applied for avail (the BIG gap) */}
            <GapConnector
              dropped={f.dropAcceptanceToApplied}
              label="accepted sanction but never applied for block availing"
              gapKey="notAvailApplied"
              title="Accepted by SSE — but no avail application was ever filed"
              rows={gaps?.notAvailApplied ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
            />

            {/* Stage 4 — Avail Applied */}
            <StageCard icon="🚦" title="Applied for Block Availing" count={f.availApplied} prev={f.acceptedBySse} color="#8b5cf6">
              {ap && (
                <>
                  {/* Live sub-stage counts */}
                  <div>
                    <div className="text-xs font-bold text-gray-500 mb-2">Current live status of avail requests:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Pending\nConcurrences", v: ap.stageCounts.pendingConcurrences,  color: BLUE   },
                        { label: "Pending\nSM Approval",  v: ap.stageCounts.pendingSmApproval,    color: AMBER, warn: sr?.smNotActing > 0 },
                        { label: "Pending\nTRD Permit",   v: ap.stageCounts.pendingTrdPermit,     color: "#8b5cf6" },
                        { label: "Availing\nActive",      v: ap.stageCounts.availingActive,       color: GREEN  },
                      ].map((item, i) => (
                        <div key={i} className={`rounded-lg p-2.5 text-center border ${(item as any).warn ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
                          <div className="text-2xl font-extrabold leading-none" style={{ color: item.color }}>{item.v}</div>
                          <div className="text-xs text-gray-500 font-semibold leading-tight mt-1 whitespace-pre-line">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SM wait time */}
                  {ap.stageCounts.pendingSmApproval > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-amber-800 mb-1.5">
                        SM Approval Wait — {ap.stageCounts.pendingSmApproval} requests waiting
                      </div>
                      <WaitPills lt1h={ap.smApprovalWait.lt1h} h1_4={ap.smApprovalWait.h1_4} h4_24={ap.smApprovalWait.h4_24} gt24h={ap.smApprovalWait.gt24h} />
                      {ap.smApprovalWait.gt24h > 0 && (
                        <div className="text-xs text-red-600 font-bold mt-1.5">
                          ⚠ {ap.smApprovalWait.gt24h} waiting &gt;24 hours — Station Masters need immediate follow-up
                        </div>
                      )}
                    </div>
                  )}

                  {/* Concurrence breakdown */}
                  {ap.stageCounts.pendingConcurrences > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-blue-800 mb-2">
                        Pending Concurrences — {ap.stageCounts.pendingConcurrences} blocks
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { dept: "TRD",  p: ap.concurrenceBreakdown.trdPending,  r: ap.concurrenceBreakdown.trdRejected  },
                          { dept: "S&T",  p: ap.concurrenceBreakdown.sntPending,  r: ap.concurrenceBreakdown.sntRejected  },
                          { dept: "ENGG", p: ap.concurrenceBreakdown.enggPending, r: ap.concurrenceBreakdown.enggRejected },
                        ].filter(row => row.p > 0 || row.r > 0).map((row, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-blue-700">{row.dept}:</span>
                            {row.p > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">{row.p} pending</span>}
                            {row.r > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{row.r} rejected</span>}
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
              label="applied but SM didn't approve"
              gapKey="smNotApproved"
              title="Applied for avail — SM not approved"
              rows={gaps?.smNotApproved ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
            />

            {/* Stage 5 — SM Approved */}
            <StageCard icon="👮" title="SM Approved" count={f.smApproved} prev={f.availApplied} color="#ec4899">
              {ap && (
                <>
                  {ap.stageCounts.smApprovedAckPending > 0 && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-pink-800 mb-1.5">
                        {ap.stageCounts.smApprovedAckPending} blocks waiting for SSE to acknowledge SM approval
                      </div>
                      <WaitPills lt1h={ap.sseAckWait.lt1h} h1_4={ap.sseAckWait.h1_4} gt24h={ap.sseAckWait.gt4h} />
                      {ap.sseAckWait.gt4h > 0 && (
                        <div className="text-xs text-red-600 font-bold mt-1">⚠ {ap.sseAckWait.gt4h} waiting &gt;4 hours</div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    <span>All-time SM approval rate: <strong style={{ color: ap.historicalRates.smApprovalRate >= 70 ? GREEN : AMBER }}>{ap.historicalRates.smApprovalRate}%</strong></span>
                    <span>Cancellation rate: <strong style={{ color: RED }}>{ap.historicalRates.cancellationRate}%</strong></span>
                  </div>
                </>
              )}
            </StageCard>

            {/* Gap 5 — not closed */}
            <GapConnector
              dropped={(f.smApproved ?? 0) - f.closed}
              label="SM approved but not yet closed"
              gapKey="smApprovedNotClosed"
              title="SM approved — where are the unclosed blocks?"
              rows={gaps?.smApprovedNotClosed ?? []}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
            />

            {/* Stage 6 — Block Closed */}
            <StageCard icon="🏁" title="Block Closed" count={f.closed} prev={f.smApproved} color={GREEN}>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-extrabold text-green-600">{d.burstStats?.onTime ?? 0}</div>
                  <div className="text-xs text-green-700 font-semibold mt-0.5">On-time</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-extrabold text-red-500">{d.burstStats?.burst ?? 0}</div>
                  <div className="text-xs text-red-500 font-semibold mt-0.5">Time overruns ({d.burstStats?.burstRate ?? 0}%)</div>
                </div>
                {ap && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-extrabold text-indigo-600">{ap.historicalRates.closureRate}%</div>
                    <div className="text-xs text-indigo-600 font-semibold mt-0.5">Closure rate (all-time)</div>
                  </div>
                )}
              </div>
              {ap?.cancellationBreakdown?.total > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600 space-y-0.5">
                  <div className="font-bold text-red-700 mb-1">{ap.cancellationBreakdown.total} blocks were cancelled during availing</div>
                  {ap.cancellationBreakdown.cancelledAfterSmApproved > 0 && (
                    <div>· {ap.cancellationBreakdown.cancelledAfterSmApproved} after SM approved (participant rejected grant)</div>
                  )}
                  {ap.cancellationBreakdown.trdRejected > 0 && <div>· {ap.cancellationBreakdown.trdRejected} due to TRD concurrence rejection</div>}
                  {ap.cancellationBreakdown.sntRejected > 0 && <div>· {ap.cancellationBreakdown.sntRejected} due to S&T concurrence rejection</div>}
                  {ap.cancellationBreakdown.enggRejected > 0 && <div>· {ap.cancellationBreakdown.enggRejected} due to ENGG concurrence rejection</div>}
                </div>
              )}
              {ap?.activeParticipants?.notClosed > 0 && (
                <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  ⚠ {ap.activeParticipants.notClosed} participants in {ap.activeParticipants.totalBlocks} active blocks haven&apos;t submitted closure yet
                </div>
              )}
            </StageCard>

            {/* ── STAGE DELAYS ── */}
            <div className="mt-8 mb-2 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Average Time at Each Stage</div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-3">Red = bottleneck (over 6 hours). Shows where time is being lost in the process.</p>
              <div className="space-y-2">
                {([
                  { label: "Creation → Manager",           key: "creationToManager"    },
                  { label: "Manager → Admin Approval",      key: "managerToAdmin"       },
                  { label: "Admin → Sanctioned",            key: "adminToSanction"      },
                  { label: "Sanctioned → Avail Applied",    key: "sanctionToApply"      },
                  { label: "Avail Applied → SM Approval",   key: "applyToSmApproval"    },
                  { label: "SM Approved → Availing Start",  key: "smApprovalToStart"    },
                  { label: "Availing Start → Closure",      key: "startToClosure"       },
                  { label: "Closure → SM Acknowledges",     key: "closureToSmAck"       },
                ] as { label: string; key: keyof typeof delays }[]).map(({ label, key }, i) => {
                  const min = delays[key];
                  const p = min ? Math.min((min / maxDelay) * 100, 100) : 0;
                  const c = min === null ? "#d1d5db" : min < 60 ? GREEN : min < 360 ? AMBER : RED;
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

            {d.rejectionReasons?.length > 0 && (
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Rejection Reasons</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={d.rejectionReasons} layout="vertical" margin={{ left: 10, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="reason" tick={{ fontSize: 11 }} width={200} />
                    <Tooltip />
                    <Bar dataKey="count" fill={RED} radius={[0,4,4,0]}>
                      <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 700 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {d.sectionBreakdown?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Top Sections by Volume</div>
                  <ResponsiveContainer width="100%" height={210}>
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
              {d.blockTypes?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Block Types</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={d.blockTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={75}
                        label={({ name, percent }) => (percent ?? 0) > 0.05 ? `${name}: ${((percent ?? 0)*100).toFixed(0)}%` : ""}>
                        {d.blockTypes.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

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

            {/* ── Action summary ── */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="font-extrabold text-amber-800 mb-3 text-sm">📋 What Management Should Act On</div>
              <ul className="text-sm text-amber-700 space-y-1.5 font-semibold">
                {pct(f.availApplied, f.sanctioned) < 5 && (
                  <li>🔴 <strong>Critical:</strong> Only <strong>{pct(f.availApplied, f.sanctioned)}%</strong> of sanctioned blocks are applied for availing — {(f.sanctioned - f.availApplied).toLocaleString()} sanctioned blocks going unused.</li>
                )}
                {sr?.smNotActing > 0 && (
                  <li>🔴 <strong>{sr.smNotActing}</strong> avail requests awaiting SM action for &gt;1 hour.</li>
                )}
                {sr?.sseNotAcceptingSanction > 0 && (
                  <li>🟠 <strong>{sr.sseNotAcceptingSanction}</strong> sanctioned blocks not accepted by SSE in &gt;72 hours.</li>
                )}
                {ap?.smApprovalWait?.gt24h > 0 && (
                  <li>🔴 <strong>{ap.smApprovalWait.gt24h}</strong> requests waiting SM approval for &gt;24 hours — escalate to divisional management.</li>
                )}
                {ap?.cancellationBreakdown?.cancelledAfterSmApproved > 0 && (
                  <li>🟠 <strong>{ap.cancellationBreakdown.cancelledAfterSmApproved}</strong> blocks cancelled after SM already approved — investigate why participants are rejecting the grant.</li>
                )}
                {sr?.activeNotClosed > 0 && (
                  <li>🟡 <strong>{sr.activeNotClosed}</strong> active blocks with no closure filed — field staff must submit closures.</li>
                )}
                {d.burstStats?.burstRate > 20 && (
                  <li>🟠 <strong>{d.burstStats.burstRate}%</strong> of closed blocks ran over granted time.</li>
                )}
              </ul>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
