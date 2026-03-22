import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRive } from "rive-react";
import API from "../api/api";

/* ─── Shared model definitions ───────────────────────────────────────────── */
const MODEL_DEFS = {
  "hb-6":     { name: "HB-6",     riveSrc: "/hustler-robot101.riv",      glow: null },
  "hb-6-pro": { name: "HB-6 Pro", riveSrc: "/hustler-robot93.riv",      glow: "rgba(200,16,46,0.9)" },
  "hb-7":     { name: "HB-7",     riveSrc: "/hustler-robot92.riv", glow: "rgba(200,16,46,0.9)" },
};

function PlanBot({ modelId, size = 18 }) {
  const def = MODEL_DEFS[modelId];
  const { RiveComponent } = useRive({ src: def.riveSrc, autoplay: true });
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      filter: def.glow
        ? `drop-shadow(0 0 3px ${def.glow}) drop-shadow(0 0 6px ${def.glow})`
        : "none",
    }}>
      <RiveComponent style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red:         #C8102E;
    --red-dim:     #8B0B1F;
    --red-glow:    rgba(200,16,46,0.22);
    --green:       #22C55E;
    --green-dim:   #15803D;
    --bg:          #05050A;
    --surface:     #0A0A10;
    --surface2:    #0E0E16;
    --border:      rgba(255,255,255,0.06);
    --border-red:  rgba(200,16,46,0.25);
    --text:        #EEEAE2;
    --text-muted:  #58585F;
    --text-dim:    #28282E;
  }

  html { scroll-behavior: smooth; }

  .dot-bg {
    background-color: var(--bg);
    background-image: radial-gradient(circle, rgba(200,16,46,0.16) 1px, transparent 1px);
    background-size: 26px 26px;
  }
  .dot-bg::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse 75% 60% at 50% 35%, var(--bg) 18%, transparent 72%);
  }

  .cb { position: relative; }
  .cb::before, .cb::after, .cb > .cbi::before, .cb > .cbi::after {
    content: ''; position: absolute;
    width: 12px; height: 12px;
    border-color: rgba(200,16,46,0.4); border-style: solid;
  }
  .cb::before  { top:-1px; left:-1px;  border-width:1px 0 0 1px; }
  .cb::after   { top:-1px; right:-1px; border-width:1px 1px 0 0; }
  .cb > .cbi::before { bottom:-1px; left:-1px;  border-width:0 0 1px 1px; }
  .cb > .cbi::after  { bottom:-1px; right:-1px; border-width:0 1px 1px 0; }

  .c-rule {
    position: relative; height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(200,16,46,0.22) 20%, rgba(200,16,46,0.38) 50%, rgba(200,16,46,0.22) 80%, transparent 100%);
  }
  .c-rule::before, .c-rule::after {
    content: ''; position: absolute;
    top: 50%; transform: translateY(-50%);
    width: 4px; height: 4px;
    background: var(--red); box-shadow: 0 0 7px var(--red);
  }
  .c-rule::before { left: 18%; }
  .c-rule::after  { right: 18%; }

  @keyframes nodePulse {
    0%,100% { box-shadow: 0 0 4px var(--red); opacity: 0.55; }
    50%      { box-shadow: 0 0 10px var(--red), 0 0 20px rgba(200,16,46,0.3); opacity: 1; }
  }
  .nd { animation: nodePulse 2.8s ease-in-out infinite; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .cursor { animation: blink 1s step-end infinite; }

  @keyframes scanH {
    0%   { top: -2px; opacity: 0; }
    4%   { opacity: 0.5; }
    96%  { opacity: 0.15; }
    100% { top: 100vh; opacity: 0; }
  }
  .scan-h {
    position: fixed; left: 0; right: 0; height: 1px;
    pointer-events: none; z-index: 10;
    background: linear-gradient(90deg, transparent, rgba(200,16,46,0.55) 50%, transparent);
    animation: scanH 14s linear infinite;
  }

  .v-trace {
    position: absolute; width: 1px; top: 0; bottom: 0; pointer-events: none;
    background: linear-gradient(180deg, transparent 0%, rgba(200,16,46,0.1) 35%, rgba(200,16,46,0.1) 65%, transparent 100%);
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes subtlePulse {
    0%,100% { opacity:0.45; transform:scale(1); }
    50%      { opacity:1; transform:scale(1.04); }
  }
  @keyframes glowBreath { 0%,100%{opacity:0.6} 50%{opacity:1} }
  @keyframes toastIn {
    from { opacity:0; transform:translateX(-50%) translateY(-10px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }
  @keyframes countdownTick { 0%,100%{opacity:1} 50%{opacity:0.65} }
  @keyframes scanline {
    from { transform:translateY(-100%); }
    to   { transform:translateY(100%); }
  }

  .plan-col {
    transition: transform 0.32s cubic-bezier(0.16,1,0.3,1), box-shadow 0.32s ease;
    position: relative;
  }
  .plan-col:hover { transform:translateY(-7px); }
  .plan-col.is-pro:hover   { transform:translateY(-10px); }
  .plan-col.is-titan:hover { transform:translateY(-9px); }
  .plan-col.is-ace:hover   { transform:translateY(-9px); }

  .cta-btn { transition:transform 0.15s ease,filter 0.15s ease,box-shadow 0.2s ease; }
  .cta-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
  .cta-btn:active:not(:disabled) { transform:translateY(0); }
  .billing-btn { transition:background 0.22s ease,color 0.22s ease; }

  .chk::before {
    content:''; display:inline-block;
    width:4px; height:8px;
    border-right:1.5px solid var(--red); border-bottom:1.5px solid var(--red);
    transform:rotate(45deg) translateY(-2px);
    margin-right:10px; flex-shrink:0; position:relative; top:-1px;
  }

  ::-webkit-scrollbar { width:3px; height:3px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#200008; border-radius:2px; }
`;

/* ─── PLAN CONFIG ────────────────────────────────────────────────────────── */
const PLANS = [
  { id:"free",  name:"Free",  tagline:"Always free",      price:0,   yearlyPrice:0,    monthlyCredits:0,     dailyCredits:20, models:["hb-6"],                   tier:"free",  perks:["20 credits per day","HB-6 model","Live preview","Basic app generation"] },
  { id:"plus",  name:"Plus",  tagline:"Get started",      price:20,  yearlyPrice:216,  monthlyCredits:800,   dailyCredits:20, models:["hb-6","hb-6-pro"],       tier:"base",  perks:["800 credits per month","20 daily bonus credits","HB-6 and HB-6 Pro models","Unlimited downloads","All app types"] },
  { id:"pro",   name:"Pro",   tagline:"Most popular",     price:50,  yearlyPrice:540,  monthlyCredits:2400,  dailyCredits:20, models:["hb-6","hb-6-pro"],       tier:"pro",   badge:"MOST POPULAR", perks:["2,400 credits per month","20 daily bonus credits","HB-6 and HB-6 Pro models","Priority build queue","Everything in Plus","Email support"] },
  { id:"ultra", name:"Ultra", tagline:"Full power",       price:100, yearlyPrice:1080, monthlyCredits:5000,  dailyCredits:20, models:["hb-6","hb-6-pro","hb-7"],tier:"base",  hb7:true, perks:["5,000 credits per month","20 daily bonus credits","All models including HB-7","Advanced reasoning engine","Everything in Pro","Priority support"] },
  { id:"titan", name:"Titan", tagline:"No ceiling",       price:200, yearlyPrice:2160, monthlyCredits:10000, dailyCredits:20, models:["hb-6","hb-6-pro","hb-7"],tier:"titan", hb7:true, badge:"POWER TIER", perks:["10,000 credits per month","20 daily bonus credits","All models including HB-7","No build queue — instant generation","Early access to new models","Everything in Ultra","Dedicated support channel"] },
  { id:"ace",   name:"Ace",   tagline:"Enterprise-grade", price:500, yearlyPrice:5400, monthlyCredits:30000, dailyCredits:20, models:["hb-6","hb-6-pro","hb-7"],tier:"ace",   hb7:true, badge:"ELITE",      perks:["30,000 credits per month","20 daily bonus credits","All models including HB-7","No build queue — always first","Early access to research models","Custom feature requests","Everything in Titan","Direct support from the team"] },
];

const TIER_STYLE = {
  free:  { glow:null, border:"rgba(255,255,255,0.06)", bg:"#0A0A10", topGlow:null, badgeBg:null },
  base:  { glow:null, border:"rgba(255,255,255,0.06)", bg:"#0A0A10", topGlow:null, badgeBg:null },
  pro:   { glow:"0 0 0 1px rgba(200,16,46,0.48),0 -50px 90px -10px rgba(200,16,46,0.32),0 50px 90px -10px rgba(200,16,46,0.1)",   border:"rgba(200,16,46,0.48)", bg:"#0F0009", topGlow:"radial-gradient(ellipse 85% 55% at 50% 0%,rgba(200,16,46,0.28) 0%,transparent 68%)",  badgeBg:"#C8102E" },
  titan: { glow:"0 0 0 1px rgba(200,16,46,0.36),0 -70px 130px -10px rgba(200,16,46,0.28),0 70px 120px -10px rgba(200,16,46,0.09)", border:"rgba(200,16,46,0.36)", bg:"#0D0008", topGlow:"radial-gradient(ellipse 105% 65% at 50% 0%,rgba(200,16,46,0.21) 0%,transparent 70%)", badgeBg:"linear-gradient(135deg,#8B0B1F,#3D0000)" },
  ace:   { glow:"0 0 0 1px rgba(200,16,46,0.44),0 -90px 180px -10px rgba(200,16,46,0.38),0 90px 160px -10px rgba(200,16,46,0.12),0 0 220px -50px rgba(200,16,46,0.18)", border:"rgba(200,16,46,0.44)", bg:"#0E0009", topGlow:"radial-gradient(ellipse 125% 75% at 50% 0%,rgba(200,16,46,0.3) 0%,transparent 63%)", badgeBg:"linear-gradient(135deg,#C8102E,#6B0000)" },
};

/* ─── SYSTEM READOUT ─────────────────────────────────────────────────────── */
function SystemReadout() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => (t + 1) % 4), 550);
    return () => clearInterval(iv);
  }, []);
  const dots = "·".repeat(tick + 1).padEnd(3, " ");

  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:"16px", padding:"7px 18px", background:"rgba(200,16,46,0.04)", border:"1px solid rgba(200,16,46,0.16)", marginBottom:"1.8rem", position:"relative" }}>
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
        <div key={i} style={{ position:"absolute",[v]:0,[h]:0,width:8,height:8,
          [`border${v[0].toUpperCase()+v.slice(1)}`]:"1px solid rgba(200,16,46,0.45)",
          [`border${h[0].toUpperCase()+h.slice(1)}`]:"1px solid rgba(200,16,46,0.45)",
        }}/>
      ))}
      <div className="nd" style={{ width:5,height:5,background:"var(--red)",flexShrink:0 }}/>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.56rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-muted)" }}>
        BILLING MODULE
      </span>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.56rem", color:"rgba(200,16,46,0.4)", letterSpacing:"0.06em" }}>//</span>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.56rem", fontWeight:500, letterSpacing:"0.16em", color:"var(--red)" }}>
        PLANS &amp; PRICING
      </span>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.56rem", color:"rgba(200,16,46,0.3)", letterSpacing:"0.06em", minWidth:"20px" }}>
        {dots}
      </span>
      <div className="nd" style={{ width:5,height:5,background:"var(--red)",flexShrink:0 }}/>
    </div>
  );
}

/* ─── INLINE COUNTDOWN (beside price) ────────────────────────────────────── */
function InlineCountdown({ secs: init }) {
  const [s, setS] = useState(init);
  useEffect(() => {
    if (s <= 0) return;
    const iv = setInterval(() => setS(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  if (!s) return null;
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  const pad = n => String(n).padStart(2,"0");
  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 8px",background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.22)",flexShrink:0 }}>
      <div style={{ width:4,height:4,background:"var(--green)",boxShadow:"0 0 6px var(--green)",animation:"nodePulse 1.5s ease infinite",flexShrink:0 }}/>
      <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",fontWeight:500,color:"var(--green)",letterSpacing:"0.06em",animation:"countdownTick 1s ease infinite",whiteSpace:"nowrap" }}>
        {pad(h)}:{pad(m)}:{pad(sec)}
      </span>
    </div>
  );
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
function Modal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(18px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
      <div style={{ background:"var(--surface2)",border:"1px solid var(--border)",padding:"2.5rem",maxWidth:"400px",width:"90%",animation:"fadeUp 0.25s ease both",position:"relative" }}>
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
          <div key={i} style={{ position:"absolute",[v]:0,[h]:0,width:11,height:11,[`border${v[0].toUpperCase()+v.slice(1)}`]:"1px solid rgba(200,16,46,0.38)",[`border${h[0].toUpperCase()+h.slice(1)}`]:"1px solid rgba(200,16,46,0.38)" }}/>
        ))}
        <p style={{ fontFamily:"'DM Sans',sans-serif",color:"var(--text-muted)",fontSize:"0.9rem",lineHeight:1.75,marginBottom:"2rem" }}>{message}</p>
        <div style={{ display:"flex",gap:"10px" }}>
          <button onClick={onCancel} style={{ flex:1,padding:"12px",background:"transparent",border:"1px solid var(--border)",color:"var(--text-muted)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"0.85rem",transition:"border-color 0.2s,color 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--text-muted)";e.currentTarget.style.color="var(--text)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-muted)";}}>Go back</button>
          <button onClick={onConfirm} style={{ flex:1,padding:"12px",background:"var(--red)",border:"none",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"0.85rem",fontWeight:600,transition:"filter 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
            onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── PLAN CARD ──────────────────────────────────────────────────────────── */
function PlanCard({ plan, isCurrent, isHigher, isSubscribed, loading, billing, promoEligible, promoSeconds, onSubscribe, onChangePlan, onCancel, index }) {
  const ts = TIER_STYLE[plan.tier];
  const isFree = plan.id === "free";
  const isHighlighted = ["pro","titan","ace"].includes(plan.tier);
  const isCurrentPaid = isCurrent && !isFree;

  const showPromo = !isFree && promoEligible && billing === "monthly" && promoSeconds > 0;

  const getDP = () => {
    if (!plan.price) return { main:0 };
    if (billing==="yearly") return { main:Math.round(plan.yearlyPrice/12), sub:`$${plan.yearlyPrice} billed annually`, savings:`Save $${plan.price*12-plan.yearlyPrice}/yr`, isYearly:true };
    if (showPromo) return { main:Math.round(plan.price/2), original:plan.price, isPromo:true };
    return { main:plan.price };
  };
  const dp = getDP();

  const ctaLabel = () => {
    if (isFree) return isCurrent ? "Current plan" : "Always free";
    if (isCurrent) return "Cancel plan";
    if (loading===plan.id) return "Please wait...";
    if (isSubscribed) return isHigher ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`;
    return `Get ${plan.name}`;
  };

  return (
    <div className={`plan-col${plan.tier==="pro"?" is-pro":plan.tier==="titan"?" is-titan":plan.tier==="ace"?" is-ace":""}`}
      style={{ flex:"1 1 0",minWidth:"190px",maxWidth:"320px",background:ts.bg,border:`1px solid ${ts.border}`,padding:isHighlighted?"2.2rem 1.7rem 1.8rem":"2rem 1.6rem 1.8rem",display:"flex",flexDirection:"column",animation:`fadeUp 0.5s ease ${0.07*index}s both`,boxShadow:ts.glow||"none",position:"relative",overflow:"hidden" }}>

      {ts.topGlow && <div style={{ position:"absolute",top:0,left:0,right:0,height:"240px",pointerEvents:"none",zIndex:0,background:ts.topGlow,animation:"glowBreath 3.5s ease-in-out infinite" }}/>}

      {plan.tier==="ace" && (
        <div style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden" }}>
          <div style={{ position:"absolute",left:0,right:0,height:"40%",background:"linear-gradient(180deg,transparent,rgba(200,16,46,0.04),transparent)",animation:"scanline 6s linear infinite" }}/>
        </div>
      )}

      {isHighlighted && [["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
        <div key={i} style={{ position:"absolute",[v]:8,[h]:8,width:9,height:9,[`border${v[0].toUpperCase()+v.slice(1)}`]:"1px solid rgba(200,16,46,0.35)",[`border${h[0].toUpperCase()+h.slice(1)}`]:"1px solid rgba(200,16,46,0.35)",pointerEvents:"none",zIndex:2 }}/>
      ))}

      <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",flex:1 }}>

        {plan.badge && (
          <div style={{ position:"absolute",top:"-2.2rem",left:"50%",transform:"translateX(-50%)",background:ts.badgeBg,color:"#fff",fontSize:"0.56rem",fontWeight:600,letterSpacing:"0.18em",fontFamily:"'DM Mono',monospace",padding:"4px 14px",whiteSpace:"nowrap",boxShadow:isHighlighted?"0 2px 20px rgba(200,16,46,0.4)":"none" }}>
            {plan.badge}
          </div>
        )}

        {isCurrent && (
          <div style={{ position:"absolute",top:0,right:0,background:"rgba(200,16,46,0.1)",border:"1px solid var(--border-red)",color:"var(--red)",fontSize:"0.54rem",fontWeight:600,letterSpacing:"0.14em",fontFamily:"'DM Mono',monospace",padding:"3px 9px" }}>ACTIVE</div>
        )}

        {plan.hb7 && (
          <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",marginBottom:"1.1rem",padding:"4px 10px",background:"rgba(200,16,46,0.07)",border:"1px solid var(--border-red)",width:"fit-content" }}>
            <div style={{ width:4,height:4,background:"var(--red)",boxShadow:"0 0 6px var(--red)",animation:"subtlePulse 2.2s ease infinite" }}/>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.57rem",fontWeight:500,letterSpacing:"0.1em",color:"var(--red)" }}>HB-7 INCLUDED</span>
          </div>
        )}

        <div style={{ marginBottom:"1.4rem" }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif",fontWeight:400,fontSize:isHighlighted?"2.1rem":"1.85rem",letterSpacing:"-0.01em",lineHeight:1.1,color:isFree?"var(--text-dim)":"var(--text)",marginBottom:"4px",textShadow:isHighlighted?"0 0 40px rgba(200,16,46,0.3)":"none" }}>{plan.name}</h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"0.76rem",color:isFree?"var(--text-dim)":isHighlighted?"rgba(200,16,46,0.65)":"var(--text-muted)",fontStyle:"italic",fontWeight:300 }}>{plan.tagline}</p>
        </div>

        {/* ── PRICE ROW ── */}
        <div style={{ marginBottom:"1.5rem" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap" }}>
            {/* Crossed out original price — prominent */}
            {dp.isPromo && dp.original && (
              <span style={{
                fontFamily:"'DM Serif Display',serif",
                fontSize:"1.6rem",
                color:"var(--text-muted)",
                textDecoration:"line-through",
                textDecorationColor:"var(--red)",
                textDecorationThickness:"2px",
                opacity:0.7,
                lineHeight:1,
              }}>${dp.original}</span>
            )}
            {/* Current price */}
            <div style={{ display:"flex",alignItems:"baseline",gap:"4px" }}>
              <span style={{
                fontFamily:"'DM Serif Display',serif",
                fontSize:isFree?"2rem":"2.5rem",
                fontWeight:400,lineHeight:1,letterSpacing:"-0.02em",
                color:isFree?"var(--text-dim)":dp.isPromo?"var(--green)":"var(--text)",
              }}>${dp.main}</span>
              {!isFree && <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"0.76rem",color:"var(--text-dim)",fontWeight:400 }}>/ mo</span>}
            </div>
            {/* Countdown timer — right beside price */}
            {showPromo && <InlineCountdown secs={promoSeconds} />}
          </div>

          {/* Promo label under price */}
          {dp.isPromo && (
            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",color:"var(--green)",marginTop:"6px",letterSpacing:"0.04em",fontWeight:500 }}>
              50% off first month
            </p>
          )}

          {dp.isYearly && dp.savings && (
            <div style={{ display:"inline-flex",alignItems:"center",marginTop:"6px",padding:"3px 9px",background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.22)" }}>
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",fontWeight:500,color:"var(--green)",letterSpacing:"0.04em" }}>{dp.savings}</span>
            </div>
          )}
          {dp.isYearly && dp.sub && <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"0.68rem",color:"var(--text-muted)",marginTop:"3px" }}>{dp.sub}</p>}

          <div style={{ marginTop:"10px",display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",background:isFree?"transparent":isHighlighted?"rgba(200,16,46,0.08)":"rgba(200,16,46,0.05)",border:`1px solid ${isFree?"var(--border)":"var(--border-red)"}` }}>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.63rem",color:isFree?"var(--text-dim)":"var(--red)",letterSpacing:"0.04em" }}>
              {plan.monthlyCredits>0 ? `${plan.monthlyCredits.toLocaleString()} credits / mo` : "20 credits / day"}
            </span>
          </div>
        </div>

        {/* divider */}
        <div style={{ position:"relative",height:"1px",background:isHighlighted?"linear-gradient(90deg,transparent,rgba(200,16,46,0.4),transparent)":"var(--border)",marginBottom:"1.3rem" }}>
          {isHighlighted && <>
            <div style={{ position:"absolute",left:"22%",top:"50%",transform:"translateY(-50%)",width:4,height:4,background:"var(--red)",boxShadow:"0 0 6px var(--red)" }}/>
            <div style={{ position:"absolute",right:"22%",top:"50%",transform:"translateY(-50%)",width:4,height:4,background:"var(--red)",boxShadow:"0 0 6px var(--red)" }}/>
          </>}
        </div>

        <div style={{ marginBottom:"1.1rem" }}>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.16em",color:"var(--text-dim)",textTransform:"uppercase",marginBottom:"8px" }}>Models</p>
          <div style={{ display:"flex",flexDirection:"column",gap:"5px" }}>
            {plan.models.map(modelId => {
              const def = MODEL_DEFS[modelId];
              return (
                <div key={modelId} style={{ display:"flex",alignItems:"center",gap:"7px",padding:"5px 8px",background:isFree?"transparent":def.glow?"rgba(200,16,46,0.05)":"rgba(255,255,255,0.02)",border:`1px solid ${isFree?"var(--border)":def.glow?"rgba(200,16,46,0.15)":"rgba(255,255,255,0.04)"}`,opacity:isFree?0.35:1 }}>
                  {!isFree && <PlanBot modelId={modelId} size={16}/>}
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.66rem",fontWeight:500,letterSpacing:"0.04em",color:isFree?"var(--text-dim)":def.glow?"var(--red)":"var(--text-muted)" }}>{def.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex:1,marginBottom:"1.8rem" }}>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.16em",color:"var(--text-dim)",textTransform:"uppercase",marginBottom:"10px" }}>Includes</p>
          <div style={{ display:"flex",flexDirection:"column",gap:"7px" }}>
            {plan.perks.map((perk,i) => (
              <div key={i} style={{ display:"flex",alignItems:"baseline" }}>
                <span className="chk" style={{ flexShrink:0 }}/>
                <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"0.79rem",color:isFree?"var(--text-dim)":"var(--text-muted)",lineHeight:1.5 }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {isCurrentPaid ? (
          <button className="cta-btn" onClick={onCancel} disabled={loading==="cancel"} style={{ width:"100%",padding:"12px",background:"transparent",border:"1px solid var(--border)",color:"var(--text-dim)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"0.82rem",fontWeight:500,transition:"border-color 0.2s,color 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--red-dim)";e.currentTarget.style.color="var(--text-muted)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-dim)";}}>
            {loading==="cancel" ? "Cancelling..." : "Cancel plan"}
          </button>
        ) : isFree ? (
          <button disabled style={{ width:"100%",padding:"12px",background:"transparent",border:"1px solid var(--border)",color:"var(--text-dim)",fontFamily:"'DM Sans',sans-serif",fontSize:"0.82rem",cursor:"default" }}>
            {isCurrent ? "Current plan" : "Always free"}
          </button>
        ) : (
          <button className="cta-btn"
            onClick={() => isSubscribed ? onChangePlan(plan.id) : onSubscribe(plan.id)}
            disabled={!!loading}
            style={{ width:"100%",padding:"13px",background:isHighlighted?"var(--red)":"transparent",border:isHighlighted?"none":"1px solid var(--border-red)",color:"#fff",cursor:loading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"0.85rem",fontWeight:isHighlighted?600:400,letterSpacing:"0.03em",opacity:loading?0.5:1,
              boxShadow:plan.tier==="ace"?"0 0 40px rgba(200,16,46,0.45),0 4px 16px rgba(200,16,46,0.2)":plan.tier==="titan"?"0 0 28px rgba(200,16,46,0.35)":plan.tier==="pro"?"0 0 20px rgba(200,16,46,0.3)":"none" }}>
            {ctaLabel()}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
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
    }).catch(()=>{});
    API.get("/paddle/promo-status").then(r => {
      if (r.data.eligible) { setPromoEligible(true); setPromoSeconds(r.data.seconds_remaining||0); }
    }).catch(()=>{});
  }, []);

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3500); };

  const handleSubscribe = async id => {
    setLoading(id);
    try {
      const r = await API.post("/paddle/create-checkout-session",{plan:id,billing,use_promo:promoEligible&&billing==="monthly"});
      if (r.data.checkout_url) window.location.href = r.data.checkout_url;
      else showToast("Failed to get checkout link.",false);
    } catch { showToast("Failed to start checkout.",false); }
    finally { setLoading(null); }
  };

  const doChangePlan = async id => {
    setLoading(id);
    try { const r = await API.post("/paddle/change-plan",{plan:id,billing}); showToast(r.data.message); }
    catch(e) { showToast(e?.response?.data?.error||"Failed.",false); }
    finally { setLoading(null); }
  };

  const doCancel = async () => {
    setLoading("cancel");
    try { const r = await API.post("/paddle/cancel-subscription"); showToast(r.data.message); setCurrentPlan("free"); localStorage.setItem("user_plan","free"); }
    catch(e) { showToast(e?.response?.data?.error||"Failed.",false); }
    finally { setLoading(null); }
  };

  const currentIdx   = PLANS.findIndex(p => p.id === currentPlan);
  const isSubscribed = currentPlan !== "free";

  return (
    <div className="dot-bg" style={{ minHeight:"100vh",color:"var(--text)",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden",position:"relative" }}>

      <div className="scan-h"/>

      {modal && <Modal message={modal.message} onConfirm={modal.onConfirm} onCancel={()=>setModal(null)}/>}

      {toast && (
        <div style={{ position:"fixed",top:"20px",left:"50%",transform:"translateX(-50%)",background:toast.ok?"var(--green-dim)":"var(--red)",color:"#fff",padding:"10px 24px",zIndex:9999,fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:"0.84rem",whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"toastIn 0.25s ease both" }}>
          {toast.msg}
        </div>
      )}

      {/* NAV */}
      <nav style={{ padding:"0 2rem",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(200,16,46,0.1)",position:"sticky",top:0,zIndex:100,background:"rgba(5,5,10,0.95)",backdropFilter:"blur(22px)" }}>
        <button onClick={()=>navigate("/studio")} style={{ background:"transparent",border:"none",color:"var(--text-muted)",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.14em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:"8px",padding:"6px 0",transition:"color 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2L3 6.5L8 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Studio
        </button>

        <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
          <div style={{ width:"36px",height:"1px",background:"linear-gradient(90deg,transparent,rgba(200,16,46,0.28))" }}/>
          <div className="nd" style={{ width:4,height:4,background:"var(--red)" }}/>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",fontWeight:500,letterSpacing:"0.2em",color:"var(--text-dim)",textTransform:"uppercase" }}>The Hustler Bot</span>
          <div className="nd" style={{ width:4,height:4,background:"var(--red)",animationDelay:"1.4s" }}/>
          <div style={{ width:"36px",height:"1px",background:"linear-gradient(90deg,rgba(200,16,46,0.28),transparent)" }}/>
        </div>

        <div style={{ width:"80px" }}/>
      </nav>

      {/* HERO */}
      <header style={{ textAlign:"center",padding:"4.5rem 2rem 3rem",position:"relative",overflow:"hidden" }}>
        <div className="v-trace" style={{ left:"16%" }}/>
        <div className="v-trace" style={{ right:"16%" }}/>
        <div className="v-trace" style={{ left:"30%",opacity:0.5 }}/>
        <div className="v-trace" style={{ right:"30%",opacity:0.5 }}/>

        <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"560px",height:"260px",pointerEvents:"none",background:"radial-gradient(ellipse at 50% 0%,rgba(200,16,46,0.08) 0%,transparent 65%)",zIndex:0 }}/>

        <div style={{ animation:"fadeUp 0.5s ease 0.05s both",position:"relative",zIndex:1 }}>
          <SystemReadout/>
        </div>

        <h1 style={{ fontFamily:"'DM Serif Display',serif",fontWeight:400,fontSize:"clamp(2.6rem,5vw,4.4rem)",letterSpacing:"-0.02em",lineHeight:1.08,color:"var(--text)",marginBottom:"1rem",animation:"fadeUp 0.5s ease 0.1s both",position:"relative",zIndex:1 }}>
          Build at your scale.
        </h1>

        <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"0.95rem",color:"var(--text-muted)",fontWeight:300,maxWidth:"400px",margin:"0 auto 2rem",lineHeight:1.85,animation:"fadeUp 0.5s ease 0.14s both",position:"relative",zIndex:1 }}>
          From free to enterprise — one platform, every tool you need to ship.
        </p>

        <div style={{ maxWidth:"440px",margin:"0 auto 2rem",animation:"fadeUp 0.5s ease 0.16s both",position:"relative",zIndex:1 }}>
          <div className="c-rule"/>
        </div>

        {/* billing toggle */}
        <div style={{ display:"inline-flex",alignItems:"center",background:"var(--surface)",border:"1px solid rgba(200,16,46,0.14)",padding:"4px",gap:"2px",animation:"fadeUp 0.5s ease 0.2s both",position:"relative",zIndex:1 }}>
          {["monthly","yearly"].map(b => (
            <button key={b} className="billing-btn" onClick={()=>setBilling(b)} style={{ padding:"8px 22px",border:"none",background:billing===b?b==="yearly"?"var(--green-dim)":"var(--red)":"transparent",color:billing===b?"#fff":"var(--text-muted)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"0.8rem",fontWeight:billing===b?500:400,letterSpacing:"0.02em" }}>
              {b.charAt(0).toUpperCase()+b.slice(1)}
              {b==="yearly" && <span style={{ marginLeft:"8px",fontSize:"0.6rem",fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",color:billing==="yearly"?"rgba(255,255,255,0.8)":"var(--green)" }}>−10%</span>}
            </button>
          ))}
        </div>

        {billing==="yearly" && (
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"0.72rem",color:"var(--green)",marginTop:"10px",animation:"fadeUp 0.3s ease both",position:"relative",zIndex:1 }}>
            Annual billing saves you 10% across all paid plans.
          </p>
        )}
      </header>

      {/* PLAN ROW */}
      <main style={{ maxWidth:"1500px",margin:"0 auto",padding:"1.5rem 1.5rem 7rem",position:"relative",zIndex:1 }}>
        <div style={{ display:"flex",flexWrap:"wrap",gap:"1px",background:"rgba(200,16,46,0.07)",border:"1px solid rgba(200,16,46,0.1)",overflow:"visible",paddingTop:"20px" }}>
          {PLANS.map((plan,i) => (
            <PlanCard key={plan.id} plan={plan} index={i}
              isCurrent={currentPlan===plan.id} isHigher={i>currentIdx}
              isSubscribed={isSubscribed} loading={loading} billing={billing} promoEligible={promoEligible}
              promoSeconds={promoSeconds}
              onSubscribe={handleSubscribe}
              onChangePlan={id => {
                const name = PLANS.find(p=>p.id===id)?.name;
                setModal({message:`Switch to ${name}? Changes take effect at the start of your next billing cycle.`,onConfirm:()=>{setModal(null);doChangePlan(id);}});
              }}
              onCancel={()=>setModal({message:"Cancel your subscription? You'll keep access until the end of your current billing period.",onConfirm:()=>{setModal(null);doCancel();}})}
            />
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ textAlign:"center",paddingBottom:"4rem",position:"relative",zIndex:1 }}>
        <div style={{ maxWidth:"320px",margin:"0 auto 1.4rem" }}>
          <div className="c-rule"/>
        </div>
        <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.56rem",color:"var(--text-dim)",letterSpacing:"0.16em",textTransform:"uppercase" }}>
          Secured by Paddle &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; No hidden fees
        </span>
      </footer>

    </div>
  );
}