import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

/* ─── Plan definitions ─────────────────────────────────────────────────────── */

const PLANS = [
  {
    id: "free", name: "Free", price: 0, yearlyPrice: 0,
    monthly: 0, daily: 20,
    features: ["20 credits / day", "HB-6 model access", "Live preview", "Basic app generation"],
    badge: null, tag: null,
    color: "#444", glow: "rgba(100,100,100,0.2)", accent: "#666",
  },
  {
    id: "plus", name: "Plus", price: 20, yearlyPrice: 216,
    monthly: 1000, daily: 20,
    features: ["1,000 credits / month", "20 daily credits", "HB-6 + HB-6 Pro models", "Download code", "All app types"],
    badge: null, tag: null,
    color: "#8b0000", glow: "rgba(140,0,0,0.3)", accent: "#cc0000",
  },
  {
    id: "pro", name: "Pro", price: 50, yearlyPrice: 540,
    monthly: 2400, daily: 20,
    features: ["2,400 credits / month", "20 daily credits", "HB-6 + HB-6 Pro models", "Everything in Plus", "Priority builds"],
    badge: "Standard", tag: "Most Popular",
    color: "#cc0000", glow: "rgba(200,0,0,0.4)", accent: "#ff3333",
  },
  {
    id: "ultra", name: "Ultra", price: 100, yearlyPrice: 1080,
    monthly: 5000, daily: 20,
    features: ["5,000 credits / month", "20 daily credits", "All models including HB-7", "Everything in Pro", "Faster responses"],
    badge: null, tag: null,
    color: "#e03030", glow: "rgba(224,48,48,0.4)", accent: "#ff4444",
  },
  {
    id: "titan", name: "Titan", price: 200, yearlyPrice: 2160,
    monthly: 10000, daily: 20,
    features: ["10,000 credits / month", "20 daily credits", "All models including HB-7", "Everything in Ultra", "Priority support", "Early features"],
    badge: "Power", tag: null,
    color: "#ff4040", glow: "rgba(255,64,64,0.45)", accent: "#ff6666",
  },
  {
    id: "ace", name: "Ace", price: 500, yearlyPrice: 5400,
    monthly: 30000, daily: 20,
    features: ["30,000 credits / month", "20 daily credits", "All models including HB-7", "Everything in Titan", "Dedicated support", "Custom requests"],
    badge: "Elite", tag: "Unlimited Power",
    color: "#ff6020", glow: "rgba(255,96,32,0.5)", accent: "#ff8844",
  },
];

/* ─── Modal ────────────────────────────────────────────────────────────────── */

function Modal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#111", border: "1px solid #333", borderRadius: "16px",
        padding: "2rem", maxWidth: "380px", width: "90%", textAlign: "center",
      }}>
        <p style={{ color: "#fff", fontSize: "1rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px", background: "#222", border: "1px solid #333",
            borderRadius: "10px", color: "#aaa", cursor: "pointer", fontSize: "0.95rem",
          }}>Go Back</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px", background: "linear-gradient(135deg,#cc0000,#8b0000)",
            border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer",
            fontSize: "0.95rem", fontWeight: 700,
          }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Countdown timer ──────────────────────────────────────────────────────── */

function CountdownTimer({ secondsRemaining }) {
  const [secs, setSecs] = useState(secondsRemaining);
  const ref = useRef(null);

  useEffect(() => {
    setSecs(secondsRemaining);
    ref.current = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) { clearInterval(ref.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [secondsRemaining]);

  if (secs <= 0) return null;

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "6px", padding: "14px 20px",
      background: "linear-gradient(135deg, rgba(200,0,0,0.15), rgba(255,60,0,0.1))",
      border: "1px solid rgba(200,0,0,0.3)",
      borderRadius: "14px", marginBottom: "1.5rem",
      maxWidth: "540px", margin: "0 auto 1.5rem",
    }}>
      <span style={{ fontSize: "1.1rem", marginRight: "6px" }}>🔥</span>
      <span style={{ color: "#ff6644", fontSize: "0.88rem", fontWeight: 700 }}>
        50% OFF first month
      </span>
      <span style={{ color: "#666", fontSize: "0.82rem", margin: "0 4px" }}>—</span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "1rem", fontWeight: 700,
        color: "#fff",
        background: "rgba(200,0,0,0.2)",
        padding: "4px 10px",
        borderRadius: "8px",
        letterSpacing: "0.05em",
      }}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
      <span style={{ color: "#555", fontSize: "0.75rem", marginLeft: "4px" }}>remaining</span>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */

export default function SubscribePage() {
  const navigate = useNavigate();
  const [loading, setLoading]         = useState(null);
  const [currentPlan, setCurrentPlan] = useState(localStorage.getItem("user_plan") || "free");
  const [modal, setModal]             = useState(null);
  const [toast, setToast]             = useState(null);
  const [billing, setBilling]         = useState("monthly"); // "monthly" | "yearly"
  const [promoEligible, setPromoEligible] = useState(false);
  const [promoSeconds, setPromoSeconds]   = useState(0);

  useEffect(() => {
    API.get("/auth/status/subscription").then(res => {
      const plan = res.data.plan || "free";
      setCurrentPlan(plan);
      localStorage.setItem("user_plan", plan);
    }).catch(() => {});

    // Check 24h promo eligibility
    API.get("/paddle/promo-status").then(res => {
      if (res.data.eligible) {
        setPromoEligible(true);
        setPromoSeconds(res.data.seconds_remaining || 0);
      }
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
      const usePromo = promoEligible && billing === "monthly";
      const res = await API.post("/paddle/create-checkout-session", {
        plan: planId,
        billing,
        use_promo: usePromo,
      });
      if (res.data.checkout_url) window.location.href = res.data.checkout_url;
      else showToast("Failed to get checkout link.", "#ff4444");
    } catch {
      showToast("Failed to start checkout.", "#ff4444");
    } finally { setLoading(null); }
  };

  const doChangePlan = async (planId) => {
    setLoading(planId);
    try {
      const res = await API.post("/paddle/change-plan", { plan: planId, billing });
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
    const planName = PLANS.find(p => p.id === planId)?.name || planId;
    setModal({
      message: `Switch to ${planName} plan at your next billing cycle?`,
      onConfirm: () => { setModal(null); doChangePlan(planId); },
    });
  };

  const handleCancel = () => {
    setModal({
      message: "Cancel your subscription? You'll keep access until the end of your billing period.",
      onConfirm: () => { setModal(null); doCancel(); },
    });
  };

  const isSubscribed = currentPlan !== "free";
  const currentIdx   = PLANS.findIndex(p => p.id === currentPlan);

  const getDisplayPrice = (plan) => {
    if (plan.price === 0) return null;

    if (billing === "yearly") {
      const monthlyEquiv = Math.round(plan.yearlyPrice / 12);
      return { main: monthlyEquiv, suffix: "/mo", note: `$${plan.yearlyPrice} billed annually`, original: plan.price };
    }

    if (promoEligible) {
      const discounted = Math.round(plan.price / 2);
      return { main: discounted, suffix: "/mo", note: "then $" + plan.price + "/mo", original: plan.price, promo: true };
    }

    return { main: plan.price, suffix: "/mo", note: null, original: null };
  };

  return (
    <div style={S.page}>
      {modal && <Modal message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
          background: toast.color, color: "#fff", padding: "12px 24px", borderRadius: "10px",
          zIndex: 999, fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={S.header}>
        <button onClick={() => navigate("/studio")} style={S.backBtn}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
          ← Back
        </button>
        <h2 style={S.headerTitle}>The Hustler Bot</h2>
        <div style={{ width: "70px" }} />
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", padding: "2.5rem 1rem 1rem" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
          Choose Your Plan
        </h1>
        <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: "500px", margin: "0 auto" }}>
          Upgrade, downgrade, or cancel anytime. Changes take effect next billing cycle.
        </p>
      </div>

      {/* Billing toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "12px", margin: "1.5rem auto 0.5rem",
      }}>
        <span style={{ fontSize: "0.88rem", color: billing === "monthly" ? "#fff" : "#555", fontWeight: billing === "monthly" ? 700 : 400 }}>
          Monthly
        </span>
        <button
          onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
          style={{
            width: "52px", height: "28px",
            borderRadius: "14px", border: "none",
            background: billing === "yearly"
              ? "linear-gradient(135deg, #cc0000, #8b0000)"
              : "#222",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.3s",
            boxShadow: billing === "yearly" ? "0 0 12px rgba(200,0,0,0.4)" : "none",
          }}
        >
          <div style={{
            width: "22px", height: "22px",
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: "3px",
            left: billing === "yearly" ? "27px" : "3px",
            transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }} />
        </button>
        <span style={{ fontSize: "0.88rem", color: billing === "yearly" ? "#fff" : "#555", fontWeight: billing === "yearly" ? 700 : 400 }}>
          Yearly
        </span>
        {billing === "yearly" && (
          <span style={{
            fontSize: "0.72rem", fontWeight: 700,
            color: "#4caf50",
            background: "rgba(76,175,80,0.12)",
            border: "1px solid rgba(76,175,80,0.3)",
            padding: "3px 10px",
            borderRadius: "20px",
          }}>
            Save 10%
          </span>
        )}
      </div>

      {/* 24h Promo countdown */}
      {promoEligible && promoSeconds > 0 && billing === "monthly" && (
        <div style={{ marginTop: "1rem" }}>
          <CountdownTimer secondsRemaining={promoSeconds} />
        </div>
      )}

      {/* Plan cards */}
      <div style={S.grid}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const planIdx   = PLANS.findIndex(p => p.id === plan.id);
          const isHigher  = planIdx > currentIdx;
          const pricing   = getDisplayPrice(plan);

          return (
            <div key={plan.id} style={{
              ...S.card,
              border: isCurrent ? `1.5px solid ${plan.color}` : "1px solid #1a1a1a",
              boxShadow: isCurrent ? `0 0 40px ${plan.glow}` : "0 2px 20px rgba(0,0,0,0.4)",
            }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                {isCurrent && (
                  <span style={{ ...S.badge, background: "#1a1a1a", color: "#aaa", border: "1px solid #444" }}>
                    Current Plan
                  </span>
                )}
                {plan.tag && !isCurrent && (
                  <span style={{ ...S.badge, background: `linear-gradient(135deg, ${plan.color}, #4a0000)` }}>
                    {plan.tag}
                  </span>
                )}
                {plan.badge && !isCurrent && (
                  <span style={{
                    ...S.badge,
                    background: "rgba(255,255,255,0.06)",
                    color: plan.accent,
                    border: `1px solid ${plan.color}40`,
                  }}>
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Plan name */}
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: "0.3rem 0 0.2rem" }}>
                {plan.name}
              </h2>

              {/* Pricing */}
              {pricing ? (
                <div style={{ marginBottom: "0.2rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    {pricing.original && (
                      <span style={{
                        fontSize: "1.1rem", color: "#555", fontWeight: 400,
                        textDecoration: "line-through", marginRight: "6px",
                      }}>
                        ${pricing.original}
                      </span>
                    )}
                    <span style={{ fontSize: "2rem", fontWeight: 900, color: "#fff" }}>
                      ${pricing.main}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "#666", fontWeight: 400 }}>
                      {pricing.suffix}
                    </span>
                  </div>
                  {pricing.note && (
                    <p style={{
                      fontSize: "0.75rem", color: pricing.promo ? "#ff6644" : "#555",
                      margin: "2px 0 0", fontWeight: pricing.promo ? 600 : 400,
                    }}>
                      {pricing.note}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#555", marginBottom: "0.2rem" }}>
                  Free
                </div>
              )}

              <div style={{ fontSize: "0.8rem", color: "#555", marginBottom: "1.2rem" }}>
                {plan.monthly > 0
                  ? `${plan.monthly.toLocaleString()} monthly credits`
                  : "20 daily credits only"}
              </div>

              {/* Features */}
              <ul style={S.featureList}>
                {plan.features.map((f, i) => (
                  <li key={i} style={S.featureItem}>
                    <span style={{ color: plan.accent, fontSize: "0.8rem" }}>✓</span>
                    <span style={{ color: "#ccc", fontSize: "0.84rem" }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                plan.id !== "free" ? (
                  <button onClick={handleCancel} disabled={loading === "cancel"}
                    style={{ ...S.btn, background: "transparent", border: "1px solid #333", color: "#666" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
                    {loading === "cancel" ? "Cancelling..." : "Cancel Plan"}
                  </button>
                ) : (
                  <button style={{ ...S.btn, background: "transparent", border: "1px solid #1a1a1a", color: "#444", cursor: "default" }}>
                    Your default
                  </button>
                )
              ) : plan.id === "free" ? (
                <button style={{ ...S.btn, background: "transparent", border: "1px solid #1a1a1a", color: "#444", cursor: "default" }}>
                  Your default
                </button>
              ) : isSubscribed ? (
                <button onClick={() => handleChangePlan(plan.id)} disabled={!!loading}
                  style={{
                    ...S.btn,
                    background: `linear-gradient(135deg, ${plan.color}, #4a0000)`,
                    boxShadow: `0 0 20px ${plan.glow}`,
                  }}>
                  {loading === plan.id ? "Processing..." : isHigher ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                </button>
              ) : (
                <button onClick={() => handleSubscribe(plan.id)} disabled={!!loading}
                  style={{
                    ...S.btn,
                    background: `linear-gradient(135deg, ${plan.color}, #4a0000)`,
                    boxShadow: `0 0 20px ${plan.glow}`,
                  }}>
                  {loading === plan.id ? "Loading..." : `Get ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ height: "3rem" }} />
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" },
  header: {
    padding: "0.85rem 1.25rem", borderBottom: "1px solid #1a1a1a",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" },
  backBtn: {
    background: "transparent", border: "1px solid #333", color: "#aaa",
    borderRadius: "8px", padding: "6px 14px", fontSize: "0.83rem",
    cursor: "pointer", transition: "border-color 0.2s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem", maxWidth: "1400px",
    margin: "1rem auto 0", padding: "1rem 1.5rem 3rem",
  },
  card: {
    background: "#0a0a0a", borderRadius: "16px", padding: "1.5rem 1.4rem",
    display: "flex", flexDirection: "column", position: "relative",
    transition: "box-shadow 0.3s, border-color 0.3s",
  },
  badge: {
    display: "inline-block", fontSize: "0.62rem", fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "3px 9px", borderRadius: "20px", color: "#fff",
  },
  featureList: {
    listStyle: "none", padding: 0, margin: "0 0 1.2rem",
    display: "flex", flexDirection: "column", gap: "7px", flex: 1,
  },
  featureItem: { display: "flex", gap: "7px", alignItems: "baseline" },
  btn: {
    width: "100%", padding: "12px", border: "none", borderRadius: "10px",
    color: "#fff", fontSize: "0.9rem", fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.2s, box-shadow 0.2s", marginTop: "auto",
  },
};