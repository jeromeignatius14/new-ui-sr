"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";
import { useGetSmPending } from "@/app/service/query/avail";
import { useSmApproveAvail, useSmAcknowledgeClosure, useSmApproveExtension } from "@/app/service/mutation/avail";
import { LoadingBar } from "@/app/components/ui/LoadingBar";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDt(iso?: string | null) {
  if (!iso) return "—";
  try {
    const s = new Date(iso).toISOString();
    const [y, m, d] = s.slice(0, 10).split("-");
    return `${d}-${m}-${y} ${s.slice(11, 16)}`;
  } catch { return "—"; }
}
function fmtShort(iso?: string | null) {
  if (!iso) return "—";
  try {
    const s = new Date(iso).toISOString();
    const [, m, d] = s.slice(0, 10).split("-");
    return `${d}-${m}\n${s.slice(11, 16)}`;
  } catch { return "—"; }
}
function getExtendedUpto(req: any) {
  return req.extensionStatus === "APPROVED" && req.extensionRequestedTo
    ? fmtShort(req.extensionRequestedTo)
    : "NA";
}
function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  try { return new Date(iso).toISOString().slice(0, 16); } catch { return ""; }
}
function fmtDur(ms: number): string {
  if (ms <= 0) return "0 min";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
function getStatusLabel(req: any) {
  const s = req.overAllStatus ?? "";
  if (s === "Block Closed") return "Closed ✓";
  if (s === "All Closures Submitted") return "Submitted\nto SM";
  if (s === "Availing Active") return "In Progress";
  if (s === "SM Approved") return "SM Approved\nAwaiting SSE";
  if (s === "Pending SM Approval") return "Awaiting\nSM Approval";
  if (s === "Pending Concurrences") return "Pending\nConcurrences";
  if (s === "Availing Cancelled") return "Cancelled";
  return s;
}

// ── Beep ──────────────────────────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch { /* ignore */ }
}

// ── Table styles ──────────────────────────────────────────────────────────────
const thSt: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.25)", padding: "8px 10px",
  fontWeight: 800, fontSize: "13px", textAlign: "center", color: "#000",
};
const tdSt: React.CSSProperties = {
  border: "1px solid #d1d5db", padding: "7px 9px",
  fontSize: "13px", fontWeight: 600, textAlign: "center",
  verticalAlign: "middle", color: "#000",
};

function getLineLabel(req: any): string {
  const sections = req.processedLineSections;
  if (Array.isArray(sections) && sections.length > 0) {
    const labels = [...new Set(
      sections.map((s: any) => s.lineName || s.road).filter(Boolean)
    )] as string[];
    if (labels.length > 0) return labels.join(" / ");
  }
  return req.corridorType ?? "—";
}

// ── BlinkingRow ───────────────────────────────────────────────────────────────
function BlinkingRow({ req, onClickId, idx }: { req: any; onClickId: (r: any) => void; idx: number }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), 600);
    return () => clearInterval(id);
  }, []);
  const timeFrom = req.smApprovedTimeFrom ?? req.grantedFromTime ?? req.sanctionedTimeFrom;
  const timeTo   = req.smApprovedTimeTo   ?? req.grantedToTime   ?? req.sanctionedTimeTo;
  const bg = on ? "#fca5a5" : "#fff0f0";
  return (
    <tr style={{ background: bg, transition: "background 0.3s" }}>
      <td style={{ ...tdSt, fontWeight: 900 }}>{req.smStation ?? "—"}</td>
      <td style={{ ...tdSt }}>
        <span onClick={() => onClickId(req)} style={{ cursor: "pointer", color: "#b91c1c", fontWeight: 900, textDecoration: "underline", fontSize: "14px" }}>
          {req.divisionId ?? (req._id || req.id)?.slice(0, 8)}
        </span>
      </td>
      <td style={tdSt}>{req.missionBlock ?? req.selectedSection ?? "—"}</td>
      <td style={tdSt}>{getLineLabel(req)}</td>
      <td style={tdSt}>{req.workLocationFrom ?? "—"}</td>
      <td style={tdSt}>{req.workLocationTo ?? "—"}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line" }}>{fmtShort(timeFrom)}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line" }}>{fmtShort(timeTo)}</td>
      <td style={tdSt}>{getExtendedUpto(req)}</td>
      <td style={tdSt}>{req.activity ?? "—"}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line", color: "#b91c1c", fontWeight: 800 }}>
        {getStatusLabel(req)}
      </td>
    </tr>
  );
}

// ── NormalRow ─────────────────────────────────────────────────────────────────
function NormalRow({ req, onClickId, idx }: { req: any; onClickId: (r: any) => void; idx: number }) {
  const timeFrom = req.smApprovedTimeFrom ?? req.grantedFromTime ?? req.sanctionedTimeFrom;
  const timeTo   = req.smApprovedTimeTo   ?? req.grantedToTime   ?? req.sanctionedTimeTo;
  return (
    <tr style={{ background: idx % 2 === 0 ? "#fff" : "#faf5ff" }}>
      <td style={{ ...tdSt, fontWeight: 900 }}>{req.smStation ?? "—"}</td>
      <td style={tdSt}>
        <span onClick={() => onClickId(req)} style={{ cursor: "pointer", color: "#1d4ed8", fontWeight: 800, textDecoration: "underline", fontSize: "14px" }}>
          {req.divisionId ?? (req._id || req.id)?.slice(0, 8)}
        </span>
      </td>
      <td style={tdSt}>{req.missionBlock ?? req.selectedSection ?? "—"}</td>
      <td style={tdSt}>{getLineLabel(req)}</td>
      <td style={tdSt}>{req.workLocationFrom ?? "—"}</td>
      <td style={tdSt}>{req.workLocationTo ?? "—"}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line" }}>{fmtShort(timeFrom)}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line" }}>{fmtShort(timeTo)}</td>
      <td style={tdSt}>{getExtendedUpto(req)}</td>
      <td style={tdSt}>{req.activity ?? "—"}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line" }}>{getStatusLabel(req)}</td>
    </tr>
  );
}

// ── Section Table ─────────────────────────────────────────────────────────────
function SectionTable({ title, subtitle, headerColor, rows, blink, onClickId, emptyMsg }: {
  title: string; subtitle?: string; headerColor: string;
  rows: any[]; blink?: boolean;
  onClickId: (r: any) => void; emptyMsg: string;
}) {
  return (
    <div style={{ border: "2px solid #888", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
      <div style={{ background: headerColor, padding: "10px 16px", textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: "17px", color: "#fff", letterSpacing: "0.5px", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{title}</div>
        {subtitle && <div style={{ fontStyle: "italic", fontSize: "12px", color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>{subtitle}</div>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", minWidth: "700px" }}>
          <thead>
            <tr style={{ background: "#f3c6d5" }}>
              <th style={thSt} rowSpan={2}>Station</th>
              <th style={thSt} rowSpan={2}>ID</th>
              <th style={thSt} rowSpan={2}>Block Section<br />/Yard</th>
              <th style={thSt} rowSpan={2}>UP/DN/<br />Road No.</th>
              <th style={{ ...thSt }} colSpan={2}>Location</th>
              <th style={{ ...thSt }} colSpan={2}>Timings</th>
              <th style={thSt} rowSpan={2}>Extended<br />Upto</th>
              <th style={thSt} rowSpan={2}>Activity</th>
              <th style={thSt} rowSpan={2}>Status</th>
            </tr>
            <tr style={{ background: "#f3c6d5" }}>
              <th style={thSt}>From</th><th style={thSt}>To</th>
              <th style={thSt}>From</th><th style={thSt}>To</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={11} style={{ ...tdSt, padding: "20px", color: "#9ca3af", fontStyle: "italic", background: "#fafafa" }}>{emptyMsg}</td></tr>
              : rows.map((req, i) =>
                  blink
                    ? <BlinkingRow key={req._id || req.id} req={req} onClickId={onClickId} idx={i} />
                    : <NormalRow   key={req._id || req.id} req={req} onClickId={onClickId} idx={i} />
                )
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Detail field ──────────────────────────────────────────────────────────────
function DRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid #e5e7eb", alignItems: "flex-start" }}>
      <span style={{ fontSize: "13px", color: "#374151", fontWeight: 700, minWidth: "150px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "14px", color: "#111827", fontWeight: 700, textAlign: "right", flex: 1 }}>{value}</span>
    </div>
  );
}
function TimeBlock({ label, from, to, accent }: { label: string; from?: string | null; to?: string | null; accent: string }) {
  if (!from && !to) return null;
  return (
    <div style={{ background: accent + "12", border: `1.5px solid ${accent}40`, borderRadius: "10px", padding: "12px 14px", marginBottom: "10px" }}>
      <div style={{ fontSize: "11px", fontWeight: 800, color: accent, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "120px", background: "#fff", borderRadius: "8px", padding: "8px 12px", border: `1px solid ${accent}30` }}>
          <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, marginBottom: "2px" }}>FROM</div>
          <div style={{ fontSize: "15px", fontWeight: 900, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{from ? new Date(from).toISOString().slice(11,16) : "—"}</div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "1px" }}>{from ? (() => { const s = new Date(from).toISOString(); const [y,m,d] = s.slice(0,10).split("-"); return `${d}-${m}-${y}`; })() : ""}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", color: accent, fontWeight: 900, fontSize: "18px", padding: "0 2px" }}>→</div>
        <div style={{ flex: 1, minWidth: "120px", background: "#fff", borderRadius: "8px", padding: "8px 12px", border: `1px solid ${accent}30` }}>
          <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, marginBottom: "2px" }}>TO</div>
          <div style={{ fontSize: "15px", fontWeight: 900, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{to ? new Date(to).toISOString().slice(11,16) : "—"}</div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "1px" }}>{to ? (() => { const s = new Date(to).toISOString(); const [y,m,d] = s.slice(0,10).split("-"); return `${d}-${m}-${y}`; })() : ""}</div>
        </div>
        {from && to && (
          <div style={{ width: "100%", marginTop: "6px", fontSize: "11px", color: accent, fontWeight: 700, textAlign: "right" }}>
            Duration: {fmtDur(new Date(to).getTime() - new Date(from).getTime())}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ title, accent, children, onClose }: { title: string; accent?: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px", paddingTop: "max(12px, 4vh)", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "500px", boxShadow: "0 24px 64px rgba(0,0,0,0.35)", overflow: "hidden", maxHeight: "calc(100dvh - 24px)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: accent ?? "#1f2937", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "16px", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", fontSize: "18px", lineHeight: 1, borderRadius: "6px", padding: "2px 8px" }}>×</button>
        </div>
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ background: "#1e40af", borderRadius: "6px", padding: "6px 12px", margin: "16px 0 10px", fontSize: "12px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>
      {label}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SmPendingAvailsPage() {
  const { data: session } = useSession();
  const { data, isLoading, refetch } = useGetSmPending();
  const [syncing, setSyncing] = useState(false);
  const approveMutation    = useSmApproveAvail();
  const closureAckMutation = useSmAcknowledgeClosure();
  const extensionMutation  = useSmApproveExtension();

  // Modal
  const [activeReq,   setActiveReq]   = useState<any>(null);
  const [modalType,   setModalType]   = useState<"approval" | "extension" | "closure" | "view" | null>(null);

  // Approve form
  const [modifyTime,  setModifyTime]  = useState(false);
  const [smTimeFrom,  setSmTimeFrom]  = useState("");
  const [smTimeTo,    setSmTimeTo]    = useState("");
  const [smRemarks,   setSmRemarks]   = useState("");
  const [smFromAutoFilled, setSmFromAutoFilled] = useState(false);

  // Reject form (inside approval modal)
  const [rejectMode,  setRejectMode]  = useState(false);
  const [rejectRmk,   setRejectRmk]   = useState("");

  // Closure form
  const [closureRmk,  setClosureRmk]  = useState("");

  // Extension form
  const [extAction,   setExtAction]   = useState<"APPROVE"|"REJECT">("APPROVE");
  const [extRemarks,  setExtRemarks]  = useState("");

  const pendingApprovals:    any[] = data?.data?.pendingApprovals    ?? [];
  const pendingClosures:     any[] = data?.data?.pendingClosures     ?? [];
  const closureViewOnly:     any[] = data?.data?.closureViewOnly     ?? [];
  const pendingExtensions:   any[] = data?.data?.pendingExtensions   ?? [];
  const inProgress:          any[] = data?.data?.inProgress          ?? [];
  const smApproved:          any[] = data?.data?.smApproved          ?? [];
  const alreadyAvailed:      any[] = data?.data?.alreadyAvailed      ?? [];
  const upcomingSanctioned:  any[] = data?.data?.upcomingSanctioned  ?? [];

  const pendingAction = [...pendingApprovals, ...pendingExtensions, ...pendingClosures];
  const underProgress = [...inProgress, ...smApproved];

  // Beep when pendingAction is non-empty
  const lastBeepRef = useRef(0);
  useEffect(() => {
    if (pendingAction.length === 0) return;
    const id = setInterval(() => {
      const now = Date.now();
      if (now - lastBeepRef.current > 8000) { playBeep(); lastBeepRef.current = now; }
    }, 1000);
    return () => clearInterval(id);
  }, [pendingAction.length]);

  // ── Open modal ──────────────────────────────────────────────────────────────
  function nowISTDatetimeLocal(): string {
    return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16);
  }

  function openModal(req: any) {
    setActiveReq(req);
    setRejectMode(false);
    setModifyTime(true);
    setSmRemarks("");
    setRejectRmk(""); setClosureRmk(""); setExtRemarks(""); setExtAction("APPROVE");

    // If the requested from time has already passed, pre-fill with current IST time
    const requestedFrom = req.requestedTimeFrom ?? req.grantedFromTime ?? req.sanctionedTimeFrom;
    const requestedFromMs = requestedFrom ? new Date(requestedFrom).getTime() : null;
    const nowAsIST = Date.now() + 5.5 * 60 * 60 * 1000;
    if (requestedFromMs && nowAsIST > requestedFromMs) {
      setSmTimeFrom(nowISTDatetimeLocal());
      setSmFromAutoFilled(true);
    } else {
      setSmTimeFrom(toDatetimeLocal(requestedFrom));
      setSmFromAutoFilled(false);
    }
    setSmTimeTo(toDatetimeLocal(req.requestedTimeTo ?? req.grantedToTime ?? req.sanctionedTimeTo));

    if (pendingApprovals.some((r: any) => (r._id||r.id) === (req._id||req.id))) {
      setModalType("approval");
    } else if (pendingExtensions.some((r: any) => (r._id||r.id) === (req._id||req.id))) {
      setModalType("extension");
    } else if (pendingClosures.some((r: any) => (r._id||r.id) === (req._id||req.id))) {
      setModalType("closure");
    } else {
      setModalType("view");
    }
  }

  // ── Submit helpers ──────────────────────────────────────────────────────────
  function submitApprove() {
    if (!activeReq) return;
    if (!smTimeFrom || !smTimeTo) { toast.error("Enter both times"); return; }
    setSyncing(true);
    setModalType(null);
    approveMutation.mutate({
      requestId: activeReq._id || activeReq.id,
      action: "APPROVE_WITH_MODIFICATION",
      smApprovedTimeFrom: toUTCSlot(smTimeFrom),
      smApprovedTimeTo: toUTCSlot(smTimeTo),
      smRemarks: smRemarks || undefined,
    }, {
      onSuccess: async () => { toast.success("Approved"); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  function submitReject() {
    if (!activeReq) return;
    if (!rejectRmk.trim()) { toast.error("Remarks required"); return; }
    setSyncing(true);
    setModalType(null);
    approveMutation.mutate({
      requestId: activeReq._id || activeReq.id,
      action: "REJECT",
      smRemarks: rejectRmk,
    }, {
      onSuccess: async () => { toast.success("Rejected"); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  function submitClosure() {
    if (!activeReq) return;
    setSyncing(true);
    setModalType(null);
    closureAckMutation.mutate({
      requestId: activeReq._id || activeReq.id,
      smClosureRemarks: closureRmk,
    }, {
      onSuccess: async () => { toast.success("Block closed"); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  function submitExtension(action?: "APPROVE" | "REJECT") {
    if (!activeReq) return;
    const act = action ?? extAction;
    if (act === "REJECT" && !extRemarks.trim()) { toast.error("Remarks required to reject"); return; }
    const pendingExtParticipant = (activeReq.availParticipants ?? []).find((p: any) => p.extensionStatus === "PENDING");
    setSyncing(true);
    setModalType(null);
    extensionMutation.mutate({
      requestId: activeReq._id || activeReq.id,
      participantId: pendingExtParticipant?.id,
      action: act,
      smRemarks: extRemarks || undefined,
    }, {
      onSuccess: async () => { toast.success(`Extension ${act === "APPROVE" ? "approved" : "rejected"}`); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  // ── Clock (IST = UTC+5:30) ───────────────────────────────────────────────────
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(id); }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const currentDate = `${pad(nowIST.getUTCDate())}/${pad(nowIST.getUTCMonth()+1)}/${nowIST.getUTCFullYear()}`;
  const currentTime = `${pad(nowIST.getUTCHours())}:${pad(nowIST.getUTCMinutes())}`;

  // ── Concurrence badge helper ─────────────────────────────────────────────────
  function ConcBadges({ req }: { req: any }) {
    const all = [
      ...(req.trdAvailConcurrences  ?? []).map((c: any) => ({ prefix: "TRD",  ...c })),
      ...(req.sntAvailConcurrences  ?? []).map((c: any) => ({ prefix: "S&T",  ...c })),
      ...(req.enggAvailConcurrences ?? []).map((c: any) => ({ prefix: "ENGG", ...c })),
    ];
    if (all.length === 0) return null;
    return (
      <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {all.map((c: any, i: number) => (
          <span key={i} style={{
            padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700,
            background: c.status === "ACCEPTED" ? "#dcfce7" : c.status === "REJECTED" ? "#fef2f2" : "#fef3c7",
            color: c.status === "ACCEPTED" ? "#166534" : c.status === "REJECTED" ? "#991b1b" : "#92400e",
            border: `1.5px solid ${c.status === "ACCEPTED" ? "#86efac" : c.status === "REJECTED" ? "#fca5a5" : "#fde68a"}`,
          }}>
            {c.prefix}/{c.depot}: {c.status}
          </span>
        ))}
      </div>
    );
  }

  // datetime-local gives "YYYY-MM-DDTHH:MM" with no timezone.
  // App convention: IST wall-clock stored in the UTC slot (no offset).
  // Appending Z forces the backend's new Date() to treat it as UTC so
  // the stored value matches exactly what the user typed.
  function toUTCSlot(s: string): string {
    if (!s) return s;
    const withSeconds = s.length === 16 ? `${s}:00` : s;
    return `${withSeconds}.000Z`;
  }

  const fldInput: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "2px solid #6b7280", fontSize: "15px", fontWeight: 600, color: "#111827", boxSizing: "border-box", background: "#fff", outline: "none", marginTop: "6px", display: "block" };
  const fldLabel: React.CSSProperties = { fontSize: "13px", fontWeight: 800, color: "#1f2937", letterSpacing: "0.3px", display: "block", marginTop: "10px" };
  const btnGreen: React.CSSProperties = { flex: 1, padding: "12px", borderRadius: "8px", fontWeight: 800, fontSize: "14px", cursor: "pointer", border: "none", background: "#16a34a", color: "#fff" };
  const btnRed:   React.CSSProperties = { ...btnGreen, background: "#dc2626" };
  const btnGray:  React.CSSProperties = { ...btnGreen, background: "#e5e7eb", color: "#374151" };
  const btnAmber: React.CSSProperties = { ...btnGreen, background: "#d97706", color: "#000" };

  return (
    <div style={{ minHeight: "100vh", background: "#c8f7c8", fontFamily: "Arial, sans-serif" }}>
      <LoadingBar active={syncing} />
      <Toaster position="top-center" />

      {/* RBMS header */}
      <div style={{ background: "#fef08a", padding: "10px", textAlign: "center" }}>
        <span style={{ fontSize: "28px", fontWeight: 900, color: "#7c3aed", letterSpacing: "3px" }}>RBMS</span>
      </div>

      {/* Date / Station / Time */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ background: "#e0e7ff", border: "2px solid #a5b4fc", borderRadius: "8px", padding: "8px 14px", textAlign: "center", fontWeight: 800, fontSize: "13px", color: "#000" }}>
          CURRENT DATE<br />{currentDate}
        </div>
        <div style={{ background: "#4ade80", border: "2px solid #16a34a", borderRadius: "8px", padding: "8px 20px", textAlign: "center", fontWeight: 900, fontSize: "15px", color: "#000", flex: 1, maxWidth: "400px" }}>
          SMR DASHBOARD
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
            {(session?.user?.depot ?? "").split(",").filter(Boolean).map(s => (
              <span key={s} style={{ background: "#15803d", color: "#fff", borderRadius: "4px", padding: "1px 8px", fontSize: "13px", fontWeight: 800 }}>{s.trim()}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ background: "#e0e7ff", border: "2px solid #a5b4fc", borderRadius: "8px", padding: "8px 14px", textAlign: "center", fontWeight: 800, fontSize: "13px", color: "#000" }}>
            CURRENT TIME<br />{currentTime}
          </div>
          <button onClick={() => refetch()} style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 13px", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>↻</button>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })} style={{ background: "#374151", color: "#fbbf24", border: "none", borderRadius: "8px", padding: "9px 14px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Alert banner when pending */}
      {pendingAction.length > 0 && (
        <div style={{ margin: "0 14px 10px", background: "#fef2f2", border: "2px solid #dc2626", borderRadius: "8px", padding: "8px 14px", fontWeight: 800, fontSize: "14px", color: "#dc2626", textAlign: "center" }}>
          ⚡ {pendingAction.length} request{pendingAction.length !== 1 ? "s" : ""} need your immediate action
        </div>
      )}

      {isLoading
        ? <div style={{ textAlign: "center", padding: "60px", fontWeight: 700, fontSize: "16px" }}>Loading…</div>
        : (
          <div style={{ padding: "0 12px 16px" }}>

            <SectionTable title="REQUESTS PENDING FOR AVAILING / CANCELLATION BLOCKS" subtitle="(CLICK ID TO TAKE ACTION)" headerColor="#c2185b" rows={pendingAction} blink onClickId={openModal} emptyMsg="No pending requests" />
            <SectionTable title="BLOCKS UNDER PROGRESS" subtitle="(CLICK ID TO SEE FULL DETAILS)" headerColor="#e65100" rows={underProgress} onClickId={openModal} emptyMsg="No blocks in progress" />
            {closureViewOnly.length > 0 && (
              <SectionTable
                title="CLOSURE SUBMITTED — AWAITING OTHER SM'S ACKNOWLEDGEMENT"
                subtitle="(VIEW ONLY — YOU GRANTED THIS BLOCK, ANOTHER SM WAS SELECTED FOR CLOSURE ACK)"
                headerColor="#7c3aed"
                rows={closureViewOnly}
                onClickId={openModal}
                emptyMsg=""
              />
            )}
            <SectionTable title="UPCOMING SANCTIONED BLOCKS" subtitle="(CLICK ID TO SEE FULL DETAILS)" headerColor="#2e7d32" rows={upcomingSanctioned} onClickId={openModal} emptyMsg="No upcoming sanctioned blocks" />
            <SectionTable title="BLOCKS ALREADY AVAILED" subtitle="(CLICK ID TO SEE FULL DETAILS)" headerColor="#1565c0" rows={alreadyAvailed} onClickId={openModal} emptyMsg="No availed blocks in last 48 hrs" />

          </div>
        )
      }

      {/* HOME / LOGOUT / BACK */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px 28px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => window.location.href = "/dashboard"} style={{ background: "#1d4ed8", border: "2px solid #1e40af", borderRadius: "24px", padding: "9px 22px", fontWeight: 800, fontSize: "14px", cursor: "pointer", color: "#fff" }}>🏠 HOME</button>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })} style={{ background: "#dc2626", border: "2px solid #b91c1c", borderRadius: "24px", padding: "9px 22px", fontWeight: 800, fontSize: "14px", cursor: "pointer", color: "#fff" }}>⏻ LOGOUT</button>
        </div>
        <button onClick={() => window.history.back()} style={{ background: "#374151", border: "2px solid #1f2937", borderRadius: "24px", padding: "9px 26px", fontWeight: 800, fontSize: "14px", cursor: "pointer", color: "#fff" }}>&lt; BACK</button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          APPROVAL MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {modalType === "approval" && activeReq && (
        <Modal title="Availing Request — SM Action" accent="#1e40af" onClose={() => setModalType(null)}>
          {/* Block identity strip */}
          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Request ID</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#1e40af" }}>{activeReq.divisionId ?? (activeReq._id||activeReq.id)?.slice(0,8)}</div>
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Department</div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{activeReq.selectedDepartment ?? "—"}</div>
            </div>
            <div style={{ flex: 2, minWidth: "180px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Section / Block</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{activeReq.missionBlock ?? activeReq.selectedSection ?? "—"}</div>
            </div>
          </div>

          <DRow label="Corridor Type"  value={activeReq.corridorType} />
          <DRow label="Work Type"      value={activeReq.workType} />
          <DRow label="Activity"       value={activeReq.activity} />
          <DRow label="Work Location"  value={[activeReq.workLocationFrom, activeReq.workLocationTo].filter(Boolean).join(" → ")} />
          {activeReq.oheMasFrom && <DRow label="OHE MAS From" value={activeReq.oheMasFrom} />}
          {activeReq.oheMasTo   && <DRow label="OHE MAS To"   value={activeReq.oheMasTo} />}
          {activeReq.requestremarks && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "8px", padding: "10px 12px", margin: "8px 0", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
              💬 SSE Remarks: {activeReq.requestremarks}
            </div>
          )}

          <div style={{ margin: "12px 0 4px" }}>
            <TimeBlock label="Admin Sanctioned Time" from={activeReq.sanctionedTimeFrom ?? activeReq.demandTimeFrom} to={activeReq.sanctionedTimeTo ?? activeReq.demandTimeTo} accent="#7c3aed" />
            <TimeBlock label="SSE's Requested Time" from={activeReq.requestedTimeFrom ?? activeReq.sanctionedTimeFrom} to={activeReq.requestedTimeTo ?? activeReq.sanctionedTimeTo} accent="#0369a1" />
          </div>

          {(activeReq.trdAvailConcurrences?.length > 0 || activeReq.sntAvailConcurrences?.length > 0 || activeReq.enggAvailConcurrences?.length > 0) && (
            <>
              <SectionDivider label="Concurrences" />
              <ConcBadges req={activeReq} />
            </>
          )}

          <SectionDivider label="Set Permitted Time" />

          {!rejectMode ? (
            <>
              <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: "12px", padding: "16px", marginBottom: "14px" }}>
                {smFromAutoFilled && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
                    <div style={{ fontWeight: 800, fontSize: "13px", color: "#991b1b" }}>⚠️ Requested from time has already passed</div>
                    <div style={{ fontSize: "12px", color: "#7f1d1d", marginTop: "3px" }}>
                      The from time has been set to the current IST time. Please review and adjust if needed before approving.
                    </div>
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "#92400e", fontWeight: 800, marginBottom: "12px", letterSpacing: "0.3px" }}>
                  ENTER ACTUAL PERMITTED TIME WINDOW
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ ...fldLabel, color: "#92400e", fontSize: "11px" }}>FROM *</label>
                    <input type="datetime-local" style={{ ...fldInput, border: "2px solid #f59e0b", fontSize: "14px" }} value={smTimeFrom} onChange={e => setSmTimeFrom(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ ...fldLabel, color: "#92400e", fontSize: "11px" }}>TO *</label>
                    <input type="datetime-local" style={{ ...fldInput, border: "2px solid #f59e0b", fontSize: "14px" }} value={smTimeTo} onChange={e => setSmTimeTo(e.target.value)} />
                  </div>
                </div>
                {smTimeFrom && smTimeTo && (
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#b45309", fontWeight: 800, textAlign: "right" }}>
                    Duration: {fmtDur(new Date(smTimeTo).getTime() - new Date(smTimeFrom).getTime())}
                  </div>
                )}
              </div>
              <label style={fldLabel}>SM Remarks (optional)</label>
              <textarea style={{ ...fldInput, height: "70px", resize: "vertical", marginBottom: "14px" }} placeholder="Enter remarks…" value={smRemarks} onChange={e => setSmRemarks(e.target.value)} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={submitApprove} disabled={approveMutation.isPending} style={{ ...btnGreen, flex: 2 }}>
                  {approveMutation.isPending ? "Submitting…" : "✓ Approve & Set Time"}
                </button>
                <button onClick={() => setRejectMode(true)} style={{ ...btnRed, flex: 1 }}>Reject</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px", fontSize: "13px", color: "#991b1b", fontWeight: 700 }}>
                ⚠ Rejecting will cancel the SSE&apos;s availing application.
              </div>
              <label style={fldLabel}>Rejection Reason *</label>
              <textarea style={{ ...fldInput, height: "90px", resize: "vertical", marginBottom: "16px" }} placeholder="Enter reason for rejection…" value={rejectRmk} onChange={e => setRejectRmk(e.target.value)} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={submitReject} disabled={approveMutation.isPending} style={{ ...btnRed, flex: 2 }}>
                  {approveMutation.isPending ? "Submitting…" : "Confirm Reject"}
                </button>
                <button onClick={() => setRejectMode(false)} style={{ ...btnGray, flex: 1 }}>← Back</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EXTENSION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {modalType === "extension" && activeReq && (() => {
        const extP = (activeReq.availParticipants ?? []).find((p: any) => p.extensionStatus === "PENDING") ?? {};
        const curEndMs = new Date(activeReq.smApprovedTimeTo ?? activeReq.grantedToTime ?? 0).getTime();
        const newEndMs = new Date(extP.extensionRequestedTo ?? 0).getTime();
        const extraMs  = newEndMs - curEndMs;
        return (
        <Modal title={extP.extensionIsEmergency ? "🚨 EMERGENCY Extension Request" : "Time Extension Request"} accent={extP.extensionIsEmergency ? "#991b1b" : "#1e40af"} onClose={() => setModalType(null)}>
          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Request ID</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#1e40af" }}>{activeReq.divisionId ?? (activeReq._id||activeReq.id)?.slice(0,8)}</div>
            </div>
            <div style={{ flex: 2, minWidth: "160px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Section</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{activeReq.missionBlock ?? activeReq.selectedSection ?? "—"}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{activeReq.activity ?? ""}</div>
            </div>
          </div>

          {extP.extensionIsEmergency && (
            <div style={{ background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "10px", padding: "12px 14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "14px", color: "#991b1b", fontWeight: 900 }}>🚨 EMERGENCY EXTENSION</div>
              <div style={{ fontSize: "13px", color: "#7f1d1d", marginTop: "4px", fontWeight: 600 }}>{extP.extensionEmergencyReason}</div>
            </div>
          )}

          <TimeBlock label="Currently Permitted Time" from={activeReq.smApprovedTimeFrom ?? activeReq.grantedFromTime} to={activeReq.smApprovedTimeTo ?? activeReq.grantedToTime} accent="#0369a1" />

          <div style={{ background: "#fff7ed", border: "2px solid #fed7aa", borderRadius: "12px", padding: "14px 16px", marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", color: "#9a3412", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>Extension Request</div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "140px", background: "#fff", borderRadius: "8px", padding: "10px 12px", border: "1px solid #fed7aa" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, marginBottom: "2px" }}>CURRENT END</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#0369a1" }}>{activeReq.smApprovedTimeTo ? new Date(activeReq.smApprovedTimeTo).toISOString().slice(11,16) : "—"}</div>
              </div>
              <div style={{ fontSize: "20px", color: "#ea580c", fontWeight: 900 }}>⟶</div>
              <div style={{ flex: 1, minWidth: "140px", background: "#fff", borderRadius: "8px", padding: "10px 12px", border: "2px solid #ea580c" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, marginBottom: "2px" }}>REQUESTED NEW END</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#9a3412" }}>{extP.extensionRequestedTo ? new Date(extP.extensionRequestedTo).toISOString().slice(11,16) : "—"}</div>
              </div>
            </div>
            {extraMs > 0 && (
              <div style={{ marginTop: "10px", background: "#ea580c", borderRadius: "8px", padding: "8px 12px", textAlign: "center", fontWeight: 900, fontSize: "14px", color: "#fff" }}>
                +{fmtDur(extraMs)} extra time requested
              </div>
            )}
            {extP.extensionRemarks && (
              <div style={{ marginTop: "10px", fontSize: "13px", color: "#78350f", fontWeight: 600, fontStyle: "italic" }}>
                SSE: &quot;{extP.extensionRemarks}&quot;
              </div>
            )}
          </div>

          <label style={fldLabel}>Remarks (required to reject, optional to approve)</label>
          <textarea style={{ ...fldInput, height: "80px", resize: "vertical", marginBottom: "14px" }} placeholder="Enter remarks…" value={extRemarks} onChange={e => setExtRemarks(e.target.value)} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => submitExtension("APPROVE")} disabled={extensionMutation.isPending} style={{ ...btnGreen, flex: 1 }}>
              {extensionMutation.isPending ? "Submitting…" : "✓ Approve"}
            </button>
            <button onClick={() => submitExtension("REJECT")} disabled={extensionMutation.isPending} style={{ ...btnRed, flex: 1 }}>
              {extensionMutation.isPending ? "Submitting…" : "✗ Reject"}
            </button>
          </div>
        </Modal>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          CLOSURE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {modalType === "closure" && activeReq && (() => {
        const permittedMs = activeReq.smApprovedTimeTo
          ? new Date(activeReq.smApprovedTimeTo).getTime() - new Date(activeReq.smApprovedTimeFrom ?? activeReq.grantedFromTime ?? 0).getTime()
          : 0;
        const actualMs = activeReq.closureSubmittedAt && activeReq.availingStartedAt
          ? new Date(activeReq.closureSubmittedAt).getTime() - new Date(activeReq.availingStartedAt).getTime()
          : 0;
        const overrun = actualMs > 0 && permittedMs > 0 && actualMs > permittedMs;
        return (
        <Modal title="Acknowledge Block Closure" accent="#0369a1" onClose={() => setModalType(null)}>
          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Request ID</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#1e40af" }}>{activeReq.divisionId ?? (activeReq._id||activeReq.id)?.slice(0,8)}</div>
            </div>
            <div style={{ flex: 2, minWidth: "160px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Section</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{activeReq.missionBlock ?? activeReq.selectedSection ?? "—"}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{activeReq.activity ?? ""}</div>
            </div>
          </div>

          <TimeBlock label="Permitted Time (SM Approved)" from={activeReq.smApprovedTimeFrom ?? activeReq.grantedFromTime} to={activeReq.smApprovedTimeTo ?? activeReq.grantedToTime} accent="#0369a1" />

          {/* Per-participant actual availed times + closure details */}
          {((activeReq.availParticipants ?? []) as any[]).filter((p: any) => p.closureSubmittedAt).map((p: any, idx: number) => {
            const pFrom = p.availStartedAt;
            const pTo   = p.closureSubmittedAt;
            const pActualMs = pFrom && pTo ? new Date(pTo).getTime() - new Date(pFrom).getTime() : 0;
            const pOverrun  = pActualMs > 0 && permittedMs > 0 && pActualMs > permittedMs;
            return (
              <div key={idx} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "14px 16px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Participant: {p.userDesignation ?? p.participantType}/{p.userDept}/{p.userDepot}
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <div style={{ flex: 1, minWidth: "120px", background: "#fff", borderRadius: "8px", padding: "8px 10px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, marginBottom: "2px" }}>AVAILING STARTED</div>
                    <div style={{ fontSize: "15px", fontWeight: 900, color: "#166534" }}>{pFrom ? new Date(pFrom).toISOString().slice(11,16) : "—"}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>{pFrom ? fmtDt(pFrom).split(" ")[0] : ""}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: "120px", background: "#fff", borderRadius: "8px", padding: "8px 10px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, marginBottom: "2px" }}>BLOCK CLOSED</div>
                    <div style={{ fontSize: "15px", fontWeight: 900, color: "#166534" }}>{pTo ? new Date(pTo).toISOString().slice(11,16) : "—"}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>{pTo ? fmtDt(pTo).split(" ")[0] : ""}</div>
                  </div>
                  {pActualMs > 0 && (
                    <div style={{ flex: 1, minWidth: "120px", background: pOverrun ? "#fef2f2" : "#dcfce7", borderRadius: "8px", padding: "8px 10px", textAlign: "center", border: pOverrun ? "2px solid #fca5a5" : "none" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: pOverrun ? "#991b1b" : "#166534" }}>{pOverrun ? "OVERRUN" : "WITHIN TIME"}</div>
                      <div style={{ fontSize: "15px", fontWeight: 900, color: pOverrun ? "#991b1b" : "#166534" }}>
                        {pOverrun ? `+${fmtDur(pActualMs - permittedMs)}` : fmtDur(pActualMs)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #d1fae5", padding: "10px 12px" }}>
                  <DRow label="Remarks"               value={p.closureRemarks} />
                  <DRow label="Reconnected Signal No." value={p.closureReconnectedSignal} />
                  <DRow label="Caution (kmph)"         value={p.closureCautionKmph} />
                  <div style={{ display: "flex", gap: "10px", padding: "6px 0", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#374151", fontWeight: 700, minWidth: "140px" }}>OHE Made Fit</span>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: p.closureOheMadeFit ? "#16a34a" : "#dc2626", background: p.closureOheMadeFit ? "#dcfce7" : "#fef2f2", borderRadius: "6px", padding: "2px 10px" }}>
                      {p.closureOheMadeFit ? "✓ YES" : "✗ NO"}
                    </span>
                  </div>
                  {p.closureImageUrl && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", marginBottom: "4px", textTransform: "uppercase" }}>Closure Image</div>
                      <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${p.closureImageUrl}`} alt="Closure"
                        style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "8px", border: "1.5px solid #bbf7d0", objectFit: "contain" }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <label style={fldLabel}>SM Remarks (optional)</label>
          <textarea style={{ ...fldInput, height: "80px", resize: "vertical", marginBottom: "14px" }} placeholder="Enter remarks…" value={closureRmk} onChange={e => setClosureRmk(e.target.value)} />
          <button onClick={submitClosure} disabled={closureAckMutation.isPending} style={{ ...btnAmber, width: "100%" }}>
            {closureAckMutation.isPending ? "Submitting…" : "✓ Acknowledge & Close Block"}
          </button>
        </Modal>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          VIEW-ONLY MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {modalType === "view" && activeReq && (
        <Modal title="Block Details" accent="#374151" onClose={() => setModalType(null)}>
          <DRow label="Request ID"   value={activeReq.divisionId ?? (activeReq._id||activeReq.id)?.slice(0,8)} />
          <DRow label="Section"      value={activeReq.selectedSection ?? activeReq.missionBlock} />
          <DRow label="Department"   value={activeReq.selectedDepartment} />
          <DRow label="Work Type"    value={activeReq.workType} />
          <DRow label="Activity"     value={activeReq.activity} />
          <DRow label="Status"       value={activeReq.overAllStatus} />

          <SectionDivider label="Timing" />
          <DRow label="Granted From"   value={fmtDt(activeReq.grantedFromTime)} />
          <DRow label="Granted To"     value={fmtDt(activeReq.grantedToTime)} />
          {activeReq.smApprovedTimeFrom && <DRow label="SM Approved From" value={fmtDt(activeReq.smApprovedTimeFrom)} />}
          {activeReq.smApprovedTimeTo   && <DRow label="SM Approved To"   value={fmtDt(activeReq.smApprovedTimeTo)} />}
          {activeReq.availingStartedAt  && <DRow label="Availing Started" value={fmtDt(activeReq.availingStartedAt)} />}
          {activeReq.closureSubmittedAt && <DRow label="Closure Submitted" value={fmtDt(activeReq.closureSubmittedAt)} />}
          {activeReq.smClosureAcknowledgedAt && <DRow label="SM Acknowledged" value={fmtDt(activeReq.smClosureAcknowledgedAt)} />}

          {(activeReq.trdAvailConcurrences?.length > 0 || activeReq.sntAvailConcurrences?.length > 0 || activeReq.enggAvailConcurrences?.length > 0) && (
            <>
              <SectionDivider label="Concurrences" />
              <ConcBadges req={activeReq} />
            </>
          )}

          <div style={{ marginTop: "16px" }}>
            <button onClick={() => setModalType(null)} style={{ ...btnGray, width: "100%" }}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
