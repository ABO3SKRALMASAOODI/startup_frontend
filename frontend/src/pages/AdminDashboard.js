import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
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

const PLAN_COLORS = { free: "#444", plus: "#2563eb", pro: "#7c3aed", ultra: "#dc2626" };
const PLAN_LABELS = { free: "Free", plus: "Plus $20", pro: "Pro $50", ultra: "Ultra $100" };

const STATE_COLOR = { completed: "#22c55e", running: "#f59e0b", failed: "#ef4444" };

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = "#dc2626", icon }) {
  return (
    <div style={{
      background: "rgba(10,10,10,0.95)",
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: "14px",
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
      boxShadow: `0 0 0 1px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.4)`,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}33, 0 8px 32px rgba(0,0,0,0.5)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.4)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>{label}</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: "1.8rem", opacity: 0.15 }}>{icon}</div>}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "3px", height: "18px", background: "#dc2626", borderRadius: "2px" }} />
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "0.02em", margin: 0 }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

// ── Chart wrapper ─────────────────────────────────────────────────────────────
function ChartBox({ title, children, style }) {
  return (
    <div style={{
      background: "rgba(10,10,10,0.95)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px",
      padding: "20px 22px",
      ...style
    }}>
      <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>{title}</div>
      {children}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem" }}>
      <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#fff", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ width: "8px", height: "8px", background: p.color, borderRadius: "50%", display: "inline-block" }} />
          {p.name}: <strong>{fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Activity Feed ─────────────────────────────────────────────────────────────
const EVENT_ICONS = {
  register: { icon: "👤", color: "#3b82f6" },
  subscribe: { icon: "💳", color: "#22c55e" },
  job_done: { icon: "✅", color: "#22c55e" },
  job_fail: { icon: "❌", color: "#ef4444" },
  job_start: { icon: "⚡", color: "#f59e0b" },
};

function ActivityFeed({ events }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "340px", overflowY: "auto" }}>
      {events.map((e, i) => {
        const meta = EVENT_ICONS[e.type] || { icon: "•", color: "#666" };
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: "1rem", lineHeight: 1.4 }}>{meta.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.label}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{fmtTime(e.ts)}</div>
            </div>
            <span style={{ fontSize: "0.65rem", color: meta.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{e.type.replace('_', ' ')}</span>
          </div>
        );
      })}
      {!events.length && <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.82rem", textAlign: "center", padding: "20px" }}>No activity yet</div>}
    </div>
  );
}

// ── Plan Pie ──────────────────────────────────────────────────────────────────
function PlanPie({ breakdown }) {
  const data = Object.entries(breakdown || {}).map(([plan, count]) => ({
    name: PLAN_LABELS[plan] || plan,
    value: count,
    color: PLAN_COLORS[plan] || "#666",
  })).filter(d => d.value > 0);

  if (!data.length) return <div style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "40px", fontSize: "0.82rem" }}>No data</div>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <ResponsiveContainer width="50%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "10px", height: "10px", background: d.color, borderRadius: "2px", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>{d.name}</span>
            <span style={{ fontSize: "0.78rem", color: "#fff", fontWeight: 700, marginLeft: "auto" }}>{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main AdminDashboard ───────────────────────────────────────────────────────
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

  // Auth guard
  useEffect(() => {
    if (!token || email !== "thehustlerbot@gmail.com") {
      navigate("/");
    }
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users?page=${userPage}&search=${userSearch}`, { headers });
      setUsers(res.data.users || []);
      setUserTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  }, [userPage, userSearch]);

  const loadJobs = useCallback(async () => {
    try {
      const res = await API.get(`/admin/jobs?page=${jobPage}&state=${jobFilter}`, { headers });
      setJobs(res.data.jobs || []);
      setJobTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  }, [jobPage, jobFilter]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { if (activeTab === "users") loadUsers(); }, [activeTab, userPage, userSearch, loadUsers]);
  useEffect(() => { if (activeTab === "jobs") loadJobs(); }, [activeTab, jobPage, jobFilter, loadJobs]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(loadOverview, 30000);
    return () => clearInterval(t);
  }, [loadOverview]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid rgba(220,0,0,0.2)", borderTop: "3px solid #dc2626", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Loading admin data…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const o = overview || {};
  const TABS = ["overview", "users", "jobs"];

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(220,0,0,0.4); border-radius: 2px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,5,5,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "0.8rem", padding: "4px 8px", borderRadius: "6px", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
            ← Back
          </button>
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", background: "#dc2626", borderRadius: "50%", boxShadow: "0 0 8px #dc2626", animation: "spin 3s linear infinite" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.04em" }}>THE HUSTLER BOT</span>
            <span style={{ fontSize: "0.7rem", color: "rgba(220,0,0,0.7)", background: "rgba(220,0,0,0.1)", border: "1px solid rgba(220,0,0,0.2)", borderRadius: "4px", padding: "1px 6px", fontWeight: 700, letterSpacing: "0.08em" }}>ADMIN</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ background: activeTab === tab ? "rgba(220,0,0,0.15)" : "transparent", border: activeTab === tab ? "1px solid rgba(220,0,0,0.3)" : "1px solid transparent", borderRadius: "8px", padding: "6px 16px", color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s" }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
            Refreshed {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button onClick={loadOverview} style={{ background: "rgba(220,0,0,0.1)", border: "1px solid rgba(220,0,0,0.2)", borderRadius: "8px", padding: "6px 12px", color: "#dc2626", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(220,0,0,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(220,0,0,0.1)"}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {activeTab === "overview" && (
          <>
            {/* KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
              <StatCard label="Total Users" value={fmt(o.users?.total)} sub={`+${fmt(o.users?.new_today)} today · +${fmt(o.users?.new_week)} this week`} accent="#3b82f6" icon="👥" />
              <StatCard label="Active Subscriptions" value={fmt(o.subscriptions?.total)} sub={`Est. MRR: $${fmt(o.subscriptions?.mrr)}`} accent="#22c55e" icon="💳" />
              <StatCard label="Jobs Today" value={fmt(o.jobs?.today)} sub={`${fmt(o.jobs?.running)} running · ${fmt(o.jobs?.failed_today)} failed · ${fmt(o.jobs?.total)} total`} accent="#f59e0b" icon="⚙️" />
              <StatCard label="Page Visits Today" value={fmt(o.visits?.today)} sub={`${fmt(o.visits?.week)} this week`} accent="#a855f7" icon="👁️" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "36px" }}>
              <StatCard label="Credits Used Today" value={Number(o.credits?.consumed_today || 0).toFixed(1)} sub="credits consumed" accent="#ec4899" icon="⚡" />
              <StatCard label="Total Tokens Used" value={fmt(o.credits?.total_tokens)} sub="all time" accent="#14b8a6" icon="🔤" />
              <StatCard label="New Users This Week" value={fmt(o.users?.new_week)} sub="verified registrations" accent="#f97316" icon="🆕" />
              <StatCard label="Jobs Running Now" value={fmt(o.jobs?.running)} sub={o.jobs?.running > 0 ? "🔴 live" : "all clear"} accent={o.jobs?.running > 0 ? "#dc2626" : "#22c55e"} icon="🚀" />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <ChartBox title="Registrations — Last 30 Days">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={regChart} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickFormatter={s => s.slice(5)} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Registrations" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>

              <ChartBox title="Page Visits — Last 30 Days">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={visChart} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickFormatter={s => s.slice(5)} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Visits" fill="#a855f7" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <ChartBox title="Jobs — Last 30 Days (Completed vs Failed)">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={jobChart} barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickFormatter={s => s.slice(5)} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }} />
                    <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[3, 3, 0, 0]} stackId="a" />
                    <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>

              <ChartBox title="Plan Distribution">
                <PlanPie breakdown={o.subscriptions?.plan_breakdown} />
              </ChartBox>
            </div>

            {/* Credits chart */}
            <div style={{ marginBottom: "16px" }}>
              <ChartBox title="Credits Consumed — Last 30 Days">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={credChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickFormatter={s => s.slice(5)} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="credits" name="Credits" stroke="#ec4899" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>

            {/* Bottom row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Activity feed */}
              <div style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px 22px" }}>
                <SectionHeader title="Recent Activity" />
                <ActivityFeed events={activity} />
              </div>

              {/* Top users */}
              <div style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px 22px" }}>
                <SectionHeader title="Top Users by Credit Usage" />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {topUsers.map((u, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ width: "22px", height: "22px", background: i === 0 ? "#dc2626" : "rgba(255,255,255,0.07)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ flex: 1, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                      <span style={{ fontSize: "0.7rem", color: PLAN_COLORS[u.plan] || "#666", background: `${PLAN_COLORS[u.plan]}22`, borderRadius: "4px", padding: "1px 6px", fontWeight: 700 }}>{u.plan}</span>
                      <span style={{ fontSize: "0.78rem", color: "#ec4899", fontWeight: 700, minWidth: "50px", textAlign: "right" }}>{Number(u.credits_used).toFixed(1)}cr</span>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", minWidth: "40px", textAlign: "right" }}>{fmt(u.jobs)} jobs</span>
                    </div>
                  ))}
                  {!topUsers.length && <div style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "20px", fontSize: "0.82rem" }}>No data yet</div>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════ USERS TAB ══════════════ */}
        {activeTab === "users" && (
          <>
            <SectionHeader
              title={`All Users (${fmt(userTotal)})`}
              right={
                <input
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  placeholder="Search by email…"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", color: "#fff", fontSize: "0.82rem", outline: "none", width: "220px" }}
                />
              }
            />
            <div style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Email", "Plan", "Credits", "Jobs", "Subscribed", "Joined"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(220,0,0,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.8)" }}>{u.email}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ background: `${PLAN_COLORS[u.plan] || "#444"}22`, color: PLAN_COLORS[u.plan] || "#666", border: `1px solid ${PLAN_COLORS[u.plan] || "#444"}44`, borderRadius: "4px", padding: "2px 8px", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase" }}>{u.plan}</span>
                      </td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.6)" }}>{fmt(u.credits_balance)}</td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.6)" }}>{fmt(u.job_count)}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ color: u.is_subscribed ? "#22c55e" : "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>{u.is_subscribed ? "✓ Active" : "Free"}</span>
                      </td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.3)" }}>{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>Page {userPage} · {fmt(userTotal)} total</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", color: userPage === 1 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: "0.8rem", cursor: userPage === 1 ? "default" : "pointer" }}>
                  ← Prev
                </button>
                <button onClick={() => setUserPage(p => p + 1)} disabled={userPage * 20 >= userTotal}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", color: userPage * 20 >= userTotal ? "rgba(255,255,255,0.2)" : "#fff", fontSize: "0.8rem", cursor: userPage * 20 >= userTotal ? "default" : "pointer" }}>
                  Next →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══════════════ JOBS TAB ══════════════ */}
        {activeTab === "jobs" && (
          <>
            <SectionHeader
              title={`All Jobs (${fmt(jobTotal)})`}
              right={
                <div style={{ display: "flex", gap: "6px" }}>
                  {["", "running", "completed", "failed"].map(s => (
                    <button key={s} onClick={() => { setJobFilter(s); setJobPage(1); }}
                      style={{ background: jobFilter === s ? "rgba(220,0,0,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${jobFilter === s ? "rgba(220,0,0,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", padding: "6px 12px", color: jobFilter === s ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.78rem", cursor: "pointer", fontWeight: jobFilter === s ? 700 : 400 }}>
                      {s || "All"}
                    </button>
                  ))}
                </div>
              }
            />
            <div style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Job ID", "Title", "User", "State", "Credits", "Tokens", "Created"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => (
                    <tr key={j.job_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(220,0,0,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: "0.78rem" }}>{j.job_id}</td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.8)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.5)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.user_email || "—"}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ color: STATE_COLOR[j.state] || "#666", background: `${STATE_COLOR[j.state] || "#666"}22`, border: `1px solid ${STATE_COLOR[j.state] || "#666"}44`, borderRadius: "4px", padding: "2px 8px", fontSize: "0.72rem", fontWeight: 700 }}>
                          {j.state === "running" && <span style={{ display: "inline-block", width: "6px", height: "6px", background: "#f59e0b", borderRadius: "50%", marginRight: "4px", animation: "spin 1s linear infinite" }} />}
                          {j.state}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", color: "#ec4899" }}>{Number(j.credits_used || 0).toFixed(1)}</td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.4)" }}>{fmt(j.tokens_used)}</td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.3)" }}>{fmtTime(j.created_at)}</td>
                    </tr>
                  ))}
                  {!jobs.length && (
                    <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>No jobs found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>Page {jobPage} · {fmt(jobTotal)} total</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setJobPage(p => Math.max(1, p - 1))} disabled={jobPage === 1}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", color: jobPage === 1 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: "0.8rem", cursor: jobPage === 1 ? "default" : "pointer" }}>
                  ← Prev
                </button>
                <button onClick={() => setJobPage(p => p + 1)} disabled={jobPage * 20 >= jobTotal}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", color: jobPage * 20 >= jobTotal ? "rgba(255,255,255,0.2)" : "#fff", fontSize: "0.8rem", cursor: jobPage * 20 >= jobTotal ? "default" : "pointer" }}>
                  Next →
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}