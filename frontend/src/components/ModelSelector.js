import React, { useState, useEffect, useRef } from "react";
import { useRive } from "rive-react";
import API from "../api/api";

/* ─── Model Selector ───────────────────────────────────────────────────────── *
 * HB-6     → regular robot,      NO glow
 * HB-6 Pro → regular robot,      RED glow
 * HB-7     → white bubble-bot,   RED glow
 * ──────────────────────────────────────────────────────────────────────────── */

const MODEL_DEFS = [
  {
    id: "hb-6",
    name: "HB-6",
    short: "HB-6",
    tip: "Fast & efficient for everyday tasks",
    color: "#4caf50",
    botGlow: null,                          // no glow on bot
    badgeColor: "#4caf50",
    min_plan_label: "Free+",
    badge: "FAST",
    riveSrc: "/hustler-robot112.riv",
  },
  {
    id: "hb-6-pro",
    name: "HB-6 Pro",
    short: "Pro",
    tip: "Powerful for complex apps — uses more credits",
    color: "#cc0000",
    botGlow: "rgba(200,0,0,0.85)",          // red glow
    badgeColor: "#cc0000",
    min_plan_label: "Plus+",
    badge: "PRO",
    riveSrc: "/hustler-robot112.riv",          // same robot + red glow
  },
  {
    id: "hb-7",
    name: "HB-7",
    short: "HB-7",
    tip: "Advanced reasoning & complex tasks — highest credit usage",
    color: "#ff6600",
    botGlow: "rgba(200,0,0,0.85)",          // red glow on white bot
    badgeColor: "#ff6600",
    min_plan_label: "Ultra+",
    badge: "MAX",
    riveSrc: "/hustler-robot95.riv",     // white bubble-bot
  },
];

/* ── Rive bot — glow is optional ── */
function RiveBot({ src, glow, size = 22 }) {
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
  });
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      filter: glow
        ? `drop-shadow(0 0 3px ${glow}) drop-shadow(0 0 7px ${glow})`
        : "none",
      transition: "filter 0.2s ease",
    }}>
      <RiveComponent style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

/* ── Row inside the open dropdown ── */
function ModelRow({ model, isAllowed, isSelected, onSelect, onClose }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => { if (isAllowed) { onSelect(model.id); onClose(); } }}
      onMouseEnter={() => isAllowed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "9px",
        width: "100%",
        padding: "8px 10px",
        background: isSelected
          ? `linear-gradient(135deg, ${model.color}18, ${model.color}08)`
          : hovered ? "rgba(255,255,255,0.04)" : "transparent",
        border: isSelected
          ? `1px solid ${model.color}35`
          : "1px solid transparent",
        borderRadius: "10px",
        cursor: isAllowed ? "pointer" : "not-allowed",
        opacity: isAllowed ? 1 : 0.38,
        transition: "all 0.13s ease",
        textAlign: "left",
        marginBottom: "2px",
        outline: "none",
      }}
    >
      <RiveBot
        src={model.riveSrc}
        glow={model.botGlow}
        size={26}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "1px" }}>
          <span style={{
            fontSize: "0.78rem", fontWeight: 700,
            color: isAllowed ? "#fff" : "#444",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.03em",
          }}>
            {model.name}
          </span>

          {!isAllowed ? (
            <span style={{
              fontSize: "0.53rem", color: "#555",
              background: "rgba(255,255,255,0.04)",
              padding: "1px 5px", borderRadius: "4px",
              border: "1px solid #252525",
              letterSpacing: "0.05em",
            }}>
              🔒 {model.min_plan_label}
            </span>
          ) : (
            <span style={{
              fontSize: "0.52rem", fontWeight: 800,
              color: model.badgeColor,
              background: `${model.badgeColor}18`,
              padding: "1px 5px", borderRadius: "4px",
              border: `1px solid ${model.badgeColor}28`,
              letterSpacing: "0.1em",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {model.badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.64rem", color: isAllowed ? "#4a4a4a" : "#2a2a2a", lineHeight: 1.3 }}>
          {model.tip}
        </div>
      </div>

      {isSelected && (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6.5" cy="6.5" r="6" stroke={model.color} strokeOpacity="0.4"/>
          <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke={model.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

/* ── Main component ── */
export default function ModelSelector({ selectedModel, onSelect, plan }) {
  const [open,          setOpen]    = useState(false);
  const [allowedModels, setAllowed] = useState(["hb-6"]);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    API.get("/auth/models")
      .then(res => {
        const allowed = (res.data.models || []).filter(m => !m.locked).map(m => m.id);
        setAllowed(allowed.length > 0 ? allowed : ["hb-6"]);
      })
      .catch(() => setAllowed(["hb-6"]));
  }, [plan]);

  const current = MODEL_DEFS.find(m => m.id === selectedModel) || MODEL_DEFS[0];

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>

      {/* ── Closed pill ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title={`Model: ${current.name} — click to change`}
        style={{
          display: "flex", alignItems: "center", gap: "4px",
          background: open ? `${current.color}10` : "transparent",
          border: `1px solid ${open ? current.color + "40" : "#1c1c1c"}`,
          borderRadius: "999px",
          padding: "2px 7px 2px 2px",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.16s ease",
          boxShadow: open && current.botGlow ? `0 0 10px ${current.botGlow}` : "none",
          height: "28px",
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.borderColor = current.color + "40";
            e.currentTarget.style.background = `${current.color}08`;
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = "#1c1c1c";
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {/* key forces remount so useRive reinitialises when model changes */}
        <RiveBot
          key={current.id}
          src={current.riveSrc}
          glow={current.botGlow}
          size={22}
        />

        <span style={{
          fontSize: "0.67rem", fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.05em",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}>
          {current.short}
        </span>

        <svg
          width="7" height="7" viewBox="0 0 8 8" fill="none"
          style={{
            color: "#3a3a3a",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.18s ease",
            marginLeft: "1px",
          }}
        >
          <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: 0,
          background: "#0b0b0b",
          border: "1px solid #1e1e1e",
          borderRadius: "14px",
          padding: "6px",
          width: "248px",
          zIndex: 500,
          boxShadow: "0 16px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.025)",
          animation: "msDropIn 0.15s cubic-bezier(0.2,0,0,1) forwards",
        }}>
          <style>{`
            @keyframes msDropIn {
              from { opacity:0; transform:translateY(5px) scale(0.97); }
              to   { opacity:1; transform:translateY(0)   scale(1);    }
            }
          `}</style>

          <div style={{
            padding: "3px 10px 7px",
            fontSize: "0.58rem", color: "#2e2e2e",
            letterSpacing: "0.12em", textTransform: "uppercase",
            borderBottom: "1px solid #161616",
            marginBottom: "5px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Select Model
          </div>

          {MODEL_DEFS.map(model => (
            <ModelRow
              key={model.id}
              model={model}
              isAllowed={allowedModels.includes(model.id)}
              isSelected={selectedModel === model.id}
              onSelect={onSelect}
              onClose={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}