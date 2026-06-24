"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetSmHistory } from "@/app/service/query/avail";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const [y, m, d] = new Date(iso).toISOString().slice(0, 10).split("-");
    return `${d}-${m}-${y}`;
  } catch { return "—"; }
}

function fmtTime(iso?: string | null) {
  if (!iso) return "—";
  try { return new Date(iso).toISOString().slice(11, 16); } catch { return "—"; }
}

const DEPT_OPTIONS = ["", "ENGG", "S&T", "TRD", "OHE", "OPTG", "COM"];
const PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: "24h", label: "Past 24 Hours" },
  { value: "week", label: "Past 1 Week" },
  { value: "month", label: "Past 1 Month" },
  { value: "year", label: "Past 1 Year" },
];

// Derive "Block Section / Yard" from processedLineSections or fall back to selectedSection
function getBlockSectionYard(b: any): string {
  const sections = Array.isArray(b.processedLineSections) ? b.processedLineSections : [];
  if (sections.length > 0 && sections[0].block) return sections[0].block;
  return b.selectedSection ?? "—";
}

// Build "Lines / Roads Affected" by combining all entries' lineName, otherLines, road, otherRoads + adjacentLinesAffected
function getLinesAffected(b: any): string {
  const sections = Array.isArray(b.processedLineSections) ? b.processedLineSections : [];
  const parts = new Set<string>();
  sections.forEach((s: any) => {
    if (s.lineName) parts.add(s.lineName.trim());
    if (s.otherLines) s.otherLines.split(",").forEach((l: string) => { if (l.trim()) parts.add(l.trim()); });
    if (s.road) parts.add(s.road.trim());
    if (s.otherRoads) s.otherRoads.split(",").forEach((r: string) => { if (r.trim()) parts.add(r.trim()); });
  });
  if (b.adjacentLinesAffected) {
    b.adjacentLinesAffected.split(",").forEach((l: string) => { if (l.trim()) parts.add(l.trim()); });
  }
  const result = [...parts].filter(Boolean).join(", ");
  return result || "—";
}

// ── CSV Download ──────────────────────────────────────────────────────────────
function downloadCsv(blocks: any[]) {
  const headers = [
    "Date", "Block ID (Division)", "Department", "Depot", "Block Section / Yard",
    "SM Approved From", "SM Approved To", "Activity",
    "Location From", "Location To", "Lines / Roads Affected",
    "Repercussions / Movement Restriction", "Remarks",
    "Fresh Caution Speed", "Fresh Caution From", "Fresh Caution To",
    "S&T Elem Section From", "S&T Elem Section To",
    "S&T Discon Line", "S&T Discon Line From", "S&T Discon Line To",
    "SM Remarks", "Applied By", "Applied By Phone", "Applied By Depot"
  ];
  const rows = blocks.map((b) => [
    fmtDate(b.date),
    b.divisionId ?? b.id,
    b.selectedDepartment ?? "",
    b.selectedDepo ?? "",
    getBlockSectionYard(b),
    fmtTime(b.smApprovedTimeFrom),
    fmtTime(b.smApprovedTimeTo),
    b.activity ?? "",
    b.workLocationFrom ?? "",
    b.workLocationTo ?? "",
    getLinesAffected(b),
    b.repercussions ?? "",
    b.requestremarks ?? "",
    b.freshCautionSpeed ?? "",
    b.freshCautionLocationFrom ?? "",
    b.freshCautionLocationTo ?? "",
    b.sigElementarySectionFrom ?? "",
    b.sigElementarySectionTo ?? "",
    b.sntDisconnectionLine ?? "",
    b.sntDisconnectionLineFrom ?? "",
    b.sntDisconnectionLineTo ?? "",
    b.smRemarks ?? "",
    b.appliedByName ?? "",
    b.appliedByPhone ?? "",
    b.appliedByDepot ?? "",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `availed-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Cell component for consistent styling ─────────────────────────────────────
function Cell({ children, mono, center, bold, color }: {
  children: React.ReactNode;
  mono?: boolean;
  center?: boolean;
  bold?: boolean;
  color?: string;
}) {
  return (
    <td style={{
      padding: "9px 11px",
      verticalAlign: "top",
      fontFamily: mono ? "monospace" : "inherit",
      textAlign: center ? "center" : "left",
      fontWeight: bold ? 700 : 400,
      color: color ?? "#111827",
      borderRight: "1px solid #d1d5db",
      fontSize: "12px",
      lineHeight: "1.4",
    }}>
      {children}
    </td>
  );
}

// ── History page content ──────────────────────────────────────────────────────
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

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)", padding: "16px 16px 14px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "20px", padding: "6px 14px", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
          >
            ← BACK
          </button>
          <div style={{ fontSize: "16px", fontWeight: 900, letterSpacing: "0.5px" }}>
            SM AVAILED BLOCK HISTORY
          </div>
        </div>
        {stationCode && (
          <div style={{ fontSize: "12px", opacity: 0.85, marginLeft: "2px" }}>
            Station: <strong>{stationCode}</strong>
          </div>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ background: "#fff", borderBottom: "2px solid #dbeafe", padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              style={{
                background: period === opt.value ? "#1d4ed8" : "#fff",
                color: period === opt.value ? "#fff" : "#1d4ed8",
                border: `2px solid ${period === opt.value ? "#1d4ed8" : "#93c5fd"}`,
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

        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          style={{ border: "2px solid #93c5fd", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", fontWeight: 700, color: "#1e40af", background: "#fff", cursor: "pointer" }}
        >
          <option value="">All Departments</option>
          {DEPT_OPTIONS.filter(Boolean).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

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

      {/* ── Summary bar ── */}
      <div style={{ padding: "8px 16px", background: "#e0e7ff", borderBottom: "1px solid #c7d2fe", fontSize: "12px", color: "#1e40af", fontWeight: 700 }}>
        {isLoading ? "Loading..." : `${total} block${total !== 1 ? "s" : ""} found`}
        {dept ? ` · Dept: ${dept}` : ""}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "14px 12px 40px" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontSize: "14px" }}>
            Loading history...
          </div>
        )}

        {isError && (
          <div style={{ textAlign: "center", padding: "60px", color: "#dc2626", fontSize: "14px" }}>
            Failed to load history.{" "}
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => refetch()}>
              Retry
            </span>
          </div>
        )}

        {!isLoading && !isError && blocks.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontSize: "14px" }}>
            No availed blocks found for the selected period{dept ? ` / ${dept}` : ""}.
          </div>
        )}

        {!isLoading && !isError && blocks.length > 0 && (
          <div style={{ overflowX: "auto", borderRadius: "10px", border: "2px solid #93c5fd", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", background: "#fff" }}>
              <thead>
                <tr style={{ background: "#1e3a8a", color: "#fff" }}>
                  {[
                    "#", "Date", "Block ID", "Dept", "Depot",
                    "Block Section\n/ Yard",
                    "SM Approved\nFrom – To", "Activity",
                    "Location\nFrom → To",
                    "Lines / Roads\nAffected",
                    "Repercussions /\nMovement Restriction",
                    "Remarks",
                    "Fresh Caution\nSpeed / Location",
                    "S&T Elem Section\n(From – To)",
                    "S&T Discon Line\n(Line / From – To)",
                    "SM Remarks", "Applied By"
                  ].map((h) => (
                    <th key={h} style={{
                      padding: "10px 11px",
                      textAlign: "left",
                      fontWeight: 800,
                      whiteSpace: "pre-line",
                      fontSize: "11px",
                      borderRight: "1px solid #3b5bdb",
                      lineHeight: "1.3",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blocks.map((b, idx) => {
                  const rowBg = idx % 2 === 0 ? "#ffffff" : "#f0f4ff";
                  const borderColor = "#d1d5db";
                  const hasFreshCaution = b.freshCautionSpeed || b.freshCautionLocationFrom;
                  const hasSntElem = b.sigElementarySectionFrom || b.elementarySection;
                  const hasSntLine = b.sntDisconnectionLine || b.sntDisconnectionLineFrom;

                  return (
                    <tr key={b.id} style={{ background: rowBg, borderBottom: `2px solid ${borderColor}` }}>
                      <Cell color="#6b7280" bold>{idx + 1}</Cell>

                      {/* Date — just date, no time */}
                      <Cell mono>{fmtDate(b.date)}</Cell>

                      {/* Division ID */}
                      <td style={{
                        padding: "9px 11px", verticalAlign: "top", fontFamily: "monospace",
                        fontWeight: 800, color: "#1e3a8a", borderRight: `1px solid ${borderColor}`,
                        fontSize: "12px", whiteSpace: "nowrap"
                      }}>
                        {b.divisionId ?? "—"}
                      </td>

                      {/* Dept */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px" }}>
                        <span style={{ background: "#dbeafe", color: "#1e40af", borderRadius: "5px", padding: "2px 7px", fontWeight: 800, fontSize: "11px", whiteSpace: "nowrap" }}>
                          {b.selectedDepartment ?? "—"}
                        </span>
                      </td>

                      {/* Depot */}
                      <Cell>{b.selectedDepo ?? "—"}</Cell>

                      {/* Block Section / Yard */}
                      <Cell bold>{getBlockSectionYard(b)}</Cell>

                      {/* SM Approved From – To */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", fontFamily: "monospace", borderRight: `1px solid ${borderColor}`, fontSize: "12px", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 700, color: "#166534" }}>{fmtTime(b.smApprovedTimeFrom)}</div>
                        <div style={{ color: "#6b7280", fontSize: "11px" }}>to {fmtTime(b.smApprovedTimeTo)}</div>
                      </td>

                      {/* Activity */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", minWidth: "160px", maxWidth: "240px", color: "#111827", fontWeight: 500, lineHeight: "1.5", wordBreak: "break-word", whiteSpace: "normal" }}>
                        {b.activity ?? "—"}
                      </td>

                      {/* Location From → To */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", whiteSpace: "nowrap" }}>
                        {b.workLocationFrom || b.workLocationTo ? (
                          <>
                            <div style={{ fontWeight: 600 }}>{b.workLocationFrom ?? "—"}</div>
                            <div style={{ color: "#6b7280", fontSize: "11px" }}>→ {b.workLocationTo ?? "—"}</div>
                          </>
                        ) : "—"}
                      </td>

                      {/* Repercussions / Movement Restriction */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", maxWidth: "180px", color: b.repercussions ? "#7c2d12" : "#9ca3af" }}>
                        {b.repercussions ?? "—"}
                      </td>

                      {/* Remarks */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", maxWidth: "160px", color: "#374151" }}>
                        {b.requestremarks ?? "—"}
                      </td>

                      {/* Lines / Roads Affected */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", minWidth: "140px", color: "#1e3a8a", fontWeight: 600, lineHeight: "1.5", wordBreak: "break-word", whiteSpace: "normal" }}>
                        {getLinesAffected(b)}
                      </td>

                      {/* Fresh Caution */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", whiteSpace: "nowrap" }}>
                        {hasFreshCaution ? (
                          <>
                            {b.freshCautionSpeed && <div style={{ fontWeight: 700, color: "#b45309" }}>{b.freshCautionSpeed} kmph</div>}
                            {b.freshCautionLocationFrom && <div style={{ color: "#6b7280", fontSize: "11px" }}>{b.freshCautionLocationFrom} – {b.freshCautionLocationTo ?? ""}</div>}
                          </>
                        ) : <span style={{ color: "#9ca3af" }}>—</span>}
                      </td>

                      {/* S&T Elementary Section */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", whiteSpace: "nowrap" }}>
                        {hasSntElem ? (
                          <span style={{ fontFamily: "monospace" }}>
                            {b.sigElementarySectionFrom ?? b.elementarySection ?? "—"}
                            {(b.sigElementarySectionTo ?? b.elementarySectionTo) ? ` – ${b.sigElementarySectionTo ?? b.elementarySectionTo}` : ""}
                          </span>
                        ) : <span style={{ color: "#9ca3af" }}>—</span>}
                      </td>

                      {/* S&T Disconnection Line */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", whiteSpace: "nowrap" }}>
                        {hasSntLine ? (
                          <>
                            {b.sntDisconnectionLine && <div style={{ fontWeight: 700 }}>{b.sntDisconnectionLine}</div>}
                            {b.sntDisconnectionLineFrom && <div style={{ color: "#6b7280", fontSize: "11px" }}>{b.sntDisconnectionLineFrom} – {b.sntDisconnectionLineTo ?? ""}</div>}
                          </>
                        ) : <span style={{ color: "#9ca3af" }}>—</span>}
                      </td>

                      {/* SM Remarks */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", maxWidth: "160px", color: "#374151" }}>
                        {b.smRemarks ?? "—"}
                      </td>

                      {/* Applied By */}
                      <td style={{ padding: "9px 11px", verticalAlign: "top", borderRight: `1px solid ${borderColor}`, fontSize: "12px", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 700, color: "#111827" }}>{b.appliedByName ?? "—"}</div>
                        {b.appliedByPhone && <div style={{ color: "#6b7280", fontSize: "11px" }}>{b.appliedByPhone}</div>}
                        {b.appliedByDepot && <div style={{ color: "#6b7280", fontSize: "11px" }}>{b.appliedByDepot}</div>}
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
