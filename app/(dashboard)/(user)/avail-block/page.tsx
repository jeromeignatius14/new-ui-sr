"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetMyAvailBlocks, useGetPendingAvailConcurrences } from "@/app/service/query/avail";
import { RequestItem } from "@/app/service/query/user-request";
import { format } from "date-fns";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDt(dt?: string | Date | null): string {
  if (!dt) return "—";
  try { return format(new Date(dt), "dd-MM-yy HH:mm"); } catch { return "—"; }
}

function getDuration(block: RequestItem): string {
  const from = block.smApprovedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom ?? block.demandTimeFrom;
  const to   = block.smApprovedTimeTo   ?? block.grantedToTime   ?? block.sanctionedTimeTo   ?? block.demandTimeTo;
  if (!from || !to) return "—";
  const mins = Math.round((new Date(to as string).getTime() - new Date(from as string).getTime()) / 60000);
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getExtendedUpto(block: RequestItem): string {
  if (block.extensionStatus === "APPROVED" && block.smApprovedTimeTo) {
    return fmtDt(block.smApprovedTimeTo);
  }
  return "NA";
}

function getBlockStatus(block: RequestItem): string {
  const pending: string[] = [];
  if (block.powerBlockRequired && (block.trdAvailConcurrences as any[])?.some((c) => c.status === "PENDING")) pending.push("TRD");
  if (block.sntDisconnectionRequired && (block.sntAvailConcurrences as any[])?.some((c) => c.status === "PENDING")) pending.push("S&T");
  if (block.enggDisconnectionsRequired && (block.enggAvailConcurrences as any[])?.some((c) => c.status === "PENDING")) pending.push("ENGG");
  if (pending.length > 0) return `${pending.join(", ")}: needs to submit the form`;
  return block.overAllStatus ?? "—";
}

function rowBg(block: RequestItem, i: number): string {
  const s = block.overAllStatus ?? "";
  if (s === "Block Burst") return "#ffcccc";
  if (s === "Availing in Progress") return "#d4edda";
  return i % 2 === 0 ? "#fff9e6" : "#fff";
}

// ── Live clock ────────────────────────────────────────────────────────────────
function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ── Table ─────────────────────────────────────────────────────────────────────
const tdStyle: React.CSSProperties = {
  padding: "7px 10px",
  border: "1px solid #ddd",
  textAlign: "center",
  whiteSpace: "nowrap",
};

function BlockTable({ blocks, onRowClick }: { blocks: RequestItem[]; onRowClick: (id: string) => void }) {
  if (blocks.length === 0) {
    return <p style={{ padding: "12px", color: "#666", fontStyle: "italic" }}>No blocks found.</p>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#b39ddb" }}>
            {["Date", "ID", "Section", "Sanctioned From", "Sanctioned To", "Extended upto", "Duration", "Activity", "Status", "BlockStatus"].map((h) => (
              <th key={h} style={{ ...tdStyle, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {blocks.map((block, i) => (
            <tr key={block.id} style={{ background: rowBg(block, i), cursor: "pointer" }} onClick={() => onRowClick(block.id)}>
              <td style={tdStyle}>{fmtDt(block.grantedFromTime ?? block.sanctionedTimeFrom ?? block.date)}</td>
              <td style={{ ...tdStyle, color: "#1565c0", fontWeight: 600, textDecoration: "underline" }}>
                {block.divisionId ?? block.id.slice(0, 8)}
              </td>
              <td style={tdStyle}>{block.selectedSection ?? "—"}</td>
              <td style={tdStyle}>{fmtDt(block.grantedFromTime ?? block.sanctionedTimeFrom)}</td>
              <td style={tdStyle}>{fmtDt(block.grantedToTime ?? block.sanctionedTimeTo)}</td>
              <td style={{ ...tdStyle, color: getExtendedUpto(block) === "NA" ? "#999" : "#c62828", fontWeight: getExtendedUpto(block) === "NA" ? 400 : 700 }}>
                {getExtendedUpto(block)}
              </td>
              <td style={tdStyle}>{getDuration(block)}</td>
              <td style={tdStyle}>{block.activity ?? "—"}</td>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{block.overAllStatus ?? "—"}</td>
              <td style={{ ...tdStyle, fontStyle: "italic", fontSize: "12px" }}>{getBlockStatus(block)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AvailBlockPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const now = useClock();

  const { data: myBlocksData, isLoading: myLoading } = useGetMyAvailBlocks();
  const { data: otherData, isLoading: otherLoading } = useGetPendingAvailConcurrences();

  const myBlocks: RequestItem[] = myBlocksData?.data?.blocks ?? [];
  const otherBlocks: RequestItem[] = otherData?.data?.pendingConcurrences ?? [];
  const isSSE = session?.user?.role === "USER";

  return (
    <div style={{ minHeight: "100vh", background: "#c8e6c9", padding: "0 0 40px" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "#4caf50", textAlign: "center", padding: "14px 20px 12px" }}>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: 1, marginBottom: "10px" }}>
          AVAIL BLOCK AT SITE
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ background: "#ef8c00", color: "#fff", padding: "5px 14px", borderRadius: "6px", fontWeight: 600 }}>
            Date — {format(now, "dd-MM-yyyy")}
          </span>
          <span style={{ background: "#fff", color: "#333", border: "1px solid #ccc", padding: "5px 14px", borderRadius: "6px", fontWeight: 600 }}>
            Time — {format(now, "HH:mm:ss")}
          </span>
          <span style={{ background: "#fff", color: "#333", border: "1px solid #ccc", padding: "5px 14px", borderRadius: "6px", fontWeight: 600 }}>
            Applicant — {session?.user?.name ?? "—"}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* ── Section 1: My blocks ────────────────────────────────────────── */}
        <h3 style={{ marginBottom: "4px", fontWeight: 700 }}>
          Upcoming Sanctioned Blocks of My section (Next 12 Hr)
        </h3>
        <p style={{ marginBottom: "10px", fontSize: "12px", color: "#555", fontStyle: "italic" }}>
          (Click ID to view &amp; submit the Request)
        </p>
        {myLoading ? <p>Loading...</p> : <BlockTable blocks={myBlocks} onRowClick={(id) => router.push(`/avail-block/${id}`)} />}

        {/* ── Section 2: Other dept blocks (SSE only) ─────────────────────── */}
        {isSSE && (
          <>
            <h3 style={{ marginTop: "32px", marginBottom: "4px", fontWeight: 700 }}>
              Other upcoming sanctioned blocks in my section
            </h3>
            <p style={{ marginBottom: "10px", fontSize: "12px", color: "#555", fontStyle: "italic" }}>
              (Blocks needing your department&apos;s concurrence — click ID to submit)
            </p>
            {otherLoading ? <p>Loading...</p> : <BlockTable blocks={otherBlocks} onRowClick={(id) => router.push(`/avail-block/${id}`)} />}
          </>
        )}

        {/* ── Back ────────────────────────────────────────────────────────── */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{ marginTop: "28px", background: "#e8d5f5", border: "1px solid #b39ddb", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
        >
          &lt; BACK
        </button>
      </div>
    </div>
  );
}
