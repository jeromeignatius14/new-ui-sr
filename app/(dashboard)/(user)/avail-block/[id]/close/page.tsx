"use client";

import { use, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { useGetAvailRequestById } from "@/app/service/query/avail";
import { useCloseBlock } from "@/app/service/mutation/avail";
import { AVAIL_STATUS } from "@/app/lib/store";

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDt(dt?: string | null) {
  if (!dt) return "—";
  try {
    const iso = new Date(dt).toISOString();
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}-${m}-${y.slice(2)} ${iso.slice(11, 16)}`;
  } catch { return "—"; }
}

// ── Full Audit Trail — entire block lifecycle ─────────────────────────────────
function AuditTrail({ block, myParticipant }: { block: any; myParticipant?: any }) {
  type Entry = { icon: string; label: string; at?: string | null; sub?: string | null; color: string; phase: string };
  const entries: Entry[] = [];

  // ── Phase 1: Request Creation ──
  entries.push({
    icon: "📝", phase: "Request",
    label: `Block Request Created — ${block.corridorType ?? "Corridor"}`,
    at: block.createdAt,
    sub: `Section: ${block.selectedSection ?? "—"}  |  Dept: ${block.selectedDepartment ?? "—"}  |  Demanded: ${fmtDt(block.demandTimeFrom)} → ${fmtDt(block.demandTimeTo)}`,
    color: "#6366f1",
  });

  // ── Phase 2: Disconnection approvals ──
  const allDisconn = [
    ...(block.trdDisconnections ?? []).map((d: any) => ({ ...d, type: "TRD" })),
    ...(block.sntDisconnections ?? []).map((d: any) => ({ ...d, type: "S&T" })),
    ...(block.enggDisconnections ?? []).map((d: any) => ({ ...d, type: "ENGG" })),
  ];
  allDisconn.forEach((d: any) => {
    if (d.approvedAt || d.status !== "PENDING") {
      entries.push({
        icon: d.status === "ACCEPTED" ? "✅" : d.status === "REJECTED" ? "❌" : "⏳",
        phase: "Disconnection",
        label: `${d.type} Disconnection ${d.status === "ACCEPTED" ? "Accepted" : d.status === "REJECTED" ? "Rejected" : "Pending"} — ${d.depot}`,
        at: d.approvedAt,
        sub: d.remarks ?? null,
        color: d.status === "ACCEPTED" ? "#059669" : d.status === "REJECTED" ? "#dc2626" : "#92400e",
      });
    }
  });

  // ── Phase 3: Dept Controller / Manager ──
  if (block.managerResponseTiming) {
    entries.push({
      icon: block.managerAcceptance ? "✅" : "❌",
      phase: "Dept Controller",
      label: block.managerAcceptance ? "Dept Controller Approved Request" : "Dept Controller Rejected Request",
      at: block.managerResponseTiming,
      sub: block.remarkByManager ?? null,
      color: block.managerAcceptance ? "#0369a1" : "#dc2626",
    });
  }

  // ── Phase 4: Admin (Sr.DOM) ──
  if (block.adminApprovedAt || block.adminRequestStatus === "ACCEPTED" || block.adminRequestStatus === "REJECTED") {
    const accepted = block.adminRequestStatus === "ACCEPTED";
    entries.push({
      icon: accepted ? "✅" : "❌",
      phase: "Admin",
      label: accepted ? "Admin (Sr.DOM) Accepted Request" : "Admin (Sr.DOM) Rejected Request",
      at: block.adminApprovedAt,
      sub: block.remarkByManager && !block.managerAcceptance ? null : (block.sanctionedRemarks ?? null),
      color: accepted ? "#0284c7" : "#dc2626",
    });
  }

  // ── Phase 5: Optimisation ──
  if (block.optimizeTimeFrom && block.optimizeTimeTo) {
    entries.push({
      icon: "⚙️", phase: "Optimisation",
      label: "Block Timings Optimised",
      at: null,
      sub: `Optimised window: ${fmtDt(block.optimizeTimeFrom)} → ${fmtDt(block.optimizeTimeTo)}`,
      color: "#7c3aed",
    });
  }

  // ── Phase 6: Sanctioned ──
  if (block.isSanctioned) {
    entries.push({
      icon: "🏆", phase: "Sanction",
      label: "Block Sanctioned",
      at: block.sanctionedAt,
      sub: `Granted: ${fmtDt(block.grantedFromTime ?? block.sanctionedTimeFrom)} → ${fmtDt(block.grantedToTime ?? block.sanctionedTimeTo)}${block.sanctionedRemarks ? `  |  Remarks: ${block.sanctionedRemarks}` : ""}`,
      color: "#b45309",
    });
  }

  // ── Phase 7: SSE accepted sanctioned block ──
  if (block.userAcceptanceForSanction) {
    entries.push({
      icon: "👍", phase: "SSE Acceptance",
      label: "SSE Accepted Sanctioned Block",
      at: null,
      sub: null,
      color: "#0369a1",
    });
  }

  // ── Phase 8: Availing phase ──
  if (block.availAppliedAt)
    entries.push({ icon: "📤", phase: "Availing", label: "Availing Application Submitted", at: block.availAppliedAt, sub: block.smStation ? `Target SM Station: ${block.smStation}` : null, color: "#1d4ed8" });

  if (block.smApprovedAt)
    entries.push({
      icon: block.sseAcceptedSmModification === false ? "✏️" : "✅",
      phase: "SM Approval",
      label: block.smApprovedTimeFrom && block.smApprovedTimeFrom !== (block.grantedFromTime ?? block.sanctionedTimeFrom)
        ? "SM Approved with Time Modification"
        : "SM Approved Availing",
      at: block.smApprovedAt,
      sub: `Window: ${fmtDt(block.smApprovedTimeFrom ?? block.grantedFromTime)} → ${fmtDt(block.smApprovedTimeTo ?? block.grantedToTime)}${block.smRemarks ? `  |  ${block.smRemarks}` : ""}`,
      color: "#047857",
    });

  if (block.sseModificationRespondedAt)
    entries.push({
      icon: block.sseAcceptedSmModification ? "✅" : "❌",
      phase: "SSE Response",
      label: block.sseAcceptedSmModification ? "SSE Accepted SM's Time Modification" : "SSE Rejected SM's Time Modification",
      at: block.sseModificationRespondedAt,
      sub: null,
      color: block.sseAcceptedSmModification ? "#047857" : "#dc2626",
    });

  if (block.availingStartedAt)
    entries.push({ icon: "▶", phase: "Availing", label: "Availing Acknowledged & Started", at: block.availingStartedAt, sub: null, color: "#16a34a" });

  if (myParticipant?.extensionRequestedAt)
    entries.push({
      icon: myParticipant.extensionIsEmergency ? "🚨" : "⏳",
      phase: "Extension",
      label: myParticipant.extensionIsEmergency ? "Emergency Time Extension Requested" : "Time Extension Requested",
      at: myParticipant.extensionRequestedAt,
      sub: myParticipant.extensionIsEmergency && myParticipant.extensionEmergencyReason
        ? `Emergency: ${myParticipant.extensionEmergencyReason}`
        : (myParticipant.extensionRemarks ?? null),
      color: myParticipant.extensionIsEmergency ? "#dc2626" : "#b45309",
    });

  if (myParticipant?.smExtensionApprovedAt)
    entries.push({
      icon: myParticipant.extensionStatus === "APPROVED" ? "✅" : "❌",
      phase: "Extension",
      label: myParticipant.extensionStatus === "APPROVED" ? "SM Approved Time Extension" : "SM Rejected Time Extension",
      at: myParticipant.smExtensionApprovedAt,
      sub: myParticipant.smExtensionRemarks ?? null,
      color: myParticipant.extensionStatus === "APPROVED" ? "#047857" : "#dc2626",
    });

  const phaseColors: Record<string, string> = {
    "Request": "#6366f1", "Disconnection": "#059669", "Dept Controller": "#0369a1",
    "Admin": "#0284c7", "Optimisation": "#7c3aed", "Sanction": "#b45309",
    "SSE Acceptance": "#0369a1", "Availing": "#1d4ed8", "SM Approval": "#047857",
    "SSE Response": "#047857", "Extension": "#b45309",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* vertical spine */}
      <div style={{ position: "absolute", left: "16px", top: 0, bottom: 0, width: "2px", background: "#e5e7eb", zIndex: 0 }} />
      {entries.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px", position: "relative" }}>
          {/* dot */}
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: e.color, flexShrink: 0, zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", boxShadow: "0 0 0 3px #fef9ee",
          }}>
            {e.icon}
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: "10px", padding: "10px 14px", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {/* phase badge */}
            <div style={{ display: "inline-block", background: e.color + "22", color: e.color, fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", marginBottom: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {e.phase}
            </div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{e.label}</div>
            {e.at && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "3px" }}>🕐 {fmtDt(e.at)}</div>}
            {e.sub && <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px", fontStyle: "italic", lineHeight: "1.5" }}>{e.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClosurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading } = useGetAvailRequestById(id);
  const closeMut = useCloseBlock();

  // Snapshot current time once on mount — this is the actual availing end time (closure submission)
  const [closureNow] = useState(() => new Date().toISOString());

  const [closureRemarks, setClosureRemarks] = useState("");
  const [reconnectedSignal, setReconnectedSignal] = useState("N");
  const [cautionKmph, setCautionKmph] = useState("");
  const [oheMadeFit, setOheMadeFit] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const block = data?.data ?? null;
  const blockId = block?.divisionId ?? id?.slice(0, 8).toUpperCase();

  // Find my participant record for actual availed times
  const myParticipant = block?.availParticipants?.find((p: any) => p.userId === session?.user?.id);
  const availFrom = myParticipant?.availStartedAt ?? block?.AvailedTimeFrom ?? block?.availingStartedAt;
  const availTo   = closureNow; // actual end = now (when the user opens the closure form)

  // Sections from missionBlock (comma-separated)
  const sections = block?.missionBlock
    ? block.missionBlock.split(",").map((s: string) => s.trim()).filter(Boolean)
    : block?.selectedSection
      ? [block.selectedSection]
      : ["—"];

  // Parse processedLineSections for auto-filled LINE column
  const parsedLineSections: any[] = (() => {
    try {
      const v = block?.processedLineSections;
      if (!v) return [];
      return typeof v === "string" ? JSON.parse(v) : (Array.isArray(v) ? v : []);
    } catch { return []; }
  })();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function handleSubmit() {
    closeMut.mutate({
      requestId: id,
      closureRemarks: closureRemarks || undefined,
      closureImage: imageFile ?? undefined,
      closureReconnectedSignal: reconnectedSignal || undefined,
      closureCautionKmph: cautionKmph || undefined,
      closureOheMadeFit: oheMadeFit,
    }, {
      onSuccess: () => {
        toast.success("Block closure submitted");
        router.push(`/avail-block/${id}`);
      },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to submit closure"),
    });
  }

  if (isLoading || !block) {
    return (
      <div style={{ minHeight: "100vh", background: "#fdf8e7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "#111827" }}>
        Loading...
      </div>
    );
  }

  const card: React.CSSProperties = {
    maxWidth: "700px", margin: "0 auto", width: "calc(100% - 24px)",
    background: "#fef9ee", border: "2px solid #222", borderRadius: "14px",
    padding: "20px 16px", marginBottom: "18px",
    boxSizing: "border-box", overflow: "hidden",
  };

  const thStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #7c3aed, #5b21b6)", padding: "12px 8px", fontSize: "11px",
    fontWeight: 800, color: "#fff", textAlign: "center",
    border: "none", whiteSpace: "nowrap", letterSpacing: "0.3px", textTransform: "uppercase",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 8px", fontSize: "12px", color: "#1a1a2e",
    textAlign: "center", border: "1px solid #ede9fe", background: "#fff",
    fontWeight: 600, wordBreak: "break-word", maxWidth: "120px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px", fontWeight: 800, color: "#4c1d95", marginBottom: "6px", display: "block",
    textTransform: "uppercase", letterSpacing: "0.5px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8e7", fontFamily: "Arial, sans-serif", paddingBottom: "40px", boxSizing: "border-box", overflowX: "hidden" }}>
      <Toaster position="top-center" />

      {/* RBMS header */}
      <div style={{ background: "#fef08a", padding: "12px 16px", textAlign: "center", borderBottom: "2px solid #eab308" }}>
        <span style={{ fontSize: "30px", fontWeight: 900, color: "#7c3aed", letterSpacing: "3px" }}>RBMS</span>
      </div>

      {/* Title */}
      <div style={{ background: "#c8f0e8", padding: "14px 16px", textAlign: "center", borderBottom: "1.5px solid #99ddd0" }}>
        <div style={{ fontSize: "16px", fontWeight: 900, color: "#1a1a2e", letterSpacing: "0.5px" }}>
          BLOCK CLOSURE REQUEST AFTER FINISHING SITE WORK
        </div>
        <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>
          Applicant&apos;s Designation: <strong>{session?.user?.department ?? "—"}</strong>
        </div>
      </div>

      <div style={{ padding: "18px 12px" }}>

        {/* Block summary */}
        <div style={{ ...card, background: "#fdf0b0", border: "2px solid #c8a84b", textAlign: "center", padding: "16px 20px" }}>
          <div style={{ fontWeight: 900, fontSize: "16px", color: "#1a1a2e" }}>
            Summary of Block (ID: {blockId})
          </div>
          <div style={{ fontSize: "13px", color: "#555", marginTop: "6px" }}>
            Availed from {fmtDt(availFrom)} To {fmtDt(availTo)}
          </div>
          <div style={{ fontSize: "12px", color: "#7a6000", marginTop: "4px" }}>
            Section: {block.selectedSection ?? block.missionBlock ?? "—"} &nbsp;|&nbsp; Dept: {block.selectedDepartment ?? "—"}
          </div>
        </div>

        {/* Closure details table */}
        <div style={{ ...card, padding: "0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Block Section / Yard</th>
                  <th style={thStyle}>Line (UP/DN/Road No./Yard)</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>To</th>
                  <th style={thStyle}>Reconnected Signal No.</th>
                  <th style={thStyle}>Caution (kmph)</th>
                  <th style={thStyle}>OHE made fit after PB</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec: string, i: number) => (
                  <tr key={i}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{sec}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#5b21b6" }}>
                      {parsedLineSections[i]?.lineName ?? parsedLineSections[0]?.lineName ?? block.lineType ?? "—"}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#166534" }}>{fmtDt(availFrom)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#166534" }}>{fmtDt(availTo)}</td>
                    {/* Inline editable — only first row; rest show the same value */}
                    <td style={{ ...tdStyle, padding: "4px 6px" }}>
                      {i === 0 ? (
                        <input
                          value={reconnectedSignal}
                          onChange={(e) => setReconnectedSignal(e.target.value)}
                          placeholder="N"
                          style={{ width: "100%", border: "1.5px solid #8b5cf6", borderRadius: "6px", background: "#faf5ff", fontSize: "14px", fontWeight: 700, color: "#5b21b6", textAlign: "center", outline: "none", padding: "6px 4px", boxSizing: "border-box" as "border-box" }}
                        />
                      ) : (
                        <span style={{ fontWeight: 700, color: "#7c3aed" }}>{reconnectedSignal || "N"}</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, padding: "4px 6px" }}>
                      {i === 0 ? (
                        <input
                          value={cautionKmph}
                          onChange={(e) => setCautionKmph(e.target.value)}
                          placeholder="—"
                          type="number"
                          inputMode="numeric"
                          style={{ width: "100%", border: "1.5px solid #8b5cf6", borderRadius: "6px", background: "#faf5ff", fontSize: "14px", fontWeight: 700, color: "#5b21b6", textAlign: "center", outline: "none", padding: "6px 4px", boxSizing: "border-box" as "border-box" }}
                        />
                      ) : (
                        <span style={{ fontWeight: 700, color: "#7c3aed" }}>{cautionKmph || "—"}</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, padding: "4px 6px" }}>
                      {i === 0 ? (
                        <div
                          onClick={() => setOheMadeFit(v => !v)}
                          style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", userSelect: "none", padding: "6px 0" }}
                        >
                          <div style={{ width: "28px", height: "28px", borderRadius: "8px", border: `2.5px solid ${oheMadeFit ? "#16a34a" : "#8b5cf6"}`, background: oheMadeFit ? "#16a34a" : "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: oheMadeFit ? "0 0 0 3px #dcfce7" : "none", transition: "all 0.2s" }}>
                            {oheMadeFit && <span style={{ color: "#fff", fontSize: "15px", fontWeight: 900, lineHeight: 1 }}>✓</span>}
                          </div>
                          <span style={{ fontWeight: 900, fontSize: "14px", color: oheMadeFit ? "#16a34a" : "#8b5cf6", background: oheMadeFit ? "#dcfce7" : "#f3e8ff", borderRadius: "6px", padding: "2px 10px" }}>{oheMadeFit ? "YES" : "NO"}</span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, color: oheMadeFit ? "#16a34a" : "#888" }}>{oheMadeFit ? "Y" : "N"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks */}
        <div style={card}>
          <label style={labelStyle}>Remarks if any:</label>
          <textarea
            style={{
              width: "100%", padding: "14px 16px",
              border: "2px solid #7c3aed", borderRadius: "10px",
              fontSize: "17px", fontWeight: 600, background: "#f0fff4", outline: "none",
              boxSizing: "border-box", resize: "vertical", minHeight: "80px",
              color: "#1a1a2e", lineHeight: "1.5",
            }}
            placeholder="Enter remarks..."
            value={closureRemarks}
            onChange={(e) => setClosureRemarks(e.target.value)}
          />
        </div>

        {/* Image attachment */}
        <div style={card}>
          <label style={labelStyle}>Attach Image (optional):</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)", color: "#fff", border: "none",
              borderRadius: "12px", padding: "12px 32px",
              fontWeight: 800, fontSize: "14px", cursor: "pointer",
              display: "block", margin: "0 auto", letterSpacing: "0.3px",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}
          >
            📎 Attach Image
          </button>
          {imageFile && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600, marginBottom: "6px" }}>
                {imageFile.name}
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", border: "2px solid #c4a8e8", objectFit: "contain" }}
                />
              )}
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                style={{ marginTop: "8px", background: "none", border: "none", color: "#dc2626", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        {/* Certification text */}
        <div style={{ ...card, background: "#f0f4ff", border: "1.5px solid #c7d2fe", textAlign: "center", padding: "14px 18px" }}>
          <p style={{ fontSize: "14px", color: "#1e1b4b", lineHeight: "1.6" }}>
            Certified that{" "}
            <span style={{ color: "#dc2626", fontWeight: 700 }}>Track/Signal/OHE</span>
            {" "}at above site has been made fit &amp; operational after availing the block.
          </p>
        </div>

        {/* Full audit history */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "4px", height: "24px", background: "#7c3aed", borderRadius: "2px" }} />
            <div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a2e" }}>Complete Block History</div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "1px" }}>From request creation through to current availing — review before closing</div>
            </div>
          </div>
          <AuditTrail block={block} myParticipant={myParticipant} />
        </div>

        {/* Confirm & Submit */}
        {!confirmed ? (
          <div style={{ maxWidth: "700px", margin: "0 auto", width: "calc(100% - 24px)" }}>
            <button
              onClick={() => setConfirmed(true)}
              style={{
                width: "100%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", border: "none",
                borderRadius: "16px", padding: "18px", fontWeight: 900, fontSize: "16px",
                cursor: "pointer", letterSpacing: "0.5px",
                boxShadow: "0 6px 20px rgba(79,70,229,0.4)",
              }}
            >
              ✓ Submit Block Closure
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: "700px", margin: "0 auto", width: "calc(100% - 24px)" }}>
            <div style={{ background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "12px", padding: "16px 18px", marginBottom: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚠️</div>
              <p style={{ fontWeight: 800, fontSize: "15px", color: "#991b1b", marginBottom: "4px" }}>
                Confirm Block Closure
              </p>
              <p style={{ fontSize: "13px", color: "#7f1d1d" }}>
                This is irreversible. The block will be marked closed pending SM acknowledgement.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSubmit}
                disabled={closeMut.isPending}
                style={{
                  flex: 1, background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", border: "none",
                  borderRadius: "14px", padding: "16px", fontWeight: 900, fontSize: "15px",
                  cursor: closeMut.isPending ? "not-allowed" : "pointer", opacity: closeMut.isPending ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(220,38,38,0.35)",
                }}
              >
                {closeMut.isPending ? "Submitting..." : "✓ Yes, Close Block"}
              </button>
              <button
                onClick={() => setConfirmed(false)}
                style={{
                  flex: 1, background: "#fff", color: "#374151", border: "2px solid #d1d5db",
                  borderRadius: "14px", padding: "16px", fontWeight: 700, fontSize: "15px", cursor: "pointer",
                }}
              >
                ← Go Back
              </button>
            </div>
          </div>
        )}

        {/* HOME / BACK */}
        <div style={{ maxWidth: "700px", margin: "24px auto 0", width: "calc(100% - 24px)", display: "flex", gap: "12px" }}>
          <button
            onClick={() => router.push("/avail-block")}
            style={{
              flex: 1, background: "#fce7f3", color: "#9d174d", border: "1.5px solid #f9a8d4",
              borderRadius: "22px", padding: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}
          >
            🏠 HOME
          </button>
          <button
            onClick={() => router.back()}
            style={{
              flex: 1, background: "#ede9fe", color: "#6d28d9", border: "1.5px solid #c4b5fd",
              borderRadius: "22px", padding: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}
          >
            &lt; BACK
          </button>
        </div>

      </div>
    </div>
  );
}
