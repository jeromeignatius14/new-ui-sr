"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { useGetTrdPending } from "@/app/service/query/avail";
import { useTrdPermitAvail, useTrdApproveExtension, useTrdAcknowledgeClosure } from "@/app/service/mutation/avail";
import { LoadingBar } from "@/app/components/ui/LoadingBar";

// ── Helpers ───────────────────────────────────────────────────────────────────
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
function toUTCSlot(s: string): string {
  if (!s) return s;
  const withSec = s.length === 16 ? `${s}:00` : s;
  return `${withSec}.000Z`;
}
function getStatusLabel(req: any) {
  const s = req.overAllStatus ?? "";
  if (s === "Block Closed") return "Closed ✓";
  if (s === "All Closures Submitted") return "Submitted\nto Controller";
  if (s === "Availing Active") return "In Progress";
  if (s === "SM Approved") return "Permitted\nAwaiting SSE Ack";
  if (s === "Pending TRD Controller Permit") return "Awaiting\nPermit";
  if (s === "Availing Cancelled") return "Cancelled";
  return s;
}
function getExtendedUpto(req: any) {
  return req.extensionStatus === "APPROVED" && req.extensionRequestedTo
    ? fmtShort(req.extensionRequestedTo)
    : "NA";
}

// ── Beep ──────────────────────────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
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

function BlinkingRow({ req, onClickId }: { req: any; onClickId: (r: any) => void }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const id = setInterval(() => setOn(v => !v), 600); return () => clearInterval(id); }, []);
  const timeFrom = req.smApprovedTimeFrom ?? req.grantedFromTime ?? req.sanctionedTimeFrom;
  const timeTo   = req.smApprovedTimeTo   ?? req.grantedToTime   ?? req.sanctionedTimeTo;
  return (
    <tr style={{ background: on ? "#fca5a5" : "#fff0f0", transition: "background 0.3s" }}>
      <td style={{ ...tdSt, fontWeight: 900 }}>{req.selectedDepartment ?? "TRD"}</td>
      <td style={tdSt}>
        <span onClick={() => onClickId(req)} style={{ cursor: "pointer", color: "#b91c1c", fontWeight: 900, textDecoration: "underline", fontSize: "14px" }}>
          {req.divisionId ?? req.id?.slice(0, 8)}
        </span>
      </td>
      <td style={tdSt}>{req.missionBlock ?? req.selectedSection ?? "—"}</td>
      <td style={tdSt}>{req.corridorType ?? "—"}</td>
      <td style={tdSt}>{req.workLocationFrom ?? "—"}</td>
      <td style={tdSt}>{req.workLocationTo ?? "—"}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line" }}>{fmtShort(timeFrom)}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line" }}>{fmtShort(timeTo)}</td>
      <td style={tdSt}>{getExtendedUpto(req)}</td>
      <td style={tdSt}>{req.activity ?? "—"}</td>
      <td style={{ ...tdSt, whiteSpace: "pre-line", color: "#b91c1c", fontWeight: 800 }}>{getStatusLabel(req)}</td>
    </tr>
  );
}

function NormalRow({ req, onClickId, idx }: { req: any; onClickId: (r: any) => void; idx: number }) {
  const timeFrom = req.smApprovedTimeFrom ?? req.grantedFromTime ?? req.sanctionedTimeFrom;
  const timeTo   = req.smApprovedTimeTo   ?? req.grantedToTime   ?? req.sanctionedTimeTo;
  return (
    <tr style={{ background: idx % 2 === 0 ? "#fff" : "#fafaf0" }}>
      <td style={{ ...tdSt, fontWeight: 900 }}>{req.selectedDepartment ?? "TRD"}</td>
      <td style={tdSt}>
        <span onClick={() => onClickId(req)} style={{ cursor: "pointer", color: "#1d4ed8", fontWeight: 800, textDecoration: "underline", fontSize: "14px" }}>
          {req.divisionId ?? req.id?.slice(0, 8)}
        </span>
      </td>
      <td style={tdSt}>{req.missionBlock ?? req.selectedSection ?? "—"}</td>
      <td style={tdSt}>{req.corridorType ?? "—"}</td>
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

function SectionTable({ title, subtitle, headerColor, rows, blink, onClickId, emptyMsg }: {
  title: string; subtitle?: string; headerColor: string;
  rows: any[]; blink?: boolean; onClickId: (r: any) => void; emptyMsg: string;
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
            <tr style={{ background: "#fde68a" }}>
              <th style={thSt} rowSpan={2}>Dept</th>
              <th style={thSt} rowSpan={2}>ID</th>
              <th style={thSt} rowSpan={2}>Block Section<br />/Yard</th>
              <th style={thSt} rowSpan={2}>UP/DN/<br />Road No.</th>
              <th style={thSt} colSpan={2}>Location</th>
              <th style={thSt} colSpan={2}>Timings</th>
              <th style={thSt} rowSpan={2}>Extended<br />Upto</th>
              <th style={thSt} rowSpan={2}>Activity</th>
              <th style={thSt} rowSpan={2}>Status</th>
            </tr>
            <tr style={{ background: "#fde68a" }}>
              <th style={thSt}>From</th><th style={thSt}>To</th>
              <th style={thSt}>From</th><th style={thSt}>To</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={11} style={{ ...tdSt, padding: "20px", color: "#9ca3af", fontStyle: "italic", background: "#fafafa" }}>{emptyMsg}</td></tr>
              : rows.map((req, i) => blink
                  ? <BlinkingRow key={req.id} req={req} onClickId={onClickId} />
                  : <NormalRow   key={req.id} req={req} onClickId={onClickId} idx={i} />
                )
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid #e5e7eb", alignItems: "flex-start" }}>
      <span style={{ fontSize: "13px", color: "#374151", fontWeight: 700, minWidth: "150px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "14px", color: "#111827", fontWeight: 700, flex: 1 }}>{value}</span>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ background: "#b45309", borderRadius: "6px", padding: "6px 12px", margin: "16px 0 10px", fontSize: "12px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>
      {label}
    </div>
  );
}

function Modal({ title, accent, children, onClose }: { title: string; accent?: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }}>
      <div style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "500px", boxShadow: "0 24px 64px rgba(0,0,0,0.35)", overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: accent ?? "#1f2937", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "16px", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", fontSize: "18px", lineHeight: 1, borderRadius: "6px", padding: "2px 8px" }}>×</button>
        </div>
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── TPC Board → Depot mapping (per division) ─────────────────────────────────
const TPC_BOARDS_BY_DIVISION: Record<string, { name: string; depots: string[] }[]> = {
  MAS: [
    { name: "TPC-GDR BOARD", depots: ["GDR", "SPE", "PON", "TVT", "BBQ", "MS"] },
    { name: "TPC-RU BOARD",  depots: ["BBQ", "AVD", "TRL", "AJJ", "CGL", "PUT"] },
    { name: "TPC-VM BOARD",  depots: ["MS", "BBQ", "TBM", "CGL", "AJJ", "ACK", "VM"] },
    { name: "TPC-JTJ BOARD", depots: ["AJJ", "WJR", "KPD", "AB", "JTJ"] },
  ],
  MDU: [
    { name: "TPC 1 (TPJ-MDU, DG-POY & MDU-BDNK)", depots: ["MPA", "DG", "MDU", "UDT", "PLNI", "TENI"] },
    { name: "TPC 2 (MDU-TEN, TEN-TN & TEN-TCN)",   depots: ["VPT", "CVP", "TEN", "TN"] },
    { name: "TPC 3 (VPT-SCT, VPT-MNM, MDU-RMM, TEN-TSI, SCT-QLN, TPJ-KKDI & MNM-VPT)", depots: ["KKDI", "MNM", "PDKT", "RMD", "RJPM", "SCT", "PUU", "ASD", "NZT"] },
  ],
  PGT: [
    { name: "TPC (PTJ-CLT)",      depots: ["PGT", "POY", "SRR", "NIL", "TIR"] },
    { name: "TPC (MAQ-MAQ/MAJN)", depots: ["QLD", "CS", "CHV", "ULL"] },
  ],
  SA: [
    { name: "TPC-SA BOARD (TPT-MAP-TNT-MVPM, SA-SAMT, MGSJ-MTDM)", depots: ["SLY", "BQI", "SA", "MTDM"] },
    { name: "TPC-CBE BOARD (MVPM-IGR-SUU-PTJ, MGSJ-MTDM)",          depots: ["ED", "TUP", "PTJ"] },
    { name: "TPC-KRR BOARD (KRR-DG, KRR-MONR, KRR-VRQ, ED-MPLM, SA-MONR, KRR-TP & SAMT-VRI)", depots: ["KRR", "KMD", "NMKL", "PLI", "CHSM"] },
  ],
  TPJ: [
    { name: "TPC-CHORD LINE (TPJ-VM)",                                                                    depots: ["TPJ", "ALU", "VRI", "VM"] },
    { name: "TPC-KPD LINE (VM-KPD, VM-PDY, VM-CUPJ, CUPJ-VRI)",                                          depots: ["TNM", "ARV", "VM", "CUPJ", "VRI"] },
    { name: "TPC-MAIN LINE (CUPJ-TPJ, TPJ-TPGY-TP)",                                                     depots: ["TPJ", "TJ", "MV", "CUPJ"] },
    { name: "TPC-BRANCH LINE (MV-TVR, TVR-KKDI, PEM-KIK, KIK-TJ, TTP-AGX, NGT-VLNK, NMJ-MQ & KIK-KIKP)", depots: ["MV", "TVR", "KIK"] },
  ],
  TVC: [
    { name: "TPC (SRR-VARD-STRL)",    depots: ["TCR", "CKI"] },
    { name: "TPC (STRL-VARD-PVU/SP)", depots: ["KTYM", "ALLP", "KYJ", "QLN"] },
    { name: "TPC (PVU/SP-MP/SP)",     depots: ["KZK", "NCJ", "NNN"] },
  ],
};

function filterByBoard(arr: any[], boardDepots: string[]): any[] {
  return arr.filter((r: any) => {
    const depot = r.appliedByDepot ?? r.selectedDepo ?? "";
    return boardDepots.includes(depot);
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PermitBlockAtSitePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetTrdPending();
  const [syncing, setSyncing] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<{ name: string; depots: string[] } | null>(null);

  const division = (session?.user?.location ?? "MAS").toUpperCase();
  const TPC_BOARDS = TPC_BOARDS_BY_DIVISION[division] ?? TPC_BOARDS_BY_DIVISION["MAS"];

  const permitMutation    = useTrdPermitAvail();
  const extensionMutation = useTrdApproveExtension();
  const closureAckMutation = useTrdAcknowledgeClosure();

  const [activeReq,  setActiveReq]  = useState<any>(null);
  const [modalType,  setModalType]  = useState<"permit" | "extension" | "closure" | "view" | null>(null);

  // Permit form
  const [modifyTime, setModifyTime] = useState(false);
  const [trdTimeFrom, setTrdTimeFrom] = useState("");
  const [trdTimeTo,   setTrdTimeTo]   = useState("");
  const [trdRemarks,  setTrdRemarks]  = useState("");

  // Reject form
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectRmk,  setRejectRmk]  = useState("");

  // Closure form
  const [closureRmk, setClosureRmk] = useState("");

  // Extension form
  const [extAction,  setExtAction]  = useState<"APPROVE" | "REJECT">("APPROVE");
  const [extRemarks, setExtRemarks] = useState("");

  const rawPendingPermits:       any[] = data?.data?.pendingPermits       ?? [];
  const rawPendingClosures:      any[] = data?.data?.pendingClosures      ?? [];
  const rawPendingExtensions:    any[] = data?.data?.pendingExtensions    ?? [];
  const rawInProgress:           any[] = data?.data?.inProgress           ?? [];
  const rawTrdApproved:          any[] = data?.data?.trdApproved          ?? [];
  const rawAlreadyAvailed:       any[] = data?.data?.alreadyAvailed       ?? [];
  const rawUpcomingSanctioned:   any[] = data?.data?.upcomingSanctioned   ?? [];

  const applyFilter = <T,>(arr: T[]) => selectedBoard ? filterByBoard(arr as any[], selectedBoard.depots) as T[] : arr;

  const pendingPermits      = applyFilter(rawPendingPermits);
  const pendingClosures     = applyFilter(rawPendingClosures);
  const pendingExtensions   = applyFilter(rawPendingExtensions);
  const inProgress          = applyFilter(rawInProgress);
  const trdApproved         = applyFilter(rawTrdApproved);
  const alreadyAvailed      = applyFilter(rawAlreadyAvailed);
  const upcomingSanctioned  = applyFilter(rawUpcomingSanctioned);

  const pendingAction = [...pendingPermits, ...pendingExtensions, ...pendingClosures];
  const underProgress = [...inProgress, ...trdApproved];

  // Beep
  const lastBeepRef = useRef(0);
  useEffect(() => {
    if (pendingAction.length === 0) return;
    const id = setInterval(() => {
      const now = Date.now();
      if (now - lastBeepRef.current > 8000) { playBeep(); lastBeepRef.current = now; }
    }, 1000);
    return () => clearInterval(id);
  }, [pendingAction.length]);

  function openModal(req: any) {
    setActiveReq(req);
    setRejectMode(false);
    setModifyTime(true);
    setTrdTimeFrom(toDatetimeLocal(req.requestedTimeFrom ?? req.grantedFromTime ?? req.sanctionedTimeFrom));
    setTrdTimeTo(toDatetimeLocal(req.requestedTimeTo ?? req.grantedToTime ?? req.sanctionedTimeTo));
    setTrdRemarks("");
    setRejectRmk(""); setClosureRmk(""); setExtRemarks(""); setExtAction("APPROVE");

    if (pendingPermits.some((r: any) => r.id === req.id)) {
      setModalType("permit");
    } else if (pendingExtensions.some((r: any) => r.id === req.id)) {
      setModalType("extension");
    } else if (pendingClosures.some((r: any) => r.id === req.id)) {
      setModalType("closure");
    } else {
      setModalType("view");
    }
  }

  function submitPermit() {
    if (!activeReq) return;
    if (!trdTimeFrom || !trdTimeTo) { toast.error("Enter both times"); return; }
    setSyncing(true); setModalType(null);
    permitMutation.mutate({
      requestId: activeReq.id,
      action: "APPROVE_WITH_MODIFICATION",
      smApprovedTimeFrom: toUTCSlot(trdTimeFrom),
      smApprovedTimeTo:   toUTCSlot(trdTimeTo),
      smRemarks: trdRemarks || undefined,
    }, {
      onSuccess: async () => { toast.success("Permitted"); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  function submitReject() {
    if (!activeReq) return;
    if (!rejectRmk.trim()) { toast.error("Remarks required"); return; }
    setSyncing(true); setModalType(null);
    permitMutation.mutate({
      requestId: activeReq.id,
      action: "REJECT",
      smRemarks: rejectRmk,
    }, {
      onSuccess: async () => { toast.success("Rejected"); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  function submitClosure() {
    if (!activeReq) return;
    setSyncing(true); setModalType(null);
    closureAckMutation.mutate({ requestId: activeReq.id, smClosureRemarks: closureRmk }, {
      onSuccess: async () => { toast.success("Block closed"); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  function submitExtension(action?: "APPROVE" | "REJECT") {
    if (!activeReq) return;
    const act = action ?? extAction;
    if (act === "REJECT" && !extRemarks.trim()) { toast.error("Remarks required to reject"); return; }
    const pendingExtParticipant = (activeReq.availParticipants ?? []).find((p: any) => p.extensionStatus === "PENDING");
    if (!pendingExtParticipant) { toast.error("No pending extension participant found"); return; }
    setSyncing(true); setModalType(null);
    extensionMutation.mutate({
      requestId: activeReq.id,
      participantId: pendingExtParticipant.id,
      action: act,
      smRemarks: extRemarks || undefined,
    }, {
      onSuccess: async () => { toast.success(`Extension ${act === "APPROVE" ? "approved" : "rejected"}`); await refetch(); setSyncing(false); },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  }

  // Clock
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(id); }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const currentDate = `${pad(nowIST.getUTCDate())}/${pad(nowIST.getUTCMonth()+1)}/${nowIST.getUTCFullYear()}`;
  const currentTime = `${pad(nowIST.getUTCHours())}:${pad(nowIST.getUTCMinutes())}`;

  const fldInput: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "2px solid #6b7280", fontSize: "15px", fontWeight: 600, color: "#111827", boxSizing: "border-box", background: "#fff", outline: "none", marginTop: "6px", display: "block" };
  const fldLabel: React.CSSProperties = { fontSize: "13px", fontWeight: 800, color: "#1f2937", letterSpacing: "0.3px", display: "block", marginTop: "10px" };
  const btnGreen: React.CSSProperties = { flex: 1, padding: "12px", borderRadius: "8px", fontWeight: 800, fontSize: "14px", cursor: "pointer", border: "none", background: "#16a34a", color: "#fff" };
  const btnRed:   React.CSSProperties = { ...btnGreen, background: "#dc2626" };
  const btnGray:  React.CSSProperties = { ...btnGreen, background: "#e5e7eb", color: "#374151" };
  const btnAmber: React.CSSProperties = { ...btnGreen, background: "#d97706", color: "#000" };

  return (
    <div style={{ minHeight: "100vh", background: "#fefce8", fontFamily: "Arial, sans-serif" }}>
      <LoadingBar active={syncing} />
      <Toaster position="top-center" />

      {/* Header */}
      <div style={{ background: "#fef08a", padding: "10px", textAlign: "center", borderBottom: "2px solid #eab308" }}>
        <span style={{ fontSize: "28px", fontWeight: 900, color: "#7c3aed", letterSpacing: "3px" }}>RBMS</span>
      </div>

      {/* Date / Info / Time */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ background: "#fde68a", border: "2px solid #f59e0b", borderRadius: "8px", padding: "8px 14px", textAlign: "center", fontWeight: 800, fontSize: "13px", color: "#000" }}>
          CURRENT DATE<br />{currentDate}
        </div>
        <div style={{ background: "#fbbf24", border: "2px solid #d97706", borderRadius: "8px", padding: "8px 20px", textAlign: "center", fontWeight: 900, fontSize: "15px", color: "#000", flex: 1, maxWidth: "400px" }}>
          TRD PERMIT BLOCK AT SITE
          <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "2px", color: "#78350f" }}>
            {selectedBoard ? selectedBoard.name : "Select a Board"} — {session?.user?.name}
          </div>
          {selectedBoard && (
            <button onClick={() => setSelectedBoard(null)} style={{ marginTop: "4px", background: "#fff", border: "1.5px solid #d97706", borderRadius: "6px", padding: "2px 10px", fontSize: "11px", fontWeight: 800, color: "#92400e", cursor: "pointer" }}>
              Change Board
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ background: "#fde68a", border: "2px solid #f59e0b", borderRadius: "8px", padding: "8px 14px", textAlign: "center", fontWeight: 800, fontSize: "13px", color: "#000" }}>
            CURRENT TIME<br />{currentTime}
          </div>
          <button onClick={() => refetch()} style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 13px", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>↻</button>
        </div>
      </div>

      {pendingAction.length > 0 && (
        <div style={{ margin: "0 14px 10px", background: "#fef2f2", border: "2px solid #dc2626", borderRadius: "8px", padding: "8px 14px", fontWeight: 800, fontSize: "14px", color: "#dc2626", textAlign: "center" }}>
          ⚡ {pendingAction.length} request{pendingAction.length !== 1 ? "s" : ""} need your immediate action
        </div>
      )}

      {!selectedBoard ? (
        /* ── Board selection screen ── */
        <div style={{ padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ fontWeight: 900, fontSize: "18px", color: "#78350f", textAlign: "center", marginBottom: "8px", letterSpacing: "0.5px" }}>
            SELECT YOUR TPC BOARD
          </div>
          <div style={{ fontSize: "13px", color: "#92400e", fontWeight: 700, textAlign: "center", marginBottom: "12px" }}>
            Only blocks from the selected board&apos;s depots will be shown
          </div>
          {TPC_BOARDS.map(board => (
            <button
              key={board.name}
              onClick={() => setSelectedBoard(board)}
              style={{
                width: "100%", maxWidth: "480px", padding: "18px 20px",
                background: "#fef3c7", border: "2.5px solid #d97706",
                borderRadius: "14px", cursor: "pointer", textAlign: "left",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                transition: "transform 0.1s, background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fde68a"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef3c7"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              <div style={{ fontWeight: 900, fontSize: "17px", color: "#78350f", marginBottom: "6px" }}>⚡ {board.name}</div>
              <div style={{ fontSize: "12px", color: "#92400e", fontWeight: 700 }}>
                Depots: {board.depots.join(" · ")}
              </div>
            </button>
          ))}
        </div>
      ) : isLoading ? (
        <div style={{ textAlign: "center", padding: "60px", fontWeight: 800, fontSize: "16px", color: "#111827" }}>Loading…</div>
      ) : isError ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ background: "#fef2f2", border: "2px solid #dc2626", borderRadius: "10px", padding: "20px", maxWidth: "480px", margin: "0 auto" }}>
            <div style={{ fontWeight: 900, fontSize: "16px", color: "#dc2626", marginBottom: "8px" }}>Unable to connect to server</div>
            <div style={{ fontSize: "13px", color: "#374151", fontWeight: 600, marginBottom: "16px" }}>The availing module may not be activated yet on the server. Please contact the admin or try again in a moment.</div>
            <button onClick={() => refetch()} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 800, fontSize: "14px", cursor: "pointer" }}>Retry</button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 12px 16px" }}>
          <SectionTable title="TRD BLOCKS PENDING PERMIT / CANCELLATION" subtitle="(CLICK ID TO TAKE ACTION)" headerColor="#b45309" rows={pendingAction} blink onClickId={openModal} emptyMsg="No pending permits" />
          <SectionTable title="BLOCKS UNDER PROGRESS" subtitle="(CLICK ID TO SEE DETAILS)" headerColor="#7c3aed" rows={underProgress} onClickId={openModal} emptyMsg="No blocks in progress" />
          <SectionTable title="UPCOMING SANCTIONED BLOCKS" subtitle="(CLICK ID TO SEE DETAILS)" headerColor="#2e7d32" rows={upcomingSanctioned} onClickId={openModal} emptyMsg="No upcoming sanctioned blocks" />
          <SectionTable title="BLOCKS ALREADY AVAILED" subtitle="(CLICK ID TO SEE DETAILS)" headerColor="#1565c0" rows={alreadyAvailed} onClickId={openModal} emptyMsg="No availed blocks in last 48 hrs" />
        </div>
      )}

      {/* Back */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 16px 28px" }}>
        <button onClick={() => router.back()} style={{ background: "#fff", border: "2px solid #374151", borderRadius: "8px", padding: "12px 40px", fontWeight: 900, fontSize: "16px", cursor: "pointer", color: "#000" }}>
          &lt; BACK
        </button>
      </div>

      {/* ── PERMIT MODAL ── */}
      {modalType === "permit" && activeReq && (
        <Modal title="TRD Availing Request — Controller Action" accent="#b45309" onClose={() => setModalType(null)}>
          <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Request ID</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#b45309" }}>{activeReq.divisionId ?? activeReq.id?.slice(0,8)}</div>
            </div>
            <div style={{ flex: 1, minWidth: "100px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Department</div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{activeReq.selectedDepartment ?? "TRD"}</div>
            </div>
            <div style={{ flex: 2, minWidth: "160px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Section / Block</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{activeReq.missionBlock ?? activeReq.selectedSection ?? "—"}</div>
            </div>
          </div>

          <DRow label="Corridor Type"  value={activeReq.corridorType} />
          <DRow label="Work Type"      value={activeReq.workType} />
          <DRow label="Activity"       value={activeReq.activity} />
          <DRow label="Work Location"  value={[activeReq.workLocationFrom, activeReq.workLocationTo].filter(Boolean).join(" → ")} />
          {activeReq.requestremarks && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "8px", padding: "10px 12px", margin: "8px 0", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
              💬 SSE Remarks: {activeReq.requestremarks}
            </div>
          )}

          <div style={{ margin: "12px 0 4px" }}>
            <TimeBlock label="Admin Sanctioned Time" from={activeReq.sanctionedTimeFrom ?? activeReq.demandTimeFrom} to={activeReq.sanctionedTimeTo ?? activeReq.demandTimeTo} accent="#7c3aed" />
            <TimeBlock label="SSE's Requested Time" from={activeReq.requestedTimeFrom ?? activeReq.sanctionedTimeFrom} to={activeReq.requestedTimeTo ?? activeReq.sanctionedTimeTo} accent="#0369a1" />
          </div>

          <SectionDivider label="Set Permitted Time" />

          {!rejectMode ? (
            <>
              <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: "12px", padding: "16px", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#92400e", fontWeight: 800, marginBottom: "12px", letterSpacing: "0.3px" }}>
                  ENTER ACTUAL PERMITTED TIME WINDOW
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ ...fldLabel, color: "#92400e", fontSize: "11px" }}>FROM *</label>
                    <input type="datetime-local" style={{ ...fldInput, border: "2px solid #f59e0b", fontSize: "14px" }} value={trdTimeFrom} onChange={e => setTrdTimeFrom(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ ...fldLabel, color: "#92400e", fontSize: "11px" }}>TO *</label>
                    <input type="datetime-local" style={{ ...fldInput, border: "2px solid #f59e0b", fontSize: "14px" }} value={trdTimeTo} onChange={e => setTrdTimeTo(e.target.value)} />
                  </div>
                </div>
                {trdTimeFrom && trdTimeTo && (
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#b45309", fontWeight: 800, textAlign: "right" }}>
                    Duration: {fmtDur(new Date(trdTimeTo).getTime() - new Date(trdTimeFrom).getTime())}
                  </div>
                )}
              </div>
              <label style={fldLabel}>Controller Remarks (optional)</label>
              <textarea style={{ ...fldInput, height: "70px", resize: "vertical", marginBottom: "14px" }} placeholder="Enter remarks…" value={trdRemarks} onChange={e => setTrdRemarks(e.target.value)} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={submitPermit} disabled={permitMutation.isPending} style={{ ...btnGreen, flex: 2 }}>
                  {permitMutation.isPending ? "Submitting…" : "✓ Permit & Set Time"}
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
                <button onClick={submitReject} disabled={permitMutation.isPending} style={{ ...btnRed, flex: 2 }}>
                  {permitMutation.isPending ? "Submitting…" : "Confirm Reject"}
                </button>
                <button onClick={() => setRejectMode(false)} style={{ ...btnGray, flex: 1 }}>← Back</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── EXTENSION MODAL ── */}
      {modalType === "extension" && activeReq && (() => {
        const extP = (activeReq.availParticipants ?? []).find((p: any) => p.extensionStatus === "PENDING") ?? {};
        const curEndMs = new Date(activeReq.smApprovedTimeTo ?? activeReq.grantedToTime ?? 0).getTime();
        const newEndMs = new Date(extP.extensionRequestedTo ?? 0).getTime();
        const extraMs  = newEndMs - curEndMs;
        return (
        <Modal title={extP.extensionIsEmergency ? "🚨 EMERGENCY Extension Request" : "Time Extension Request"} accent={extP.extensionIsEmergency ? "#991b1b" : "#b45309"} onClose={() => setModalType(null)}>
          <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Request ID</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#b45309" }}>{activeReq.divisionId ?? activeReq.id?.slice(0,8)}</div>
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
              <div style={{ flex: 1, minWidth: "130px", background: "#fff", borderRadius: "8px", padding: "10px 12px", border: "1px solid #fed7aa" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, marginBottom: "2px" }}>CURRENT END</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#0369a1" }}>{activeReq.smApprovedTimeTo ? new Date(activeReq.smApprovedTimeTo).toISOString().slice(11,16) : "—"}</div>
              </div>
              <div style={{ fontSize: "20px", color: "#ea580c", fontWeight: 900 }}>⟶</div>
              <div style={{ flex: 1, minWidth: "130px", background: "#fff", borderRadius: "8px", padding: "10px 12px", border: "2px solid #ea580c" }}>
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

      {/* ── CLOSURE MODAL ── */}
      {modalType === "closure" && activeReq && (() => {
        const permittedMs = activeReq.smApprovedTimeTo
          ? new Date(activeReq.smApprovedTimeTo).getTime() - new Date(activeReq.smApprovedTimeFrom ?? activeReq.grantedFromTime ?? 0).getTime()
          : 0;
        return (
        <Modal title="Acknowledge Block Closure" accent="#0369a1" onClose={() => setModalType(null)}>
          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Request ID</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#1e40af" }}>{activeReq.divisionId ?? activeReq.id?.slice(0,8)}</div>
            </div>
            <div style={{ flex: 2, minWidth: "160px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Section</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{activeReq.missionBlock ?? activeReq.selectedSection ?? "—"}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{activeReq.activity ?? ""}</div>
            </div>
          </div>

          <TimeBlock label="Permitted Time (Controller Approved)" from={activeReq.smApprovedTimeFrom ?? activeReq.grantedFromTime} to={activeReq.smApprovedTimeTo ?? activeReq.grantedToTime} accent="#b45309" />

          {/* Per-participant actual availed times + closure details */}
          {((activeReq.availParticipants ?? []) as any[]).filter((p: any) => p.closureSubmittedAt).map((p: any, pidx: number) => {
            const pFrom = p.availStartedAt;
            const pTo   = p.closureSubmittedAt;
            const pActualMs = pFrom && pTo ? new Date(pTo).getTime() - new Date(pFrom).getTime() : 0;
            const pOverrun  = pActualMs > 0 && permittedMs > 0 && pActualMs > permittedMs;
            return (
              <div key={pidx} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "14px 16px", marginBottom: "12px" }}>
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
                  <DRow label="Remarks"                value={p.closureRemarks} />
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

          <label style={fldLabel}>Controller Remarks (optional)</label>
          <textarea style={{ ...fldInput, height: "80px", resize: "vertical", marginBottom: "14px" }} placeholder="Enter remarks…" value={closureRmk} onChange={e => setClosureRmk(e.target.value)} />
          <button onClick={submitClosure} disabled={closureAckMutation.isPending} style={{ ...btnAmber, width: "100%" }}>
            {closureAckMutation.isPending ? "Submitting…" : "✓ Acknowledge & Close Block"}
          </button>
        </Modal>
        );
      })()}

      {/* ── VIEW MODAL ── */}
      {modalType === "view" && activeReq && (
        <Modal title="Block Details" accent="#374151" onClose={() => setModalType(null)}>
          <DRow label="Request ID"  value={activeReq.divisionId ?? activeReq.id?.slice(0,8)} />
          <DRow label="Section"     value={activeReq.selectedSection ?? activeReq.missionBlock} />
          <DRow label="Work Type"   value={activeReq.workType} />
          <DRow label="Activity"    value={activeReq.activity} />
          <DRow label="Status"      value={activeReq.overAllStatus} />

          <SectionDivider label="Timing" />
          <DRow label="Granted From"      value={fmtDt(activeReq.grantedFromTime)} />
          <DRow label="Granted To"        value={fmtDt(activeReq.grantedToTime)} />
          {activeReq.smApprovedTimeFrom && <DRow label="Permitted From" value={fmtDt(activeReq.smApprovedTimeFrom)} />}
          {activeReq.smApprovedTimeTo   && <DRow label="Permitted To"   value={fmtDt(activeReq.smApprovedTimeTo)} />}
          {activeReq.availingStartedAt  && <DRow label="Availing Started"   value={fmtDt(activeReq.availingStartedAt)} />}
          {activeReq.closureSubmittedAt && <DRow label="Closure Submitted"  value={fmtDt(activeReq.closureSubmittedAt)} />}

          <div style={{ marginTop: "16px" }}>
            <button onClick={() => setModalType(null)} style={{ ...btnGray, width: "100%" }}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
