"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetAvailRequestById } from "@/app/service/query/avail";
import {
  useApplyForAvailing,
  useSubmitAvailConcurrence,
  useSseRespondToSmModification,
  useStartAvailing,
  useCloseBlock,
  useRequestExtension,
} from "@/app/service/mutation/avail";
import { AVAIL_STATUS, blockSectionYards } from "@/app/lib/store";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDt(dt?: string | null) {
  if (!dt) return "—";
  try { return format(new Date(dt), "dd-MM-yyyy HH:mm"); } catch { return "—"; }
}

function getYards(block: any): string[] {
  const section = (block.missionBlock ?? block.selectedSection ?? "").split(",")[0].trim();
  return blockSectionYards[section] ?? [];
}

// Returns seconds until start time; negative = already past
function secondsUntilStart(block: any): number {
  const startStr = block.smApprovedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom;
  if (!startStr) return 0;
  return Math.floor((new Date(startStr).getTime() - Date.now()) / 1000);
}

function CountdownOrStart({ block, onStart }: { block: any; onStart: () => void }) {
  const [secs, setSecs] = useState(() => secondsUntilStart(block));

  useEffect(() => {
    const id = setInterval(() => setSecs(secondsUntilStart(block)), 1000);
    return () => clearInterval(id);
  }, [block]);

  if (secs > 0) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const label = h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
    const startTime = fmtDt(block.smApprovedTimeFrom ?? block.grantedFromTime ?? block.sanctionedTimeFrom);
    return (
      <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "10px", padding: "18px", textAlign: "center" }}>
        <p style={{ fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>Block opens at {startTime}</p>
        <p style={{ color: "#555", fontSize: "14px" }}>Time remaining: <strong>{label}</strong></p>
        <button disabled style={disabledBtn}>Start Block (not yet time)</button>
      </div>
    );
  }

  return (
    <button onClick={onStart} style={greenBtn}>
      ▶ Start Block
    </button>
  );
}

// ── Modal backdrop ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", minWidth: "320px", maxWidth: "480px", width: "90%" }}>
        <h3 style={{ marginBottom: "16px", fontWeight: 700 }}>{title}</h3>
        {children}
        <button onClick={onClose} style={{ marginTop: "14px", background: "#eee", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const btn: React.CSSProperties = { display: "block", width: "100%", padding: "14px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer", border: "none", marginBottom: "12px", textAlign: "center" };
const greenBtn: React.CSSProperties = { ...btn, background: "#4caf50", color: "#fff" };
const tealBtn: React.CSSProperties = { ...btn, background: "#26c6da", color: "#fff" };
const orangeBtn: React.CSSProperties = { ...btn, background: "#ff9800", color: "#fff" };
const redBtn: React.CSSProperties = { ...btn, background: "#e53935", color: "#fff" };
const purpleBtn: React.CSSProperties = { ...btn, background: "#7b1fa2", color: "#fff" };
const disabledBtn: React.CSSProperties = { ...btn, background: "#ccc", color: "#666", cursor: "not-allowed" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "12px", fontSize: "14px", boxSizing: "border-box" };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AvailBlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const { data, isLoading, refetch } = useGetAvailRequestById(id);
  const block = data?.data ?? null;

  // Modal state
  const [modal, setModal] = useState<"apply" | "concurrence" | "extend" | "close" | null>(null);

  // Form state
  const [oheMasFrom, setOheMasFrom] = useState("");
  const [oheMasTo, setOheMasTo] = useState("");
  const [concurrenceRemarks, setConcurrenceRemarks] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [extensionRemarks, setExtensionRemarks] = useState("");
  const [closureYard, setClosureYard] = useState("");
  const [closureRemarks, setClosureRemarks] = useState("");

  // Mutations
  const applyMut = useApplyForAvailing();
  const concurrenceMut = useSubmitAvailConcurrence();
  const sseRespondMut = useSseRespondToSmModification();
  const startMut = useStartAvailing();
  const closeMut = useCloseBlock();
  const extensionMut = useRequestExtension();

  if (isLoading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  if (!block) return <div style={{ padding: "40px" }}>Block not found.</div>;

  const userId = session?.user?.id;
  const userDept = session?.user?.department;
  const isOwner = block.userId === userId;
  const status = block.overAllStatus ?? "";

  // ── Action handlers ──────────────────────────────────────────────────────────
  const handleApply = () => {
    if (!oheMasFrom.trim() || !oheMasTo.trim()) { toast.error("Enter both OHE MAS values"); return; }
    applyMut.mutate({ requestId: id, oheMasFrom, oheMasTo }, {
      onSuccess: () => { setModal(null); refetch(); },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
    });
  };

  const handleConcurrence = () => {
    concurrenceMut.mutate({
      requestId: id, accept: true,
      acceptRemarks: concurrenceRemarks,
      userDepartement: userDept,
    }, {
      onSuccess: () => { setModal(null); refetch(); },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
    });
  };

  const handleSseRespond = (accept: boolean) => {
    sseRespondMut.mutate({ requestId: id, accept }, {
      onSuccess: () => refetch(),
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
    });
  };

  const handleStart = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => startMut.mutate({ requestId: id, latitude: pos.coords.latitude, longitude: pos.coords.longitude, geoCheckBypassed: true }, { onSuccess: () => refetch(), onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed") }),
      () => startMut.mutate({ requestId: id, latitude: null, longitude: null, geoCheckBypassed: true }, { onSuccess: () => refetch(), onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed") })
    );
  };

  const handleExtension = () => {
    if (!newEndTime) { toast.error("Select a new end time"); return; }
    extensionMut.mutate({ requestId: id, newEndTime, remarks: extensionRemarks }, {
      onSuccess: () => { setModal(null); refetch(); },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
    });
  };

  const handleClose = () => {
    if (!closureYard) { toast.error("Select a closure yard"); return; }
    if (!closureRemarks.trim()) { toast.error("Enter closure remarks"); return; }
    closeMut.mutate({ requestId: id, closureYard, closureRemarks }, {
      onSuccess: () => { setModal(null); refetch(); },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
    });
  };

  const yards = getYards(block);

  // ── Status badge colour ──────────────────────────────────────────────────────
  const badgeColor = status === AVAIL_STATUS.BLOCK_BURST ? "#e53935"
    : status === AVAIL_STATUS.AVAILING_IN_PROGRESS ? "#2e7d32"
    : status === AVAIL_STATUS.BLOCK_CLOSED ? "#1565c0"
    : status.includes("Cancelled") ? "#b71c1c"
    : "#37474f";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "0 0 40px" }}>
      <Toaster position="top-center" />

      {/* Header */}
      <div style={{ background: "#4caf50", textAlign: "center", padding: "16px" }}>
        <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
          Block ID {block.divisionId ?? id}
        </span>
      </div>

      {/* Content card */}
      <div style={{ maxWidth: "500px", margin: "24px auto", background: "#fffde7", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "24px" }}>

        {/* Status badge */}
        <div style={{ background: badgeColor, color: "#fff", borderRadius: "8px", padding: "10px 16px", textAlign: "center", fontWeight: 700, fontSize: "15px", marginBottom: "20px" }}>
          {status || "Unknown Status"}
          {block.extensionStatus === "PENDING" && (
            <div style={{ fontSize: "12px", marginTop: "4px", fontWeight: 400 }}>⏳ Extension pending SM approval</div>
          )}
        </div>

        {/* Block info */}
        <table style={{ width: "100%", marginBottom: "20px", fontSize: "13px" }}>
          <tbody>
            {[
              ["Section", block.selectedSection],
              ["Work Type", block.workType],
              ["Activity", block.activity],
              ["Department", block.selectedDepartment],
              ["Granted From", fmtDt(block.grantedFromTime ?? block.sanctionedTimeFrom)],
              ["Granted To", fmtDt(block.grantedToTime ?? block.sanctionedTimeTo)],
              block.smApprovedTimeFrom && ["SM Approved From", fmtDt(block.smApprovedTimeFrom)],
              block.smApprovedTimeTo && ["SM Approved To", fmtDt(block.smApprovedTimeTo)],
              block.oheMasFrom && ["OHE MAS From", block.oheMasFrom],
              block.oheMasTo && ["OHE MAS To", block.oheMasTo],
              block.smRemarks && ["SM Remarks", block.smRemarks],
              block.availingStartedAt && ["Availing Started", fmtDt(block.availingStartedAt)],
              block.extensionRequestedTo && ["Extension Requested To", fmtDt(block.extensionRequestedTo)],
              block.extensionStatus === "APPROVED" && ["Extension Approved To", fmtDt(block.smApprovedTimeTo)],
              block.closureYard && ["Closure Yard", block.closureYard],
              block.closureRemarks && ["Closure Remarks", block.closureRemarks],
            ].filter(Boolean).map(([label, val]) => (
              <tr key={label as string}>
                <td style={{ padding: "4px 8px", fontWeight: 600, width: "45%", color: "#555" }}>{label}:</td>
                <td style={{ padding: "4px 8px" }}>{val as string}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Action buttons ─────────────────────────────────────────────────── */}

        {/* Own block — Sanctioned, not yet applied */}
        {isOwner && status === "Sanctioned and Accepted by SSE" && (
          <>
            <button style={greenBtn} onClick={() => setModal("apply")}>Click to Submit</button>
            <button style={tealBtn} onClick={() => setModal("apply")}>Edit Block Request</button>
          </>
        )}

        {/* Other dept — needs concurrence, not yet submitted */}
        {!isOwner && (status === AVAIL_STATUS.PENDING_CONCURRENCES || status === AVAIL_STATUS.APPLIED_FOR_AVAILING) && (
          <button style={greenBtn} onClick={() => setModal("concurrence")}>Click to Submit</button>
        )}

        {/* Own — waiting states */}
        {isOwner && (status === AVAIL_STATUS.APPLIED_FOR_AVAILING || status === AVAIL_STATUS.PENDING_CONCURRENCES) && (
          <div style={{ textAlign: "center", padding: "16px", color: "#555", fontStyle: "italic" }}>
            Waiting for other department concurrences...
          </div>
        )}
        {isOwner && status === AVAIL_STATUS.PENDING_SM_APPROVAL && (
          <div style={{ textAlign: "center", padding: "16px", color: "#555", fontStyle: "italic" }}>
            Waiting for SM approval...
          </div>
        )}

        {/* Own — SM time modification pending SSE response */}
        {isOwner && status === AVAIL_STATUS.SM_TIME_MODIFIED && (
          <>
            <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", padding: "12px", marginBottom: "14px", fontSize: "13px" }}>
              <strong>SM modified the time.</strong><br />
              New From: {fmtDt(block.smApprovedTimeFrom)}<br />
              New To: {fmtDt(block.smApprovedTimeTo)}<br />
              SM Remarks: {block.smRemarks ?? "—"}
            </div>
            <button style={greenBtn} onClick={() => handleSseRespond(true)} disabled={sseRespondMut.isPending}>
              Accept SM Time
            </button>
            <button style={redBtn} onClick={() => handleSseRespond(false)} disabled={sseRespondMut.isPending}>
              Reject SM Time (Cancels Availing)
            </button>
          </>
        )}

        {/* Own — SM approved, time-gated start */}
        {isOwner && status === AVAIL_STATUS.SM_APPROVED && (
          <CountdownOrStart block={block} onStart={handleStart} />
        )}

        {/* Own — Availing in Progress */}
        {isOwner && status === AVAIL_STATUS.AVAILING_IN_PROGRESS && (
          <>
            {block.extensionStatus !== "PENDING" && (
              <button style={orangeBtn} onClick={() => setModal("extend")}>
                Request for Time Extension
              </button>
            )}
            {block.extensionStatus === "PENDING" && (
              <div style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "13px" }}>
                Extension request sent to SM — waiting for approval.
              </div>
            )}
            <button style={redBtn} onClick={() => setModal("close")}>Block Closure</button>
          </>
        )}

        {/* Own — Block Burst (urgent close) */}
        {isOwner && status === AVAIL_STATUS.BLOCK_BURST && (
          <>
            <div style={{ background: "#ffebee", border: "2px solid #e53935", borderRadius: "8px", padding: "14px", marginBottom: "14px", textAlign: "center" }}>
              <strong style={{ color: "#c62828", fontSize: "16px" }}>⚠ BLOCK BURST</strong>
              <p style={{ fontSize: "13px", marginTop: "6px", color: "#555" }}>Granted time has elapsed. Close the block immediately.</p>
            </div>
            <button style={redBtn} onClick={() => setModal("close")}>Block Closure</button>
          </>
        )}

        {/* Own — Closure submitted */}
        {isOwner && status === AVAIL_STATUS.CLOSURE_SUBMITTED && (
          <div style={{ textAlign: "center", padding: "16px", color: "#555", fontStyle: "italic" }}>
            Closure submitted — waiting for SM acknowledgement.
          </div>
        )}

        {/* Closed / Cancelled */}
        {(status === AVAIL_STATUS.BLOCK_CLOSED || status === AVAIL_STATUS.AVAILING_CANCELLED) && (
          <div style={{ textAlign: "center", padding: "16px", color: "#555" }}>
            {status === AVAIL_STATUS.BLOCK_CLOSED ? "✅ Block Closed." : "❌ Availing Cancelled."}
          </div>
        )}

        {/* Location note */}
        <div style={{ marginTop: "14px", background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "6px", padding: "8px 12px", fontSize: "12px", color: "#666" }}>
          📍 Location is captured automatically when you start the block (geo-tagging).
        </div>

        {/* Back */}
        <button onClick={() => router.push("/avail-block")} style={{ marginTop: "18px", background: "#e8d5f5", border: "1px solid #b39ddb", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
          &lt; BACK
        </button>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}

      {/* Apply / Edit */}
      {modal === "apply" && (
        <Modal title="Submit Availing Application" onClose={() => setModal(null)}>
          <label style={{ fontSize: "13px", fontWeight: 600 }}>OHE MAS From</label>
          <input style={inputStyle} placeholder="e.g. TVC/1100" value={oheMasFrom} onChange={(e) => setOheMasFrom(e.target.value)} />
          <label style={{ fontSize: "13px", fontWeight: 600 }}>OHE MAS To</label>
          <input style={inputStyle} placeholder="e.g. NCJ/1200" value={oheMasTo} onChange={(e) => setOheMasTo(e.target.value)} />
          <button onClick={handleApply} disabled={applyMut.isPending} style={{ ...greenBtn, marginTop: "8px" }}>
            {applyMut.isPending ? "Submitting..." : "Submit"}
          </button>
        </Modal>
      )}

      {/* Concurrence */}
      {modal === "concurrence" && (
        <Modal title="Submit Concurrence" onClose={() => setModal(null)}>
          <label style={{ fontSize: "13px", fontWeight: 600 }}>Remarks (optional)</label>
          <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }} placeholder="Add remarks..." value={concurrenceRemarks} onChange={(e) => setConcurrenceRemarks(e.target.value)} />
          <button onClick={handleConcurrence} disabled={concurrenceMut.isPending} style={{ ...greenBtn, marginTop: "8px" }}>
            {concurrenceMut.isPending ? "Submitting..." : "Accept & Submit"}
          </button>
        </Modal>
      )}

      {/* Time Extension */}
      {modal === "extend" && (
        <Modal title="Request Time Extension" onClose={() => setModal(null)}>
          <label style={{ fontSize: "13px", fontWeight: 600 }}>New End Time</label>
          <input type="datetime-local" style={inputStyle} value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
          <label style={{ fontSize: "13px", fontWeight: 600 }}>Reason for Extension</label>
          <textarea style={{ ...inputStyle, height: "70px", resize: "vertical" }} placeholder="Enter reason..." value={extensionRemarks} onChange={(e) => setExtensionRemarks(e.target.value)} />
          <button onClick={handleExtension} disabled={extensionMut.isPending} style={{ ...orangeBtn, marginTop: "8px" }}>
            {extensionMut.isPending ? "Submitting..." : "Request Extension"}
          </button>
        </Modal>
      )}

      {/* Block Closure */}
      {modal === "close" && (
        <Modal title="Block Closure" onClose={() => setModal(null)}>
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "6px", padding: "10px", marginBottom: "14px", fontSize: "12px" }}>
            ⚠ This action is irreversible. Only close when work is physically complete.
          </div>
          <label style={{ fontSize: "13px", fontWeight: 600 }}>Closure Yard</label>
          {yards.length > 0 ? (
            <select style={inputStyle} value={closureYard} onChange={(e) => setClosureYard(e.target.value)}>
              <option value="">— Select Yard —</option>
              {yards.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          ) : (
            <input style={inputStyle} placeholder="Enter yard name" value={closureYard} onChange={(e) => setClosureYard(e.target.value)} />
          )}
          <label style={{ fontSize: "13px", fontWeight: 600 }}>Closure Remarks</label>
          <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }} placeholder="Describe work completed..." value={closureRemarks} onChange={(e) => setClosureRemarks(e.target.value)} />
          <button onClick={handleClose} disabled={closeMut.isPending} style={{ ...redBtn, marginTop: "8px" }}>
            {closeMut.isPending ? "Submitting..." : "Submit Closure"}
          </button>
        </Modal>
      )}
    </div>
  );
}
