import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  RadialBarChart, RadialBar,
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();
const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " · " +
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};
const fmtShortDay = (s) => {
  if (!s) return "";
  const parts = s.split("-");
  return `${parts[1]}/${parts[2]}`;
};

const PLAN_COLORS = { free: "#3a3a3a", plus: "#2563eb", pro: "#7c3aed", ultra: "#dc2626" };
const PLAN_LABELS = { free: "Free", plus: "Plus", pro: "Pro", ultra: "Ultra" };
const STATE_COLOR = { completed: "#10b981", running: "#f59e0b", failed: "#ef4444" };

const ACCENT = {
  red: "#dc2626",
  redGlow: "rgba(220, 38, 38, 0.15)",
  redBorder: "rgba(220, 38, 38, 0.25)",
  blue: "#3b82f6",
  green: "#10b981",
  amber: "#f59e0b",
  pink: "#ec4899",
  purple: "#a855f7",
  teal: "#14b8a6",
  orange: "#f97316",
};

// ── Global styles ─────────────────────────────────────────────────────────────
function AdminStyles() {
  useEffect(() => {
    const id = "admin-dashboard-styles";
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse-dot { 0%,100% { opacity: 1; box-shadow: 0 0 4px currentColor; } 50% { opacity: 0.4; box-shadow: 0 0 8px currentColor; } }
      @keyframes glow-line { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .admin-scroll::-webkit-scrollbar { width: 3px; }
      .admin-scroll::-webkit-scrollbar-track { background: transparent; }
      .admin-scroll::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.3); border-radius: 2px; }
      .admin-scroll::-webkit-scrollbar-thumb:hover { background: rgba(220,38,38,0.5); }
      .admin-row-hover:hover { background: rgba(220,38,38,0.04) !important; }
      .admin-card { 
        background: rgba(12,12,12,0.98);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 16px;
        animation: fadeIn 0.4s ease forwards;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .admin-card:hover {
        border-color: rgba(220,38,38,0.2);
        box-shadow: 0 0 24px rgba(220,38,38,0.06);
      }
    `;
    document.head.appendChild(tag);
  }, []);
  return null;
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, accent = ACCENT.red, icon, trend, delay = 0 }) {
  return (
    <div className="admin-card" style={{ padding: "20px 22px", position: "relative", overflow: "hidden", animationDelay: `${delay}ms` }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", marginBottom: "10px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
          {sub && <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.3)", marginTop: "8px", fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
          {trend !== undefined && (
            <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", fontWeight: 700, color: trend >= 0 ? ACCENT.green : ACCENT.red, background: trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", padding: "2px 8px", borderRadius: "6px" }}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </div>
          )}
        </div>
        {icon && (
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${accent}12`, border: `1px solid ${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mini Spark Line ───────────────────────────────────────────────────────────
function SparkLine({ data, dataKey, color = ACCENT.red, height = 40 }) {
  if (!data || !data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#spark-${color.replace('#','')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Chart Card ────────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style, action }) {
  return (
    <div className="admin-card" style={{ padding: "22px 24px", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(8,8,8,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", fontSize: "0.78rem", fontFamily: "'DM Sans', sans-serif", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: "6px", fontSize: "0.7rem" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#fff", display: "flex", gap: "8px", alignItems: "center", marginBottom: "2px" }}>
          <span style={{ width: "6px", height: "6px", background: p.color, borderRadius: "50%", display: "inline-block" }} />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>{p.name}:</span>
          <strong style={{ color: "#fff" }}>{typeof p.value === 'number' && p.value % 1 !== 0 ? p.value.toFixed(1) : fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Live Indicator ────────────────────────────────────────────────────────────
function LiveDot({ color = ACCENT.red }) {
  return (
    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite", color }} />
  );
}

// ── Plan Badge ────────────────────────────────────────────────────────────────
function PlanBadge({ plan }) {
  const c = PLAN_COLORS[plan] || "#444";
  return (
    <span style={{ background: `${c}18`, color: c === "#3a3a3a" ? "rgba(255,255,255,0.4)" : c, border: `1px solid ${c}33`, borderRadius: "6px", padding: "2px 10px", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
      {PLAN_LABELS[plan] || plan}
    </span>
  );
}

// ── State Badge ───────────────────────────────────────────────────────────────
function StateBadge({ state }) {
  const c = STATE_COLOR[state] || "#666";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: c, background: `${c}15`, border: `1px solid ${c}30`, borderRadius: "6px", padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
      {state === "running" && <LiveDot color={c} />}
      {state}
    </span>
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────────
const EVENT_META = {
  register:  { icon: "◉", color: ACCENT.blue,  label: "Register" },
  subscribe: { icon: "◈", color: ACCENT.green,  label: "Subscribe" },
  job_done:  { icon: "✓", color: ACCENT.green,  label: "Completed" },
  job_fail:  { icon: "✕", color: ACCENT.red,    label: "Failed" },
  job_start: { icon: "⚡", color: ACCENT.amber, label: "Started" },
};

function ActivityFeed({ events }) {
  return (
    <div className="admin-scroll" style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "400px", overflowY: "auto" }}>
      {events.map((e, i) => {
        const meta = EVENT_META[e.type] || { icon: "•", color: "#666", label: e.type };
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.015)", transition: "background 0.15s", cursor: "default" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.04)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}>
            <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: `${meta.color}15`, border: `1px solid ${meta.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: meta.color, fontWeight: 700, flexShrink: 0 }}>
              {meta.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'DM Sans', sans-serif" }}>{e.label}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
              <span style={{ fontSize: "0.62rem", color: meta.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>{meta.label}</span>
              <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.18)", fontFamily: "'JetBrains Mono', monospace" }}>{fmtTime(e.ts)}</span>
            </div>
          </div>
        );
      })}
      {!events.length && <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.82rem", textAlign: "center", padding: "40px" }}>No activity yet</div>}
    </div>
  );
}

// ── Plan Distribution Ring ────────────────────────────────────────────────────
function PlanRing({ breakdown }) {
  const data = Object.entries(breakdown || {}).map(([plan, count]) => ({
    name: PLAN_LABELS[plan] || plan,
    value: count,
    color: PLAN_COLORS[plan] || "#666",
    plan,
  })).filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (!data.length) return <div style={{ color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "40px", fontSize: "0.82rem" }}>No data</div>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={66} dataKey="value" strokeWidth={2} stroke="#0c0c0c">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{fmt(total)}</span>
          <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>users</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", background: d.color, borderRadius: "3px", display: "inline-block" }} />
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: "0.74rem", color: "#fff", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(d.value)} <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>({pct}%)</span></span>
              </div>
              <div style={{ height: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: "2px", transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, total, perPage = 20, onPageChange }) {
  const totalPages = Math.ceil(total / perPage);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
      <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
        {fmt(total)} total · page {page}/{totalPages || 1}
      </span>
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
          style={{ ...paginationBtn, opacity: page === 1 ? 0.3 : 1, cursor: page === 1 ? "default" : "pointer" }}>← Prev</button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          style={{ ...paginationBtn, opacity: page >= totalPages ? 0.3 : 1, cursor: page >= totalPages ? "default" : "pointer" }}>Next →</button>
      </div>
    </div>
  );
}
const paginationBtn = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "6px 14px", color: "#fff", fontSize: "0.76rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: "all 0.15s" };

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("user_email");

  const [overview, setOverview]     = useState(null);
  const [regChart, setRegChart]     = useState([]);
  const [jobChart, setJobChart]     = useState([]);
  const [visChart, setVisChart]     = useState([]);
  const [credChart, setCredChart]   = useState([]);
  const [users, setUsers]           = useState([]);
  const [userTotal, setUserTotal]   = useState(0);
  const [userPage, setUserPage]     = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [jobs, setJobs]             = useState([]);
  const [jobTotal, setJobTotal]     = useState(0);
  const [jobPage, setJobPage]       = useState(1);
  const [jobFilter, setJobFilter]   = useState("");
  const [topUsers, setTopUsers]     = useState([]);
  const [activity, setActivity]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!token || email !== "thehustlerbot@gmail.com") navigate("/");
  }, [token, email, navigate]);

  const headers = { Authorization: `Bearer ${token}` };

  const loadOverview = useCallback(async () => {
    try {
      const [ov, reg, job, vis, cred, top, act] = await Promise.all([
        API.get("/admin/overview", { headers }),
        API.get("/admin/charts/registrations", { headers }),
        API.get("/admin/charts/jobs", { headers }),
        API.get("/admin/charts/visits", { headers }),
        API.get("/admin/charts/credits", { headers }),
        API.get("/admin/top-users", { headers }),
        API.get("/admin/activity", { headers }),
      ]);
      setOverview(ov.data);
      setRegChart(reg.data.data || []);
      setJobChart(job.data.data || []);
      setVisChart(vis.data.data || []);
      setCredChart(cred.data.data || []);
      setTopUsers(top.data.users || []);
      setActivity(act.data.events || []);
      setLastRefresh(new Date());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users?page=${userPage}&search=${userSearch}`, { headers });
      setUsers(res.data.users || []);
      setUserTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPage, userSearch]);

  const loadJobs = useCallback(async () => {
    try {
      const res = await API.get(`/admin/jobs?page=${jobPage}&state=${jobFilter}`, { headers });
      setJobs(res.data.jobs || []);
      setJobTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobPage, jobFilter]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { if (activeTab === "users") loadUsers(); }, [activeTab, userPage, userSearch, loadUsers]);
  useEffect(() => { if (activeTab === "jobs") loadJobs(); }, [activeTab, jobPage, jobFilter, loadJobs]);
  useEffect(() => { const t = setInterval(loadOverview, 30000); return () => clearInterval(t); }, [loadOverview]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#030303", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "2px solid rgba(220,38,38,0.15)", borderTop: "2px solid #dc2626", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif" }}>Loading dashboard…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const o = overview || {};
  const TABS = [
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "users",    label: "Users",    icon: "◎" },
    { id: "jobs",     label: "Jobs",     icon: "⚙" },
  ];

  // Derived metrics
  const successRate = o.jobs?.total > 0 ? (((o.jobs.total - (o.jobs?.failed_today || 0)) / o.jobs.total) * 100).toFixed(1) : "—";
  const avgCreditsPerJob = o.jobs?.total > 0 && o.credits?.consumed_today ? (o.credits.consumed_today / Math.max(1, o.jobs.today)).toFixed(1) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#030303", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <AdminStyles />

      {/* ── TOP NAV ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(3,3,3,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button onClick={() => navigate("/")} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.76rem", padding: "5px 12px", borderRadius: "8px", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
            ← Home
          </button>
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LiveDot />
            <span style={{ fontSize: "0.82rem", fontWeight: 800, letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>COMMAND CENTER</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "3px", border: "1px solid rgba(255,255,255,0.04)" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "rgba(220,38,38,0.12)" : "transparent",
                border: "none",
                borderRadius: "8px",
                padding: "6px 16px",
                color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.35)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
              <span style={{ fontSize: "0.7rem", opacity: activeTab === tab.id ? 1 : 0.5 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono', monospace" }}>
            {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button onClick={loadOverview}
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "8px", padding: "5px 14px", color: "#dc2626", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s", fontFamily: "'JetBrains Mono', monospace" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(220,38,38,0.08)"}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: "28px", maxWidth: "1440px", margin: "0 auto" }}>

        {/* ════════════ OVERVIEW ════════════ */}
        {activeTab === "overview" && (
          <>
            {/* KPI Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
              <MetricCard label="Total Users" value={fmt(o.users?.total)} sub={`+${fmt(o.users?.new_today)} today`} accent={ACCENT.blue} icon="👥" delay={0} />
              <MetricCard label="MRR" value={`$${fmt(o.subscriptions?.mrr)}`} sub={`${fmt(o.subscriptions?.total)} active subs`} accent={ACCENT.green} icon="💰" delay={50} />
              <MetricCard label="Jobs Today" value={fmt(o.jobs?.today)} sub={`${fmt(o.jobs?.total)} total all time`} accent={ACCENT.amber} icon="⚡" delay={100} />
              <MetricCard label="Credits Today" value={Number(o.credits?.consumed_today || 0).toFixed(1)} sub={`${fmt(o.credits?.total_tokens)} tokens all time`} accent={ACCENT.pink} icon="🔥" delay={150} />
            </div>

            {/* KPI Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
              <MetricCard label="New This Week" value={fmt(o.users?.new_week)} sub="verified registrations" accent={ACCENT.orange} icon="📈" delay={200} />
              <MetricCard label="Running Now" value={fmt(o.jobs?.running)} sub={o.jobs?.running > 0 ? "live builds" : "all quiet"} accent={o.jobs?.running > 0 ? ACCENT.red : ACCENT.green} icon={o.jobs?.running > 0 ? "🔴" : "✅"} delay={250} />
              <MetricCard label="Failed Today" value={fmt(o.jobs?.failed_today)} sub="build failures" accent={ACCENT.red} icon="⚠️" delay={300} />
              <MetricCard label="Visits Today" value={fmt(o.visits?.today)} sub={`${fmt(o.visits?.week)} this week`} accent={ACCENT.purple} icon="👁" delay={350} />
            </div>

            {/* Charts Row 1: Registrations + Visits */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <ChartCard title="User Registrations" subtitle="Last 30 days">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={regChart}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT.blue} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={ACCENT.blue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} tickFormatter={fmtShortDay} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" name="Registrations" stroke={ACCENT.blue} strokeWidth={2} fill="url(#regGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Page Visits" subtitle="Last 30 days">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={visChart}>
                    <defs>
                      <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT.purple} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={ACCENT.purple} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} tickFormatter={fmtShortDay} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" name="Visits" stroke={ACCENT.purple} strokeWidth={2} fill="url(#visGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Charts Row 2: Jobs + Plans */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <ChartCard title="Build Jobs" subtitle="Completed vs Failed — Last 30 days">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={jobChart} barSize={8} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} tickFormatter={fmtShortDay} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans'" }} />
                    <Bar dataKey="completed" name="Completed" fill={ACCENT.green} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="failed" name="Failed" fill={ACCENT.red} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Plan Distribution" subtitle="All verified users">
                <PlanRing breakdown={o.subscriptions?.plan_breakdown} />
              </ChartCard>
            </div>

            {/* Credits chart */}
            <div style={{ marginBottom: "12px" }}>
              <ChartCard title="Credit Consumption" subtitle="Last 30 days">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={credChart}>
                    <defs>
                      <linearGradient id="credGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT.pink} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={ACCENT.pink} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} tickFormatter={fmtShortDay} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'JetBrains Mono'" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="credits" name="Credits" stroke={ACCENT.pink} strokeWidth={2} fill="url(#credGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Bottom: Activity + Top Users */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <ChartCard title="Live Activity" subtitle="Recent events across the platform">
                <ActivityFeed events={activity} />
              </ChartCard>

              <ChartCard title="Top Users" subtitle="By credit consumption">
                <div className="admin-scroll" style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
                  {topUsers.map((u, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.015)", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}>
                      <div style={{ width: "24px", height: "24px", background: i === 0 ? ACCENT.red : i === 1 ? "rgba(255,255,255,0.08)" : i === 2 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, flexShrink: 0, color: i === 0 ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {i + 1}
                      </div>
                      <span style={{ flex: 1, fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{u.email}</span>
                      <PlanBadge plan={u.plan} />
                      <span style={{ fontSize: "0.74rem", color: ACCENT.pink, fontWeight: 700, minWidth: "55px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{Number(u.credits_used).toFixed(1)}</span>
                      <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", minWidth: "40px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(u.jobs)}</span>
                    </div>
                  ))}
                  {!topUsers.length && <div style={{ color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "40px", fontSize: "0.82rem" }}>No data yet</div>}
                </div>
              </ChartCard>
            </div>
          </>
        )}

        {/* ════════════ USERS TAB ════════════ */}
        {activeTab === "users" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "3px", height: "18px", background: ACCENT.red, borderRadius: "2px" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>All Users</h2>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(userTotal)}</span>
              </div>
              <input value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                placeholder="Search by email…"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px 16px", color: "#fff", fontSize: "0.82rem", outline: "none", width: "240px", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"} />
            </div>
            <div className="admin-card" style={{ overflow: "hidden", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Email", "Plan", "Credits", "Jobs", "Status", "Joined"].map(h => (
                      <th key={h} style={{ padding: "14px 18px", textAlign: "left", color: "rgba(255,255,255,0.25)", fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="admin-row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.025)", background: "transparent", transition: "background 0.15s" }}>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif" }}>{u.email}</td>
                      <td style={{ padding: "12px 18px" }}><PlanBadge plan={u.plan} /></td>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{fmt(u.credits_balance)}</td>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{fmt(u.job_count)}</td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ color: u.is_subscribed ? ACCENT.green : "rgba(255,255,255,0.2)", fontSize: "0.72rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                          {u.is_subscribed ? "● Active" : "○ Free"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.25)", fontSize: "0.74rem", fontFamily: "'JetBrains Mono', monospace" }}>{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr><td colSpan={6} style={{ padding: "50px", textAlign: "center", color: "rgba(255,255,255,0.15)" }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={userPage} total={userTotal} onPageChange={setUserPage} />
          </>
        )}

        {/* ════════════ JOBS TAB ════════════ */}
        {activeTab === "jobs" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "3px", height: "18px", background: ACCENT.red, borderRadius: "2px" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>All Jobs</h2>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(jobTotal)}</span>
              </div>
              <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "3px", border: "1px solid rgba(255,255,255,0.04)" }}>
                {["", "running", "completed", "failed"].map(s => (
                  <button key={s} onClick={() => { setJobFilter(s); setJobPage(1); }}
                    style={{
                      background: jobFilter === s ? "rgba(220,38,38,0.12)" : "transparent",
                      border: "none", borderRadius: "8px",
                      padding: "5px 14px",
                      color: jobFilter === s ? "#fff" : "rgba(255,255,255,0.35)",
                      fontSize: "0.74rem", cursor: "pointer", fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                    }}>
                    {s || "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-card" style={{ overflow: "hidden", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["ID", "Title", "User", "State", "Credits", "Tokens", "Created"].map(h => (
                      <th key={h} style={{ padding: "14px 18px", textAlign: "left", color: "rgba(255,255,255,0.25)", fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => (
                    <tr key={j.job_id} className="admin-row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.025)", background: "transparent", transition: "background 0.15s" }}>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem" }}>{j.job_id}</td>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.7)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title || "—"}</td>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.45)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{j.user_email || "—"}</td>
                      <td style={{ padding: "12px 18px" }}><StateBadge state={j.state} /></td>
                      <td style={{ padding: "12px 18px", color: ACCENT.pink, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", fontWeight: 600 }}>{Number(j.credits_used || 0).toFixed(1)}</td>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem" }}>{fmt(j.tokens_used)}</td>
                      <td style={{ padding: "12px 18px", color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem" }}>{fmtTime(j.created_at)}</td>
                    </tr>
                  ))}
                  {!jobs.length && (
                    <tr><td colSpan={7} style={{ padding: "50px", textAlign: "center", color: "rgba(255,255,255,0.15)" }}>No jobs found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={jobPage} total={jobTotal} onPageChange={setJobPage} />
          </>
        )}
      </div>
    </div>
  );
}