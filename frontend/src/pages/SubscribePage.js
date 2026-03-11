import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red:        #C8102E;
    --red-dim:    #8B0B1F;
    --red-deep:   #3D0410;
    --red-glow:   rgba(200,16,46,0.18);
    --bg:         #080809;
    --surface:    #0D0D0F;
    --surface2:   #111114;
    --border:     rgba(255,255,255,0.055);
    --border-red: rgba(200,16,46,0.22);
    --text:       #F0EEE8;
    --text-muted: #5A5A62;
    --text-dim:   #2E2E35;
  }

  html { scroll-behavior: smooth; }

  body { background: var(--bg); color: var(--text); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes subtlePulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes countdownTick {
    0%  { transform: scaleY(1); }
    50% { transform: scaleY(0.92); }
    100%{ transform: scaleY(1); }
  }

  .plan-col {
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  .plan-col:hover { transform: translateY(-6px); }

  .cta-btn {
    transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.15s ease;
  }
  .cta-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }
  .cta-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .billing-pill {
    transition: background 0.25s ease, color 0.25s ease;
  }

  /* thin red underline accent */
  .accent-line {
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--red), transparent);
    transform-origin: left center;
    animation: lineGrow 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both;
  }

  /* noise overlay for depth */
  .noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .check-icon::before {
    content: '';
    display: inline-block;
    width: 5px; height: 9px;
    border-right: 1.5px solid var(--red);
    border-bottom: 1.5px solid var(--red);
    transform: rotate(45deg) translateY(-2px);
    margin-right: 10px;
    flex-shrink: 0;
    position: relative; top: -1px;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--red-dim); border-radius: 2px; }
`;

/* ─── PLAN DATA ──────────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Always free",
    price: 0,
    yearlyPrice: 0,
    monthlyCredits: 0,
    dailyCredits: 20,
    model: "HB-6",
    featured: false,
    perks: [
      "20 credits per day",
      "HB-6 model",
      "Live preview",
      "Basic app generation",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "Get started",
    price: 20,
    yearlyPrice: 216,
    monthlyCredits: 1000,
    dailyCredits: 20,
    model: "HB-6 + HB-6 Pro",
    featured: false,
    perks: [
      "1,000 credits per month",
      "20 daily bonus credits",
      "HB-6 and HB-6 Pro models",
      "Unlimited downloads",
      "All app types",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Most popular",
    price: 50,
    yearlyPrice: 540,
    monthlyCredits: 2400,
    dailyCredits: 20,
    model: "HB-6 + HB-6 Pro",
    featured: true,
    perks: [
      "2,400 credits per month",
      "20 daily bonus credits",
      "HB-6 and HB-6 Pro models",
      "Priority build queue",
      "Everything in Plus",
      "Email support",
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    tagline: "Full power",
    price: 100,
    yearlyPrice: 1080,
    monthlyCredits: 5000,
    dailyCredits: 20,
    model: "All models incl. HB-7",
    featured: false,
    hb7: true,
    perks: [
      "5,000 credits per month",
      "20 daily bonus credits",
      "All models including HB-7",
      "Advanced reasoning engine",
      "Everything in Pro",
      "Priority support",
    ],
  },
  {
    id: "titan",
    name: "Titan",
    tagline: "No ceiling",
    price: 200,
    yearlyPrice: 2160,
    monthlyCredits: 10000,
    dailyCredits: 20,
    model: "All models incl. HB-7",
    featured: false,
    hb7: true,
    perks: [
      "10,000 credits per month",
      "20 daily bonus credits",
      "All models including HB-7",
      "Top priority queue",
      "Everything in Ultra",
      "Early feature access",
      "Dedicated support",
    ],
  },
  {
    id: "ace",
    name: "Ace",
    tagline: "Enterprise-grade",
    price: 500,
    yearlyPrice: 5400,
    monthlyCredits: 30000,
    dailyCredits: 20,
    model: "All models incl. HB-7",
    featured: false,
    hb7: true,
    perks: [
      "30,000 credits per month",
      "20 daily bonus credits",
      "All models including HB-7",
      "Absolute top priority",
      "Everything in Titan",
      "Custom build requests",
      "White-glove support",
      "Direct line to the team",
    ],
  },
];

/* ─── COUNTDOWN ──────────────────────────────────────────────────────────── */
function Countdown({ secs: init }) {
  const [s, setS] = useState(init);
  useEffect(() => {
    if (s <= 0) return;
    const iv = setInterval(() => setS(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  if (!s) return null;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = n => String(n).padStart(2, "0");
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "16px",
      padding: "10px 24px",
      background: "rgba(200,16,46,0.06)",
      border: "1px solid var(--border-red)",
      borderRadius: "4px",
      marginBottom: "2.5rem",
    }}>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.72rem", fontWeight: 500,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--text-muted)",
      }}>
        50% off first month — ends in
      </span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.9rem", fontWeight: 500,
        color: "var(--red)",
        letterSpacing: "0.06em",
        animation: "countdownTick 1s ease infinite",
        display: "inline-block",
      }}>
        {pad(h)}:{pad(m)}:{pad(sec)}
      </span>
    </div>
  );
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
function Modal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "2.5rem",
        maxWidth: "400px", width: "90%",
        animation: "fadeUp 0.25s ease both",
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
          lineHeight: 1.75,
          marginBottom: "2rem",
        }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "12px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-muted)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "12px",
              background: "var(--red)",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "filter 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
            onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PLAN CARD ──────────────────────────────────────────────────────────── */
function PlanCard({ plan, isCurrent, isHigher, isSubscribed, loading, billing, promoEligible, onSubscribe, onChangePlan, onCancel, index }) {

  const getDisplayPrice = () => {
    if (!plan.price) return { main: 0, sub: null, strike: null };
    if (billing === "yearly") {
      return {
        main: Math.round(plan.yearlyPrice / 12),
        sub: `$${plan.yearlyPrice} billed annually`,
        strike: null,
      };
    }
    if (promoEligible) {
      return {
        main: Math.round(plan.price / 2),
        sub: `then $${plan.price}/mo`,
        strike: plan.price,
        promo: true,
      };
    }
    return { main: plan.price, sub: null, strike: null };
  };

  const dp = getDisplayPrice();

  const ctaLabel = () => {
    if (plan.id === "free") return isCurrent ? "Current plan" : "Always free";
    if (isCurrent) return "Cancel plan";
    if (loading === plan.id) return "Please wait...";
    if (isSubscribed) return isHigher ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`;
    return `Get ${plan.name}`;
  };

  const isFeatured = plan.featured;
  const isCurrentPaid = isCurrent && plan.id !== "free";
  const isFree = plan.id === "free";

  return (
    <div
      className="plan-col"
      style={{
        position: "relative",
        flex: "1 1 0",
        minWidth: "200px",
        maxWidth: "340px",
        background: isFeatured ? "var(--surface2)" : "var(--surface)",
        border: isCurrent
          ? "1px solid var(--red)"
          : isFeatured
            ? "1px solid var(--border-red)"
            : "1px solid var(--border)",
        borderRadius: "6px",
        padding: "2rem 1.6rem",
        display: "flex",
        flexDirection: "column",
        animation: `fadeUp 0.5s ease ${0.08 * index}s both`,
        boxShadow: isFeatured
          ? "0 0 60px rgba(200,16,46,0.08)"
          : "none",
      }}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div style={{
          position: "absolute",
          top: "-1px", left: "50%", transform: "translateX(-50%)",
          background: "var(--red)",
          color: "#fff",
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.14em",
          fontFamily: "'DM Mono', monospace",
          padding: "4px 16px",
          borderRadius: "0 0 4px 4px",
          whiteSpace: "nowrap",
        }}>
          MOST POPULAR
        </div>
      )}

      {/* Active badge */}
      {isCurrent && (
        <div style={{
          position: "absolute",
          top: "1rem", right: "1.2rem",
          background: "rgba(200,16,46,0.1)",
          border: "1px solid var(--border-red)",
          color: "var(--red)",
          fontSize: "0.55rem",
          fontWeight: 600,
          letterSpacing: "0.14em",
          fontFamily: "'DM Mono', monospace",
          padding: "3px 9px",
          borderRadius: "2px",
        }}>
          ACTIVE
        </div>
      )}

      {/* HB-7 tag */}
      {plan.hb7 && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "1.2rem",
          padding: "4px 10px",
          background: "rgba(200,16,46,0.07)",
          border: "1px solid var(--border-red)",
          borderRadius: "3px",
          width: "fit-content",
        }}>
          <div style={{
            width: "4px", height: "4px", borderRadius: "50%",
            background: "var(--red)",
            animation: "subtlePulse 2s ease infinite",
          }} />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.58rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            color: "var(--red)",
          }}>
            HB-7 INCLUDED
          </span>
        </div>
      )}

      {/* Name + tagline */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontWeight: 400,
          fontSize: "1.9rem",
          letterSpacing: "-0.01em",
          color: isFree ? "var(--text-dim)" : "var(--text)",
          lineHeight: 1.1,
          marginBottom: "4px",
        }}>
          {plan.name}
        </h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.78rem",
          color: isFree ? "var(--text-dim)" : "var(--text-muted)",
          fontStyle: "italic",
          fontWeight: 300,
        }}>
          {plan.tagline}
        </p>
      </div>

      {/* Price */}
      <div style={{ marginBottom: "1.6rem" }}>
        {dp.strike && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem",
            color: "var(--text-dim)",
            textDecoration: "line-through",
            marginRight: "6px",
          }}>
            ${dp.strike}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: isFree ? "2rem" : "2.6rem",
            fontWeight: 400,
            color: isFree ? "var(--text-dim)" : dp.promo ? "var(--red)" : "var(--text)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}>
            ${dp.main}
          </span>
          {!isFree && (
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              color: "var(--text-dim)",
              fontWeight: 400,
            }}>
              / mo
            </span>
          )}
        </div>
        {dp.sub && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.7rem",
            color: dp.promo ? "var(--red-dim)" : "var(--text-muted)",
            marginTop: "4px",
          }}>
            {dp.sub}
          </p>
        )}

        {/* Credits chip */}
        <div style={{
          marginTop: "10px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          background: isFree ? "transparent" : "rgba(200,16,46,0.06)",
          border: `1px solid ${isFree ? "var(--border)" : "var(--border-red)"}`,
          borderRadius: "3px",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.65rem",
            color: isFree ? "var(--text-dim)" : "var(--red)",
            letterSpacing: "0.04em",
          }}>
            {plan.monthlyCredits > 0
              ? `${plan.monthlyCredits.toLocaleString()} credits / mo`
              : "20 credits / day"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: "1px",
        background: isFeatured ? "var(--border-red)" : "var(--border)",
        marginBottom: "1.4rem",
      }} />

      {/* Model */}
      <div style={{ marginBottom: "1.2rem" }}>
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.58rem",
          letterSpacing: "0.14em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}>
          Model
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.8rem",
          color: isFree ? "var(--text-dim)" : "var(--text-muted)",
          fontWeight: 400,
        }}>
          {plan.model}
        </p>
      </div>

      {/* Perks */}
      <div style={{ flex: 1, marginBottom: "1.8rem" }}>
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.58rem",
          letterSpacing: "0.14em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}>
          Includes
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {plan.perks.map((perk, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0",
              }}
            >
              <span className="check-icon" style={{ flexShrink: 0 }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8rem",
                color: isFree ? "var(--text-dim)" : "var(--text-muted)",
                lineHeight: 1.5,
              }}>
                {perk}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {isCurrentPaid ? (
        <button
          className="cta-btn"
          onClick={onCancel}
          disabled={loading === "cancel"}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            color: "var(--text-dim)",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.82rem",
            fontWeight: 500,
            letterSpacing: "0.02em",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red-dim)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}
        >
          {loading === "cancel" ? "Cancelling..." : "Cancel plan"}
        </button>
      ) : isFree ? (
        <button disabled style={{
          width: "100%",
          padding: "12px",
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          color: "var(--text-dim)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.82rem",
          cursor: "default",
        }}>
          {isCurrent ? "Current plan" : "Always free"}
        </button>
      ) : (
        <button
          className="cta-btn"
          onClick={() => isSubscribed ? onChangePlan(plan.id) : onSubscribe(plan.id)}
          disabled={!!loading}
          style={{
            width: "100%",
            padding: "13px",
            background: isFeatured
              ? "var(--red)"
              : "transparent",
            border: isFeatured
              ? "none"
              : "1px solid var(--border-red)",
            borderRadius: "4px",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem",
            fontWeight: isFeatured ? 600 : 400,
            letterSpacing: "0.03em",
            opacity: loading ? 0.5 : 1,
            boxShadow: isFeatured ? "0 0 30px rgba(200,16,46,0.3)" : "none",
          }}
        >
          {ctaLabel()}
        </button>
      )}
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function SubscribePage() {
  const navigate = useNavigate();
  const [loading,        setLoading]        = useState(null);
  const [currentPlan,    setCurrentPlan]    = useState(localStorage.getItem("user_plan") || "free");
  const [modal,          setModal]          = useState(null);
  const [toast,          setToast]          = useState(null);
  const [billing,        setBilling]        = useState("monthly");
  const [promoEligible,  setPromoEligible]  = useState(false);
  const [promoSeconds,   setPromoSeconds]   = useState(0);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    API.get("/auth/status/subscription").then(r => {
      const p = r.data.plan || "free";
      setCurrentPlan(p);
      localStorage.setItem("user_plan", p);
    }).catch(() => {});
    API.get("/paddle/promo-status").then(r => {
      if (r.data.eligible) {
        setPromoEligible(true);
        setPromoSeconds(r.data.seconds_remaining || 0);
      }
    }).catch(() => {});
  }, []);

  const showToast = (msg, color = "#4caf50") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubscribe = async id => {
    setLoading(id);
    try {
      const r = await API.post("/paddle/create-checkout-session", {
        plan: id, billing, use_promo: promoEligible && billing === "monthly",
      });
      if (r.data.checkout_url) window.location.href = r.data.checkout_url;
      else showToast("Failed to get checkout link.", "#C8102E");
    } catch { showToast("Failed to start checkout.", "#C8102E"); }
    finally { setLoading(null); }
  };

  const doChangePlan = async id => {
    setLoading(id);
    try {
      const r = await API.post("/paddle/change-plan", { plan: id, billing });
      showToast(r.data.message);
    } catch (e) { showToast(e?.response?.data?.error || "Failed.", "#C8102E"); }
    finally { setLoading(null); }
  };

  const doCancel = async () => {
    setLoading("cancel");
    try {
      const r = await API.post("/paddle/cancel-subscription");
      showToast(r.data.message);
      setCurrentPlan("free");
      localStorage.setItem("user_plan", "free");
    } catch (e) { showToast(e?.response?.data?.error || "Failed.", "#C8102E"); }
    finally { setLoading(null); }
  };

  const currentIdx  = PLANS.findIndex(p => p.id === currentPlan);
  const isSubscribed = currentPlan !== "free";

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "'DM Sans', sans-serif",
      overflowX: "hidden",
    }}>
      <div className="noise" />

      {modal && (
        <Modal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", top: "20px", left: "50%",
          transform: "translateX(-50%)",
          background: toast.color,
          color: "#fff",
          padding: "10px 24px",
          borderRadius: "4px",
          zIndex: 9999,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: "0.84rem",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "toastIn 0.25s ease both",
        }}>
          {toast.msg}
        </div>
      )}

      {/* NAV */}
      <nav style={{
        padding: "0 2rem",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(8,8,9,0.92)",
        backdropFilter: "blur(20px)",
      }}>
        <button
          onClick={() => navigate("/studio")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 0",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Studio
        </button>

        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.7rem",
          fontWeight: 500,
          letterSpacing: "0.16em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
        }}>
          The Hustler Bot
        </span>

        <div style={{ width: "80px" }} />
      </nav>

      {/* HERO */}
      <header style={{
        textAlign: "center",
        padding: "5rem 2rem 3rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle radial */}
        <div style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "700px", height: "300px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(200,16,46,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-block",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.62rem",
          fontWeight: 500,
          letterSpacing: "0.22em",
          color: "var(--red)",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
          animation: "fadeUp 0.5s ease 0.05s both",
        }}>
          Plans &amp; Pricing
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
          color: "var(--text)",
          marginBottom: "1rem",
          animation: "fadeUp 0.5s ease 0.1s both",
        }}>
          Build at your scale.
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.95rem",
          color: "var(--text-muted)",
          fontWeight: 300,
          maxWidth: "400px",
          margin: "0 auto 2.5rem",
          lineHeight: 1.8,
          animation: "fadeUp 0.5s ease 0.14s both",
        }}>
          From free to enterprise — one platform,
          every tool you need to ship.
        </p>

        {promoEligible && promoSeconds > 0 && billing === "monthly" && (
          <div style={{ animation: "fadeUp 0.5s ease 0.18s both" }}>
            <Countdown secs={promoSeconds} />
          </div>
        )}

        {/* Billing toggle */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "4px",
          gap: "2px",
          animation: "fadeUp 0.5s ease 0.18s both",
        }}>
          {["monthly", "yearly"].map(b => (
            <button
              key={b}
              className="billing-pill"
              onClick={() => setBilling(b)}
              style={{
                padding: "7px 20px",
                borderRadius: "3px",
                border: "none",
                background: billing === b ? "var(--red)" : "transparent",
                color: billing === b ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8rem",
                fontWeight: billing === b ? 500 : 400,
                letterSpacing: "0.02em",
                transition: "background 0.2s ease, color 0.2s ease",
              }}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
              {b === "yearly" && (
                <span style={{
                  marginLeft: "7px",
                  fontSize: "0.6rem",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.08em",
                  color: billing === "yearly" ? "rgba(255,255,255,0.7)" : "var(--text-dim)",
                }}>
                  −10%
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* PLAN GRID */}
      <main style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "1rem 2rem 6rem",
      }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1px",
          justifyContent: "center",
          background: "var(--border)",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}>
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              isCurrent={currentPlan === plan.id}
              isHigher={i > currentIdx}
              isSubscribed={isSubscribed}
              loading={loading}
              billing={billing}
              promoEligible={promoEligible}
              onSubscribe={handleSubscribe}
              onChangePlan={id => {
                const name = PLANS.find(p => p.id === id)?.name;
                setModal({
                  message: `Switch to ${name}? Changes take effect at the start of your next billing cycle.`,
                  onConfirm: () => { setModal(null); doChangePlan(id); },
                });
              }}
              onCancel={() => setModal({
                message: "Cancel your subscription? You'll keep access until the end of your current billing period.",
                onConfirm: () => { setModal(null); doCancel(); },
              })}
            />
          ))}
        </div>
      </main>

      {/* FOOTER NOTE */}
      <footer style={{
        textAlign: "center",
        paddingBottom: "4rem",
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.58rem",
          color: "var(--text-dim)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}>
          Secured by Paddle &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; No hidden fees
        </span>
      </footer>
    </div>
  );
}