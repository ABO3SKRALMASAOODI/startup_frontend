import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

/* ────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
──────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

  @keyframes riseIn {
    0%   { opacity: 0; transform: translateY(40px) scale(0.97); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes shimmerDrift {
    0%   { background-position: 200% 50%; }
    100% { background-position: -200% 50%; }
  }
  @keyframes fireFlicker {
    0%, 100% { opacity: 1; transform: scaleY(1); }
    33%      { opacity: 0.8; transform: scaleY(1.05); }
    66%      { opacity: 0.9; transform: scaleY(0.96); }
  }
  @keyframes badgePop {
    0%   { transform: scale(0.6) rotate(-8deg); opacity: 0; }
    70%  { transform: scale(1.1) rotate(2deg);  opacity: 1; }
    100% { transform: scale(1) rotate(0deg);    opacity: 1; }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.6; }
    50%      { opacity: 1; }
  }
  @keyframes orb {
    0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
    50%  { transform: translate(-50%, -50%) scale(1.15); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
  }

  .plan-card-wrap {
    transition: transform 0.35s cubic-bezier(0.2,0,0,1);
  }
  .plan-card-wrap:hover { transform: translateY(-9px); }
  .plan-card-wrap.is-featured:hover { transform: translateY(-14px); }

  .cta-btn-anim {
    transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.2s ease;
  }
  .cta-btn-anim:hover:not(:disabled) {
    transform: scale(1.04);
    filter: brightness(1.1);
  }
  .cta-btn-anim:active:not(:disabled) { transform: scale(0.97); }
`;

/* ────────────────────────────────────────────────────────────────────────────
   PLAN DATA
──────────────────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "free", name: "Free", subtitle: "Zero cost, always",
    price: 0, yearlyPrice: 0, monthlyCredits: 0, dailyCredits: 20,
    models: [
      { name: "HB-6", color: "#4caf50", dot: "#4caf50", desc: "Fast & capable", star: false },
    ],
    perks: [
      { icon: "⚡", label: "20 credits / day" },
      { icon: "🤖", label: "HB-6 model" },
      { icon: "👁", label: "Live preview" },
      { icon: "📦", label: "Basic app generation" },
    ],
    tier: 0, featured: false,
    accent: "#1e1e1e", accentBright: "#2a2a2a",
    glow: "transparent", glowBright: "transparent",
    bg: "#070707", border: "#111", borderHover: "#1e1e1e",
    topLabel: null, ctaText: "Start Free", ctaKind: "ghost",
    chipBg: "rgba(255,255,255,0.02)", chipBorder: "#111",
    modelBg: "rgba(255,255,255,0.02)", modelBorder: "rgba(76,175,80,0.1)",
  },
  {
    id: "plus", name: "Plus", subtitle: "Get building",
    price: 20, yearlyPrice: 216, monthlyCredits: 1000, dailyCredits: 20,
    models: [
      { name: "HB-6",     color: "#4caf50", dot: "#4caf50", desc: "Fast & capable",   star: false },
      { name: "HB-6 Pro", color: "#cc0000", dot: "#cc0000", desc: "Smarter reasoning", star: false },
    ],
    perks: [
      { icon: "⚡", label: "1,000 credits / month" },
      { icon: "＋", label: "20 daily bonus credits" },
      { icon: "🤖", label: "HB-6 + HB-6 Pro" },
      { icon: "⬇", label: "Unlimited downloads" },
      { icon: "🧩", label: "All app types" },
    ],
    tier: 1, featured: false,
    accent: "#5a0000", accentBright: "#8b0000",
    glow: "rgba(139,0,0,0.15)", glowBright: "rgba(139,0,0,0.4)",
    bg: "linear-gradient(160deg,#0e0000,#070000)",
    border: "#1e0000", borderHover: "#440000",
    topLabel: null, ctaText: "Get Plus →", ctaKind: "solid",
    chipBg: "rgba(139,0,0,0.08)", chipBorder: "rgba(139,0,0,0.2)",
    modelBg: "rgba(139,0,0,0.06)", modelBorder: "rgba(139,0,0,0.15)",
  },
  {
    id: "pro", name: "Pro", subtitle: "The serious builder",
    price: 50, yearlyPrice: 540, monthlyCredits: 2400, dailyCredits: 20,
    models: [
      { name: "HB-6",     color: "#4caf50", dot: "#4caf50", desc: "Fast & capable",   star: false },
      { name: "HB-6 Pro", color: "#cc0000", dot: "#dd2222", desc: "Smarter reasoning", star: false },
    ],
    perks: [
      { icon: "⚡", label: "2,400 credits / month" },
      { icon: "＋", label: "20 daily bonus credits" },
      { icon: "🤖", label: "HB-6 + HB-6 Pro" },
      { icon: "🚀", label: "Priority build queue" },
      { icon: "✓",  label: "Everything in Plus" },
      { icon: "💬", label: "Email support" },
    ],
    tier: 2, featured: true,
    accent: "#900000", accentBright: "#cc0000",
    glow: "rgba(200,0,0,0.25)", glowBright: "rgba(200,0,0,0.55)",
    bg: "linear-gradient(160deg,#160000,#0b0000)",
    border: "#380000", borderHover: "#770000",
    topLabel: "MOST POPULAR", ctaText: "Get Pro →", ctaKind: "solid",
    chipBg: "rgba(200,0,0,0.1)", chipBorder: "rgba(200,0,0,0.25)",
    modelBg: "rgba(200,0,0,0.07)", modelBorder: "rgba(200,0,0,0.2)",
  },
  {
    id: "ultra", name: "Ultra", subtitle: "Unlock HB-7",
    price: 100, yearlyPrice: 1080, monthlyCredits: 5000, dailyCredits: 20,
    models: [
      { name: "HB-6",     color: "#4caf50", dot: "#4caf50", desc: "Fast & capable",    star: false },
      { name: "HB-6 Pro", color: "#cc0000", dot: "#dd2222", desc: "Smarter reasoning",  star: false },
      { name: "HB-7",     color: "#ff7722", dot: "#ff7722", desc: "Most powerful model", star: true },
    ],
    perks: [
      { icon: "⚡", label: "5,000 credits / month" },
      { icon: "＋", label: "20 daily bonus credits" },
      { icon: "★",  label: "ALL 3 models incl. HB-7" },
      { icon: "🧠", label: "Advanced reasoning engine" },
      { icon: "✓",  label: "Everything in Pro" },
      { icon: "🔒", label: "Priority support" },
    ],
    tier: 3, featured: false,
    accent: "#a82000", accentBright: "#e03030",
    glow: "rgba(224,48,48,0.25)", glowBright: "rgba(224,48,48,0.6)",
    bg: "linear-gradient(160deg,#1a0200,#0d0100)",
    border: "#540a00", borderHover: "#aa2000",
    topLabel: "HB-7 UNLOCKED", ctaText: "Get Ultra →", ctaKind: "solid",
    chipBg: "rgba(224,48,48,0.1)", chipBorder: "rgba(224,48,48,0.25)",
    modelBg: "rgba(224,48,48,0.07)", modelBorder: "rgba(224,48,48,0.2)",
  },
  {
    id: "titan", name: "Titan", subtitle: "Power without a ceiling",
    price: 200, yearlyPrice: 2160, monthlyCredits: 10000, dailyCredits: 20,
    models: [
      { name: "HB-6",     color: "#4caf50", dot: "#4caf50", desc: "Fast & capable",    star: false },
      { name: "HB-6 Pro", color: "#cc0000", dot: "#dd2222", desc: "Smarter reasoning",  star: false },
      { name: "HB-7",     color: "#ff7722", dot: "#ff8833", desc: "Most powerful model", star: true },
    ],
    perks: [
      { icon: "⚡", label: "10,000 credits / month" },
      { icon: "＋", label: "20 daily bonus credits" },
      { icon: "★",  label: "ALL 3 models incl. HB-7" },
      { icon: "🥇", label: "Top priority queue" },
      { icon: "✓",  label: "Everything in Ultra" },
      { icon: "🌟", label: "Early feature access" },
      { icon: "🛡", label: "Dedicated support" },
    ],
    tier: 4, featured: true,
    accent: "#cc2800", accentBright: "#ff3a18",
    glow: "rgba(255,58,24,0.3)", glowBright: "rgba(255,58,24,0.7)",
    bg: "linear-gradient(160deg,#220400,#110200)",
    border: "#6e1200", borderHover: "#cc2800",
    topLabel: "POWER TIER", ctaText: "Go Titan 🔥", ctaKind: "fire",
    chipBg: "rgba(255,58,24,0.1)", chipBorder: "rgba(255,58,24,0.25)",
    modelBg: "rgba(255,58,24,0.07)", modelBorder: "rgba(255,58,24,0.2)",
  },
  {
    id: "ace", name: "Ace", subtitle: "No limits. No mercy.",
    price: 500, yearlyPrice: 5400, monthlyCredits: 30000, dailyCredits: 20,
    models: [
      { name: "HB-6",     color: "#4caf50", dot: "#4caf50", desc: "Fast & capable",    star: false },
      { name: "HB-6 Pro", color: "#cc0000", dot: "#dd2222", desc: "Smarter reasoning",  star: false },
      { name: "HB-7",     color: "#ff7722", dot: "#ff9933", desc: "Most powerful model", star: true },
    ],
    perks: [
      { icon: "⚡", label: "30,000 credits / month" },
      { icon: "＋", label: "20 daily bonus credits" },
      { icon: "★",  label: "ALL 3 models incl. HB-7" },
      { icon: "👑", label: "Absolute top priority" },
      { icon: "✓",  label: "Everything in Titan" },
      { icon: "🛠", label: "Custom build requests" },
      { icon: "🤝", label: "White-glove support" },
      { icon: "📞", label: "Direct line to the team" },
    ],
    tier: 5, featured: true,
    accent: "#bb4000", accentBright: "#ff6020",
    glow: "rgba(255,96,32,0.35)", glowBright: "rgba(255,96,32,0.8)",
    bg: "linear-gradient(160deg,#1e0600,#0f0300)",
    border: "#882800", borderHover: "#ee4400",
    topLabel: "⚡ ELITE", ctaText: "Go Ace ⚡", ctaKind: "elite",
    chipBg: "rgba(255,96,32,0.1)", chipBorder: "rgba(255,96,32,0.3)",
    modelBg: "rgba(255,96,32,0.08)", modelBorder: "rgba(255,96,32,0.22)",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────────────────────── */
function ModelRow({ m, bg, border }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "9px",
      padding: "7px 11px", borderRadius: "9px",
      background: bg, border: `1px solid ${border}`,
    }}>
      <div style={{
        width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
        background: m.dot,
        boxShadow: `0 0 7px ${m.dot}`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.7rem", fontWeight: 700,
          color: m.color, letterSpacing: "0.04em",
        }}>
          {m.name}
          {m.star && (
            <span style={{
              fontSize: "0.48rem", fontWeight: 800,
              color: "#ff8833",
              background: "rgba(255,136,51,0.15)",
              border: "1px solid rgba(255,136,51,0.35)",
              padding: "1px 5px", borderRadius: "3px",
              letterSpacing: "0.1em",
            }}>
              MAX POWER
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.59rem", color: "#383838", marginTop: "1px", fontFamily: "'Instrument Sans', sans-serif" }}>
          {m.desc}
        </div>
      </div>
    </div>
  );
}

function PerkRow({ perk, accent, dimmed }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <span style={{
        width: "20px", height: "20px", flexShrink: 0, marginTop: "0px",
        background: dimmed ? "rgba(255,255,255,0.02)" : `${accent}16`,
        border: `1px solid ${dimmed ? "#121212" : accent + "28"}`,
        borderRadius: "5px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.6rem",
        color: dimmed ? "#1a1a1a" : accent,
      }}>
        {perk.icon}
      </span>
      <span style={{
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: "0.82rem", lineHeight: 1.45,
        color: dimmed ? "#1e1e1e" : "#aaa",
        fontWeight: 400,
      }}>
        {perk.label}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   PLAN CARD
──────────────────────────────────────────────────────────────────────────── */
function PlanCard({ plan, isCurrent, isHigher, isSubscribed, loading, billing, promoEligible, onSubscribe, onChangePlan, onCancel, delay }) {
  const [hov, setHov] = useState(false);
  const isDim = plan.price === 0;

  const getPrice = () => {
    if (!plan.price) return null;
    if (billing === "yearly") {
      return { val: Math.round(plan.yearlyPrice / 12), sub: `$${plan.yearlyPrice} billed annually`, strike: null, hot: false };
    }
    if (promoEligible) {
      return { val: Math.round(plan.price / 2), sub: `then $${plan.price}/mo`, strike: plan.price, hot: true };
    }
    return { val: plan.price, sub: null, strike: null, hot: false };
  };

  const price = getPrice();
  const hasHB7 = plan.models.some(m => m.star);

  const shadow = isCurrent
    ? `0 0 0 2px ${plan.accentBright}, 0 20px 70px ${plan.glowBright}`
    : hov
      ? `0 0 0 1px ${plan.borderHover}, 0 28px 90px ${plan.glowBright}, 0 8px 30px rgba(0,0,0,0.7)`
      : `0 0 0 1px ${plan.border}, 0 8px 32px rgba(0,0,0,0.5)`;

  /* CTA label */
  const ctaLabel = () => {
    if (isCurrent) return plan.id === "free" ? "Current plan" : "Cancel Plan";
    if (plan.id === "free") return "Always free";
    if (loading === plan.id) return "Loading...";
    if (isSubscribed) return isHigher ? `↑ Upgrade to ${plan.name}` : `Switch to ${plan.name}`;
    return plan.ctaText;
  };

  const ctaBg = () => {
    if (isDim || plan.id === "free") return "transparent";
    if (plan.ctaKind === "elite") return "linear-gradient(135deg,#ff6020 0%,#cc3300 45%,#7a1200 100%)";
    if (plan.ctaKind === "fire")  return "linear-gradient(135deg,#ff3a18 0%,#cc2200 50%,#6e1000 100%)";
    return `linear-gradient(135deg,${plan.accentBright} 0%,${plan.accent} 55%,#330000 100%)`;
  };

  const ctaGlow = () => {
    if (plan.ctaKind === "elite") return "0 0 40px rgba(255,96,32,0.55), 0 0 80px rgba(255,96,32,0.2)";
    if (plan.ctaKind === "fire")  return "0 0 30px rgba(255,58,24,0.5), 0 0 60px rgba(255,58,24,0.15)";
    if (isDim || plan.id === "free") return "none";
    return `0 0 22px ${plan.glow}`;
  };

  return (
    <div
      className={`plan-card-wrap${plan.featured ? " is-featured" : ""}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        borderRadius: "22px",
        padding: "2px",
        background: plan.featured && hov
          ? `linear-gradient(160deg, ${plan.accentBright}50 0%, transparent 40%, ${plan.accentBright}25 100%)`
          : "transparent",
        boxShadow: shadow,
        transition: "box-shadow 0.3s ease",
        animation: `riseIn 0.6s ease ${delay}s both`,
      }}
    >
      {/* Fire halo for Titan / Ace */}
      {(plan.id === "ace" || plan.id === "titan") && (
        <div style={{
          position: "absolute",
          top: "-24px", left: "50%",
          width: "180px", height: "60px",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse, ${plan.glowBright} 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "fireFlicker 2.2s ease-in-out infinite",
          filter: "blur(3px)",
          zIndex: 0,
        }} />
      )}

      {/* Top badge */}
      {plan.topLabel && (
        <div style={{
          position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
          background: plan.id === "ace"   ? "linear-gradient(135deg,#ff6020,#bb3300)"
                    : plan.id === "titan" ? "linear-gradient(135deg,#ff3a18,#9a1800)"
                    : plan.id === "ultra" ? "linear-gradient(135deg,#e03030,#6a1000)"
                    : `linear-gradient(135deg,${plan.accentBright},#3a0000)`,
          color: "#fff", padding: "4px 18px", borderRadius: "100px",
          fontSize: "0.56rem", fontWeight: 800, letterSpacing: "0.18em",
          fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
          boxShadow: `0 0 18px ${plan.glowBright}`,
          zIndex: 10,
          animation: `badgePop 0.5s cubic-bezier(0.2,0,0,1.3) ${delay + 0.3}s both`,
        }}>
          {plan.topLabel}
        </div>
      )}

      {isCurrent && (
        <div style={{
          position: "absolute", top: "-12px", right: "14px",
          background: "#0e0e0e", border: "1px solid #1e1e1e",
          color: "#3a3a3a", padding: "3px 11px",
          borderRadius: "100px", fontSize: "0.55rem",
          fontWeight: 700, letterSpacing: "0.12em",
          fontFamily: "'JetBrains Mono', monospace", zIndex: 10,
        }}>
          ACTIVE
        </div>
      )}

      {/* Inner card */}
      <div style={{
        borderRadius: "20px",
        background: plan.bg,
        padding: "1.9rem 1.5rem 1.6rem",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        minHeight: plan.featured ? "560px" : "auto",
      }}>
        {/* Ambient orb */}
        {!isDim && (
          <div style={{
            position: "absolute",
            top: "0", left: "50%",
            width: "200px", height: "200px",
            transform: "translate(-50%, -40%)",
            background: `radial-gradient(circle, ${plan.glowBright} 0%, transparent 65%)`,
            pointerEvents: "none",
            animation: "orb 4s ease-in-out infinite",
            opacity: hov ? 0.7 : 0.3,
            transition: "opacity 0.4s ease",
          }} />
        )}

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>

          {/* Plan title */}
          <div style={{ marginBottom: hasHB7 ? "0.6rem" : "1rem" }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: plan.id === "ace" ? "2.7rem" : plan.featured ? "2.2rem" : "1.9rem",
              fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1,
              color: isDim ? "#1e1e1e" : "#fff",
              textShadow: plan.featured ? `0 0 50px ${plan.glowBright}` : "none",
              marginBottom: "3px",
            }}>
              {plan.name}
            </h2>
            <p style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "0.76rem", color: isDim ? "#1c1c1c" : "#3a3a3a",
              fontStyle: "italic",
            }}>
              {plan.subtitle}
            </p>
          </div>

          {/* HB-7 callout banner */}
          {hasHB7 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 10px", marginBottom: "0.9rem",
              background: "rgba(255,136,34,0.08)",
              border: "1px solid rgba(255,136,34,0.28)",
              borderRadius: "8px",
            }}>
              <span style={{ color: "#ff8833", fontSize: "0.7rem" }}>★</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.58rem", fontWeight: 700,
                color: "#ff8833", letterSpacing: "0.08em",
              }}>
                HB-7 INCLUDED — MOST CAPABLE MODEL
              </span>
            </div>
          )}

          {/* Pricing */}
          <div style={{ marginBottom: "1.1rem" }}>
            {price ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  {price.strike && (
                    <span style={{
                      fontFamily: "'Syne', sans-serif", fontSize: "1.2rem",
                      color: "#1e1e1e", textDecoration: "line-through", marginRight: "4px",
                    }}>
                      ${price.strike}
                    </span>
                  )}
                  <span style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: plan.featured ? "2.9rem" : "2.4rem",
                    fontWeight: 800, lineHeight: 1,
                    color: price.hot ? "#ff9944" : "#fff",
                    textShadow: plan.featured ? `0 0 30px ${plan.glowBright}` : "none",
                  }}>
                    ${price.val}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#2a2a2a", paddingBottom: "5px", marginLeft: "2px" }}>
                    /mo
                  </span>
                </div>
                {price.sub && (
                  <div style={{
                    fontSize: "0.68rem", marginTop: "3px",
                    color: price.hot ? "#aa6600" : "#272727",
                    fontWeight: price.hot ? 600 : 400,
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}>
                    {price.sub}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "2.4rem", fontWeight: 800, color: "#181818", lineHeight: 1,
              }}>
                $0
              </div>
            )}

            {/* Credits chip */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              marginTop: "9px", padding: "4px 11px",
              background: plan.chipBg, border: `1px solid ${plan.chipBorder}`,
              borderRadius: "100px",
            }}>
              <div style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: isDim ? "#181818" : plan.accentBright,
                boxShadow: isDim ? "none" : `0 0 5px ${plan.accentBright}`,
              }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.66rem", fontWeight: 700,
                color: isDim ? "#1a1a1a" : plan.accentBright,
                letterSpacing: "0.04em",
              }}>
                {plan.monthlyCredits > 0
                  ? `${plan.monthlyCredits.toLocaleString()} credits/mo`
                  : "20 credits/day"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: "1px",
            background: isDim
              ? "#0c0c0c"
              : `linear-gradient(90deg,transparent,${plan.accentBright}55,transparent)`,
            marginBottom: "1.1rem",
          }} />

          {/* Models */}
          <div style={{ marginBottom: "1.2rem" }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.18em",
              color: isDim ? "#161616" : "#252525", marginBottom: "7px",
            }}>
              AI MODELS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {plan.models.map(m => (
                <ModelRow key={m.name} m={m} bg={plan.modelBg} border={plan.modelBorder} />
              ))}
            </div>
          </div>

          {/* Perks */}
          <div style={{ marginBottom: "1.5rem", flex: 1 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.18em",
              color: isDim ? "#161616" : "#252525", marginBottom: "9px",
            }}>
              WHAT YOU GET
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {plan.perks.map((p, i) => (
                <PerkRow key={i} perk={p} accent={plan.accentBright} dimmed={isDim} />
              ))}
            </div>
          </div>

          {/* CTA */}
          {isCurrent && plan.id !== "free" ? (
            <button
              className="cta-btn-anim"
              onClick={onCancel}
              disabled={loading === "cancel"}
              style={{
                width: "100%", padding: "13px",
                background: "transparent", border: "1px solid #1a1a1a",
                borderRadius: "12px", color: "#333",
                cursor: "pointer", fontFamily: "'Syne', sans-serif",
                fontSize: "0.88rem", letterSpacing: "0.04em",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
            >
              {loading === "cancel" ? "Cancelling..." : "Cancel Plan"}
            </button>
          ) : (isCurrent && plan.id === "free") || plan.id === "free" ? (
            <button disabled style={{
              width: "100%", padding: "13px",
              background: "transparent", border: "1px solid #0e0e0e",
              borderRadius: "12px", color: "#161616",
              fontFamily: "'Syne', sans-serif", fontSize: "0.86rem", cursor: "default",
            }}>
              {isCurrent ? "Current plan" : "Always free"}
            </button>
          ) : (
            <button
              className="cta-btn-anim"
              onClick={() => isSubscribed ? onChangePlan(plan.id) : onSubscribe(plan.id)}
              disabled={!!loading}
              style={{
                width: "100%", padding: "14px",
                background: ctaBg(),
                border: "none", borderRadius: "12px",
                color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Syne', sans-serif",
                fontSize: "0.9rem", fontWeight: 700,
                letterSpacing: "0.04em",
                boxShadow: ctaGlow(),
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                opacity: loading ? 0.6 : 1,
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Shimmer for elite/fire */}
              {(plan.ctaKind === "elite" || plan.ctaKind === "fire") && (
                <span style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmerDrift 2.5s linear infinite",
                }} />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>
                {ctaLabel()}
              </span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   COUNTDOWN
──────────────────────────────────────────────────────────────────────────── */
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
      display: "inline-flex", alignItems: "center", gap: "12px",
      padding: "10px 22px",
      background: "linear-gradient(135deg,rgba(180,0,0,0.1),rgba(255,80,0,0.07))",
      border: "1px solid rgba(180,0,0,0.22)", borderRadius: "100px",
      marginBottom: "2rem",
    }}>
      <span>🔥</span>
      <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#aa4400" }}>
        50% OFF first month
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: "0.96rem",
        fontWeight: 700, color: "#fff",
        background: "rgba(180,0,0,0.15)", padding: "3px 12px", borderRadius: "8px",
        letterSpacing: "0.08em",
      }}>
        {pad(h)}:{pad(m)}:{pad(sec)}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   MODAL
──────────────────────────────────────────────────────────────────────────── */
function Modal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.93)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "20px",
        padding: "2.5rem 2rem", maxWidth: "380px", width: "90%", textAlign: "center",
        boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
        animation: "riseIn 0.3s ease both",
      }}>
        <p style={{ fontFamily: "'Instrument Sans', sans-serif", color: "#bbb", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2rem" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px", background: "transparent",
            border: "1px solid #1a1a1a", borderRadius: "12px", color: "#444",
            cursor: "pointer", fontSize: "0.88rem", fontFamily: "'Syne', sans-serif",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#444"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
          >Go Back</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "12px",
            background: "linear-gradient(135deg,#cc0000,#6b0000)",
            border: "none", borderRadius: "12px", color: "#fff",
            cursor: "pointer", fontSize: "0.88rem", fontWeight: 700,
            fontFamily: "'Syne', sans-serif",
            boxShadow: "0 0 20px rgba(200,0,0,0.3)",
          }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   PAGE
──────────────────────────────────────────────────────────────────────────── */
export default function SubscribePage() {
  const navigate = useNavigate();
  const [loading,       setLoading]       = useState(null);
  const [currentPlan,   setCurrentPlan]   = useState(localStorage.getItem("user_plan") || "free");
  const [modal,         setModal]         = useState(null);
  const [toast,         setToast]         = useState(null);
  const [billing,       setBilling]       = useState("monthly");
  const [promoEligible, setPromoEligible] = useState(false);
  const [promoSeconds,  setPromoSeconds]  = useState(0);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    API.get("/auth/status/subscription").then(r => {
      const p = r.data.plan || "free";
      setCurrentPlan(p); localStorage.setItem("user_plan", p);
    }).catch(() => {});
    API.get("/paddle/promo-status").then(r => {
      if (r.data.eligible) { setPromoEligible(true); setPromoSeconds(r.data.seconds_remaining || 0); }
    }).catch(() => {});
  }, []);

  const showToast = (msg, color = "#4caf50") => {
    setToast({ msg, color }); setTimeout(() => setToast(null), 3500);
  };

  const handleSubscribe = async id => {
    setLoading(id);
    try {
      const r = await API.post("/paddle/create-checkout-session", {
        plan: id, billing, use_promo: promoEligible && billing === "monthly",
      });
      if (r.data.checkout_url) window.location.href = r.data.checkout_url;
      else showToast("Failed to get checkout link.", "#ff4444");
    } catch { showToast("Failed to start checkout.", "#ff4444"); }
    finally { setLoading(null); }
  };

  const doChangePlan = async id => {
    setLoading(id);
    try {
      const r = await API.post("/paddle/change-plan", { plan: id, billing });
      showToast(r.data.message);
    } catch (e) { showToast(e?.response?.data?.error || "Failed.", "#ff4444"); }
    finally { setLoading(null); }
  };

  const doCancel = async () => {
    setLoading("cancel");
    try {
      const r = await API.post("/paddle/cancel-subscription");
      showToast(r.data.message);
      setCurrentPlan("free"); localStorage.setItem("user_plan", "free");
    } catch (e) { showToast(e?.response?.data?.error || "Failed.", "#ff4444"); }
    finally { setLoading(null); }
  };

  const currentIdx  = PLANS.findIndex(p => p.id === currentPlan);
  const isSubscribed = currentPlan !== "free";

  return (
    <div style={{
      minHeight: "100vh", background: "#020202", color: "#fff",
      fontFamily: "'Instrument Sans', sans-serif", overflowX: "hidden",
    }}>
      {modal && <Modal message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}

      {toast && (
        <div style={{
          position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
          background: toast.color, color: "#fff",
          padding: "11px 28px", borderRadius: "100px",
          zIndex: 9999, fontWeight: 700, fontSize: "0.84rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          whiteSpace: "nowrap", fontFamily: "'Instrument Sans', sans-serif",
          animation: "riseIn 0.3s ease both",
        }}>
          {toast.msg}
        </div>
      )}

      {/* NAV */}
      <div style={{
        padding: "0.9rem 1.5rem",
        borderBottom: "1px solid #0c0c0c",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(2,2,2,0.92)", backdropFilter: "blur(20px)",
      }}>
        <button
          onClick={() => navigate("/studio")}
          style={{
            background: "transparent", border: "1px solid #151515",
            color: "#333", borderRadius: "10px",
            padding: "7px 16px", fontSize: "0.8rem",
            cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#8b0000"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#151515"; e.currentTarget.style.color = "#333"; }}
        >
          ← Studio
        </button>
        <span style={{
          fontFamily: "'Syne', sans-serif", fontSize: "0.82rem",
          fontWeight: 700, letterSpacing: "0.16em", color: "#161616",
          textTransform: "uppercase",
        }}>
          The Hustler Bot
        </span>
        <div style={{ width: "90px" }} />
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "4.5rem 1rem 2.5rem", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "350px",
          background: "radial-gradient(ellipse at 50% 0%,rgba(120,0,0,0.15) 0%,transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ animation: "riseIn 0.6s ease 0.05s both" }}>
          <span style={{
            display: "inline-block",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.22em",
            color: "#3a0000", background: "rgba(80,0,0,0.06)",
            border: "1px solid rgba(80,0,0,0.18)",
            padding: "5px 18px", borderRadius: "100px", marginBottom: "1.5rem",
          }}>
            CHOOSE YOUR POWER LEVEL
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(2.8rem,5.5vw,5rem)",
          fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05,
          color: "#fff", marginBottom: "0.9rem",
          textShadow: "0 0 80px rgba(140,0,0,0.2)",
          animation: "riseIn 0.6s ease 0.1s both",
        }}>
          Build Anything.<br />
          <span style={{
            background: "linear-gradient(135deg,#ff4422 0%,#cc2200 45%,#8b1200 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Without Limits.
          </span>
        </h1>

        <p style={{
          color: "#2e2e2e", fontSize: "0.95rem",
          maxWidth: "440px", margin: "0 auto 2.2rem",
          lineHeight: 1.85, fontFamily: "'Instrument Sans', sans-serif",
          animation: "riseIn 0.6s ease 0.15s both",
        }}>
          More credits. More models. More everything — with every tier you climb.
        </p>

        {promoEligible && promoSeconds > 0 && billing === "monthly" && (
          <div style={{ animation: "riseIn 0.6s ease 0.2s both" }}>
            <Countdown secs={promoSeconds} />
          </div>
        )}

        {/* Billing toggle */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "14px",
          background: "#060606", border: "1px solid #111",
          borderRadius: "100px", padding: "8px 22px",
          animation: "riseIn 0.6s ease 0.2s both",
        }}>
          {["monthly", "yearly"].map(b => (
            <React.Fragment key={b}>
              {b === "yearly" && (
                <button
                  onClick={() => setBilling(v => v === "monthly" ? "yearly" : "monthly")}
                  style={{
                    width: "44px", height: "24px", borderRadius: "12px",
                    border: "none", cursor: "pointer", position: "relative",
                    background: billing === "yearly"
                      ? "linear-gradient(135deg,#cc0000,#6b0000)" : "#0f0f0f",
                    transition: "background 0.3s",
                    boxShadow: billing === "yearly" ? "0 0 12px rgba(200,0,0,0.35)" : "none",
                  }}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: "#fff", position: "absolute", top: "3px",
                    left: billing === "yearly" ? "23px" : "3px",
                    transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }} />
                </button>
              )}
              <span style={{
                fontSize: "0.8rem",
                fontWeight: billing === b ? 700 : 400,
                color: billing === b ? "#fff" : "#222",
                fontFamily: "'Instrument Sans', sans-serif",
                transition: "color 0.2s",
              }}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </span>
            </React.Fragment>
          ))}
          {billing === "yearly" && (
            <span style={{
              fontSize: "0.6rem", fontWeight: 800, color: "#4caf50",
              background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.18)",
              padding: "3px 9px", borderRadius: "100px",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.07em",
              animation: "badgePop 0.4s cubic-bezier(0.2,0,0,1.3) both",
            }}>
              SAVE 10%
            </span>
          )}
        </div>
      </div>

      {/* PLAN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(238px, 1fr))",
        gap: "1.5rem",
        maxWidth: "1580px",
        margin: "0 auto",
        padding: "2rem 1.5rem 7rem",
        alignItems: "stretch",
      }}>
        {PLANS.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
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
                message: `Switch to the ${name} plan? Changes take effect next billing cycle.`,
                onConfirm: () => { setModal(null); doChangePlan(id); },
              });
            }}
            onCancel={() => setModal({
              message: "Cancel your subscription? You'll keep access until the end of your billing period.",
              onConfirm: () => { setModal(null); doCancel(); },
            })}
            delay={i * 0.07}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", paddingBottom: "4rem" }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.58rem", color: "#111",
          letterSpacing: "0.12em",
        }}>
          SECURED BY PADDLE · CANCEL ANYTIME · NO HIDDEN FEES
        </p>
      </div>
    </div>
  );
}