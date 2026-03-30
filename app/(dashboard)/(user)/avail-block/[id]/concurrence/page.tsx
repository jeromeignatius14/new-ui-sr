"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGetAvailRequestById } from "@/app/service/query/avail";
import { useSubmitAvailConcurrence } from "@/app/service/mutation/avail";
import { Toaster } from "react-hot-toast";

function fmtDt(dt?: string | null) {
  if (!dt) return "—";
  try {
    const iso = new Date(dt).toISOString();
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}-${m}-${y} ${iso.slice(11, 16)}`;
  } catch { return "—"; }
}

export default function ConcurrencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const userDept = session?.user?.department ?? "";

  const { data, isLoading, refetch } = useGetAvailRequestById(id);
  const concurrenceMut = useSubmitAvailConcurrence();

  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [done, setDone] = useState<"accepted" | "rejected" | null>(null);

  const block = data?.data;

  function handleAccept() {
    concurrenceMut.mutate(
      { requestId: id, accept: true, userDepartment: userDept },
      {
        onSuccess: () => { refetch(); setDone("accepted"); },
      }
    );
  }

  function handleReject() {
    if (!rejectReason.trim()) return;
    concurrenceMut.mutate(
      { requestId: id, accept: false, remarks: rejectReason.trim(), userDepartment: userDept },
      {
        onSuccess: () => { refetch(); setDone("rejected"); },
      }
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "14px",
    border: "2px solid #16a34a",
    padding: "18px 20px",
    maxWidth: "520px",
    width: "100%",
    margin: "0 auto",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    padding: "8px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    color: "#6b7280",
    fontWeight: 600,
    fontSize: "13px",
    minWidth: "120px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#c8f0c8", fontFamily: "Arial, sans-serif" }}>
      <Toaster position="top-center" />

      {/* RBMS header */}
      <div style={{ background: "#fef08a", padding: "12px 16px", textAlign: "center" }}>
        <span style={{ fontSize: "30px", fontWeight: 900, color: "#7c3aed", letterSpacing: "3px" }}>RBMS</span>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>

        {/* Page title */}
        <div style={{
          background: "#dc2626", color: "#fff", borderRadius: "10px",
          padding: "12px 28px", fontWeight: 900, fontSize: "18px",
          letterSpacing: "1px", textAlign: "center", width: "100%", maxWidth: "520px",
        }}>
          ⚡ CONCURRENCE REQUIRED
        </div>

        <p style={{ textAlign: "center", fontWeight: 700, fontSize: "13px", color: "#374151", margin: 0 }}>
          Dept: <strong>{userDept}</strong> — review and submit your concurrence for this availing block
        </p>

        {isLoading && (
          <div style={{ padding: "40px", fontWeight: 800, fontSize: "16px", textAlign: "center", color: "#111827" }}>Loading…</div>
        )}

        {!isLoading && !block && (
          <div style={{ padding: "40px", color: "#dc2626", fontWeight: 800 }}>Block not found.</div>
        )}

        {!isLoading && block && (
          <>
            {/* Block details card */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 900, fontSize: "16px", color: "#065f46", marginBottom: "12px", textAlign: "center" }}>
                Block Details — {(block as any).divisionId ?? id.slice(0, 8)}
              </div>

              <div style={rowStyle}>
                <span style={labelStyle}>Section</span>
                <span>{block.selectedSection ?? "—"}</span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Mission Block</span>
                <span>{block.missionBlock ?? "—"}</span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Work Type</span>
                <span>{block.workType ?? "—"}</span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Activity</span>
                <span>{block.activity ?? "—"}</span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Sanctioned From</span>
                <span>{fmtDt((block as any).grantedFromTime ?? (block as any).sanctionedTimeFrom)}</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <span style={labelStyle}>Sanctioned To</span>
                <span>{fmtDt((block as any).grantedToTime ?? (block as any).sanctionedTimeTo)}</span>
              </div>
            </div>

            {/* Done banner */}
            {done === "accepted" && (
              <div style={{
                background: "#dcfce7", border: "2px solid #16a34a", borderRadius: "10px",
                padding: "16px 20px", maxWidth: "520px", width: "100%", textAlign: "center",
                fontWeight: 900, fontSize: "16px", color: "#15803d",
              }}>
                ✅ Concurrence Submitted — Block Approved by your dept
              </div>
            )}

            {done === "rejected" && (
              <div style={{
                background: "#fee2e2", border: "2px solid #dc2626", borderRadius: "10px",
                padding: "16px 20px", maxWidth: "520px", width: "100%", textAlign: "center",
                fontWeight: 900, fontSize: "16px", color: "#991b1b",
              }}>
                ❌ Concurrence Rejected — Availing will be cancelled
              </div>
            )}

            {/* Action buttons */}
            {!done && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px", width: "100%" }}>
                {/* Accept button */}
                <button
                  onClick={handleAccept}
                  disabled={concurrenceMut.isPending}
                  style={{
                    background: "#16a34a", color: "#fff", border: "none", borderRadius: "40px",
                    padding: "16px", fontWeight: 900, fontSize: "17px", cursor: "pointer",
                    width: "100%", opacity: concurrenceMut.isPending ? 0.7 : 1,
                    boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
                  }}
                >
                  {concurrenceMut.isPending ? "Submitting…" : "✅ Submit Block — Give Concurrence"}
                </button>

                {/* Reject toggle */}
                {!showReject && (
                  <button
                    onClick={() => setShowReject(true)}
                    style={{
                      background: "#fff", color: "#dc2626", border: "2px solid #dc2626",
                      borderRadius: "40px", padding: "14px", fontWeight: 900, fontSize: "15px",
                      cursor: "pointer", width: "100%",
                    }}
                  >
                    Reject Concurrence
                  </button>
                )}

                {/* Reject form */}
                {showReject && (
                  <div style={{
                    background: "#fff", border: "2px solid #dc2626", borderRadius: "12px",
                    padding: "16px", display: "flex", flexDirection: "column", gap: "10px",
                  }}>
                    <label style={{ fontWeight: 800, fontSize: "14px", color: "#991b1b" }}>
                      Reason for Rejection (required)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Enter reason for rejecting concurrence…"
                      style={{
                        width: "100%", border: "1.5px solid #fca5a5", borderRadius: "8px",
                        padding: "10px", fontSize: "14px", fontWeight: 600, resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => { setShowReject(false); setRejectReason(""); }}
                        style={{
                          flex: 1, background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db",
                          borderRadius: "8px", padding: "10px", fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={!rejectReason.trim() || concurrenceMut.isPending}
                        style={{
                          flex: 2, background: "#dc2626", color: "#fff", border: "none",
                          borderRadius: "8px", padding: "10px", fontWeight: 900, cursor: "pointer",
                          opacity: !rejectReason.trim() || concurrenceMut.isPending ? 0.5 : 1,
                          fontSize: "14px",
                        }}
                      >
                        {concurrenceMut.isPending ? "Submitting…" : "Confirm Rejection"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Back button */}
        <button
          onClick={() => router.push("/avail-block")}
          style={{
            background: "#fff", border: "2px solid #374151", borderRadius: "8px",
            padding: "12px 40px", fontWeight: 900, fontSize: "16px",
            cursor: "pointer", color: "#000", marginTop: "8px",
          }}
        >
          &lt; BACK
        </button>
      </div>
    </div>
  );
}
