"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetSmHistory } from "@/app/service/query/avail";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDt(iso?: string | null) {
  if (!iso) return "—";
  try {
    const s = new Date(iso).toISOString();
    const [y, m, d] = s.slice(0, 10).split("-");
    return `${d}-${m}-${y} ${s.slice(11, 16)}`;
  } catch { return "—"; }
}

function fmtTime(iso?: string | null) {
  if (!iso) return "—";
  try { return new Date(iso).toISOString().slice(11, 16); } catch { return "—"; }
}

function calcDuration(from?: string | null, to?: string | null) {
  if (!from || !to) return "—";
  try {
    const mins = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
    if (mins < 0) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  } catch { return "—"; }
}

const DEPT_OPTIONS = ["", "ENGG", "S&T", "TRD", "OHE", "OPTG", "COM"];
const PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: "24h", label: "Past 24 Hours" },
  { value: "week", label: "Past 1 Week" },
  { value: "month", label: "Past 1 Month" },
  { value: "year", label: "Past 1 Year" },
];

// ── CSV Download ──────────────────────────────────────────────────────────────
function downloadCsv(blocks: any[]) {
  const headers = [
    "Date", "Block ID", "SM Station", "Department", "Depot", "Section",
    "Mission Block", "SM Approved From", "SM Approved To", "Actual Duration",
    "Activity", "Applied By", "Applied By Phone", "Applied By Depot",
    "Burst", "Participants"
  ];
  const rows = blocks.map((b) => {
    const participants = (b.availParticipants ?? [])
      .map((p: any) => `${p.userName}(${p.userDept})`)
      .join(" | ");
    const burst = (b.availParticipants ?? []).some((p: any) => p.blockBurst) ? "YES" : "NO";
    const duration = calcDuration(b.availingStartedAt, b.smClosureAcknowledgedAt);
    return [
      fmtDt(b.date),
      b.id,
      b.smStation ?? "",
      b.selectedDepartment ?? "",
      b.appliedByDepot ?? "",
      b.selectedSection ?? "",
      b.missionBlock ? "YES" : "NO",
      fmtTime(b.smApprovedTimeFrom),
      fmtTime(b.smApprovedTimeTo),
      duration,
      b.activity ?? "",
      b.appliedByName ?? "",
      b.appliedByPhone ?? "",
      b.appliedByDepot ?? "",
      burst,
      participants,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `availed-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page content ─────────────────────────────────────────────────────────
function AvailedHistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const stationCode = session?.user?.depot ?? "";

  const initialPeriod = searchParams.get("period") ?? "week";
  const [period, setPeriod] = useState(initialPeriod);
  const [dept, setDept] = useState("");

  const { data, isLoading, isError, refetch } = useGetSmHistory(
    stationCode || undefined,
    period,
    undefined,
    undefined,
    dept || undefined
  );

  const blocks: any[] = data?.data?.blocks ?? [];
  const total: number = data?.data?.total ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)", padding: "16px 16px 14px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "20px", padding: "6px 14px", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
          >
            ← BACK
          </button>
          <div style={{ fontSize: "16px", fontWeight: 900, letterSpacing: "0.5px" }}>
            SM AVAILED BLOCK HISTORY
          </div>
        </div>
        {stationCode && (
          <div style={{ fontSize: "12px", opacity: 0.8, marginLeft: "2px" }}>
            Station: <strong>{stationCode}</strong>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #dbeafe", padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        {/* Period selector */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              style={{
                background: period === opt.value ? "#1d4ed8" : "#eff6ff",
                color: period === opt.value ? "#fff" : "#1e40af",
                border: `1.5px solid ${period === opt.value ? "#1d4ed8" : "#bfdbfe"}`,
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Dept filter */}
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          style={{ border: "1.5px solid #bfdbfe", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", fontWeight: 700, color: "#1e40af", background: "#eff6ff", cursor: "pointer" }}
        >
          <option value="">All Departments</option>
          {DEPT_OPTIONS.filter(Boolean).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Download CSV */}
        <button
          onClick={() => downloadCsv(blocks)}
          disabled={blocks.length === 0}
          style={{
            marginLeft: "auto",
            background: blocks.length > 0 ? "#15803d" : "#9ca3af",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            padding: "7px 18px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: blocks.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          ⬇ Download CSV
        </button>
      </div>

      {/* Summary */}
      <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>
          {isLoading ? "Loading..." : `${total} block${total !== 1 ? "s" : ""} found`}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "10px 16px 32px" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280", fontSize: "14px" }}>
            Loading history...
          </div>
        )}

        {isError && (
          <div style={{ textAlign: "center", padding: "40px", color: "#dc2626", fontSize: "14px" }}>
            Failed to load history.{" "}
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => refetch()}>
              Retry
            </span>
          </div>
        )}

        {!isLoading && !isError && blocks.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280", fontSize: "14px" }}>
            No availed blocks found for the selected period{dept ? ` / ${dept}` : ""}.
          </div>
        )}

        {!isLoading && !isError && blocks.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <thead>
                <tr style={{ background: "#1d4ed8", color: "#fff" }}>
                  {[
                    "#", "Date", "Block ID", "SM Stn", "Dept", "Depot",
                    "Section", "Mission", "SM Approved", "Duration",
                    "Activity", "Applied By", "Burst", "Participants"
                  ].map((h) => (
                    <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 800, whiteSpace: "nowrap", fontSize: "11px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blocks.map((b, idx) => {
                  const hasBurst = (b.availParticipants ?? []).some((p: any) => p.blockBurst);
                  const duration = calcDuration(b.availingStartedAt, b.smClosureAcknowledgedAt);
                  const participants = (b.availParticipants ?? [])
                    .map((p: any) => `${p.userName} (${p.userDept}${p.userDepot ? "/" + p.userDepot : ""})`)
                    .join(", ");
                  const rowBg = idx % 2 === 0 ? "#fff" : "#f8faff";
                  return (
                    <tr key={b.id} style={{ background: rowBg, borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 10px", color: "#6b7280", fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{fmtDt(b.date)}</td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap", fontWeight: 700, color: "#1d4ed8", fontFamily: "monospace" }}>
                        {b.id?.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{b.smStation ?? "—"}</td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
                        <span style={{ background: "#eff6ff", color: "#1e40af", borderRadius: "4px", padding: "2px 6px", fontWeight: 700, fontSize: "11px" }}>
                          {b.selectedDepartment ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{b.appliedByDepot ?? "—"}</td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }}>{b.selectedSection ?? "—"}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>
                        {b.missionBlock ? <span style={{ color: "#dc2626", fontWeight: 800 }}>YES</span> : <span style={{ color: "#6b7280" }}>—</span>}
                      </td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                        {fmtTime(b.smApprovedTimeFrom)} – {fmtTime(b.smApprovedTimeTo)}
                      </td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap", fontWeight: 700, color: "#047857" }}>
                        {duration}
                      </td>
                      <td style={{ padding: "8px 10px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {b.activity ?? "—"}
                      </td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 700 }}>{b.appliedByName ?? "—"}</div>
                        {b.appliedByPhone && (
                          <div style={{ color: "#6b7280", fontSize: "11px" }}>{b.appliedByPhone}</div>
                        )}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>
                        {hasBurst ? (
                          <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "4px", padding: "2px 6px", fontWeight: 800, fontSize: "11px" }}>
                            BURST
                          </span>
                        ) : (
                          <span style={{ color: "#6b7280", fontSize: "11px" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "8px 10px", maxWidth: "200px", fontSize: "11px", color: "#374151" }}>
                        {participants || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AvailedHistoryPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading...</div>}>
      <AvailedHistoryContent />
    </Suspense>
  );
}
