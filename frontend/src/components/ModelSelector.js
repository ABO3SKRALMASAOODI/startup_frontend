import React, { useState, useEffect, useRef } from "react";
import API from "../api/api";

/* ─── Model Selector ───────────────────────────────────────────────────────── *
 * Small dropdown that sits at the left of the prompt input box.
 * Shows HB-6 / HB-6 Pro / HB-7 with lock icons for plans that don't have access.
 * ──────────────────────────────────────────────────────────────────────────── */

const MODEL_DEFS = [
  {
    id: "hb-6",
    name: "HB-6",
    short: "HB-6",
    tip: "Fast & efficient for everyday tasks",
    color: "#4caf50",
    min_plan_label: "Free+",
  },
  {
    id: "hb-6-pro",
    name: "HB-6 Pro",
    short: "Pro",
    tip: "Powerful for complex apps — uses more credits",
    color: "#cc0000",
    min_plan_label: "Plus+",
  },
  {
    id: "hb-7",
    name: "HB-7",
    short: "HB-7",
    tip: "Advanced reasoning & complex tasks — highest credit usage",
    color: "#ff6600",
    min_plan_label: "Ultra+",
  },
];

export default function ModelSelector({ selectedModel, onSelect, plan }) {
  const [open, setOpen]       = useState(false);
  const [hoveredId, setHover] = useState(null);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Fetch allowed models from backend on mount
  const [allowedModels, setAllowed] = useState(["hb-6"]);
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${current.color}30`,
          borderRadius: "8px",
          padding: "5px 10px",
          cursor: "pointer",
          color: current.color,
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = current.color + "80";
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = current.color + "30";
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        }}
      >
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: current.color,
          boxShadow: `0 0 6px ${current.color}80`,
          flexShrink: 0,
        }} />
        {current.short}
        <span style={{ fontSize: "0.6rem", color: "#555", marginLeft: "2px" }}>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: 0,
          background: "#111",
          border: "1px solid #222",
          borderRadius: "12px",
          padding: "6px",
          minWidth: "220px",
          zIndex: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        }}>
          {MODEL_DEFS.map(model => {
            const isAllowed  = allowedModels.includes(model.id);
            const isSelected = selectedModel === model.id;
            const isHovered  = hoveredId === model.id;

            return (
              <div key={model.id} style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    if (isAllowed) {
                      onSelect(model.id);
                      setOpen(false);
                    }
                  }}
                  onMouseEnter={() => setHover(model.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%",
                    padding: "10px 12px",
                    background: isSelected
                      ? "rgba(140,0,0,0.12)"
                      : isHovered && isAllowed
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isAllowed ? "pointer" : "not-allowed",
                    opacity: isAllowed ? 1 : 0.5,
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: model.color,
                    boxShadow: isSelected ? `0 0 8px ${model.color}` : "none",
                    flexShrink: 0,
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.82rem", fontWeight: 700,
                      color: isAllowed ? "#fff" : "#555",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      {model.name}
                      {!isAllowed && (
                        <span style={{
                          fontSize: "0.6rem", color: "#888",
                          background: "rgba(255,255,255,0.06)",
                          padding: "1px 6px", borderRadius: "4px",
                          border: "1px solid #333",
                        }}>
                          🔒 {model.min_plan_label}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: "0.68rem",
                      color: isAllowed ? "#666" : "#333",
                      marginTop: "2px",
                      lineHeight: 1.3,
                    }}>
                      {model.tip}
                    </div>
                  </div>

                  {isSelected && (
                    <span style={{ color: model.color, fontSize: "0.75rem", flexShrink: 0 }}>✓</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}