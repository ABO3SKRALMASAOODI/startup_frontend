import React from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function SubscribePage() {
  const navigate = useNavigate();

  const handlePaddleSubscribe = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first.");
    try {
      const res = await API.post("/paddle/create-checkout-session", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        alert("Failed to get checkout link.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout session.");
    }
  };

  // Return to studio — restores the session that was saved before navigating here
  const handleBack = () => navigate("/studio");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("seen_intro");
    navigate("/");
  };

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <button
          onClick={handleBack}
          style={S.backBtn}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}
        >
          ← Back
        </button>
        <h2 style={S.headerTitle}>The Hustler Bot</h2>
        {/* Spacer to keep title centred */}
        <div style={{ width: "70px" }} />
      </div>

      {/* Card */}
      <div style={S.cardWrap}>
        <div style={S.card}>

          {/* Badge */}
          <div style={S.badge}>Most Popular</div>

          <h1 style={S.cardTitle}>Unlock Full Access</h1>
          <p style={S.cardSubtitle}>
            Upgrade for <strong style={{ color: "#fff" }}>$20 / month</strong> and get{" "}
            <strong style={{ color: "#fff" }}>500 credits</strong> monthly — enough to build dozens of apps.
          </p>

          {/* Divider */}
          <div style={S.divider} />

          {/* Feature list */}
          <ul style={S.featureList}>
            {[
              ["500 credits / month", "vs 20 free daily"],
              ["Unlimited app builds", "with live preview"],
              ["Unlimited follow-up edits", "per project"],
              ["Download generated code", "anytime"],
              ["Priority support", "faster builds"],
              ["All future features", "automatically included"],
            ].map(([main, sub], i) => (
              <li key={i} style={S.featureItem}>
                <span style={S.checkmark}>✓</span>
                <span>
                  <span style={{ color: "#eee" }}>{main}</span>
                  <span style={{ color: "#555", marginLeft: "6px", fontSize: "0.82rem" }}>{sub}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handlePaddleSubscribe}
            style={S.subscribeBtn}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 0 36px rgba(200,0,0,0.65)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 0 22px rgba(180,0,0,0.4)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Subscribe Now — $20 / month
          </button>

          {/* Secondary actions */}
          <button
            onClick={handleBack}
            style={S.secondaryBtn}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#444"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#222"}
          >
            Back to Studio
          </button>

          <button
            onClick={handleLogout}
            style={S.logoutBtn}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}
          >
            Log Out
          </button>

        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "Segoe UI, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "0.85rem 1.25rem",
    background: "#000",
    borderBottom: "1px solid #1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.02em",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid #333",
    color: "#aaa",
    borderRadius: "8px",
    padding: "6px 14px",
    fontSize: "0.83rem",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  cardWrap: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2.5rem 1rem",
  },
  card: {
    maxWidth: "560px",
    width: "100%",
    backgroundColor: "#0d0d0d",
    padding: "2.5rem 2.75rem",
    borderRadius: "20px",
    boxShadow: "0 0 50px rgba(180,0,0,0.25)",
    border: "1px solid #1f0000",
    textAlign: "center",
    position: "relative",
  },
  badge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #cc0000, #8b0000)",
    color: "#fff",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "1.25rem",
    boxShadow: "0 0 12px rgba(180,0,0,0.4)",
  },
  cardTitle: {
    fontSize: "2rem",
    fontWeight: 800,
    marginBottom: "0.75rem",
    lineHeight: 1.2,
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: "1rem",
    color: "#888",
    marginBottom: "0",
    lineHeight: 1.6,
  },
  divider: {
    height: "1px",
    background: "#1a1a1a",
    margin: "1.75rem 0",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 2rem",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  featureItem: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    fontSize: "0.92rem",
    lineHeight: 1.5,
  },
  checkmark: {
    color: "#cc0000",
    fontWeight: 700,
    fontSize: "0.95rem",
    flexShrink: 0,
  },
  subscribeBtn: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #cc0000, #8b0000)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
    boxShadow: "0 0 22px rgba(180,0,0,0.4)",
    transition: "box-shadow 0.2s, transform 0.15s",
    marginBottom: "0.85rem",
  },
  secondaryBtn: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "1px solid #222",
    borderRadius: "12px",
    color: "#aaa",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "border-color 0.2s",
    marginBottom: "0.6rem",
  },
  logoutBtn: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    border: "none",
    color: "#555",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "color 0.2s",
  },
};