export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "24px",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "48px 40px",
        textAlign: "center",
        maxWidth: "480px",
        width: "100%",
      }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛤️</div>
        <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: 800, margin: "0 0 8px" }}>
          Feature Update in Progress
        </h1>
        <p style={{ color: "#fbbf24", fontSize: "13px", fontWeight: 600, margin: "0 0 24px", letterSpacing: "2px", textTransform: "uppercase" }}>
          Southern Railway — RBMS
        </p>
        <div style={{ width: "60px", height: "3px", background: "#fbbf24", borderRadius: "2px", margin: "0 auto 24px" }} />
        <p style={{ color: "#cbd5e1", fontSize: "15px", lineHeight: 1.7, margin: "0 0 12px" }}>
          We are rolling out a new feature update and improving server speed and efficiency for the Railway Block Management System. The app will be briefly unavailable during this time.
        </p>
        <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: "0 0 32px" }}>
          We will be back online within <strong style={{ color: "#fbbf24" }}>25–30 minutes</strong>. Thank you for your patience.
        </p>
        <div style={{
          background: "rgba(251,191,36,0.1)",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: "10px",
          padding: "12px 20px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24" }} />
          <span style={{ color: "#fbbf24", fontSize: "13px", fontWeight: 600 }}>Update in progress</span>
        </div>
      </div>
    </div>
  );
}
