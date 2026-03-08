import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const PLANS = [
  { id: "free", name: "Free", price: 0, monthly: 0, daily: 20, features: ["20 credits / day", "Live preview", "Basic app generation"], badge: null, color: "#333", glow: "rgba(100,100,100,0.3)" },
  { id: "plus", name: "Plus", price: 20, monthly: 1000, daily: 20, features: ["1,000 credits / month", "20 daily credits", "Live preview", "Download code", "All app types"], badge: "Popular", color: "#8b0000", glow: "rgba(180,0,0,0.4)" },
  { id: "pro", name: "Pro", price: 50, monthly: 2400, daily: 20, features: ["2,400 credits / month", "20 daily credits", "Everything in Plus", "Priority builds", "Faster responses"], badge: "Best Value", color: "#cc0000", glow: "rgba(220,0,0,0.5)" },
  { id: "ultra", name: "Ultra", price: 100, monthly: 5000, daily: 20, features: ["5,000 credits / month", "20 daily credits", "Everything in Pro", "Priority support", "Early access to features"], badge: "Power User", color: "#ff2020", glow: "rgba(255,30,30,0.55)" },
];

function Modal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
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

export default function SubscribePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(localStorage.getItem("user_plan") || "free");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get("/auth/status/subscription").then(res => {
      const plan = res.data.plan || "free";
      setCurrentPlan(plan);
      localStorage.setItem("user_plan", plan);
    }).catch(() => {});
  }, []);

  const showToast = (msg, color = "#4caf50") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubscribe = async (planId) => {
    if (planId === "free") return;
    setLoading(planId);
    try {
      const res = await API.post("/paddle/create-checkout-session", { plan: planId });
      if (res.data.checkout_url) window.location.href = res.data.checkout_url;
      else showToast("Failed to get checkout link.", "#ff4444");
    } catch {
      showToast("Failed to start checkout.", "#ff4444");
    } finally { setLoading(null); }
  };

  const doChangePlan = async (planId) => {
    setLoading(planId);
    try {
      const res = await API.post("/paddle/change-plan", { plan: planId });
      showToast(res.data.message);
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to change plan.", "#ff4444");
    } finally { setLoading(null); }
  };

  const doCancel = async () => {
    setLoading("cancel");
    try {
      const res = await API.post("/paddle/cancel-subscription");
      showToast(res.data.message);
      setCurrentPlan("free");
      localStorage.setItem("user_plan", "free");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to cancel.", "#ff4444");
    } finally { setLoading(null); }
  };

  const handleChangePlan = (planId) => {
    setModal({ message: `Switch to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan at your next billing cycle?`, onConfirm: () => { setModal(null); doChangePlan(planId); } });
  };

  const handleCancel = () => {
    setModal({ message: "Cancel your subscription? You'll keep access until the end of your billing period.", onConfirm: () => { setModal(null); doCancel(); } });
  };

  const isSubscribed = currentPlan !== "free";
  const currentIdx = PLANS.findIndex(p => p.id === currentPlan);

  return (
    <div style={S.page}>
      {modal && <Modal message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
      {toast && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "12px 24px", borderRadius: "10px", zIndex: 999, fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}

      <div style={S.header}>
        <button onClick={() => navigate("/studio")} style={S.backBtn} onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"} onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>← Back</button>
        <h2 style={S.headerTitle}>The Hustler Bot</h2>
        <div style={{ width: "70px" }} />
      </div>

      <div style={{ textAlign: "center", padding: "3rem 1rem 1.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>Choose Your Plan</h1>
        <p style={{ color: "#666", fontSize: "1rem" }}>Upgrade, downgrade, or cancel anytime. Changes take effect next billing cycle.</p>
      </div>

      <div style={S.grid}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const planIdx = PLANS.findIndex(p => p.id === plan.id);
          const isHigher = planIdx > currentIdx;

          return (
            <div key={plan.id} style={{ ...S.card, border: isCurrent ? `1.5px solid ${plan.color}` : "1px solid #1a1a1a", boxShadow: isCurrent ? `0 0 40px ${plan.glow}` : "0 2px 20px rgba(0,0,0,0.4)" }}>
              {plan.badge && !isCurrent && (
                <div style={{ ...S.badge, background: `linear-gradient(135deg, ${plan.color}, #4a0000)` }}>{plan.badge}</div>
              )}
              {isCurrent && (
                <div style={{ ...S.badge, background: "#1a1a1a", color: "#aaa", border: "1px solid #444" }}>Current Plan</div>
              )}

              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: "0.5rem 0 0.25rem" }}>{plan.name}</h2>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: plan.price === 0 ? "#555" : "#fff", marginBottom: "0.25rem" }}>
                {plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price > 0 && <span style={{ fontSize: "1rem", color: "#666", fontWeight: 400 }}> / mo</span>}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "1.5rem" }}>
                {plan.monthly > 0 ? `${plan.monthly.toLocaleString()} monthly credits` : "20 daily credits only"}
              </div>

              <ul style={S.featureList}>
                {plan.features.map((f, i) => (
                  <li key={i} style={S.featureItem}>
                    <span style={{ color: plan.color === "#333" ? "#555" : plan.color }}>✓</span>
                    <span style={{ color: "#ccc", fontSize: "0.88rem" }}>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                plan.id !== "free" ? (
                  <button onClick={handleCancel} disabled={loading === "cancel"} style={{ ...S.btn, background: "transparent", border: "1px solid #333", color: "#666" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
                    {loading === "cancel" ? "Cancelling..." : "Cancel Plan"}
                  </button>
                ) : (
                  <button style={{ ...S.btn, background: "transparent", border: "1px solid #1a1a1a", color: "#444", cursor: "default" }}>Your default</button>
                )
              ) : plan.id === "free" ? (
                <button style={{ ...S.btn, background: "transparent", border: "1px solid #1a1a1a", color: "#444", cursor: "default" }}>Your default</button>
              ) : isSubscribed ? (
                <button onClick={() => handleChangePlan(plan.id)} disabled={!!loading}
                  style={{ ...S.btn, background: `linear-gradient(135deg, ${plan.color}, #4a0000)`, boxShadow: `0 0 20px ${plan.glow}` }}>
                  {loading === plan.id ? "Processing..." : isHigher ? `Upgrade to ${plan.name}` : `Downgrade to ${plan.name}`}
                </button>
              ) : (
                <button onClick={() => handleSubscribe(plan.id)} disabled={!!loading}
                  style={{ ...S.btn, background: `linear-gradient(135deg, ${plan.color}, #4a0000)`, boxShadow: `0 0 20px ${plan.glow}` }}>
                  {loading === plan.id ? "Loading..." : `Get ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Problem 5 fix: logout button removed from subscription page */}
      <div style={{ height: "3rem" }} />
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" },
  header: { padding: "0.85rem 1.25rem", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" },
  backBtn: { background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", padding: "6px 14px", fontSize: "0.83rem", cursor: "pointer", transition: "border-color 0.2s" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto", padding: "1rem 1.5rem 3rem" },
  card: { background: "#0a0a0a", borderRadius: "18px", padding: "2rem 1.75rem", display: "flex", flexDirection: "column", position: "relative" },
  badge: { display: "inline-block", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "20px", marginBottom: "0.5rem", color: "#fff", alignSelf: "flex-start" },
  featureList: { listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  featureItem: { display: "flex", gap: "8px", alignItems: "baseline" },
  btn: { width: "100%", padding: "13px", border: "none", borderRadius: "11px", color: "#fff", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s", marginTop: "auto" },
};