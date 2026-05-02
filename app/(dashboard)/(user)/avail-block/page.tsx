"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetDepotBlocks, useGetMyParticipations, useGetPendingAvailConcurrences } from "@/app/service/query/avail";
import { useQueryClient } from "@tanstack/react-query";

// ── Time helpers ───────────────────────────────────────────────────────────────
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function nowIST() { return Date.now() + IST_OFFSET_MS; }

function fmtDate(dt?: string | Date | null): string {
  if (!dt) return "—";
  try { const iso = new Date(dt).toISOString(); const [y,m,d] = iso.slice(0,10).split("-"); return `${d}-${m}-${y.slice(2)}`; }
  catch { return "—"; }
}

function fmtDt(dt?: string | Date | null): string {
  if (!dt) return "—";
  try { const iso = new Date(dt).toISOString(); const [y,m,d] = iso.slice(0,10).split("-"); return `${d}-${m}-${y.slice(2)}\n${iso.slice(11,16)}`; }
  catch { return "—"; }
}

function fmtTime(dt?: string | Date | null): string {
  if (!dt) return "—";
  try { return new Date(dt).toISOString().slice(11, 16); }
  catch { return "—"; }
}

function getEffectiveTimes(block: any): { fromMs: number | null; toMs: number | null } {
  const f = block.smApprovedTimeFrom ?? block.requestedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom ?? block.demandTimeFrom;
  const t = block.smApprovedTimeTo   ?? block.requestedTimeTo   ?? block.grantedToTime   ?? block.sanctionedTimeTo   ?? block.demandTimeTo;
  return { fromMs: f ? new Date(f).getTime() : null, toMs: t ? new Date(t).getTime() : null };
}

function getDuration(block: any): string {
  const { fromMs, toMs } = getEffectiveTimes(block);
  if (!fromMs || !toMs) return "—";
  const mins = Math.round((toMs - fromMs) / 60000);
  if (mins <= 0) return "—";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ── SM Approved visibility gate ────────────────────────────────────────────────
// Only show "SM Approved" blocks within 10 minutes of the granted start time.
// If SM approves very close to start (already within 10 min window), show immediately.
// Rejection is always shown immediately (different status — SM Rejected / Availing Cancelled).
function isSmApprovedVisible(block: any): boolean {
  if (block.overAllStatus !== "SM Approved") return true;
  const approvedFrom = block.smApprovedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom;
  if (!approvedFrom) return true; // no time info → show by default
  const fromMs = new Date(approvedFrom).getTime();
  return (fromMs - nowIST()) <= 10 * 60 * 1000; // within 10 mins of start
}

// ── Clock ──────────────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}
function clockStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ── Urgency ────────────────────────────────────────────────────────────────────
type Urgency = "urgent" | "near" | null;
function getUrgency(block: any, myParticipant?: any): Urgency {
  const now = nowIST();
  const { fromMs, toMs } = getEffectiveTimes(block);

  // If I'm actively availing and end is near
  if (myParticipant?.availStartedAt && !myParticipant?.closureSubmittedAt && toMs) {
    const effTo = myParticipant.smExtensionGrantedTo
      ? new Date(myParticipant.smExtensionGrantedTo).getTime() : toMs;
    const minsLeft = (effTo - now) / 60000;
    if (minsLeft < 5) return "urgent";
    if (minsLeft < 20) return "near";
  }
  // Block is upcoming
  if (fromMs && fromMs > now) {
    const minsUntil = (fromMs - now) / 60000;
    if (minsUntil < 10) return "urgent";
    if (minsUntil < 30) return "near";
  }
  return null;
}

// ── Beep ───────────────────────────────────────────────────────────────────────
function playBeep(freq = 880) {
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch { /* ignore */ }
}

// ── Status helpers ─────────────────────────────────────────────────────────────
function shortStatus(block: any, myParticipant?: any): { text: string; color: string } {
  const s = block.overAllStatus ?? "";
  if (s === "Sanctioned and Accepted by SSE") return { text: "Ready to Apply", color: "#16a34a" };
  if (s === "Pending Concurrences") return { text: "Pending Concurrence", color: "#c2410c" };
  if (s === "Pending SM Approval") return { text: "Pending SM Approval", color: "#9333ea" };
  if (s === "SM Approved") return { text: "SM Approved ✔ — Auto-starting", color: "#047857" };
  if (s === "SM Rejected") return { text: "SM Rejected ✗ — No Work Today", color: "#dc2626" };
  if (s === "Availing Active") {
    if (myParticipant?.availStartedAt && !myParticipant?.closureSubmittedAt)
      return { text: "In Progress ▶", color: "#2563eb" };
    if (myParticipant?.closureSubmittedAt)
      return { text: "Closed ✓ (awaiting others)", color: "#0d9488" };
    return { text: "Active — Auto-Starting", color: "#16a34a" };
  }
  if (s === "All Closures Submitted") return { text: "Awaiting SM Closure Ack", color: "#0369a1" };
  if (s === "Block Closed") return { text: "Block Closed ✓", color: "#1d4ed8" };
  if (s === "Availing Cancelled") return { text: "Cancelled", color: "#dc2626" };
  if (myParticipant?.blockBurst) return { text: "⚠ BLOCK BURST", color: "#dc2626" };
  return { text: s || "—", color: "#374151" };
}

function detailedStatus(block: any): string {
  const appliedBy = block.appliedByName
    ? `${block.appliedByName}${block.appliedByPhone ? ` (${block.appliedByPhone})` : ""} applied.`
    : "";
  const s = block.overAllStatus ?? "";

  if (s === "Pending Concurrences") {
    const pending: string[] = [];
    (block.sntAvailConcurrences ?? []).filter((c: any) => c.status === "PENDING")
      .forEach((c: any) => pending.push(`S&T/${c.depot}${c.submittedByPhone ? ` - ${c.submittedByPhone}` : ""}`));
    (block.trdAvailConcurrences ?? []).filter((c: any) => c.status === "PENDING")
      .forEach((c: any) => pending.push(`TRD/${c.depot}${c.submittedByPhone ? ` - ${c.submittedByPhone}` : ""}`));
    (block.enggAvailConcurrences ?? []).filter((c: any) => c.status === "PENDING")
      .forEach((c: any) => pending.push(`ENGG/${c.depot}${c.submittedByPhone ? ` - ${c.submittedByPhone}` : ""}`));
    return `${appliedBy} Pending concurrence from: ${pending.join(", ") || "—"}`;
  }
  if (s === "Pending SM Approval") return `${appliedBy} Pending with SM at station ${block.smStation ?? "—"}`;
  if (s === "SM Approved") {
    const startAt = block.smApprovedTimeFrom ?? block.grantedFromTime;
    return `${appliedBy} SM granted. Block auto-starts at ${fmtTime(startAt)}. Please be at the work site.`;
  }
  if (s === "SM Rejected") {
    return `${appliedBy} SM rejected availing${block.smRemarks ? ` — "${block.smRemarks}"` : ""}. No work today.`;
  }
  if (s === "Availing Active") {
    const parts = (block.availParticipants ?? []).map((p: any) => {
      const who = `${p.userName}/${p.userDept}`;
      if (p.closureSubmittedAt) return `${who}: Closed ✓`;
      if (p.blockBurst) return `${who}: ⚠ BURST`;
      if (p.availStartedAt) return `${who}: In Progress`;
      return `${who}: Not started`;
    });
    return `${appliedBy} ${parts.join(" | ")}`;
  }
  if (s === "All Closures Submitted") return `${appliedBy} All participants closed — awaiting SM ack.`;
  if (s === "Block Closed") return `${appliedBy} Block fully closed.`;
  return appliedBy || s;
}

// ── Table styles ───────────────────────────────────────────────────────────────
const th: React.CSSProperties = { border: "1px solid #374151", padding: "8px", fontWeight: 800, fontSize: "13px", textAlign: "center", color: "#000" };
const td: React.CSSProperties = { border: "1px solid #9ca3af", padding: "7px 8px", fontSize: "13px", fontWeight: 700, color: "#000", verticalAlign: "middle", textAlign: "center" };

// ── BlockRow ───────────────────────────────────────────────────────────────────
function BlockRow({
  block, myParticipant, isConcurrence, onNavigate, onNavigateConcurrence,
}: {
  block: any; myParticipant?: any; isConcurrence?: boolean;
  onNavigate: (id: string) => void; onNavigateConcurrence: (id: string) => void;
}) {
  const urgency = getUrgency(block, myParticipant);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!urgency && !isConcurrence) return;
    const id = setInterval(() => setTick(t => t + 1), isConcurrence ? 400 : 600);
    return () => clearInterval(id);
  }, [urgency, isConcurrence]);

  const blinkOp = (urgency === "urgent" || isConcurrence) ? (tick % 2 === 0 ? 1 : 0.2) : 1;
  const rowBg = isConcurrence
    ? (tick % 2 === 0 ? "#fecaca" : "#fff0f0")
    : block.overAllStatus === "SM Rejected"
    ? "#fef2f2"
    : urgency === "urgent" ? (tick % 2 === 0 ? "#fca5a5" : "#fff")
    : urgency === "near" ? "#fef9c3"
    : block.overAllStatus === "Availing Active" ? "#f0fdf4"
    : block.overAllStatus === "SM Approved" ? "#f0fdf4"
    : block.overAllStatus === "Sanctioned and Accepted by SSE" ? "#f8fafc"
    : "#fff";

  const { fromMs, toMs } = getEffectiveTimes(block);
  const ss = shortStatus(block, myParticipant);
  const det = detailedStatus(block);

  return (
    <tr style={{ background: rowBg, opacity: blinkOp, transition: "opacity 0.15s" }}>
      <td style={td}>{fmtDate(block.date)}</td>
      <td style={td}>
        <span
          onClick={() => isConcurrence ? onNavigateConcurrence(block.id) : onNavigate(block.id)}
          style={{ color: isConcurrence ? "#dc2626" : "#1d4ed8", fontWeight: 900, cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
        >
          {block.divisionId ?? block.id.slice(0, 8)}
        </span>
        {isConcurrence && (
          <div style={{ fontSize: "10px", background: "#dc2626", color: "#fff", borderRadius: "4px", padding: "1px 4px", marginTop: "2px" }}>CONCURRENCE</div>
        )}
        {myParticipant?.blockBurst && (
          <div style={{ fontSize: "10px", background: "#7f1d1d", color: "#fff", borderRadius: "4px", padding: "1px 4px", marginTop: "2px" }}>BURST</div>
        )}
      </td>
      <td style={td}>{block.selectedSection ?? block.missionBlock ?? "—"}</td>
      <td style={{ ...td, whiteSpace: "pre-line" }}>{fmtDt(fromMs ? new Date(fromMs) : null)}</td>
      <td style={{ ...td, whiteSpace: "pre-line" }}>{fmtDt(toMs ? new Date(toMs) : null)}</td>
      <td style={td}>{getDuration(block)}</td>
      <td style={td}>
        {block.appliedByName
          ? <span style={{ fontSize: "12px" }}>{block.appliedByName}<br/><span style={{ color: "#6b7280", fontWeight: 600 }}>{block.appliedByPhone ?? ""}</span></span>
          : <span style={{ color: "#9ca3af" }}>Not applied</span>}
      </td>
      <td style={{ ...td, color: ss.color }}>{ss.text}</td>
      <td style={{ ...td, fontSize: "11px", textAlign: "left", maxWidth: "220px", wordBreak: "break-word" }}>{det}</td>
    </tr>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AvailBlockPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const now = useClock();
  const qc = useQueryClient();

  const { data: depotData, isLoading: depotLoading, isError: depotError } = useGetDepotBlocks();
  const { data: myPartData } = useGetMyParticipations();
  const { data: concurData } = useGetPendingAvailConcurrences();

  const depotBlocks: any[] = depotData?.data?.blocks ?? [];
  const myParticipations: any[] = myPartData?.data?.blocks ?? [];
  const concurrenceBlocks: any[] = concurData?.data?.pendingConcurrences ?? [];

  // Build a map: requestId → my AvailParticipant record (from myParticipations)
  const myPartMap = new Map<string, any>();
  myParticipations.forEach(b => { if (b.myParticipant) myPartMap.set(b.id, b.myParticipant); });

  // Merge depot blocks + my participations (dedup by id)
  const allBlockMap = new Map<string, any>();
  depotBlocks.forEach(b => allBlockMap.set(b.id, b));
  myParticipations.forEach(b => { if (!allBlockMap.has(b.id)) allBlockMap.set(b.id, b); });
  const allBlocks = [...allBlockMap.values()];

  // Dedup concurrence blocks (remove if already in allBlocks as depot member)
  const concurrenceOnly = concurrenceBlocks.filter(b => !allBlockMap.has(b.id));

  // Badge count
  const badgeCount =
    concurrenceOnly.length +
    allBlocks.filter(b => {
      const p = myPartMap.get(b.id);
      if (p?.blockBurst && !p?.closureSubmittedAt) return true;
      // SM Rejected — badge for 12h only, then auto-vanish
      if (b.overAllStatus === "SM Rejected") {
        const { fromMs } = getEffectiveTimes(b);
        return !fromMs || fromMs > nowIST() - TWELVE_HRS;
      }
      // SM Approved — badge only within 10-min window (and only if visible to this user)
      if (b.overAllStatus === "SM Approved" && isSmApprovedVisible(b)) return true;
      if (b.overAllStatus === "Availing Active" && p?.availStartedAt && !p?.closureSubmittedAt) {
        const { toMs } = getEffectiveTimes(b);
        const effTo = p.smExtensionGrantedTo ? new Date(p.smExtensionGrantedTo).getTime() : toMs;
        if (effTo && (effTo - nowIST()) < 20 * 60 * 1000) return true;
      }
      return false;
    }).length;

  useEffect(() => { (window as any).__availBadgeCount = badgeCount; }, [badgeCount]);

  // Beep for urgent items
  const lastBeepRef = useRef<Record<string, number>>({});
  useEffect(() => {
    const urgentIds = [
      ...concurrenceOnly.map(b => b.id),
      ...allBlocks.filter(b => getUrgency(b, myPartMap.get(b.id)) === "urgent").map(b => b.id),
    ];
    const nowMs = nowIST();
    for (const id of urgentIds) {
      const last = lastBeepRef.current[id] ?? 0;
      if (nowMs - last > 8000) { playBeep(); lastBeepRef.current[id] = nowMs; }
    }
  });

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["avail-depot-blocks"] });
    qc.invalidateQueries({ queryKey: ["avail-my-participations"] });
    qc.invalidateQueries({ queryKey: ["avail-concurrences"] });
  };

  const navigateToBlock = (id: string) => router.push(`/avail-block/${id}`);
  const navigateToConcurrence = (id: string) => router.push(`/avail-block/${id}/concurrence`);

  // ── Categorize into priority sections ─────────────────────────────────────────
  const TWELVE_HRS  = 12 * 60 * 60 * 1000;
  const TWENTYFOUR_HRS = 24 * 60 * 60 * 1000;

  type SectionKey = "inProgress" | "needsAction" | "next12h" | "prev24h" | "other";
  type BlockEntry = { block: any; myParticipant?: any; isConcurrence?: boolean };

  function categorize(block: any, mp: any): SectionKey {
    const now = nowIST();
    const { fromMs } = getEffectiveTimes(block);
    const s = block.overAllStatus ?? "";

    // Section 1 — actively availing (started or submitted closure)
    if (
      (s === "Availing Active" || s === "All Closures Submitted") &&
      mp?.availStartedAt
    ) return "inProgress";

    // Section 2 — SM Rejected: show prominently so SSE knows, but vanish after 12h
    if (s === "SM Rejected") {
      if (!fromMs || fromMs > now - TWELVE_HRS) return "needsAction";
      // After 12 hours, fall through to prev24h / other naturally
    }

    // Section 2 — auto-starting soon (SM Approved, in the 10-min window)
    if (s === "SM Approved") return "needsAction";

    // Section 2 — availing active but my start is pending (auto-start will fire on detail page)
    if (s === "Availing Active" && mp && !mp.availStartedAt) return "needsAction";

    // Section 2 — burst
    if (mp?.blockBurst && !mp?.closureSubmittedAt) return "needsAction";

    // Section 3 — upcoming in next 12 hours
    if (fromMs && fromMs > now && fromMs <= now + TWELVE_HRS) return "next12h";

    // Section 4 — past 24 hours, incomplete
    if (fromMs && fromMs < now && fromMs > now - TWENTYFOUR_HRS) {
      if (s !== "Block Closed" && s !== "Availing Cancelled") return "prev24h";
    }

    return "other";
  }

  const buckets: Record<SectionKey, BlockEntry[]> = {
    inProgress:  [],
    needsAction: [],
    next12h:     [],
    prev24h:     [],
    other:       [],
  };

  // Concurrences always go to "needsAction"
  concurrenceOnly.forEach(b => buckets.needsAction.push({ block: b, isConcurrence: true }));

  // All depot/participation blocks — skip SM Approved blocks outside the 10-min visibility window
  allBlocks.forEach(b => {
    if (!isSmApprovedVisible(b)) return; // hide SM Approved until 10 mins before start
    const mp = myPartMap.get(b.id);
    buckets[categorize(b, mp)].push({ block: b, myParticipant: mp });
  });

  // Sort within each bucket by effective fromMs (nearest first)
  const byTime = (a: BlockEntry, b: BlockEntry) => {
    const at = getEffectiveTimes(a.block).fromMs ?? 0;
    const bt = getEffectiveTimes(b.block).fromMs ?? 0;
    return at - bt;
  };
  buckets.inProgress.sort(byTime);
  buckets.needsAction.sort(byTime);
  buckets.next12h.sort(byTime);
  buckets.prev24h.sort((a, b) => (getEffectiveTimes(b.block).fromMs ?? 0) - (getEffectiveTimes(a.block).fromMs ?? 0));
  buckets.other.sort(byTime);

  const isEmpty = buckets.inProgress.length === 0 && buckets.needsAction.length === 0 && buckets.next12h.length === 0 && buckets.prev24h.length === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#c8f0c8", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
        @media (max-width:640px) { .avail-info-row { flex-direction:column !important } }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fef08a", padding: "12px 16px", textAlign: "center" }}>
        <span style={{ fontSize: "30px", fontWeight: 900, color: "#7c3aed", letterSpacing: "3px" }}>RBMS</span>
      </div>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 0" }}>
        <div style={{ fontWeight: 800, fontSize: "13px", color: "#374151" }}>
          Depot: <span style={{ color: "#7c3aed" }}>{session?.user?.depot}</span>
          {" · "}{session?.user?.name}
        </div>
        <button onClick={handleRefresh} style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
          ↻ Refresh
        </button>
      </div>

      <div style={{ padding: "10px 16px" }}>
        {/* Banner */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <div style={{ background: "#4ade80", border: "3px solid #16a34a", borderRadius: "10px", fontWeight: 900, color: "#000", letterSpacing: "1px", textAlign: "center", width: "100%", maxWidth: "700px", padding: "12px 24px", fontSize: "18px" }}>
            AVAIL BLOCK AT SITE
          </div>
        </div>

        {/* Date/Time */}
        <div className="avail-info-row" style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "14px" }}>
          <div style={{ background: "#fb923c", border: "2px solid #ea580c", borderRadius: "8px", padding: "7px 14px", fontWeight: 800, fontSize: "13px", color: "#000" }}>
            Date — {fmtDate(new Date().toISOString())}
          </div>
          <div style={{ background: "#4f46e5", border: "2px solid #3730a3", borderRadius: "8px", padding: "7px 14px", fontWeight: 800, fontSize: "13px", color: "#fff" }}>
            Time — {clockStr(now)}
          </div>
        </div>

        {badgeCount > 0 && (
          <div style={{ background: "#dc2626", color: "#fff", borderRadius: "8px", padding: "8px 16px", fontWeight: 800, fontSize: "14px", textAlign: "center", marginBottom: "12px" }}>
            ⚡ {badgeCount} item{badgeCount !== 1 ? "s" : ""} need your immediate attention
          </div>
        )}

        <p style={{ textAlign: "center", fontStyle: "italic", fontWeight: 700, fontSize: "13px", color: "#374151", margin: "0 0 10px 0" }}>
          Click the Block ID to view details &amp; take action
        </p>

        {depotLoading ? (
          <div style={{ textAlign: "center", padding: "40px", fontWeight: 800, fontSize: "16px", color: "#111827" }}>Loading…</div>
        ) : depotError ? (
          <div style={{ background: "#fef2f2", border: "2px solid #dc2626", borderRadius: "10px", padding: "20px", margin: "0 0 16px", textAlign: "center" }}>
            <div style={{ fontWeight: 900, fontSize: "15px", color: "#dc2626", marginBottom: "6px" }}>Unable to connect to server</div>
            <div style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>The availing module may not be activated yet. Please contact the admin or try again.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as any }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #374151", background: "#fff", minWidth: "900px" }}>
              <thead>
                <tr style={{ background: "#d8b4fe" }}>
                  <th style={th}>Date</th>
                  <th style={th}>Block ID</th>
                  <th style={th}>Section</th>
                  <th style={th}>From</th>
                  <th style={th}>To</th>
                  <th style={th}>Duration</th>
                  <th style={th}>Applied By</th>
                  <th style={th}>Status</th>
                  <th style={th}>Detailed Status</th>
                </tr>
              </thead>
              <tbody>
                {isEmpty && (
                  <tr>
                    <td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "#6b7280", fontWeight: 700 }}>
                      No sanctioned blocks found for your depot
                    </td>
                  </tr>
                )}

                {/* ── Section 1: Currently In Progress ── */}
                {buckets.inProgress.length > 0 && (
                  <tr>
                    <td colSpan={9} style={{ background: "#dcfce7", borderTop: "2px solid #16a34a", borderBottom: "1px solid #16a34a", padding: "6px 12px", fontWeight: 900, fontSize: "13px", color: "#15803d", letterSpacing: "0.5px" }}>
                      ▶ CURRENTLY IN PROGRESS
                    </td>
                  </tr>
                )}
                {buckets.inProgress.map(({ block, myParticipant, isConcurrence }) => (
                  <BlockRow key={block.id} block={block} myParticipant={myParticipant} isConcurrence={isConcurrence} onNavigate={navigateToBlock} onNavigateConcurrence={navigateToConcurrence} />
                ))}

                {/* ── Section 2: Attention Needed ── */}
                {buckets.needsAction.length > 0 && (
                  <tr>
                    <td colSpan={9} style={{ background: "#fef2f2", borderTop: "2px solid #dc2626", borderBottom: "1px solid #dc2626", padding: "6px 12px", fontWeight: 900, fontSize: "13px", color: "#b91c1c", letterSpacing: "0.5px" }}>
                      ⚡ ATTENTION — SM APPROVED / STARTING SOON / REJECTED
                    </td>
                  </tr>
                )}
                {buckets.needsAction.map(({ block, myParticipant, isConcurrence }) => (
                  <BlockRow key={block.id} block={block} myParticipant={myParticipant} isConcurrence={isConcurrence} onNavigate={navigateToBlock} onNavigateConcurrence={navigateToConcurrence} />
                ))}

                {/* ── Section 3: Next 12 Hours ── */}
                {buckets.next12h.length > 0 && (
                  <tr>
                    <td colSpan={9} style={{ background: "#fefce8", borderTop: "2px solid #ca8a04", borderBottom: "1px solid #ca8a04", padding: "6px 12px", fontWeight: 900, fontSize: "13px", color: "#92400e", letterSpacing: "0.5px" }}>
                      🕐 UPCOMING — NEXT 12 HOURS
                    </td>
                  </tr>
                )}
                {buckets.next12h.map(({ block, myParticipant, isConcurrence }) => (
                  <BlockRow key={block.id} block={block} myParticipant={myParticipant} isConcurrence={isConcurrence} onNavigate={navigateToBlock} onNavigateConcurrence={navigateToConcurrence} />
                ))}

                {/* ── Section 4: Previous 24 Hours — No Action ── */}
                {buckets.prev24h.length > 0 && (
                  <tr>
                    <td colSpan={9} style={{ background: "#f1f5f9", borderTop: "2px solid #64748b", borderBottom: "1px solid #64748b", padding: "6px 12px", fontWeight: 900, fontSize: "13px", color: "#475569", letterSpacing: "0.5px" }}>
                      ⏰ PREVIOUS 24 HOURS — NO ACTION TAKEN
                    </td>
                  </tr>
                )}
                {buckets.prev24h.map(({ block, myParticipant, isConcurrence }) => (
                  <BlockRow key={block.id} block={block} myParticipant={myParticipant} isConcurrence={isConcurrence} onNavigate={navigateToBlock} onNavigateConcurrence={navigateToConcurrence} />
                ))}

              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 16px 28px" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "#fff", border: "2px solid #374151", borderRadius: "8px", padding: "12px 40px", fontWeight: 900, fontSize: "16px", cursor: "pointer", color: "#000" }}>
          &lt; BACK
        </button>
      </div>
    </div>
  );
}
