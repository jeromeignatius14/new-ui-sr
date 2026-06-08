"use client";

import { use, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetAvailRequestById, useGetSmStations } from "@/app/service/query/avail";
import {
  useApplyForAvailing,
  useSubmitAvailConcurrence,
  useSseRespondToSmModification,
  useStartAvailing,
  useRequestExtension,
  useExitWithoutAvailing,
} from "@/app/service/mutation/avail";
import { AVAIL_STATUS } from "@/app/lib/store";
import { LoadingBar } from "@/app/components/ui/LoadingBar";
import { toast, Toaster } from "react-hot-toast";
import { getCurrentPosition } from "@/app/hooks/useGeoLocation";
import { availService } from "@/app/service/api/avail";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDt(dt?: string | null) {
  if (!dt) return "—";
  try {
    const iso = new Date(dt).toISOString();
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}-${m}-${y} ${iso.slice(11, 16)}`;
  } catch { return "—"; }
}

// Derive station codes from missionBlock (e.g. "TVC-NCJ" or "TVC-NCJ,NCJ-TEN")
// "TVC-NCJ" → ["TVC", "NCJ"]
// "TVC-NCJ,NCJ-TEN" → ["TVC", "NCJ", "TEN"]
function getStationsFromBlock(block: any): string[] {
  // Use missionBlock — it holds the exact sub-sections the work is on
  const sectionStr = (block.missionBlock ?? block.selectedSection ?? "").trim();
  if (!sectionStr) return [];
  const seen = new Set<string>();
  sectionStr.split(",").forEach((sec: string) => {
    const s = sec.trim();
    if (!s) return;
    const parts = s.split("-");
    if (parts.length === 1) {
      seen.add(s); // yard or single station — keep as-is
    } else {
      parts.forEach((p) => { const t = p.trim(); if (t) seen.add(t); });
    }
  });
  return [...seen].filter(s => s.toUpperCase() !== "YD");
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30

function secondsUntilStart(block: any): number {
  const startStr = block.smApprovedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom;
  if (!startStr) return 0;
  // Times are stored as IST values in the UTC slot (app-wide convention).
  // Shift Date.now() forward by IST offset so both sides are on the same scale.
  const nowAsIST = Date.now() + IST_OFFSET_MS;
  return Math.floor((new Date(startStr).getTime() - nowAsIST) / 1000);
}

function getStatusLabel(status: string, myParticipant?: any): string {
  if (!status) return "Loading...";
  if (status === "Sanctioned and Accepted by SSE") return "Ready to Apply";
  if (status === AVAIL_STATUS.PENDING_CONCURRENCES) return "Pending\nConcurrences";
  if (status === AVAIL_STATUS.PENDING_SM_APPROVAL)  return "Pending\nSM Approval";
  if (status === AVAIL_STATUS.SM_APPROVED) {
    if (!myParticipant) return "SM Approved\nAwaiting Acknowledgement";
    if (myParticipant?.smAckStatus === "ACCEPTED") return "SM Approved\nAwaiting Other SSEs";
    if (myParticipant?.smAckStatus === "REJECTED") return "SM Approved\n(You Declined)";
    return "SM Approved\nAwaiting Your Acknowledgement";
  }
  if (status === AVAIL_STATUS.AVAILING_ACTIVE) {
    if (myParticipant?.blockBurst && !myParticipant?.closureSubmittedAt) return "⚠ Block Burst";
    if (myParticipant?.closureSubmittedAt) return "Closure Submitted\nAwaiting Others";
    if (myParticipant?.availStartedAt) return "Availing\nIn Progress";
    return "Availing\nActive";
  }
  if (status === AVAIL_STATUS.ALL_CLOSURES_SUBMITTED) return "All Closed\nAwaiting SM Ack";
  if (status === AVAIL_STATUS.BLOCK_CLOSED)           return "Block Closed ✅";
  if (status === AVAIL_STATUS.AVAILING_CANCELLED)     return "Availing\nCancelled";
  return status;
}

function getStatusBg(status: string, myParticipant?: any): string {
  if (status === AVAIL_STATUS.AVAILING_ACTIVE) {
    if (myParticipant?.blockBurst && !myParticipant?.closureSubmittedAt) return "#dc2626";
    if (myParticipant?.availStartedAt) return "#16a34a";
    return "#2563eb";
  }
  if (status === AVAIL_STATUS.ALL_CLOSURES_SUBMITTED) return "#0369a1";
  if (status === AVAIL_STATUS.BLOCK_CLOSED)           return "#1d4ed8";
  if (status === AVAIL_STATUS.SM_APPROVED)
    return myParticipant?.smAckStatus === "ACCEPTED" ? "#0369a1" : "#047857";
  if (status === AVAIL_STATUS.AVAILING_CANCELLED)     return "#7f1d1d";
  return "#374151";
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function CountdownBadge({ block }: { block: any }) {
  const [secs, setSecs] = useState(() => secondsUntilStart(block));
  useEffect(() => {
    const id = setInterval(() => setSecs(secondsUntilStart(block)), 1000);
    return () => clearInterval(id);
  }, [block]);
  if (secs <= 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const label = h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  return (
    <div style={{ background: "#fef3c7", border: "1.5px solid #fbbf24", borderRadius: "10px", padding: "12px 16px", textAlign: "center", marginBottom: "16px" }}>
      <p style={{ fontWeight: 700, fontSize: "14px", color: "#92400e", margin: "0 0 4px" }}>
        Block opens at {fmtDt(block.smApprovedTimeFrom ?? block.grantedFromTime)}
      </p>
      <p style={{ color: "#92400e", fontSize: "14px", margin: 0 }}>
        Time remaining: <strong>{label}</strong>
      </p>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", paddingTop: "max(16px, 5vh)", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px 24px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ marginBottom: "20px", fontWeight: 700, fontSize: "17px", color: "#111827", borderBottom: "2px solid #fbbf24", paddingBottom: "10px" }}>{title}</h3>
        {children}
        <button onClick={onClose} style={{ marginTop: "14px", background: "#f3f4f6", border: "1px solid #d1d5db", padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#374151", width: "100%", fontSize: "14px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Audit Trail ───────────────────────────────────────────────────────────────
function AuditTrail({ block, myParticipant }: { block: any; myParticipant?: any }) {
  type AuditEntry = { icon: string; label: string; at?: string | null; sub?: string; color: string };
  const entries: AuditEntry[] = [];

  if (block.availAppliedAt)
    entries.push({ icon: "📤", label: "Availing Application Submitted", at: block.availAppliedAt, color: "#1d4ed8" });

  if (block.smApprovedAt) {
    const status = block.overAllStatus;
    const wasCancelled = status === "Availing Cancelled";
    const wasModified  = block.smApprovedTimeFrom && block.sseAcceptedSmModification !== null;
    const label = wasCancelled && !block.sseAcceptedSmModification
      ? "SM Rejected Availing"
      : block.sseAcceptedSmModification === false
        ? "SM Modified Time"
        : "SM Approved Availing";
    entries.push({
      icon: wasCancelled && !block.sseAcceptedSmModification ? "❌" : wasModified ? "✏️" : "✅",
      label,
      at: block.smApprovedAt,
      sub: [block.powerNumber ? `Power No: ${block.powerNumber}` : null, block.smRemarks ?? null].filter(Boolean).join(" · ") || undefined,
      color: wasCancelled && !block.sseAcceptedSmModification ? "#dc2626" : "#047857",
    });
  }

  if (block.sseModificationRespondedAt)
    entries.push({
      icon: block.sseAcceptedSmModification ? "✅" : "❌",
      label: block.sseAcceptedSmModification ? "SSE Accepted SM's Time Modification" : "SSE Rejected SM's Time Modification",
      at: block.sseModificationRespondedAt,
      color: block.sseAcceptedSmModification ? "#047857" : "#dc2626",
    });

  if (block.availingStartedAt)
    entries.push({ icon: "▶", label: "Availing Acknowledged & Started", at: block.availingStartedAt, color: "#16a34a" });

  const mp = myParticipant;
  if (mp?.extensionRequestedAt)
    entries.push({
      icon: mp.extensionIsEmergency ? "🚨" : "⏳",
      label: mp.extensionIsEmergency ? "Emergency Time Extension Requested" : "Time Extension Requested",
      at: mp.extensionRequestedAt,
      sub: mp.extensionIsEmergency && mp.extensionEmergencyReason ? `Emergency: ${mp.extensionEmergencyReason}` : (mp.extensionRemarks ?? undefined),
      color: mp.extensionIsEmergency ? "#dc2626" : "#b45309",
    });

  if (mp?.smExtensionApprovedAt)
    entries.push({
      icon: mp.extensionStatus === "APPROVED" ? "✅" : "❌",
      label: mp.extensionStatus === "APPROVED"
        ? `SM Approved Extension — new end: ${mp.smExtensionGrantedTo ? new Date(mp.smExtensionGrantedTo).toISOString().slice(11,16) : "—"}`
        : "SM Rejected Time Extension",
      at: mp.smExtensionApprovedAt,
      sub: mp.smExtensionRemarks ?? undefined,
      color: mp.extensionStatus === "APPROVED" ? "#047857" : "#dc2626",
    });

  if (block.closureSubmittedAt)
    entries.push({ icon: "🔒", label: "Block Closure Submitted", at: block.closureSubmittedAt, sub: block.closureYard ? `Yard: ${block.closureYard}` : undefined, color: "#0369a1" });

  if (block.smClosureAcknowledgedAt)
    entries.push({ icon: "✅", label: "SM Acknowledged Closure — Block Closed", at: block.smClosureAcknowledgedAt, sub: block.smClosureRemarks ?? undefined, color: "#1d4ed8" });

  if (entries.length === 0) return null;

  return (
    <div style={{ maxWidth: "620px", margin: "18px auto 0", width: "calc(100% - 24px)" }}>
      <div style={{ fontSize: "12px", fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
        Audit Trail
      </div>
      <div style={{ position: "relative" }}>
        {/* vertical line */}
        <div style={{ position: "absolute", left: "15px", top: 0, bottom: 0, width: "2px", background: "#e5e7eb" }} />
        {entries.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "14px", position: "relative" }}>
            {/* dot */}
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: e.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", zIndex: 1, boxShadow: "0 0 0 3px #fff" }}>
              {e.icon}
            </div>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "10px 14px", flex: 1, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{e.label}</div>
              {e.at && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>🕐 {fmtDt(e.at)}</div>}
              {e.sub && <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px", fontStyle: "italic" }}>{e.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  fontSize: "12px", fontWeight: 700, color: "#6b7280",
  textTransform: "uppercase", letterSpacing: "0.5px",
  marginBottom: "4px", display: "block",
};
const fieldInput: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  border: "1.5px solid #d1d5db", marginBottom: "14px",
  fontSize: "14px", boxSizing: "border-box", outline: "none",
  background: "#f9fafb", color: "#111827",
};

// datetime-local → explicit UTC ISO (app convention: IST wall-clock in UTC slot)
function toUTCSlot(s: string): string {
  if (!s) return s;
  const withSeconds = s.length === 16 ? `${s}:00` : s;
  return `${withSeconds}.000Z`;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AvailBlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const { data, isLoading, refetch } = useGetAvailRequestById(id);
  const block = data?.data ?? null;
  const { data: smStationsData } = useGetSmStations();
  const smStations: { code: string; smName: string }[] = Array.isArray(smStationsData?.data) ? smStationsData.data : [];

  const [syncing, setSyncing] = useState(false);
  const [modal, setModal] = useState<"apply" | "concurrence" | "extend" | "exit" | null>(null);

  const [selectedStation, setSelectedStation]       = useState("");
  const [manualStation, setManualStation]           = useState("");
  const [applyTimeFrom, setApplyTimeFrom]           = useState("");
  const [applyTimeTo, setApplyTimeTo]               = useState("");
  const [concurrenceRemarks, setConcurrenceRemarks] = useState("");
  const [newEndTime, setNewEndTime]                 = useState("");
  const [extensionRemarks, setExtensionRemarks]     = useState("");
  const [extensionIsEmergency, setExtensionIsEmergency] = useState(false);
  const [extensionEmergencyReason, setExtensionEmergencyReason] = useState("");

  // ── Apply modal auto-fill flag ───────────────────────────────────────────
  const [applyFromAutoFilled, setApplyFromAutoFilled] = useState(false);

  // ── 1-second ticker — only runs when SM has approved and block hasn't started
  const [startTimeTick, setStartTimeTick] = useState(0);
  const blockStatus = data?.data?.overAllStatus ?? "";
  const needsTick = blockStatus === "SM Approved" || blockStatus === "Availing Active";
  useEffect(() => {
    if (!needsTick) return;
    const id = setInterval(() => setStartTimeTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [needsTick]);

  // ── Auto-acknowledge + auto-start refs ───────────────────────────────────
  const autoAckedRef  = useRef(false);
  const autoStartedRef = useRef(false);

  // ── Geo-fence override dialog state ─────────────────────────────────────
  const [geoWarn, setGeoWarn] = useState<{
    action: "ack" | "ackDecline" | "start" | "extend";
    distanceMeters: number;
    pos: { lat: number; lng: number };
  } | null>(null);

  // ── Reset auto-act guards when navigating to a different block ──────────
  useEffect(() => {
    autoAckedRef.current  = false;
    autoStartedRef.current = false;
  }, [id]);

  // React Query's refetchInterval handles background polling — no extra interval needed.

  // ── Auto-acknowledge + auto-start at granted from time ───────────────────
  // Fires every second (via startTimeTick). At the granted time, silently
  // acknowledges the SM grant then starts availing — no button click needed.
  useEffect(() => {
    if (!block || !isParticipant || myAvailStarted || myClosed || isTerminal) return;
    if (secondsUntilStart(block) > 0) return; // not yet time

    const s = block.overAllStatus ?? "";

    if (s === AVAIL_STATUS.SM_APPROVED && myParticipant?.smAckStatus === null && !autoAckedRef.current && !sseRespondMut.isPending) {
      autoAckedRef.current = true;
      sseRespondMut.mutate({ requestId: id, accept: true }, {
        onSuccess: () => refetch(),
        onError:   () => { autoAckedRef.current = false; }, // allow retry next tick
      });
    } else if (s === AVAIL_STATUS.AVAILING_ACTIVE && !myAvailStarted && !autoStartedRef.current && !startMut.isPending) {
      autoStartedRef.current = true;
      startMut.mutate({ requestId: id }, {
        onSuccess: () => refetch(),
        onError:   () => { autoStartedRef.current = false; },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimeTick]);

  const applyMut       = useApplyForAvailing();
  const concurrenceMut = useSubmitAvailConcurrence();
  const sseRespondMut  = useSseRespondToSmModification();
  const startMut       = useStartAvailing();
  const extensionMut   = useRequestExtension();
  const exitMut        = useExitWithoutAvailing();

  const EXIT_REASONS = ["Caution not permitted", "Labour didn't turn up", "Machine not deployed", "Other"];
  const [exitReason, setExitReason] = useState("");
  const [exitOtherReason, setExitOtherReason] = useState("");

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#c8f0c8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#374151", fontWeight: 700, fontSize: "16px" }}>Loading block details...</div>
    </div>
  );
  if (!block) return (
    <div style={{ minHeight: "100vh", background: "#c8f0c8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#dc2626", fontWeight: 700 }}>Block not found.</div>
    </div>
  );

  const userId    = session?.user?.id;
  const userDept  = session?.user?.department;
  const userDepot = session?.user?.depot;
  const status    = block.overAllStatus ?? "";
  const blockId   = block.divisionId ?? id;

  // ── Find my participant record ───────────────────────────────────────────
  const myParticipant: any = (block.availParticipants as any[])?.find((p: any) => p.userId === userId) ?? null;
  const isParticipant = !!myParticipant;
  const myAvailStarted = !!myParticipant?.availStartedAt;
  const myClosed = !!myParticipant?.closureSubmittedAt;
  const myBurst = !!myParticipant?.blockBurst && !myClosed;

  // ── Pending concurrence check ────────────────────────────────────────────
  const hasPendingConcurrence = (() => {
    if (!userDept || !userDepot) return false;
    const d = userDept.toUpperCase();
    if (d === "TRD")
      return (block.trdAvailConcurrences as any[])?.some((c: any) => c.depot === userDepot && c.status === "PENDING");
    if (d === "S&T" || d === "SNT")
      return (block.sntAvailConcurrences as any[])?.some((c: any) => c.depot === userDepot && c.status === "PENDING");
    if (d === "ENGG")
      return (block.enggAvailConcurrences as any[])?.some((c: any) => c.depot === userDepot && c.status === "PENDING");
    return false;
  })();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleApply = () => {
    const station = manualStation.trim() || selectedStation;
    if (!station) { toast.error("Select or enter a station code"); return; }
    // from must not be in the past
    if (applyTimeFrom) {
      const fromMs = new Date(applyTimeFrom + ":00.000Z").getTime();
      const nowMs  = Date.now() + IST_OFFSET_MS;
      if (fromMs < nowMs - 60_000) { toast.error("From time cannot be in the past"); return; }
    }
    // to must be after from (when both are entered)
    if (applyTimeFrom && applyTimeTo) {
      if (applyTimeTo <= applyTimeFrom) { toast.error("To time must be later than From time"); return; }
    }
    setSyncing(true);
    applyMut.mutate({
      requestId: id,
      smStation: station,
      requestedTimeFrom: applyTimeFrom ? toUTCSlot(applyTimeFrom) : undefined,
      requestedTimeTo: applyTimeTo ? toUTCSlot(applyTimeTo) : undefined,
    }, {
      onSuccess: async () => {
        setModal(null); setSelectedStation(""); setManualStation(""); setApplyTimeFrom(""); setApplyTimeTo("");
        toast.success("Application submitted");
        await refetch();
        setSyncing(false);
      },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  };

  const handleConcurrence = () => {
    setSyncing(true);
    concurrenceMut.mutate({ requestId: id, accept: true, remarks: concurrenceRemarks, userDepartment: userDept }, {
      onSuccess: async () => {
        setModal(null);
        toast.success("Concurrence submitted");
        await refetch();
        setSyncing(false);
      },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  };

  const submitAcknowledge = (accept: boolean, lat?: number, lng?: number, geoOverride?: boolean) => {
    setSyncing(true);
    sseRespondMut.mutate({ requestId: id, accept, lat, lng, geoOverride }, {
      onSuccess: async () => {
        toast.success(accept ? "SM grant acknowledged" : "Availing declined");
        await refetch();
        setSyncing(false);
      },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  };

  // Helper: get GPS then check fence; if outside show warning dialog, else proceed directly
  const withGeoCheck = async (
    action: "ack" | "ackDecline" | "start" | "extend",
    proceed: (lat?: number, lng?: number, geoOverride?: boolean) => void
  ) => {
    const pos = await getCurrentPosition();
    if (!pos) { proceed(); return; }
    const station = block.smStation ?? block.missionBlock ?? "";
    try {
      const geo = await availService.geoCheck(station, pos.lat, pos.lng);
      if (geo?.fenceFound && !geo?.insideFence && geo.distanceMeters != null) {
        setGeoWarn({ action, distanceMeters: geo.distanceMeters, pos });
        return;
      }
    } catch { /* geo check failed — proceed without blocking */ }
    proceed(pos.lat, pos.lng, false);
  };

  const handleAcknowledge = async (accept: boolean) => {
    await withGeoCheck(accept ? "ack" : "ackDecline", (lat, lng, geoOverride) =>
      submitAcknowledge(accept, lat, lng, geoOverride)
    );
  };

  const submitStart = (lat?: number, lng?: number, geoOverride?: boolean) => {
    setSyncing(true);
    startMut.mutate({ requestId: id, lat, lng, geoOverride }, {
      onSuccess: async () => {
        toast.success("Availing started");
        await refetch();
        setSyncing(false);
      },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  };

  const handleStart = async () => {
    await withGeoCheck("start", submitStart);
  };

  const submitExtension = (lat?: number, lng?: number, geoOverride?: boolean) => {
    setSyncing(true);
    extensionMut.mutate({
      requestId: id,
      newEndTime: toUTCSlot(newEndTime),
      remarks: extensionRemarks,
      isEmergency: extensionIsEmergency,
      emergencyReason: extensionIsEmergency ? extensionEmergencyReason : undefined,
      lat, lng, geoOverride,
    }, {
      onSuccess: async () => {
        setModal(null);
        toast.success("Extension requested");
        await refetch();
        setSyncing(false);
      },
      onError: (e: any) => { setSyncing(false); toast.error(e?.response?.data?.message ?? "Failed"); },
    });
  };

  const handleExtension = async () => {
    if (!newEndTime) { toast.error("Select a new end time"); return; }
    if (extensionIsEmergency && !extensionEmergencyReason.trim()) { toast.error("Please describe the emergency"); return; }
    await withGeoCheck("extend", submitExtension);
  };

  // ── Geo-override: proceed despite being outside fence ───────────────────
  const handleGeoOverrideProceed = () => {
    if (!geoWarn) return;
    const { action, pos } = geoWarn;
    setGeoWarn(null);
    if (action === "ack") submitAcknowledge(true, pos.lat, pos.lng, true);
    else if (action === "ackDecline") submitAcknowledge(false, pos.lat, pos.lng, true);
    else if (action === "start") submitStart(pos.lat, pos.lng, true);
    else if (action === "extend") submitExtension(pos.lat, pos.lng, true);
  };

  // ── Action flags ─────────────────────────────────────────────────────────
  // Anyone in the same depot can apply (if no one has applied yet)
  const canSubmit = !block.availAppliedAt
    && status === "Sanctioned and Accepted by SSE"
    && userDepot === block.selectedDepo;

  // Can give concurrence: my dept has a pending record and I'm not already a participant
  const canConcur = status === AVAIL_STATUS.PENDING_CONCURRENCES && hasPendingConcurrence && !myParticipant;

  // In progress: started and not closed
  const isInProgress = isParticipant && myAvailStarted && !myClosed;

  // Per-participant extension state
  const myExtPending  = isInProgress && myParticipant.extensionStatus === "PENDING";
  const myExtRejected = isInProgress && myParticipant.extensionStatus === "REJECTED";
  const canRequestExt = isInProgress && myParticipant.extensionStatus !== "PENDING";

  const closeActive = isInProgress;
  const isTerminal  = status === AVAIL_STATUS.BLOCK_CLOSED || status === AVAIL_STATUS.AVAILING_CANCELLED;

  const secs = secondsUntilStart(block);

  return (
    <div style={{ minHeight: "100vh", background: "#c8f0c8", fontFamily: "Arial, sans-serif" }}>
      <LoadingBar active={syncing} />
      <Toaster position="top-center" />

      {/* ── Geo-fence override warning dialog ── */}
      {geoWarn && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", paddingTop: "max(16px, 10vh)", overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px 20px", maxWidth: "320px", width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "#92400e", marginBottom: "8px" }}>Outside Work Location</div>
            <div style={{ fontSize: "14px", color: "#374151", marginBottom: "20px" }}>
              You are <strong>{geoWarn.distanceMeters.toLocaleString()} m</strong> away from the work location geo-fence. Do you want to proceed anyway?
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setGeoWarn(null)}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleGeoOverrideProceed}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Yellow RBMS header ── */}
      <div style={{ background: "#fef08a", padding: "12px 16px", textAlign: "center" }}>
        <span style={{ fontSize: "30px", fontWeight: 900, color: "#7c3aed", letterSpacing: "3px" }}>RBMS</span>
      </div>

      {/* ── Block ID banner ── */}
      <div style={{ padding: "14px 12px 0", display: "flex", justifyContent: "center" }}>
        <div style={{
          background: "#4ade80", border: "3px solid #16a34a", borderRadius: "10px",
          padding: "14px 32px", fontWeight: 900, fontSize: "20px",
          color: "#000", textAlign: "center", width: "100%", maxWidth: "620px",
        }}>
          Block ID {blockId}
        </div>
      </div>

      {/* ── Main card ── */}
      <div style={{ margin: "14px auto 24px", maxWidth: "620px", width: "calc(100% - 24px)", background: "#fefce8", border: "2px solid #374151", borderRadius: "20px", padding: "28px 20px 28px" }}>

        {/* Status badge — centered, auto-width */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            background: getStatusBg(status, myParticipant), color: "#fff",
            borderRadius: "14px", padding: "16px 32px",
            fontWeight: 900, fontSize: "20px", textAlign: "center",
            whiteSpace: "pre-line", lineHeight: "1.35",
          }}>
            {getStatusLabel(status, myParticipant)}
            {myExtPending && (
              <div style={{ fontSize: "13px", color: "#fde68a", marginTop: "6px" }}>⏳ Your extension pending SM approval</div>
            )}
            {myBurst && (
              <div style={{ fontSize: "13px", color: "#fde68a", marginTop: "6px", fontWeight: 900 }}>⚠ BLOCK BURST — Time exceeded!</div>
            )}
          </div>
        </div>

        {/* ── Block details card ── */}
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "16px", marginBottom: "18px" }}>
          <p style={{ fontWeight: 800, fontSize: "14px", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>Block Details</p>
          {[
            { label: "Date",           value: block.date ? fmtDt(block.date) : null },
            { label: "Section",        value: block.selectedSection },
            { label: "Mission Block",  value: block.missionBlock },
            { label: "Department",     value: block.selectedDepartment },
            { label: "Depot",          value: block.selectedDepo },
            { label: "Work Type",      value: block.workType },
            { label: "Work Nature",    value: block.workNature },
            { label: "Activity",       value: block.activity },
            { label: "Work Location",  value: block.workLocationFrom && block.workLocationTo ? `${block.workLocationFrom} → ${block.workLocationTo}` : (block.workLocationFrom || block.workLocationTo || null) },
            { label: "Asset Name",     value: block.assetName },
            { label: "Asset Number",   value: block.assetNumber },
            { label: "Applied By",     value: block.appliedByName ? `${block.appliedByName}${block.appliedByPhone ? ` (${block.appliedByPhone})` : ""}` : null },
          ].filter(r => r.value).map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: "14px", color: "#111827", fontWeight: 700, textAlign: "right" }}>{value}</span>
            </div>
          ))}

          {/* Remarks — shown separately as a full-width block since it can be long */}
          {block.requestremarks && (
            <div style={{ marginTop: "10px", background: "#fefce8", border: "1.5px solid #fbbf24", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Remarks</p>
              <p style={{ fontSize: "14px", color: "#111827", fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{block.requestremarks}</p>
            </div>
          )}

          {/* Sanctioned / Granted time — only show before SM acts as a pending reference */}
          {(block.grantedFromTime || block.sanctionedTimeFrom) && !block.smApprovedTimeFrom && (
            <div style={{ marginTop: "10px", background: "#f0fdf4", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#15803d", margin: "0 0 4px" }}>
                Admin Sanctioned Time <span style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280" }}>(pending SM approval)</span>
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 700, color: "#14532d", flexWrap: "wrap", gap: "4px" }}>
                <span>From: {fmtDt(block.grantedFromTime ?? block.sanctionedTimeFrom)}</span>
                <span>To: {fmtDt(block.grantedToTime ?? block.sanctionedTimeTo)}</span>
              </div>
            </div>
          )}

          {/* SM approved / modified time */}
          {block.smApprovedTimeFrom && (() => {
            const reqFrom = block.requestedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom;
            const smModified = reqFrom && block.smApprovedTimeFrom !== reqFrom;
            return (
              <div style={{ marginTop: "8px", background: smModified ? "#fef3c7" : "#eff6ff", borderRadius: "8px", padding: "10px 12px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: smModified ? "#92400e" : "#1d4ed8", margin: "0 0 4px" }}>
                  {smModified ? "⚡ SM Modified Time" : "✔ SM Approved Time"}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 700, color: smModified ? "#78350f" : "#1e3a8a" }}>
                  <span>From: {fmtDt(block.smApprovedTimeFrom)}</span>
                  <span>To: {fmtDt(block.smApprovedTimeTo)}</span>
                </div>
                {block.powerNumber && (
                  <p style={{ fontSize: "13px", color: "#1d4ed8", margin: "6px 0 0", fontWeight: 800 }}>⚡ Power No: <strong>{block.powerNumber}</strong></p>
                )}
                {block.smRemarks && (
                  <p style={{ fontSize: "13px", color: "#374151", margin: "6px 0 0" }}>Remarks: <strong>{block.smRemarks}</strong></p>
                )}
              </div>
            );
          })()}

          {/* Approved extension time */}
          {myParticipant?.extensionStatus === "APPROVED" && myParticipant?.smExtensionGrantedTo && (
            <div style={{ marginTop: "8px", background: "#fefce8", border: "2px solid #fbbf24", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ✅ Extension Approved — New End Time
              </p>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#78350f" }}>
                {fmtDt(myParticipant.smExtensionGrantedTo)}
              </div>
              {myParticipant.smExtensionRemarks && (
                <p style={{ fontSize: "12px", color: "#78350f", margin: "4px 0 0", fontStyle: "italic" }}>
                  SM: &quot;{myParticipant.smExtensionRemarks}&quot;
                </p>
              )}
            </div>
          )}

          {/* Actual availed time */}
          {block.availingStartedAt && (
            <div style={{ marginTop: "8px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "13px", fontWeight: 800, color: "#15803d", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Actual Availed Time
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 700, color: "#14532d" }}>
                <span>Started: {fmtDt(block.availingStartedAt)}</span>
                <span>
                  {block.closureSubmittedAt
                    ? `Closed: ${fmtDt(block.closureSubmittedAt)}`
                    : "Ongoing…"}
                </span>
              </div>
              {block.availingStartedAt && block.closureSubmittedAt && (() => {
                const startMs = new Date(block.availingStartedAt as string).getTime();
                const endMs   = new Date(block.closureSubmittedAt as string).getTime();
                const mins    = Math.round((endMs - startMs) / 60000);
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return (
                  <p style={{ fontSize: "13px", color: "#166534", margin: "4px 0 0", fontWeight: 700 }}>
                    Duration availed: {h > 0 ? `${h}h ` : ""}{m}m
                  </p>
                );
              })()}
            </div>
          )}
        </div>

        {/* Countdown + auto-start notice (SM approved, not yet started) */}
        {isParticipant && (status === AVAIL_STATUS.SM_APPROVED || (status === AVAIL_STATUS.AVAILING_ACTIVE && !myAvailStarted)) && !isTerminal && (
          <div style={{ width: "100%", maxWidth: "420px" }}>
            {secs > 0 && <CountdownBadge block={block} />}
            <div style={{ background: "#f0f9ff", border: "1.5px solid #93c5fd", borderRadius: "10px", padding: "12px 16px", textAlign: "center", marginTop: secs > 0 ? "6px" : "0" }}>
              <div style={{ fontWeight: 800, fontSize: "14px", color: "#1e40af" }}>✅ SM Approved — Block Auto-Starts</div>
              <div style={{ fontSize: "13px", color: "#1e40af", marginTop: "4px" }}>
                {secs > 0
                  ? `Your block will start automatically at ${fmtDt(block.smApprovedTimeFrom ?? block.grantedFromTime)}. Please be at the work site.`
                  : "Starting availing automatically… Please wait."}
              </div>
            </div>
          </div>
        )}

        {/* My closure submitted notice */}
        {myClosed && status !== AVAIL_STATUS.BLOCK_CLOSED && (
          <div style={{ background: "#dbeafe", border: "1.5px solid #93c5fd", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "15px", color: "#1e40af", fontWeight: 700, textAlign: "center" }}>
            ✅ Your closure submitted — awaiting all others &amp; SM acknowledgement
          </div>
        )}

        {/* All closures submitted — awaiting SM */}
        {status === AVAIL_STATUS.ALL_CLOSURES_SUBMITTED && (
          <div style={{ background: "#fef3c7", border: "1.5px solid #fbbf24", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "15px", color: "#92400e", fontWeight: 700, textAlign: "center" }}>
            ✅ All participants closed — awaiting SM acknowledgement
          </div>
        )}

        {/* Terminal result */}
        {isTerminal && (
          <div style={{ background: status === AVAIL_STATUS.BLOCK_CLOSED ? "#dcfce7" : "#fee2e2", borderRadius: "12px", padding: "18px", textAlign: "center", marginBottom: "18px" }}>
            <p style={{ fontWeight: 900, fontSize: "20px", color: status === AVAIL_STATUS.BLOCK_CLOSED ? "#16a34a" : "#dc2626", margin: 0 }}>
              {status === AVAIL_STATUS.BLOCK_CLOSED ? "✅ Block Closed Successfully" : "❌ Availing Cancelled"}
            </p>
          </div>
        )}

        {/* ── Participants list ── */}
        {(block.availParticipants as any[])?.length > 0 && (
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "14px", marginBottom: "18px" }}>
            <p style={{ fontWeight: 800, fontSize: "13px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px" }}>Participants</p>
            {(block.availParticipants as any[]).map((p: any) => {
              const isSelf = p.userId === userId;
              const ptStatus = p.closureSubmittedAt ? "Closed ✓"
                : p.blockBurst ? "⚠ Burst"
                : p.availStartedAt ? "Availing"
                : p.smAckStatus === "ACCEPTED" ? "Ack'd"
                : p.smAckStatus === "REJECTED" ? "Declined"
                : p.smAckStatus === null && status === AVAIL_STATUS.SM_APPROVED ? "Ack pending"
                : "Waiting";
              const ptColor = p.closureSubmittedAt ? "#059669" : p.blockBurst ? "#dc2626" : p.availStartedAt ? "#2563eb" : "#6b7280";
              return (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                  <span style={{ fontWeight: 700, color: isSelf ? "#7c3aed" : "#111827" }}>
                    {p.userDesignation ?? p.participantType}/{p.userDept}/{p.userDepot}{isSelf ? " (You)" : ""}
                    {p.userPhone && <span style={{ color: "#6b7280", fontWeight: 500 }}> · {p.userPhone}</span>}
                  </span>
                  <span style={{ fontWeight: 800, color: ptColor, fontSize: "12px" }}>{ptStatus}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Buttons ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>

          {/* Apply for availing */}
          {canSubmit && (
            <button
              onClick={() => {
                // If sanctioned from time has already passed, pre-fill current IST time
                const sanctionedFrom = block.grantedFromTime ?? block.sanctionedTimeFrom ?? block.demandTimeFrom;
                const sanctionedFromMs = sanctionedFrom ? new Date(sanctionedFrom).getTime() : null;
                const nowAsIST = Date.now() + IST_OFFSET_MS;
                if (sanctionedFromMs && nowAsIST > sanctionedFromMs) {
                  const nowDTL = new Date(nowAsIST).toISOString().slice(0, 16);
                  setApplyTimeFrom(nowDTL);
                  setApplyFromAutoFilled(true);
                } else {
                  setApplyTimeFrom("");
                  setApplyFromAutoFilled(false);
                }
                setModal("apply");
              }}
              disabled={syncing}
              style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: "50px", padding: "14px 52px", fontWeight: 800, fontSize: "17px", cursor: syncing ? "not-allowed" : "pointer", letterSpacing: "0.3px", opacity: syncing ? 0.7 : 1 }}
            >
              Click to Submit
            </button>
          )}

          {/* Exit without availing */}
          {canSubmit && (
            <button
              onClick={() => { setExitReason(""); setExitOtherReason(""); setModal("exit"); }}
              disabled={syncing}
              style={{ background: "#fff", color: "#dc2626", border: "2px solid #dc2626", borderRadius: "50px", padding: "12px 40px", fontWeight: 800, fontSize: "15px", cursor: syncing ? "not-allowed" : "pointer", opacity: syncing ? 0.7 : 1 }}
            >
              Exit without availing Block
            </button>
          )}

          {/* Give Concurrence */}
          {canConcur && (
            <button onClick={() => setModal("concurrence")} disabled={syncing} style={{ ...wideBtn("#4f46e5"), opacity: syncing ? 0.7 : 1 }}>
              Give Concurrence
            </button>
          )}


          {/* Request for Time Extension */}
          {isInProgress && (
            myExtRejected ? (
              <button
                onClick={() => { setExtensionIsEmergency(false); setExtensionEmergencyReason(""); setNewEndTime(""); setExtensionRemarks(""); setModal("extend"); }}
                style={wideBtn("#dc2626")}
              >
                ❌ SM Rejected Extension — Apply Again?
              </button>
            ) : myExtPending ? (
              <div style={{ ...wideBtnDisabled, background: "#dbeafe", color: "#1e40af", textAlign: "center" }}>
                ⏳ Extension pending SM approval
              </div>
            ) : (
              <button
                onClick={() => setModal("extend")}
                style={wideBtn("#f59e0b")}
              >
                Request for Time Extension
              </button>
            )
          )}

          {/* Block Closure */}
          {isInProgress && (
            <button
              onClick={() => router.push(`/avail-block/${id}/close`)}
              style={wideBtn("#dc2626")}
            >
              Block Closure
            </button>
          )}

        </div>

        {/* ── Audit Trail ── */}
        <AuditTrail block={block} myParticipant={myParticipant} />

        {/* ── BACK ── */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
          <button
            onClick={() => router.push("/avail-block")}
            style={{
              background: "#c4b5fd", border: "none", borderRadius: "14px",
              padding: "16px 0", fontWeight: 900, fontSize: "18px",
              cursor: "pointer", color: "#000", width: "100%",
            }}
          >
            &lt; BACK
          </button>
        </div>

      </div>

      {/* ── Modals ── */}
      {modal === "apply" && (() => {
        const isTrdBlock = block.selectedDepartment === "TRD";
        const stationOptions = getStationsFromBlock(block);
        const canApply = !!(selectedStation || manualStation.trim());
        return (
          <Modal title="Apply for Availing" onClose={() => { setModal(null); setSelectedStation(""); setManualStation(""); setApplyTimeFrom(""); setApplyTimeTo(""); }}>

            {isTrdBlock && (
              /* TRD info banner — still need station selection below */
              <div style={{ background: "#fff7ed", border: "2px solid #f59e0b", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px" }}>
                <div style={{ fontWeight: 800, fontSize: "13px", color: "#78350f", marginBottom: "2px" }}>⚡ TRD Department Block</div>
                <div style={{ fontSize: "12px", color: "#92400e" }}>
                  After applying, this block goes to the <strong>TRD Controller</strong> for permit. Select the depot / station code for this block below.
                </div>
              </div>
            )}

            {/* Station selection — required for all departments including TRD */}
            <>
            {!isTrdBlock && <>
                          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                {/* {isTrdBlock
                  ? "Select the depot / station code for this block:"
                  : "Select the SM station for this block section:"} */}

                  Select the SM station for this block section:
              </p>
            </>}

              {!isTrdBlock&& <>
                <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {stationOptions.map((code) => {
                  const isSelected = selectedStation === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => { setSelectedStation(code); setManualStation(""); }}
                      style={{
                        padding: "14px 18px", borderRadius: "10px",
                        fontSize: "17px", fontWeight: 700, textAlign: "left",
                        cursor: "pointer", border: "2px solid",
                        borderColor: isSelected ? "#16a34a" : "#e5e7eb",
                        background: isSelected ? "#f0fdf4" : "#fff",
                        color: isSelected ? "#15803d" : "#111827",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}
                    >
                      {code}
                      {isSelected && <span style={{ fontSize: "18px" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              
              </>}
            
              <div style={{ marginBottom: "16px" }}>
                <label style={fieldLabel}>
                  {isTrdBlock ? "Depot / Station (type to search)" : "Station code (type to search or select above)"}
                </label>
                <input
                  type="text"
                  list="sm-station-options"
                  placeholder={isTrdBlock ? "e.g. MDU, DG, POY…" : "e.g. VRI, MNM, TPJ…"}
                  value={manualStation}
                  onChange={(e) => { setManualStation(e.target.value.toUpperCase()); setSelectedStation(""); }}
                  style={fieldInput}
                  autoComplete="off"
                />
                <datalist id="sm-station-options">
                  {smStations.map((s) => (
                    <option key={s.code} value={s.code}>{s.smName ? `${s.code} — ${s.smName}` : s.code}</option>
                  ))}
                </datalist>
              </div>
            </>

            {/* Optional time edit */}
            <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px" }}>
              {applyFromAutoFilled && (
                <div style={{ background: "#fffbeb", border: "1.5px solid #f59e0b", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
                  <div style={{ fontWeight: 800, fontSize: "13px", color: "#92400e" }}>⚠️ Sanctioned start time has passed</div>
                  <div style={{ fontSize: "12px", color: "#b45309", marginTop: "3px" }}>
                    The from time has been set to the current time. Please review and edit if needed before submitting.
                  </div>
                </div>
              )}
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#0369a1", margin: "0 0 10px" }}>
                ✏️ Edit requested times (optional — leave blank to use sanctioned times)
              </p>
              <label style={fieldLabel}>Requested Time From (24h)</label>
              <input
                type="datetime-local"
                lang="en-GB"
                min={new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 16)}
                style={fieldInput}
                value={applyTimeFrom}
                onChange={(e) => setApplyTimeFrom(e.target.value)}
              />
              <label style={fieldLabel}>Requested Time To (24h — must be after From)</label>
              <input
                type="datetime-local"
                lang="en-GB"
                min={applyTimeFrom || new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 16)}
                style={{ ...fieldInput, marginBottom: 0 }}
                value={applyTimeTo}
                onChange={(e) => setApplyTimeTo(e.target.value)}
              />
            </div>

            <button
              onClick={handleApply}
              disabled={applyMut.isPending || !canApply}
              style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: canApply ? "#16a34a" : "#d1d5db", fontWeight: 800, fontSize: "16px", cursor: canApply ? "pointer" : "not-allowed", color: canApply ? "#fff" : "#9ca3af" }}
            >
              {applyMut.isPending ? "Submitting..." : "Submit Application"}
            </button>
          </Modal>
        );
      })()}

      {modal === "concurrence" && (
        <Modal title="Submit Concurrence" onClose={() => setModal(null)}>
          <label style={fieldLabel}>Remarks (optional)</label>
          <textarea style={{ ...fieldInput, height: "80px", resize: "vertical" }} placeholder="Add remarks..." value={concurrenceRemarks} onChange={(e) => setConcurrenceRemarks(e.target.value)} />
          <button onClick={handleConcurrence} disabled={concurrenceMut.isPending} style={{ ...wideBtn("#16a34a"), marginTop: "4px" }}>
            {concurrenceMut.isPending ? "Submitting..." : "Accept & Submit Concurrence"}
          </button>
        </Modal>
      )}

      {modal === "extend" && (
        <Modal title="Request for Time Extension" onClose={() => setModal(null)}>
          <label style={fieldLabel}>New End Time</label>
          <input type="datetime-local" style={fieldInput} value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
          <label style={fieldLabel}>Reason for Extension</label>
          <textarea style={{ ...fieldInput, height: "70px", resize: "vertical" }} placeholder="Enter reason..." value={extensionRemarks} onChange={(e) => setExtensionRemarks(e.target.value)} />

          {/* Emergency toggle */}
          <div
            onClick={() => { setExtensionIsEmergency(v => !v); setExtensionEmergencyReason(""); }}
            style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
              borderRadius: "10px", marginBottom: "12px", cursor: "pointer",
              background: extensionIsEmergency ? "#fef2f2" : "#f9fafb",
              border: `2px solid ${extensionIsEmergency ? "#dc2626" : "#e5e7eb"}`,
              transition: "all 0.15s",
            }}
          >
            <div style={{
              width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
              background: extensionIsEmergency ? "#dc2626" : "#fff",
              border: `2px solid ${extensionIsEmergency ? "#dc2626" : "#d1d5db"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {extensionIsEmergency && <span style={{ color: "#fff", fontSize: "14px", fontWeight: 900, lineHeight: 1 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: extensionIsEmergency ? "#dc2626" : "#374151" }}>
                🚨 This is an Emergency
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                Tap to mark if this extension is due to an emergency situation
              </div>
            </div>
          </div>

          {extensionIsEmergency && (
            <>
              <label style={{ ...fieldLabel, color: "#dc2626" }}>Emergency Description *</label>
              <textarea
                style={{ ...fieldInput, height: "80px", resize: "vertical", borderColor: "#dc2626", background: "#fff5f5" }}
                placeholder="Describe the emergency situation..."
                value={extensionEmergencyReason}
                onChange={(e) => setExtensionEmergencyReason(e.target.value)}
              />
            </>
          )}

          <button onClick={handleExtension} disabled={extensionMut.isPending} style={{ ...wideBtn(extensionIsEmergency ? "#dc2626" : "#f59e0b"), marginTop: "4px" }}>
            {extensionMut.isPending ? "Submitting..." : extensionIsEmergency ? "🚨 Submit Emergency Extension" : "Request Extension"}
          </button>
        </Modal>
      )}

      {/* ── Exit without availing modal ── */}
      {modal === "exit" && (
        <Modal title="Exit without availing Block" onClose={() => setModal(null)}>
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", fontSize: "13px", color: "#991b1b", fontWeight: 700 }}>
            ⚠ This will mark the block as not availed. This action cannot be undone.
          </div>
          <label style={fieldLabel}>Reason for not availing *</label>
          <select
            style={{ ...fieldInput, background: "#fff" }}
            value={exitReason}
            onChange={(e) => { setExitReason(e.target.value); setExitOtherReason(""); }}
          >
            <option value="">-- Select a reason --</option>
            {EXIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {exitReason === "Other" && (
            <>
              <label style={{ ...fieldLabel, marginTop: "12px" }}>Please specify *</label>
              <textarea
                style={{ ...fieldInput, height: "70px", resize: "vertical" }}
                placeholder="Enter reason..."
                value={exitOtherReason}
                onChange={(e) => setExitOtherReason(e.target.value)}
              />
            </>
          )}
          <button
            disabled={exitMut.isPending || !exitReason || (exitReason === "Other" && !exitOtherReason.trim())}
            onClick={() => {
              const finalReason = exitReason === "Other" ? exitOtherReason.trim() : exitReason;
              exitMut.mutate({ requestId: id as string, reason: finalReason }, {
                onSuccess: () => { setModal(null); router.push("/avail-block"); },
              });
            }}
            style={{
              ...wideBtn("#dc2626"),
              marginTop: "16px",
              opacity: (!exitReason || (exitReason === "Other" && !exitOtherReason.trim())) ? 0.5 : 1,
              cursor: (!exitReason || (exitReason === "Other" && !exitOtherReason.trim())) ? "not-allowed" : "pointer",
            }}
          >
            {exitMut.isPending ? "Submitting..." : "Confirm Exit without Availing"}
          </button>
        </Modal>
      )}

    </div>
  );
}

// ── Button helpers ─────────────────────────────────────────────────────────────
function wideBtn(bg: string, textColor?: string): React.CSSProperties {
  // Auto-pick dark text for light/amber backgrounds
  const lightBgs = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"];
  const color = textColor ?? (lightBgs.includes(bg) ? "#1a1a2e" : "#fff");
  return {
    width: "100%", padding: "16px 24px", borderRadius: "14px",
    fontSize: "17px", fontWeight: 800, border: "none",
    textAlign: "center", color, cursor: "pointer",
    background: bg, letterSpacing: "0.2px",
  };
}

const wideBtnDisabled: React.CSSProperties = {
  width: "100%", padding: "16px 24px", borderRadius: "14px",
  fontSize: "17px", fontWeight: 700, border: "none",
  textAlign: "center", color: "#374151", cursor: "not-allowed",
  background: "#d1d5db", letterSpacing: "0.2px",
};
