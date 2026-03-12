import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  RadialBarChart, RadialBar, ComposedChart,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const fmt = (n) => Number(n || 0).toLocaleString();
const fmtDollar = (n) => `$${Number(n || 0).toLocaleString()}`;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;
const fmtK = (n) => {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
};

const fmtDate = (s) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " · " + d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};
const fmtShortDay = (s) => {
  if (!s) return "";
  const parts = s.split("-");
  return `${parts[1]}/${parts[2]}`;
};
const fmtWeek = (s) => {
  if (!s) return "";
  const d = new Date(s);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
};

const C = {
  bg: "#030303",
  card: "rgba(10,10,10,0.98)",
  cardBorder: "rgba(255,255,255,0.04)",
  cardHover: "rgba(220,38,38,0.06)",
  red: "#dc2626",
  redDim: "#991b1b",
  redGlow: "rgba(220,38,38,0.12)",
  crimson: "#cc0000",
  blue: "#3b82f6",
  green: "#10b981",
  amber: "#f59e0b",
  pink: "#ec4899",
  purple: "#a855f7",
  teal: "#14b8a6",
  orange: "#f97316",
  cyan: "#06b6d4",
  text: "#ffffff",
  textDim: "rgba(255,255,255,0.45)",
  textMuted: "rgba(255,255,255,0.2)",
  textGhost: "rgba(255,255,255,0.08)",
  line: "rgba(255,255,255,0.04)",
};

const PLAN_COLORS = { free: "#3a3a3a", plus: "#3b82f6", pro: "#a855f7", ultra: "#dc2626" };
const PLAN_LABELS = { free: "Free", plus: "Plus", pro: "Pro", ultra: "Ultra" };
const STATE_COLOR = { completed: "#10b981", running: "#f59e0b", failed: "#ef4444" };

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════════════════════════ */

function AdminStyles() {
  useEffect(() => {
    const id = "admin-v2-styles";
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulseDot { 0%,100% { opacity: 1; box-shadow: 0 0 4px currentColor; } 50% { opacity: 0.4; box-shadow: 0 0 10px currentColor; } }
      @keyframes glowBreathe { 0%,100% { box-shadow: 0 0 12px rgba(220,38,38,0.08); } 50% { box-shadow: 0 0 24px rgba(220,38,38,0.15); } }

      .adm-scroll::-webkit-scrollbar { width: 3px; height: 3px; }
      .adm-scroll::-webkit-scrollbar-track { background: transparent; }
      .adm-scroll::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.2); border-radius: 2px; }

      .adm-card {
        background: ${C.card};
        border: 1px solid ${C.cardBorder};
        border-radius: 14px;
        animation: fadeUp 0.35s ease forwards;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .adm-card:hover {
        border-color: rgba(220,38,38,0.12);
        box-shadow: 0 0 20px rgba(220,38,38,0.04);
      }

      .adm-row:hover { background: rgba(220,38,38,0.03) !important; }

      .adm-nav-btn {
        background: transparent;
        border: none;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        font-family: 'Outfit', sans-serif;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }
      .adm-nav-btn.active {
        background: rgba(220,38,38,0.12);
        color: #fff;
      }
      .adm-nav-btn:not(.active) {
        color: rgba(255,255,255,0.32);
      }
      .adm-nav-btn:not(.active):hover {
        color: rgba(255,255,255,0.6);
        background: rgba(255,255,255,0.03);
      }
    `;
    document.head.appendChild(tag);
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function LiveDot({ color = C.red, size = 6 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-block", animation: "pulseDot 1.8s ease-in-out infinite", color, flexShrink: 0 }} />;
}

function PlanBadge({ plan }) {
  const c = PLAN_COLORS[plan] || "#444";
  return (
    <span style={{ background: `${c}18`, color: c === "#3a3a3a" ? "rgba(255,255,255,0.35)" : c, border: `1px solid ${c}30`, borderRadius: "6px", padding: "2px 10px", fontWeight: 700, fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Space Mono', monospace" }}>
      {PLAN_LABELS[plan] || plan}
    </span>
  );
}

function StateBadge({ state }) {
  const c = STATE_COLOR[state] || "#666";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: c, background: `${c}12`, border: `1px solid ${c}25`, borderRadius: 6, padding: "3px 10px", fontSize: "0.66rem", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
      {state === "running" && <LiveDot color={c} size={5} />}
      {state}
    </span>
  );
}

function TrendBadge({ value }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", fontWeight: 700, color: up ? C.green : C.red, background: up ? "rgba(16,185,129,0.08)" : "rgba(220,38,38,0.08)", padding: "2px 8px", borderRadius: 6, fontFamily: "'Space Mono', monospace" }}>
      {up ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

/* ── Metric Card ── */
function MetricCard({ label, value, sub, accent = C.red, icon, trend, delay = 0, small }) {
  return (
    <div className="adm-card" style={{ padding: small ? "14px 16px" : "18px 20px", position: "relative", overflow: "hidden", animationDelay: `${delay}ms` }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent 10%, ${accent}55, transparent 90%)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", color: C.textMuted, marginBottom: 8, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: small ? "1.5rem" : "1.85rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>{value}</div>
          {sub && <div style={{ fontSize: "0.7rem", color: C.textMuted, marginTop: 6, fontFamily: "'Outfit', sans-serif" }}>{sub}</div>}
          {trend !== undefined && <div style={{ marginTop: 6 }}><TrendBadge value={trend} /></div>}
        </div>
        {icon && (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}0a`, border: `1px solid ${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{icon}</div>
        )}
      </div>
    </div>
  );
}

/* ── Chart Card wrapper ── */
function ChartCard({ title, subtitle, children, style, action, noPad }) {
  return (
    <div className="adm-card" style={{ padding: noPad ? 0 : "18px 20px", overflow: "hidden", ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: noPad ? "18px 20px 0" : 0 }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>{title}</div>
            {subtitle && <div style={{ fontSize: "0.65rem", color: C.textMuted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Custom Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(6,6,6,0.97)", border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: "0.74rem", fontFamily: "'Outfit', sans-serif", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
      <div style={{ color: C.textMuted, marginBottom: 6, fontSize: "0.66rem" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#fff", display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
          <span style={{ width: 5, height: 5, background: p.color, borderRadius: "50%", display: "inline-block" }} />
          <span style={{ color: C.textDim }}>{p.name}:</span>
          <strong style={{ color: "#fff" }}>{typeof p.value === "number" && p.value % 1 !== 0 ? p.value.toFixed(1) : fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

/* ── Pagination ── */
function Pagination({ page, total, perPage = 20, onPageChange }) {
  const totalPages = Math.ceil(total / perPage);
  const btnStyle = { background: "rgba(255,255,255,0.03)", border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: "0.74rem", fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
      <span style={{ fontSize: "0.72rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{fmt(total)} total · page {page}/{totalPages || 1}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} style={{ ...btnStyle, opacity: page === 1 ? 0.3 : 1 }}>← Prev</button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} style={{ ...btnStyle, opacity: page >= totalPages ? 0.3 : 1 }}>Next →</button>
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon, title, count, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 18, background: C.red, borderRadius: 2 }} />
        <span style={{ fontSize: "0.66rem", opacity: 0.5 }}>{icon}</span>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
        {count !== undefined && <span style={{ fontSize: "0.7rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{fmt(count)}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Plan Ring ── */
function PlanRing({ breakdown }) {
  const data = Object.entries(breakdown || {}).map(([plan, count]) => ({ name: PLAN_LABELS[plan] || plan, value: count, color: PLAN_COLORS[plan] || "#666", plan })).filter(d => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!data.length) return <div style={{ color: C.textMuted, textAlign: "center", padding: 40, fontSize: "0.8rem" }}>No data</div>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={62} dataKey="value" strokeWidth={2} stroke="#0a0a0a">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>{fmt(total)}</span>
          <span style={{ fontSize: "0.52rem", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>users</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, background: d.color, borderRadius: 3, display: "inline-block" }} />
                  <span style={{ fontSize: "0.76rem", color: C.textDim, fontFamily: "'Outfit', sans-serif" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#fff", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(d.value)} <span style={{ color: C.textMuted, fontWeight: 400 }}>({pct}%)</span></span>
              </div>
              <div style={{ height: 3, background: C.textGhost, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 2, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Activity Feed ── */
const EVENT_META = {
  register: { icon: "◉", color: C.blue, label: "Register" },
  subscribe: { icon: "◈", color: C.green, label: "Subscribe" },
  job_done: { icon: "✓", color: C.green, label: "Completed" },
  job_fail: { icon: "✕", color: C.red, label: "Failed" },
  job_start: { icon: "⚡", color: C.amber, label: "Started" },
};

function ActivityFeed({ events }) {
  return (
    <div className="adm-scroll" style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 380, overflowY: "auto" }}>
      {events.map((e, i) => {
        const meta = EVENT_META[e.type] || { icon: "•", color: "#666", label: e.type };
        return (
          <div key={i} className="adm-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, transition: "background 0.15s" }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: `${meta.color}12`, border: `1px solid ${meta.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", color: meta.color, fontWeight: 700, flexShrink: 0 }}>{meta.icon}</div>
            <div style={{ flex: 1, minWidth: 0, fontSize: "0.76rem", color: C.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Outfit', sans-serif" }}>{e.label}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: "0.58rem", color: meta.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Space Mono', monospace" }}>{meta.label}</span>
              <span style={{ fontSize: "0.58rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{fmtTime(e.ts)}</span>
            </div>
          </div>
        );
      })}
      {!events.length && <div style={{ color: C.textMuted, fontSize: "0.8rem", textAlign: "center", padding: 40 }}>No activity yet</div>}
    </div>
  );
}

/* ── Conversion Funnel ── */
function ConversionFunnel({ funnel }) {
  if (!funnel) return null;
  const steps = [
    { label: "Visitors", value: funnel.visitors_30d, color: C.blue },
    { label: "Registered", value: funnel.registered_30d, color: C.purple, rate: funnel.visitor_to_register },
    { label: "Subscribed", value: funnel.subscribed_30d, color: C.green, rate: funnel.register_to_subscribe },
  ];
  const maxVal = Math.max(...steps.map(s => s.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {steps.map((step, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: step.color, fontFamily: "'Outfit', sans-serif" }}>{step.label}</span>
              {step.rate !== undefined && (
                <span style={{ fontSize: "0.62rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{fmtPct(step.rate)} conversion</span>
              )}
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>{fmt(step.value)}</span>
          </div>
          <div style={{ height: 6, background: C.textGhost, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(step.value / maxVal) * 100}%`, background: `linear-gradient(90deg, ${step.color}cc, ${step.color})`, borderRadius: 3, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Retention Cohort Heatmap ── */
function CohortHeatmap({ cohorts }) {
  if (!cohorts || !cohorts.length) return <div style={{ color: C.textMuted, textAlign: "center", padding: 40 }}>Not enough data for cohorts yet</div>;

  const cellColor = (pct) => {
    if (pct >= 50) return "rgba(220,38,38,0.7)";
    if (pct >= 30) return "rgba(220,38,38,0.45)";
    if (pct >= 15) return "rgba(220,38,38,0.25)";
    if (pct > 0) return "rgba(220,38,38,0.12)";
    return "rgba(255,255,255,0.02)";
  };

  return (
    <div className="adm-scroll" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 12px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace" }}>Cohort</th>
            <th style={{ ...heatmapTh }}>Size</th>
            {["Wk 0", "Wk 1", "Wk 2", "Wk 3", "Wk 4"].map(w => <th key={w} style={{ ...heatmapTh }}>{w}</th>)}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c, i) => (
            <tr key={i}>
              <td style={{ padding: "6px 12px", color: C.textDim, fontFamily: "'Space Mono', monospace", fontSize: "0.7rem" }}>{fmtWeek(c.cohort)}</td>
              <td style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 700, fontFamily: "'Space Mono', monospace", fontSize: "0.72rem" }}>{c.size}</td>
              {c.retention.map((pct, j) => (
                <td key={j} style={{ padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ background: cellColor(pct), borderRadius: 4, padding: "4px 0", color: pct > 0 ? "#fff" : C.textMuted, fontSize: "0.68rem", fontWeight: 700, fontFamily: "'Space Mono', monospace", transition: "background 0.3s" }}>
                    {fmtPct(pct)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const heatmapTh = { padding: "8px 8px", textAlign: "center", color: C.textMuted, fontWeight: 600, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Space Mono', monospace" };

/* ── Hourly Heatmap ── */
function HourlyHeatmap({ data, valueKey = "count", label = "Jobs" }) {
  if (!data || !data.length) return null;
  const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 1);
  const full24 = Array.from({ length: 24 }, (_, h) => {
    const match = data.find(d => d.hour === h);
    return { hour: h, value: match ? match[valueKey] || match.views || 0 : 0 };
  });

  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 80, padding: "0 4px" }}>
      {full24.map((d, i) => {
        const pct = d.value / maxVal;
        return (
          <div key={i} title={`${d.hour}:00 — ${d.value} ${label}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", height: `${Math.max(4, pct * 60)}px`, background: pct > 0.7 ? C.red : pct > 0.3 ? `${C.red}88` : `${C.red}33`, borderRadius: 2, transition: "height 0.4s ease" }} />
            {i % 3 === 0 && <span style={{ fontSize: "0.5rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{d.hour}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Engagement Segments Ring ── */
function SegmentRing({ segments }) {
  const data = [
    { name: "Power", value: segments?.power || 0, color: C.red },
    { name: "Active", value: segments?.active || 0, color: C.amber },
    { name: "Casual", value: segments?.casual || 0, color: C.blue },
    { name: "Dormant", value: segments?.dormant || 0, color: "#333" },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <div style={{ color: C.textMuted, textAlign: "center", padding: 40 }}>No data</div>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={56} dataKey="value" strokeWidth={2} stroke="#0a0a0a">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>{fmt(total)}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, background: d.color, borderRadius: 3 }} />
            <span style={{ fontSize: "0.74rem", color: C.textDim, fontFamily: "'Outfit', sans-serif", minWidth: 60 }}>{d.name}</span>
            <span style={{ fontSize: "0.72rem", color: "#fff", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AXIS TICK STYLE
   ═══════════════════════════════════════════════════════════════════════════ */
const axisTick = { fill: C.textMuted, fontSize: 9, fontFamily: "'Space Mono', monospace" };
const gridStroke = "rgba(255,255,255,0.025)";

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("user_email");

  /* ── State ── */
  const [overview, setOverview] = useState(null);
  const [regChart, setRegChart] = useState([]);
  const [jobChart, setJobChart] = useState([]);
  const [visChart, setVisChart] = useState([]);
  const [credChart, setCredChart] = useState([]);
  const [mrrChart, setMrrChart] = useState([]);
  const [users, setUsers] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobPage, setJobPage] = useState(1);
  const [jobFilter, setJobFilter] = useState("");
  const [topUsers, setTopUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [engineStats, setEngineStats] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [retention, setRetention] = useState(null);
  const [pageAnalytics, setPageAnalytics] = useState(null);
  const [countryData, setCountryData] = useState([]);
  const [realtime, setRealtime] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!token || email !== "thehustlerbot@gmail.com") navigate("/");
  }, [token, email, navigate]);

  const headers = { Authorization: `Bearer ${token}` };

  /* ── Data loaders ── */
  const loadOverview = useCallback(async () => {
    try {
      const [ov, reg, job, vis, cred, mrr, top, act] = await Promise.all([
        API.get("/admin/overview", { headers }),
        API.get("/admin/charts/registrations", { headers }),
        API.get("/admin/charts/jobs", { headers }),
        API.get("/admin/charts/visits", { headers }),
        API.get("/admin/charts/credits", { headers }),
        API.get("/admin/charts/mrr", { headers }).catch(() => ({ data: { data: [] } })),
        API.get("/admin/top-users", { headers }),
        API.get("/admin/activity", { headers }),
      ]);
      setOverview(ov.data); setRegChart(reg.data.data || []); setJobChart(job.data.data || []);
      setVisChart(vis.data.data || []); setCredChart(cred.data.data || []); setMrrChart(mrr.data.data || []);
      setTopUsers(top.data.users || []); setActivity(act.data.events || []);
      setLastRefresh(new Date());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRevenue = useCallback(async () => {
    try {
      const res = await API.get("/admin/revenue", { headers });
      setRevenue(res.data);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEngine = useCallback(async () => {
    try {
      const res = await API.get("/admin/engine-stats", { headers });
      setEngineStats(res.data);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEngagement = useCallback(async () => {
    try {
      const [eng, ret, pa, countries] = await Promise.all([
        API.get("/admin/engagement", { headers }),
        API.get("/admin/retention", { headers }).catch(() => ({ data: { cohorts: [] } })),
        API.get("/admin/page-analytics", { headers }),
        API.get("/admin/country-stats", { headers }).catch(() => ({ data: { countries: [] } })),
      ]);
      setEngagement(eng.data); setRetention(ret.data); setPageAnalytics(pa.data);
      setCountryData(countries.data.countries || []);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRealtime = useCallback(async () => {
    try {
      const res = await API.get("/admin/realtime", { headers });
      setRealtime(res.data);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSessionStats = useCallback(async () => {
    try {
      const res = await API.get("/admin/session-stats", { headers });
      setSessionStats(res.data);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users?page=${userPage}&search=${userSearch}`, { headers });
      setUsers(res.data.users || []); setUserTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPage, userSearch]);

  const loadJobs = useCallback(async () => {
    try {
      const res = await API.get(`/admin/jobs?page=${jobPage}&state=${jobFilter}`, { headers });
      setJobs(res.data.jobs || []); setJobTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobPage, jobFilter]);

  /* ── Effects ── */
  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { if (activeTab === "revenue") loadRevenue(); }, [activeTab, loadRevenue]);
  useEffect(() => { if (activeTab === "engine") loadEngine(); }, [activeTab, loadEngine]);
  useEffect(() => { if (activeTab === "engagement") { loadEngagement(); loadSessionStats(); } }, [activeTab, loadEngagement, loadSessionStats]);
  useEffect(() => { if (activeTab === "live") loadRealtime(); }, [activeTab, loadRealtime]);
  useEffect(() => { if (activeTab === "users") loadUsers(); }, [activeTab, userPage, userSearch, loadUsers]);
  useEffect(() => { if (activeTab === "jobs") loadJobs(); }, [activeTab, jobPage, jobFilter, loadJobs]);
  useEffect(() => {
    const t = setInterval(() => {
      loadOverview();
      if (activeTab === "live") loadRealtime();
    }, 30000);
    return () => clearInterval(t);
  }, [loadOverview, loadRealtime, activeTab]);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: `2px solid rgba(220,38,38,0.12)`, borderTop: `2px solid ${C.red}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: C.textMuted, fontSize: "0.8rem", fontFamily: "'Outfit', sans-serif" }}>Loading command center…</div>
      </div>
      <AdminStyles />
    </div>
  );

  const o = overview || {};

  const TABS = [
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "revenue", label: "Revenue", icon: "◈" },
    { id: "engine", label: "Engine", icon: "⚙" },
    { id: "engagement", label: "Engage", icon: "◎" },
    { id: "users", label: "Users", icon: "👤" },
    { id: "jobs", label: "Jobs", icon: "⚡" },
    { id: "live", label: "Live", icon: "●" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
      <AdminStyles />

      {/* ══════════ TOP NAV ══════════ */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(3,3,3,0.88)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.cardBorder}`, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/")} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.cardBorder}`, color: C.textDim, cursor: "pointer", fontSize: "0.74rem", padding: "4px 12px", borderRadius: 7, fontFamily: "'Outfit', sans-serif", fontWeight: 600, transition: "all 0.15s" }}>← Home</button>
          <div style={{ width: 1, height: 18, background: C.cardBorder }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LiveDot size={7} />
            <span style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em" }}>COMMAND CENTER</span>
          </div>
        </div>

        <div className="adm-scroll" style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 3, border: `1px solid ${C.cardBorder}`, overflowX: "auto", maxWidth: "60%" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`adm-nav-btn ${activeTab === tab.id ? "active" : ""}`}>
              <span style={{ fontSize: "0.65rem", opacity: activeTab === tab.id ? 1 : 0.5 }}>{tab.icon}</span>
              {tab.label}
              {tab.id === "live" && <LiveDot size={5} color={C.green} />}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.64rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          <button onClick={() => { loadOverview(); if (activeTab === "live") loadRealtime(); }} style={{ background: C.redGlow, border: `1px solid ${C.red}25`, borderRadius: 8, padding: "4px 14px", color: C.red, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.15s" }}>↻</button>
        </div>
      </div>

      {/* ══════════ CONTENT ══════════ */}
      <div style={{ padding: "24px 24px 60px", maxWidth: 1480, margin: "0 auto" }}>

        {/* ════════════════════ OVERVIEW TAB ════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* KPI Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 10 }}>
              <MetricCard label="Total Users" value={fmt(o.users?.total)} sub={`+${fmt(o.users?.new_today)} today`} accent={C.blue} icon="👥" trend={o.users?.trend_week} delay={0} />
              <MetricCard label="MRR" value={fmtDollar(o.subscriptions?.mrr)} sub={`${fmt(o.subscriptions?.total)} subscribers`} accent={C.green} icon="💰" delay={50} />
              <MetricCard label="Jobs Today" value={fmt(o.jobs?.today)} sub={`${fmt(o.jobs?.total)} all time`} accent={C.amber} icon="⚡" delay={100} />
              <MetricCard label="Success Rate" value={fmtPct(o.jobs?.success_rate)} sub={`${fmt(o.jobs?.failed_today)} failed today`} accent={o.jobs?.success_rate >= 90 ? C.green : C.red} icon="✓" delay={150} />
              <MetricCard label="Visits Today" value={fmt(o.visits?.today)} sub={`${fmt(o.visits?.week)} this week`} accent={C.purple} icon="👁" trend={o.visits?.trend_week} delay={200} />
            </div>

            {/* KPI Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
              <MetricCard small label="New This Week" value={fmt(o.users?.new_week)} accent={C.orange} icon="📈" delay={250} />
              <MetricCard small label="Conversion" value={fmtPct(o.subscriptions?.conversion_rate)} accent={C.teal} icon="🎯" delay={300} />
              <MetricCard small label="Running Now" value={fmt(o.jobs?.running)} accent={o.jobs?.running > 0 ? C.red : C.green} icon={o.jobs?.running > 0 ? "🔴" : "✅"} delay={350} />
              <MetricCard small label="Credits Today" value={Number(o.credits?.consumed_today || 0).toFixed(1)} accent={C.pink} icon="🔥" delay={400} />
              <MetricCard small label="Avg Cr/Job" value={o.credits?.avg_per_job || "—"} accent={C.cyan} icon="📊" delay={450} />
            </div>

            {/* Charts row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <ChartCard title="User Registrations" subtitle="Last 30 days — daily new verified users">
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={regChart}>
                    <defs><linearGradient id="rG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.blue} stopOpacity={0.15} /><stop offset="100%" stopColor={C.blue} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                    <YAxis tick={axisTick} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" name="Users" stroke={C.blue} strokeWidth={2} fill="url(#rG2)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Page Visits" subtitle="Last 30 days — total page views">
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={visChart}>
                    <defs><linearGradient id="vG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.purple} stopOpacity={0.15} /><stop offset="100%" stopColor={C.purple} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                    <YAxis tick={axisTick} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" name="Visits" stroke={C.purple} strokeWidth={2} fill="url(#vG2)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
              <ChartCard title="Build Jobs" subtitle="Completed vs Failed — Last 30 days">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={jobChart} barSize={6} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                    <YAxis tick={axisTick} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "0.65rem", color: C.textMuted }} />
                    <Bar dataKey="completed" name="Completed" fill={C.green} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="failed" name="Failed" fill={C.red} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Plan Distribution" subtitle="All verified users">
                <PlanRing breakdown={o.subscriptions?.plan_breakdown} />
              </ChartCard>
            </div>

            {/* Credits chart */}
            <div style={{ marginBottom: 10 }}>
              <ChartCard title="Credit Consumption" subtitle="Last 30 days — daily credits used">
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={credChart}>
                    <defs><linearGradient id="cG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.pink} stopOpacity={0.15} /><stop offset="100%" stopColor={C.pink} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                    <YAxis tick={axisTick} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="credits" name="Credits" stroke={C.pink} strokeWidth={2} fill="url(#cG2)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Activity + Top Users */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <ChartCard title="Live Activity" subtitle="Recent events across the platform">
                <ActivityFeed events={activity} />
              </ChartCard>

              <ChartCard title="Top Users" subtitle="By credit consumption">
                <div className="adm-scroll" style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 380, overflowY: "auto" }}>
                  {topUsers.map((u, i) => (
                    <div key={i} className="adm-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, transition: "background 0.15s" }}>
                      <div style={{ width: 22, height: 22, background: i === 0 ? C.red : i === 1 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.64rem", fontWeight: 800, flexShrink: 0, color: i === 0 ? "#fff" : C.textDim, fontFamily: "'Space Mono', monospace" }}>{i + 1}</div>
                      <span style={{ flex: 1, fontSize: "0.76rem", color: C.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                      <PlanBadge plan={u.plan} />
                      <span style={{ fontSize: "0.72rem", color: C.pink, fontWeight: 700, minWidth: 50, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>{Number(u.credits_used).toFixed(1)}</span>
                      <span style={{ fontSize: "0.66rem", color: C.textMuted, minWidth: 36, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>{fmt(u.jobs)}</span>
                    </div>
                  ))}
                  {!topUsers.length && <div style={{ color: C.textMuted, textAlign: "center", padding: 40 }}>No data yet</div>}
                </div>
              </ChartCard>
            </div>
          </>
        )}

        {/* ════════════════════ REVENUE TAB ════════════════════ */}
        {activeTab === "revenue" && (
          <>
            {revenue ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 10 }}>
                  <MetricCard label="MRR" value={fmtDollar(revenue.mrr)} accent={C.green} icon="💰" delay={0} />
                  <MetricCard label="ARR" value={fmtDollar(revenue.arr)} accent={C.green} icon="📈" delay={50} />
                  <MetricCard label="ARPU" value={fmtDollar(revenue.arpu)} sub="Per verified user" accent={C.blue} icon="👤" delay={100} />
                  <MetricCard label="ARPPU" value={fmtDollar(revenue.arppu)} sub="Per paying user" accent={C.purple} icon="💎" delay={150} />
                  <MetricCard label="LTV Estimate" value={fmtDollar(revenue.ltv_estimate)} sub="6-month avg" accent={C.amber} icon="🏆" delay={200} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <ChartCard title="MRR Trend" subtitle="Last 30 days">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={mrrChart}>
                        <defs><linearGradient id="mrrG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.2} /><stop offset="100%" stopColor={C.green} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                        <YAxis tick={axisTick} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="mrr" name="MRR" stroke={C.green} strokeWidth={2} fill="url(#mrrG)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Conversion Funnel" subtitle="Last 30 days — Visitor → Register → Subscribe">
                    <ConversionFunnel funnel={revenue.funnel} />
                  </ChartCard>
                </div>

                <ChartCard title="Revenue by Plan" subtitle="Monthly recurring by tier">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 8 }}>
                    {["plus", "pro", "ultra"].map(plan => {
                      const info = revenue.revenue_by_plan?.[plan] || { count: 0, revenue: 0, price: 0 };
                      return (
                        <div key={plan} style={{ background: `${PLAN_COLORS[plan]}08`, border: `1px solid ${PLAN_COLORS[plan]}20`, borderRadius: 12, padding: "18px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <PlanBadge plan={plan} />
                            <span style={{ fontSize: "0.72rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>${info.price}/mo</span>
                          </div>
                          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", marginBottom: 4 }}>{fmtDollar(info.revenue)}</div>
                          <div style={{ fontSize: "0.72rem", color: C.textDim }}>{fmt(info.count)} subscribers</div>
                        </div>
                      );
                    })}
                  </div>
                </ChartCard>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 80, color: C.textMuted }}>Loading revenue data...</div>
            )}
          </>
        )}

        {/* ════════════════════ ENGINE TAB ════════════════════ */}
        {activeTab === "engine" && (
          <>
            {engineStats ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 10 }}>
                  <MetricCard label="Avg Tokens/Job" value={fmtK(engineStats.avg_tokens_per_job)} accent={C.amber} icon="🔤" delay={0} />
                  <MetricCard label="Avg Credits/Job" value={engineStats.avg_credits_per_job} accent={C.pink} icon="🔥" delay={50} />
                  <MetricCard label="Max Tokens" value={fmtK(engineStats.max_tokens_job)} accent={C.red} icon="📈" delay={100} />
                  <MetricCard label="Avg Turns/Job" value={engineStats.avg_turns_per_job} accent={C.blue} icon="🔄" delay={150} />
                  <MetricCard label="Success Rate" value={fmtPct(o.jobs?.success_rate)} accent={o.jobs?.success_rate >= 90 ? C.green : C.red} icon="✓" delay={200} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <ChartCard title="Token Usage Trend" subtitle="Last 30 days — input vs output tokens">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={engineStats.token_trend}>
                        <defs>
                          <linearGradient id="itG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.blue} stopOpacity={0.15} /><stop offset="100%" stopColor={C.blue} stopOpacity={0} /></linearGradient>
                          <linearGradient id="otG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.amber} stopOpacity={0.15} /><stop offset="100%" stopColor={C.amber} stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                        <YAxis tick={axisTick} tickFormatter={fmtK} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "0.65rem", color: C.textMuted }} />
                        <Area type="monotone" dataKey="input_tokens" name="Input" stroke={C.blue} strokeWidth={1.5} fill="url(#itG)" dot={false} />
                        <Area type="monotone" dataKey="output_tokens" name="Output" stroke={C.amber} strokeWidth={1.5} fill="url(#otG)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Daily Success Rate" subtitle="Last 7 days — completed / (completed + failed)">
                    <ResponsiveContainer width="100%" height={220}>
                      <ComposedChart data={engineStats.daily_success_rate}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                        <YAxis yAxisId="left" tick={axisTick} />
                        <YAxis yAxisId="right" orientation="right" tick={axisTick} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "0.65rem", color: C.textMuted }} />
                        <Bar yAxisId="left" dataKey="completed" name="Completed" fill={C.green} radius={[3, 3, 0, 0]} barSize={8} />
                        <Bar yAxisId="left" dataKey="failed" name="Failed" fill={C.red} radius={[3, 3, 0, 0]} barSize={8} />
                        <Line yAxisId="right" type="monotone" dataKey="success_rate" name="Success %" stroke={C.amber} strokeWidth={2} dot={{ r: 3, fill: C.amber }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <ChartCard title="Token Breakdown" subtitle="All-time input / output / cache distribution">
                    {(() => {
                      const tb = engineStats.token_breakdown || {};
                      const data = [
                        { name: "Input", value: tb.input, color: C.blue },
                        { name: "Output", value: tb.output, color: C.amber },
                        { name: "Cache Write", value: tb.cache_write, color: C.purple },
                        { name: "Cache Read", value: tb.cache_read, color: C.teal },
                      ].filter(d => d.value > 0);
                      const total = data.reduce((s, d) => s + d.value, 0);
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                          <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={62} dataKey="value" strokeWidth={2} stroke="#0a0a0a">
                                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                            {data.map((d, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 8, height: 8, background: d.color, borderRadius: 3 }} />
                                <span style={{ fontSize: "0.74rem", color: C.textDim, flex: 1 }}>{d.name}</span>
                                <span style={{ fontSize: "0.72rem", color: "#fff", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmtK(d.value)}</span>
                                <span style={{ fontSize: "0.62rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{total > 0 ? `${((d.value / total) * 100).toFixed(0)}%` : ""}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </ChartCard>

                  <ChartCard title="Hourly Build Distribution" subtitle="When users build — last 30 days (UTC)">
                    <HourlyHeatmap data={engineStats.hourly_distribution} valueKey="count" label="builds" />
                  </ChartCard>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 80, color: C.textMuted }}>Loading engine stats...</div>
            )}
          </>
        )}

        {/* ════════════════════ ENGAGEMENT TAB ════════════════════ */}
        {activeTab === "engagement" && (
          <>
            {engagement ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 10 }}>
                  <MetricCard label="DAU" value={fmt(engagement.dau)} accent={C.green} icon="📊" delay={0} />
                  <MetricCard label="WAU" value={fmt(engagement.wau)} accent={C.blue} icon="📈" delay={50} />
                  <MetricCard label="MAU" value={fmt(engagement.mau)} accent={C.purple} icon="📉" delay={100} />
                  <MetricCard label="Stickiness" value={fmtPct(engagement.stickiness)} sub="DAU/MAU ratio" accent={C.amber} icon="🧲" delay={150} />
                  <MetricCard label="Avg Jobs/User" value={engagement.avg_jobs_per_active_user} sub="Active users · 7d" accent={C.pink} icon="⚡" delay={200} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <ChartCard title="DAU Trend" subtitle="Daily active users — last 14 days">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={engagement.dau_trend}>
                        <defs><linearGradient id="dauG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.15} /><stop offset="100%" stopColor={C.green} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                        <YAxis tick={axisTick} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="dau" name="DAU" stroke={C.green} strokeWidth={2} fill="url(#dauG)" dot={{ r: 2, fill: C.green }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="User Segments" subtitle="By activity level — last 7 days">
                    <SegmentRing segments={engagement.segments} />
                  </ChartCard>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <ChartCard title="Retention Cohorts" subtitle="Weekly — % of users who returned to build in subsequent weeks">
                    <CohortHeatmap cohorts={retention?.cohorts} />
                  </ChartCard>
                </div>

                {countryData.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <ChartCard title="Visitors by Country" subtitle="Last 30 days — where your visitors come from">
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginTop: 4 }}>
                        {countryData.slice(0, 12).map((c, i) => {
                          const maxVisits = countryData[0]?.visits || 1;
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.2)", fontFamily: "Space Mono, monospace", minWidth: 18, textAlign: "right" }}>{i + 1}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontSize: "0.76rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.country}</span>
                                  <span style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 700, fontFamily: "Space Mono, monospace", flexShrink: 0, marginLeft: 6 }}>{fmt(c.visits)}</span>
                                </div>
                                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: (c.visits / maxVisits * 100) + "%", background: "linear-gradient(90deg, rgba(220,38,38,0.6), #dc2626)", borderRadius: 2, transition: "width 0.6s ease" }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ChartCard>
                  </div>
                )}
                {sessionStats && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                    {/* Referrer Sources */}
                    <ChartCard title="Traffic Sources" subtitle="Last 30 days — how visitors found you">
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                        {(() => {
                          const colors = { direct: C.blue, search: C.green, social: C.pink, referral: C.amber, internal: C.purple };
                          const icons = { direct: "⌨", search: "🔍", social: "📱", referral: "🔗", internal: "↩" };
                          const total = (sessionStats.referrer_breakdown || []).reduce((s, r) => s + r.visits, 0) || 1;
                          return (sessionStats.referrer_breakdown || []).map((r, i) => (
                            <div key={i}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontSize: "0.76rem", color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
                                  <span>{icons[r.referrer_source] || "•"}</span>{r.referrer_source}
                                </span>
                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff", fontFamily: "Space Mono, monospace" }}>
                                  {r.visits} <span style={{ color: C.textMuted, fontWeight: 400 }}>({Math.round(r.visits/total*100)}%)</span>
                                </span>
                              </div>
                              <div style={{ height: 4, background: C.textGhost, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${r.visits/total*100}%`, background: colors[r.referrer_source] || C.blue, borderRadius: 2, transition: "width 0.6s" }} />
                              </div>
                            </div>
                          ));
                        })()}
                        {!sessionStats.referrer_breakdown?.length && <div style={{ color: C.textMuted, fontSize: "0.8rem", textAlign: "center", padding: 20 }}>No data yet</div>}
                      </div>
                    </ChartCard>

                    {/* Device Breakdown */}
                    <ChartCard title="Devices" subtitle="Last 30 days">
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                        {(() => {
                          const colors = { desktop: C.blue, mobile: C.green, tablet: C.amber };
                          const icons = { desktop: "🖥", mobile: "📱", tablet: "📟" };
                          const total = (sessionStats.device_breakdown || []).reduce((s, r) => s + (r.unique_devices || r.visits), 0) || 1;
                          return (sessionStats.device_breakdown || []).map((r, i) => (
                            <div key={i}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontSize: "0.76rem", color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
                                  <span>{icons[r.device_type] || "•"}</span>{r.device_type}
                                </span>
                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff", fontFamily: "Space Mono, monospace" }}>
                                  {r.unique_devices || r.visits} <span style={{ color: C.textMuted, fontWeight: 400 }}>({Math.round((r.unique_devices || r.visits)/total*100)}%)</span>
                                </span>
                              </div>
                              <div style={{ height: 4, background: C.textGhost, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${(r.unique_devices || r.visits)/total*100}%`, background: colors[r.device_type] || C.blue, borderRadius: 2, transition: "width 0.6s" }} />
                              </div>
                            </div>
                          ));
                        })()}
                        {!sessionStats.device_breakdown?.length && <div style={{ color: C.textMuted, fontSize: "0.8rem", textAlign: "center", padding: 20 }}>No data yet</div>}
                        <div style={{ borderTop: `1px solid ${C.cardBorder}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                          <div style={{ textAlign: "center", flex: 1 }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{sessionStats.avg_session_duration}s</div>
                            <div style={{ fontSize: "0.62rem", color: C.textMuted, marginTop: 2 }}>Avg session</div>
                          </div>
                          <div style={{ textAlign: "center", flex: 1 }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{sessionStats.avg_pages_per_session}</div>
                            <div style={{ fontSize: "0.62rem", color: C.textMuted, marginTop: 2 }}>Pages/session</div>
                          </div>
                        </div>
                      </div>
                    </ChartCard>

                    {/* Browser Breakdown */}
                    <ChartCard title="Browsers" subtitle="Last 30 days">
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                        {(() => {
                          const colors = { Chrome: C.blue, Safari: C.amber, Firefox: C.orange, Edge: C.teal, Opera: C.red, Other: "#555" };
                          const total = (sessionStats.browser_breakdown || []).reduce((s, r) => s + r.visits, 0) || 1;
                          return (sessionStats.browser_breakdown || []).map((r, i) => (
                            <div key={i}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontSize: "0.76rem", color: C.textDim }}>{r.browser}</span>
                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff", fontFamily: "Space Mono, monospace" }}>
                                  {r.visits} <span style={{ color: C.textMuted, fontWeight: 400 }}>({Math.round(r.visits/total*100)}%)</span>
                                </span>
                              </div>
                              <div style={{ height: 4, background: C.textGhost, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${r.visits/total*100}%`, background: colors[r.browser] || "#555", borderRadius: 2, transition: "width 0.6s" }} />
                              </div>
                            </div>
                          ));
                        })()}
                        {!sessionStats.browser_breakdown?.length && <div style={{ color: C.textMuted, fontSize: "0.8rem", textAlign: "center", padding: 20 }}>No data yet</div>}
                      </div>
                    </ChartCard>
                  </div>
                )}

                {pageAnalytics && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <ChartCard title="Top Pages" subtitle="Most visited — last 30 days">
                      <div className="adm-scroll" style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 300, overflowY: "auto" }}>
                        {(pageAnalytics.top_pages || []).map((p, i) => {
                          const maxViews = pageAnalytics.top_pages?.[0]?.views || 1;
                          return (
                            <div key={i} className="adm-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, transition: "background 0.15s" }}>
                              <span style={{ width: 20, textAlign: "center", fontSize: "0.66rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{i + 1}</span>
                              <span style={{ flex: 1, fontSize: "0.76rem", color: C.textDim, fontFamily: "'Space Mono', monospace" }}>{p.page}</span>
                              <div style={{ width: 80, height: 4, background: C.textGhost, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${(p.views / maxViews) * 100}%`, background: C.red, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: "0.72rem", color: "#fff", fontWeight: 700, fontFamily: "'Space Mono', monospace", minWidth: 40, textAlign: "right" }}>{fmt(p.views)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </ChartCard>

                    <ChartCard title="Hourly Visit Pattern" subtitle="When users visit — last 7 days (UTC)">
                      <HourlyHeatmap data={pageAnalytics.hourly_pattern} valueKey="views" label="visits" />
                      <div style={{ marginTop: 16 }}>
                        <ResponsiveContainer width="100%" height={140}>
                          <AreaChart data={pageAnalytics.visitor_trend}>
                            <defs><linearGradient id="uvG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.teal} stopOpacity={0.15} /><stop offset="100%" stopColor={C.teal} stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="day" tick={axisTick} tickFormatter={fmtShortDay} />
                            <YAxis tick={axisTick} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="unique_visitors" name="Unique" stroke={C.teal} strokeWidth={1.5} fill="url(#uvG)" dot={false} />
                            <Area type="monotone" dataKey="total_views" name="Views" stroke={C.purple} strokeWidth={1.5} fill="transparent" dot={false} strokeDasharray="4 4" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 80, color: C.textMuted }}>Loading engagement data...</div>
            )}
          </>
        )}

        {/* ════════════════════ USERS TAB ════════════════════ */}
        {activeTab === "users" && (
          <>
            <SectionHeader icon="👤" title="All Users" count={userTotal}>
              <input value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} placeholder="Search by email…"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: "0.8rem", outline: "none", width: 240, fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s" }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"}
                onBlur={e => e.currentTarget.style.borderColor = C.cardBorder} />
            </SectionHeader>
            <div className="adm-card" style={{ overflow: "hidden", padding: 0 }}>
              <div className="adm-scroll" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                      {["Email", "Plan", "Credits", "Jobs", "Credits Used", "Last Active", "Joined"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="adm-row" style={{ borderBottom: `1px solid ${C.textGhost}`, transition: "background 0.15s" }}>
                        <td style={{ padding: "10px 16px", color: C.textDim }}>{u.email}</td>
                        <td style={{ padding: "10px 16px" }}><PlanBadge plan={u.plan} /></td>
                        <td style={{ padding: "10px 16px", color: C.textDim, fontFamily: "'Space Mono', monospace", fontSize: "0.76rem" }}>{fmt(u.credits_balance)}</td>
                        <td style={{ padding: "10px 16px", color: C.textDim, fontFamily: "'Space Mono', monospace", fontSize: "0.76rem" }}>{fmt(u.job_count)}</td>
                        <td style={{ padding: "10px 16px", color: C.pink, fontFamily: "'Space Mono', monospace", fontSize: "0.76rem", fontWeight: 600 }}>{Number(u.total_credits_used || 0).toFixed(1)}</td>
                        <td style={{ padding: "10px 16px", color: C.textMuted, fontSize: "0.72rem", fontFamily: "'Space Mono', monospace" }}>{fmtDate(u.last_active)}</td>
                        <td style={{ padding: "10px 16px", color: C.textMuted, fontSize: "0.72rem", fontFamily: "'Space Mono', monospace" }}>{fmtDate(u.created_at)}</td>
                      </tr>
                    ))}
                    {!users.length && <tr><td colSpan={7} style={{ padding: 50, textAlign: "center", color: C.textMuted }}>No users found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={userPage} total={userTotal} onPageChange={setUserPage} />
          </>
        )}

        {/* ════════════════════ JOBS TAB ════════════════════ */}
        {activeTab === "jobs" && (
          <>
            <SectionHeader icon="⚡" title="All Jobs" count={jobTotal}>
              <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 3, border: `1px solid ${C.cardBorder}` }}>
                {["", "running", "completed", "failed"].map(s => (
                  <button key={s} onClick={() => { setJobFilter(s); setJobPage(1); }}
                    style={{ background: jobFilter === s ? C.redGlow : "transparent", border: "none", borderRadius: 8, padding: "5px 14px", color: jobFilter === s ? "#fff" : C.textDim, fontSize: "0.72rem", cursor: "pointer", fontWeight: 600, fontFamily: "'Outfit', sans-serif", transition: "all 0.15s" }}>
                    {s || "All"}
                  </button>
                ))}
              </div>
            </SectionHeader>
            <div className="adm-card" style={{ overflow: "hidden", padding: 0 }}>
              <div className="adm-scroll" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", minWidth: 900 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                      {["ID", "Title", "User", "State", "Turns", "Credits", "Tokens", "Created"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.job_id} className="adm-row" style={{ borderBottom: `1px solid ${C.textGhost}`, transition: "background 0.15s" }}>
                        <td style={{ padding: "10px 16px", color: C.textMuted, fontFamily: "'Space Mono', monospace", fontSize: "0.72rem" }}>{j.job_id}</td>
                        <td style={{ padding: "10px 16px", color: C.textDim, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title || "—"}</td>
                        <td style={{ padding: "10px 16px", color: C.textDim, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.76rem" }}>{j.user_email || "—"}</td>
                        <td style={{ padding: "10px 16px" }}><StateBadge state={j.state} /></td>
                        <td style={{ padding: "10px 16px", color: C.textDim, fontFamily: "'Space Mono', monospace", fontSize: "0.76rem" }}>{fmt(j.turns)}</td>
                        <td style={{ padding: "10px 16px", color: C.pink, fontFamily: "'Space Mono', monospace", fontSize: "0.76rem", fontWeight: 600 }}>{Number(j.credits_used || 0).toFixed(1)}</td>
                        <td style={{ padding: "10px 16px", color: C.textDim, fontFamily: "'Space Mono', monospace", fontSize: "0.72rem" }}>{fmtK(j.tokens_used)}</td>
                        <td style={{ padding: "10px 16px", color: C.textMuted, fontFamily: "'Space Mono', monospace", fontSize: "0.7rem" }}>{fmtTime(j.created_at)}</td>
                      </tr>
                    ))}
                    {!jobs.length && <tr><td colSpan={8} style={{ padding: 50, textAlign: "center", color: C.textMuted }}>No jobs found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={jobPage} total={jobTotal} onPageChange={setJobPage} />
          </>
        )}

        {/* ════════════════════ LIVE TAB ════════════════════ */}
        {activeTab === "live" && (
          <>
            {realtime ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                  <MetricCard label="Active Now" value={fmt(realtime.active_now)} sub="Visitors in last 5 min" accent={C.green} icon={<LiveDot size={8} color={C.green} />} delay={0} />
                  <MetricCard label="Active (15m)" value={fmt(realtime.active_15m)} sub="Visitors in last 15 min" accent={C.blue} icon="👁" delay={50} />
                  <MetricCard label="Running Builds" value={fmt(realtime.running_jobs?.length || 0)} sub="Live AI jobs" accent={C.red} icon={<LiveDot size={8} />} delay={100} />
                </div>

                {realtime.running_jobs?.length > 0 && (
                  <ChartCard title="Live Builds" subtitle="Currently running AI jobs" style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {realtime.running_jobs.map((j, i) => (
                        <div key={i} className="adm-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(220,38,38,0.03)", border: `1px solid ${C.red}15`, transition: "background 0.15s" }}>
                          <LiveDot size={7} />
                          <span style={{ fontSize: "0.78rem", color: "#fff", fontWeight: 600, flex: 1 }}>{j.title || j.job_id}</span>
                          <span style={{ fontSize: "0.72rem", color: C.textDim }}>{j.user_email}</span>
                          <PlanBadge plan={j.plan || "free"} />
                          <span style={{ fontSize: "0.66rem", color: C.textMuted, fontFamily: "'Space Mono', monospace" }}>{fmtTime(j.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}

                <ChartCard title="Live Page Hits" subtitle="Last 2 minutes — real-time visitor stream">
                  <div className="adm-scroll" style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 400, overflowY: "auto" }}>
                    {(realtime.recent_hits || []).map((h, i) => (
                      <div key={i} className="adm-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6, transition: "background 0.15s" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.74rem", color: C.textDim, fontFamily: "'Space Mono', monospace", minWidth: 50 }}>{h.page}</span>
                        <span style={{ flex: 1, fontSize: "0.66rem", color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.ip}</span>
                        {h.country && h.country !== "Unknown" && <span style={{ fontSize: "0.62rem", color: "#3b82f6", fontFamily: "Space Mono, monospace", flexShrink: 0 }}>{h.country}</span>}
                        <span style={{ fontSize: "0.62rem", color: C.textMuted, fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>{fmtTime(h.visited_at)}</span>
                      </div>
                    ))}
                    {!(realtime.recent_hits?.length) && <div style={{ color: C.textMuted, textAlign: "center", padding: 40 }}>No recent hits</div>}
                  </div>
                </ChartCard>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button onClick={loadRealtime} style={{ background: C.redGlow, border: `1px solid ${C.red}25`, borderRadius: 10, padding: "8px 24px", color: C.red, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>↻ Refresh Live Data</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 80, color: C.textMuted }}>Loading real-time data...</div>
            )}
          </>
        )}

      </div>
    </div>
  );
}