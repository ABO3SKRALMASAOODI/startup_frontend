import React, { useState, useEffect, useRef } from "react";
import { useRive } from "rive-react";
import API from "../api/api";

/* ─── Model Selector ───────────────────────────────────────────────────────── *
 * Compact pill trigger → floating card dropdown with Rive bot avatar.
 * ──────────────────────────────────────────────────────────────────────────── */

const MODEL_DEFS = [
  {
    id: "hb-6",
    name: "HB-6",
    short: "HB-6",
    tip: "Fast & efficient for everyday tasks",
    color: "#4caf50",
    glow: "rgba(76,175,80,0.35)",
    min_plan_label: "Free+",
    badge: "FAST",
    badgeColor: "#4caf50",
  },
  {
    id: "hb-6-pro",
    name: "HB-6 Pro",
    short: "HB-6 Pro",
    tip: "Powerful for complex apps — uses more credits",
    color: "#cc0000",
    glow: "rgba(204,0,0,0.35)",
    min_plan_label: "Plus+",
    badge: "PRO",
    badgeColor: "#cc0000",
  },
  {
    id: "hb-7",
    name: "HB-7",
    short: "HB-7",
    tip: "Advanced reasoning & complex tasks — highest credit usage",
    color: "#ff6600",
    glow: "rgba(255,102,0,0.35)",
    min_plan_label: "Ultra+",
    badge: "MAX",
    badgeColor: "#ff6600",
  },
];

/* ── Tiny Rive bot used inside each model row ── */
function MiniBot({ color }) {
  const { RiveComponent } = useRive({
    src: "/hustler-robot.riv",
    autoplay: true,
    stateMachines: ["State Machine 1"],
  });

  return (
    <div style={{
      width: "28px", height: "28px", flexShrink: 0,
      filter: `drop-shadow(0 0 4px ${color})`,
    }}>
      <RiveComponent style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default function ModelSelector({ selectedModel, onSelect, plan }) {
  const [open,     setOpen]    = useState(false);
  const [hoveredId, setHover]  = useState(null);
  const [allowedModels, setAllowed] = useState(["hb-6"]);
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* fetch allowed models */
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

      {/* ── Pill trigger ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: open
            ? `rgba(${current.id === "hb-6" ? "76,175,80" : current.id === "hb-6-pro" ? "140,0,0" : "255,102,0"},0.1)`
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${open ? current.color + "60" : "#1e1e1e"}`,
          borderRadius: "999px",
          padding: "5px 10px 5px 6px",
          cursor: "pointer",
          transition: "all 0.18s ease",
          outline: "none",
          boxShadow: open ? `0 0 12px ${current.glow}` : "none",
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.borderColor = current.color + "50";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = "#1e1e1e";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          }
        }}
      >
        {/* coloured dot */}
        <span style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: current.color,
          boxShadow: `0 0 6px ${current.color}`,
          flexShrink: 0,
          transition: "box-shadow 0.2s",
        }} />

        {/* model name */}
        <span style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: current.color,
          letterSpacing: "0.05em",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1,
        }}>
          {current.short}
        </span>

        {/* chevron */}
        <svg
          width="8" height="8" viewBox="0 0 8 8" fill="none"
          style={{
            color: "#444",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            marginLeft: "1px",
          }}
        >
          <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Dropdown card ── */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 10px)",
          left: 0,
          background: "#0c0c0c",
          border: "1px solid #1e1e1e",
          borderRadius: "16px",
          padding: "8px",
          width: "260px",
          zIndex: 500,
          boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)",
          animation: "msDropIn 0.16s cubic-bezier(0.2,0,0,1) forwards",
        }}>

          {/* inline keyframes */}
          <style>{`
            @keyframes msDropIn {
              from { opacity: 0; transform: translateY(6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
          `}</style>

          {/* header label */}
          <div style={{
            padding: "4px 10px 8px",
            fontSize: "0.6rem",
            color: "#333",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            borderBottom: "1px solid #161616",
            marginBottom: "6px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Select Model
          </div>

          {MODEL_DEFS.map(model => {
            const isAllowed  = allowedModels.includes(model.id);
            const isSelected = selectedModel === model.id;
            const isHovered  = hoveredId === model.id && isAllowed;

            return (
              <button
                key={model.id}
                onClick={() => {
                  if (isAllowed) { onSelect(model.id); setOpen(false); }
                }}
                onMouseEnter={() => isAllowed && setHover(model.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%",
                  padding: "9px 10px",
                  background: isSelected
                    ? `linear-gradient(135deg, ${model.color}15, ${model.color}08)`
                    : isHovered
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                  border: isSelected
                    ? `1px solid ${model.color}30`
                    : "1px solid transparent",
                  borderRadius: "10px",
                  cursor: isAllowed ? "pointer" : "not-allowed",
                  opacity: isAllowed ? 1 : 0.4,
                  transition: "all 0.14s ease",
                  textAlign: "left",
                  marginBottom: "3px",
                  outline: "none",
                  boxShadow: isSelected ? `0 0 10px ${model.glow}` : "none",
                }}
              >
                {/* Rive bot with model-coloured glow */}
                <MiniBot color={isAllowed ? model.color : "#333"} />

                {/* text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    marginBottom: "2px",
                  }}>
                    <span style={{
                      fontSize: "0.8rem", fontWeight: 700,
                      color: isAllowed ? "#fff" : "#444",
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "0.03em",
                    }}>
                      {model.name}
                    </span>

                    {/* badge: either plan lock or speed label */}
                    {!isAllowed ? (
                      <span style={{
                        fontSize: "0.55rem", color: "#666",
                        background: "rgba(255,255,255,0.05)",
                        padding: "1px 6px", borderRadius: "4px",
                        border: "1px solid #2a2a2a",
                        letterSpacing: "0.06em",
                      }}>
                        🔒 {model.min_plan_label}
                      </span>
                    ) : (
                      <span style={{
                        fontSize: "0.54rem",
                        fontWeight: 800,
                        color: model.badgeColor,
                        background: `${model.badgeColor}18`,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        border: `1px solid ${model.badgeColor}30`,
                        letterSpacing: "0.1em",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {model.badge}
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: "0.66rem",
                    color: isAllowed ? "#555" : "#2e2e2e",
                    lineHeight: 1.35,
                  }}>
                    {model.tip}
                  </div>
                </div>

                {/* selected checkmark */}
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="6.5" stroke={model.color} strokeOpacity="0.4"/>
                    <path d="M4 7L6.2 9.2L10 5" stroke={model.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}