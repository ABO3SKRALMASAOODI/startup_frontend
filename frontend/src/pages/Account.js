import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Modal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#111", border: "1px solid #333", borderRadius: "16px", padding: "2rem", maxWidth: "380px", width: "90%", textAlign: "center" }}>
        <p style={{ color: "#fff", fontSize: "1rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", background: "#222", border: "1px solid #333", borderRadius: "10px", color: "#aaa", cursor: "pointer", fontSize: "0.95rem" }}>Go Back</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#cc0000,#8b0000)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "0.95rem", fontWeight: 700 }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function Account() {
  const navigate = useNavigate();
  const email = localStorage.getItem("user_email") || "Not available";
  const storedName = localStorage.getItem("user_name") || email.split("@")[0] || "";
  const [name, setName] = useState(storedName);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [plan, setPlan] = useState(localStorage.getItem("user_plan") || "free");
  const [cancelling, setCancelling] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get("/auth/status/subscription").then(res => {
      const p = res.data.plan || "free";
      setPlan(p);
      localStorage.setItem("user_plan", p);
    }).catch(() => {});
  }, []);

  const showToast = (msg, color = "#4caf50") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancelSubscription = () => {
    if (plan === "free") return showToast("You don't have an active subscription.", "#ff4444");
    setModal({
      message: "Cancel your subscription? You'll keep access until the end of your billing period.",
      onConfirm: async () => {
        setModal(null);
        setCancelling(true);
        try {
          const res = await API.post("/paddle/cancel-subscription");
          showToast(res.data.message || "Subscription cancelled.");
          setPlan("free");
          localStorage.setItem("user_plan", "free");
        } catch (err) {
          showToast(err?.response?.data?.error || "Failed to cancel. Please try again.", "#ff4444");
        } finally { setCancelling(false); }
      }
    });
  };

  const handleLogout = () => {
    setModal({
      message: "Are you sure you want to log out?",
      onConfirm: () => { localStorage.clear(); navigate("/"); }
    });
  };

  const handleSaveName = () => {
    const trimmed = name.trim() || email.split("@")[0];
    localStorage.setItem("user_name", trimmed);
    setName(trimmed);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const planColors = { free: "#555", plus: "#8b0000", pro: "#cc0000", ultra: "#ff2020" };
  const planColor = planColors[plan] || "#555";

  return (
    <div style={pageLayout}>
      {modal && <Modal message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
      {toast && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "12px 24px", borderRadius: "10px", zIndex: 999, fontWeight: 600, fontSize: "0.9rem" }}>
          {toast.msg}
        </div>
      )}
      <div style={header}>
        <button onClick={() => navigate("/")} style={backBtnStyle} onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"} onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>← Back</button>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#fff", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>Account Settings</h2>
      </div>
      <div style={card}>
        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ background: planColor, color: "#fff", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 14px", borderRadius: "20px" }}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </span>
          <button onClick={() => navigate("/subscribe")} style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "#cc0000", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline" }}>
            {plan === "free" ? "Upgrade" : "Manage Plan"}
          </button>
        </div>
        <h3 style={sectionTitle}>Your Info</h3>
        <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
          <label style={{ fontSize: "0.78rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>Display Name</label>
          {editing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditing(false); }}
                style={{ ...inputStyle, margin: 0, flex: 1 }} placeholder="Your name" />
              <button onClick={handleSaveName} style={{ ...mainBtn, padding: "10px 18px", width: "auto" }}>Save</button>
              <button onClick={() => { setEditing(false); setName(storedName); }} style={{ ...secondaryBtn, padding: "10px 14px", width: "auto" }}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.05rem", color: "#fff" }}>{name || "—"}</span>
              <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "#ff4444", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Edit</button>
              {saved && <span style={{ fontSize: "0.78rem", color: "#4caf50" }}>Saved</span>}
            </div>
          )}
        </div>
        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
          <label style={{ fontSize: "0.78rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>Email</label>
          <span style={{ fontSize: "1.05rem", color: "#ccc", wordBreak: "break-word" }}>{email}</span>
        </div>
        <div style={btnGroup}>
          <button onClick={() => navigate("/studio")} style={mainBtn}>Go to Dashboard</button>
          <button onClick={() => navigate("/change-password")} style={secondaryBtn}>Change Password</button>
          <button onClick={() => navigate("/legal")} style={secondaryBtn}>Terms &amp; Policies</button>
          {plan !== "free" && (
            <button onClick={handleCancelSubscription} disabled={cancelling} style={secondaryBtn}>
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
          )}
          <button onClick={handleLogout} style={dangerBtn}>Log Out</button>
        </div>
      </div>
    </div>
  );
}

const pageLayout = { minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" };
const header = { width: "100%", backgroundColor: "#000", borderBottom: "1px solid #222", padding: "1rem 1.5rem", display: "flex", alignItems: "center", position: "relative" };
const backBtnStyle = { background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", padding: "6px 14px", fontSize: "0.85rem", cursor: "pointer", transition: "border-color 0.2s" };
const card = { width: "90%", maxWidth: "440px", backgroundColor: "#111", padding: "2rem", borderRadius: "16px", boxShadow: "0 0 20px rgba(0,0,0,0.6)", textAlign: "center", marginTop: "2rem" };
const sectionTitle = { marginBottom: "1.5rem", fontSize: "1.3rem" };
const inputStyle = { width: "100%", padding: "11px 14px", marginBottom: "14px", borderRadius: "8px", border: "1px solid #444", backgroundColor: "#222", color: "#fff", fontSize: "1rem", boxSizing: "border-box", outline: "none" };
const btnGroup = { display: "flex", flexDirection: "column", gap: "0.8rem" };
const mainBtn = { width: "100%", padding: "12px", background: "linear-gradient(135deg,#cc0000,#8b0000)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "1rem", cursor: "pointer", boxShadow: "0 0 14px rgba(180,0,0,0.3)" };
const secondaryBtn = { width: "100%", padding: "12px", backgroundColor: "#222", color: "#ccc", border: "1px solid #333", borderRadius: "10px", fontSize: "1rem", cursor: "pointer" };
const dangerBtn = { width: "100%", padding: "12px", backgroundColor: "transparent", color: "rgba(255,100,100,0.7)", border: "1px solid rgba(80,0,0,0.4)", borderRadius: "10px", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem", transition: "all 0.2s" };

export default Account;