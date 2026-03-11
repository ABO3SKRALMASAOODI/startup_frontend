import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StickyNavbar from "../components/StickyNavbar";
import API from "../api/api";

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

  :root {
    --red:        #C8102E;
    --red-dim:    rgba(200,16,46,0.15);
    --red-glow:   rgba(200,16,46,0.35);
    --bg:         #040406;
    --surface:    #080810;
    --surface2:   #0C0C16;
    --grid-line:  rgba(200,16,46,0.07);
    --circuit:    rgba(200,16,46,0.18);
    --border:     rgba(255,255,255,0.06);
    --text:       #E8E4DC;
    --muted:      #3A3A46;
    --dim:        #18181F;
  }

  * { box-sizing: border-box; }

  .circuit-bg {
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
      linear-gradient(rgba(200,16,46,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,16,46,0.025) 1px, transparent 1px);
    background-size: 80px 80px, 80px 80px, 16px 16px, 16px 16px;
    background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;
  }

  @keyframes scanDown {
    0%   { top: -4px; opacity: 0.7; }
    100% { top: 100%; opacity: 0; }
  }
  .scan-line {
    position: fixed; left: 0; width: 100%; height: 2px;
    pointer-events: none; z-index: 999;
    background: linear-gradient(90deg, transparent, rgba(200,16,46,0.35), rgba(200,16,46,0.7), rgba(200,16,46,0.35), transparent);
    animation: scanDown 7s linear infinite;
    box-shadow: 0 0 10px rgba(200,16,46,0.5);
  }

  @keyframes nodePulse {
    0%,100% { box-shadow: 0 0 4px var(--red); opacity: 0.6; }
    50%      { box-shadow: 0 0 10px var(--red), 0 0 20px rgba(200,16,46,0.3); opacity: 1; }
  }
  .node-dot {
    width: 6px; height: 6px;
    background: var(--red);
    flex-shrink: 0;
    animation: nodePulse 2.4s ease-in-out infinite;
  }

  @keyframes glitch1 {
    0%,90%,100% { transform: translate(0); opacity:1; }
    92%          { transform: translate(-3px, 1px); opacity:0.85; }
    94%          { transform: translate(3px, -1px); opacity:0.85; }
    96%          { transform: translate(0); opacity:1; }
  }
  .glitch-text { animation: glitch1 9s steps(1) infinite; display: inline-block; }

  .tpl-card {
    position: relative;
    background: var(--surface);
    border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1);
    overflow: hidden;
  }
  .tpl-card::before {
    content: '';
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background: linear-gradient(135deg, rgba(200,16,46,0.05) 0%, transparent 55%);
    opacity: 0; transition: opacity 0.22s ease;
  }
  .tpl-card:hover { border-color: rgba(200,16,46,0.45); transform: translateY(-5px);
    box-shadow: 0 0 0 1px rgba(200,16,46,0.18), inset 0 0 40px rgba(200,16,46,0.04), 0 20px 50px rgba(0,0,0,0.7); }
  .tpl-card:hover::before { opacity: 1; }

  .card-pip {
    width: 5px; height: 5px;
    background: var(--red);
    box-shadow: 0 0 8px var(--red);
    opacity: 0; transition: opacity 0.2s;
    position: absolute; z-index: 5;
  }
  .tpl-card:hover .card-pip { opacity: 1; }

  .filter-btn {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem; font-weight: 500;
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 6px 14px;
    border: 1px solid rgba(255,255,255,0.07);
    background: transparent; color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }
  .filter-btn:hover { border-color: rgba(200,16,46,0.35); color: var(--text); background: rgba(200,16,46,0.05); }
  .filter-btn.active { background: var(--red); border-color: var(--red); color: #fff; box-shadow: 0 0 16px rgba(200,16,46,0.35); }

  .use-btn {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
    padding: 10px 24px;
    background: var(--red); color: #fff; border: none; cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: filter 0.15s, transform 0.15s;
    box-shadow: 0 0 24px rgba(200,16,46,0.45), 0 0 50px rgba(200,16,46,0.15);
    position: relative; overflow: hidden;
  }
  .use-btn::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: translateX(-100%); transition: transform 0.4s ease;
  }
  .use-btn:hover::after { transform: translateX(100%); }
  .use-btn:hover { filter: brightness(1.15); transform: scale(1.03); }
  .use-btn:active { transform: scale(0.97); }

  .search-input::placeholder { color: var(--muted); }
  .search-input:focus { outline: none; }
  .trace-h { height: 1px; background: linear-gradient(90deg, rgba(200,16,46,0.2), transparent); }

  @keyframes pageFadeUp {
    from { opacity:0; transform: translateY(14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .page-root { animation: pageFadeUp 0.45s ease both; }
`;

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const ALL_TEMPLATES = [
  { job_id:"6a1def90", category:"Marketing",  title:"SaaS Landing Page",     desc:"Hero, feature grid, pricing table, and CTA — everything a modern SaaS needs to convert.", tags:["SaaS","Pricing","CTA"] },
  { job_id:"0fa66551", category:"Marketing",  title:"Waitlist / Coming Soon", desc:"Pre-launch page with email capture, countdown timer, and social proof section.",         tags:["Launch","Email","Countdown"] },
  { job_id:"ea5cb482", category:"Marketing",  title:"Agency Landing Page",    desc:"Bold agency homepage with services, case studies, team, and contact form.",              tags:["Agency","Services","Portfolio"] },
  { job_id:"ea5cb482", category:"Portfolio",  title:"Developer Portfolio",    desc:"Clean developer portfolio with projects, skills, GitHub stats, and contact.",            tags:["Developer","CV","GitHub"] },
  { job_id:"ea5cb482", category:"Portfolio",  title:"Designer Showcase",      desc:"Visual-first portfolio with full-bleed case studies and a minimal nav.",                 tags:["Design","Case Studies","Visual"] },
  { job_id:"ea5cb482", category:"Portfolio",  title:"Freelancer Profile",     desc:"One-page freelancer site with rates, testimonials, and a booking form.",                 tags:["Freelance","Booking","Rates"] },
  { job_id:"70d042cf", category:"E-commerce", title:"Product Page",           desc:"Product showcase with image gallery, reviews, size selector, and add-to-cart.",          tags:["Product","Cart","Reviews"] },
  { job_id:"70d042cf", category:"E-commerce", title:"Storefront",             desc:"Multi-product catalog with filters, sort controls, and a cart sidebar.",                 tags:["Catalog","Filters","Cart"] },
  { job_id:"70d042cf", category:"E-commerce", title:"Checkout Flow",          desc:"Multi-step checkout with address, payment, and order confirmation screens.",             tags:["Checkout","Payment","Steps"] },
  { job_id:"515567f6", category:"Dashboard",  title:"Analytics Dashboard",    desc:"Data dashboard with charts, KPI cards, date filters, and sidebar navigation.",          tags:["Analytics","Charts","KPIs"] },
  { job_id:"515567f6", category:"Dashboard",  title:"Admin Panel",            desc:"Full admin panel with users table, actions, stats overview, and dark sidebar.",          tags:["Admin","Tables","Users"] },
  { job_id:"515567f6", category:"Dashboard",  title:"CRM Dashboard",          desc:"Customer pipeline with deal stages, activity feed, and contact management.",            tags:["CRM","Pipeline","Contacts"] },
  { job_id:"515567f6", category:"App",        title:"Task Manager",           desc:"Kanban-style task board with drag-and-drop columns and priority labels.",               tags:["Kanban","Tasks","Productivity"] },
  { job_id:"6a1def90", category:"App",        title:"Finance Tracker",        desc:"Personal finance app with income/expense charts and category breakdown.",               tags:["Finance","Charts","Budget"] },
  { job_id:"515567f6", category:"App",        title:"Habit Tracker",          desc:"Daily habit tracker with streaks, completion rings, and progress history.",             tags:["Habits","Streaks","Health"] },
  { job_id:"4338edbb", category:"Business",   title:"Restaurant Website",     desc:"Restaurant site with online menu, gallery, reservation form, and location map.",        tags:["Food","Menu","Reservations"] },
  { job_id:"6a1def90", category:"Business",   title:"Law Firm Site",          desc:"Professional law firm site with practice areas, team bios, and contact form.",         tags:["Legal","Professional","Services"] },
  { job_id:"6a1def90", category:"Business",   title:"Real Estate Listing",    desc:"Property listing with photo carousel, specs, map embed, and agent contact.",           tags:["Real Estate","Listing","Map"] },
];

const CATEGORIES = ["All","Marketing","Portfolio","E-commerce","Dashboard","App","Business"];
const BACKEND    = "https://entrepreneur-bot-backend.onrender.com";
const previewUrl = (id) => `${BACKEND}/auth/preview/${id}/`;

/* ─── CIRCUIT SVG ────────────────────────────────────────────────────────── */
function CircuitSVG() {
  return (
    <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.22,pointerEvents:"none" }} xmlns="http://www.w3.org/2000/svg">
      {[80,160,260,340].map(y => <line key={`h${y}`} x1="0" y1={y} x2="100%" y2={y} stroke="#C8102E" strokeWidth="0.6" strokeDasharray="40 22"/>)}
      {[100,260,420,580,740,900].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100%" stroke="#C8102E" strokeWidth="0.6" strokeDasharray="30 16"/>)}
      {[[100,80],[260,160],[420,80],[580,260],[740,160],[100,260],[420,340],[580,80],[900,160]].map(([x,y],i) =>
        <rect key={i} x={x-4} y={y-4} width="8" height="8" fill="none" stroke="#C8102E" strokeWidth="1" opacity="0.8"/>
      )}
      {[[100,80],[260,160],[420,260]].map(([x,y],i) =>
        <circle key={i} cx={x} cy={y} r="3" fill="#C8102E" opacity="0.6"/>
      )}
      <polyline points="0,80 100,80 100,160 260,160" fill="none" stroke="#C8102E" strokeWidth="1" opacity="0.5"/>
      <polyline points="420,80 420,160 580,160 580,260" fill="none" stroke="#C8102E" strokeWidth="1" opacity="0.45"/>
      <polyline points="900,80 900,260 740,260 740,340" fill="none" stroke="#C8102E" strokeWidth="0.8" opacity="0.35"/>
    </svg>
  );
}

/* ─── CARD ───────────────────────────────────────────────────────────────── */
function TemplateCard({ template, index, onUse }) {
  const [cloning,  setCloning]  = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleUse = async (e) => {
    e.stopPropagation();
    if (cloning) return;
    setCloning(true);
    try { await onUse(template); } finally { setCloning(false); }
  };

  return (
    <motion.div
      className="tpl-card"
      initial={{ opacity:0, y:18 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.97 }}
      transition={{ duration:0.32, delay: Math.min(index * 0.04, 0.28) }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handleUse}
    >
      {/* corner pips */}
      <div className="card-pip" style={{ top:6,  left:6  }} />
      <div className="card-pip" style={{ top:6,  right:6 }} />
      <div className="card-pip" style={{ bottom:6, left:6  }} />
      <div className="card-pip" style={{ bottom:6, right:6 }} />

      {/* preview window */}
      <div style={{ height:"210px", background:"#06060C", position:"relative", overflow:"hidden", borderBottom:"1px solid rgba(200,16,46,0.08)" }}>
        {/* browser chrome */}
        <div style={{
          position:"absolute",top:0,left:0,right:0,height:"28px",zIndex:2,
          background:"rgba(8,8,16,0.98)",borderBottom:"1px solid rgba(200,16,46,0.07)",
          display:"flex",alignItems:"center",gap:"5px",padding:"0 10px",
        }}>
          {["#FF5F57","#FFBD2E","#28C840"].map((c,i)=>(
            <span key={i} style={{ width:"6px",height:"6px",background:c,opacity:0.45,flexShrink:0 }}/>
          ))}
          <div style={{ marginLeft:"8px",flex:1,height:"10px",background:"rgba(200,16,46,0.05)",border:"1px solid rgba(200,16,46,0.1)",display:"flex",alignItems:"center",padding:"0 6px" }}>
            <div style={{ width:"35%",height:"1px",background:"rgba(200,16,46,0.2)" }}/>
          </div>
        </div>

        <iframe src={previewUrl(template.job_id)} title={template.title}
          style={{ position:"absolute",top:"28px",left:0,width:"200%",height:"calc(200% - 28px)",transform:"scale(0.5)",transformOrigin:"top left",pointerEvents:"none",border:"none" }}
          sandbox="allow-scripts allow-same-origin" loading="lazy"
        />

        <AnimatePresence>
          {hovering && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.14}}
              style={{ position:"absolute",inset:0,zIndex:3,background:"rgba(4,4,6,0.72)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <motion.button className="use-btn" initial={{scale:0.88,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.13}}
                onClick={handleUse} disabled={cloning}>
                {cloning ? "CLONING..." : "USE TEMPLATE →"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* body */}
      <div style={{ padding:"13px 15px 17px", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px" }}>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.5rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--red)" }}>
            {template.category}
          </span>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.48rem",color:"var(--muted)",letterSpacing:"0.1em" }}>
            TPL_{String(index+1).padStart(3,"0")}
          </span>
        </div>

        <div style={{ height:"1px",background:"linear-gradient(90deg,rgba(200,16,46,0.22),transparent)",marginBottom:"9px" }}/>

        <h3 style={{ fontFamily:"'Rajdhani',sans-serif",fontSize:"1.02rem",fontWeight:700,color:"var(--text)",marginBottom:"5px",letterSpacing:"0.05em",textTransform:"uppercase",lineHeight:1.15 }}>
          {template.title}
        </h3>
        <p style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:"0.68rem",color:"var(--muted)",lineHeight:1.7,margin:"0 0 11px",fontWeight:400 }}>
          {template.desc}
        </p>

        <div style={{ display:"flex",flexWrap:"wrap",gap:"4px" }}>
          {template.tags.map(tag => (
            <span key={tag} style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",border:"1px solid rgba(200,16,46,0.14)",background:"rgba(200,16,46,0.03)",padding:"2px 7px" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function TemplatesPage() {
  const navigate = useNavigate();
  const [active,  setActive]  = useState("All");
  const [search,  setSearch]  = useState("");
  const [focused, setFocused] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = PAGE_CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  const filtered = ALL_TEMPLATES.filter(t => {
    const matchCat    = active === "All" || t.category === active;
    const q           = search.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(g => g.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleUse = async (template) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("pending_template", template.job_id);
      navigate(`/login?redirect=studio&template=${template.job_id}`);
      return;
    }
    try {
      const res = await API.post("/auth/template/clone", { template_id: template.job_id });
      navigate(`/studio?cloned=${res.data.job_id}`);
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to clone template.");
    }
  };

  const userName = (() => {
    const s = localStorage.getItem("user_name");
    if (s) return s;
    return (localStorage.getItem("user_email") || "").split("@")[0] || "";
  })();

  return (
    <>
      <StickyNavbar userName={userName} />
      <div className="scan-line" />

      <div className="circuit-bg page-root" style={{ minHeight:"100vh",paddingTop:"72px",fontFamily:"'Rajdhani',sans-serif",position:"relative",overflowX:"hidden",color:"var(--text)" }}>

        {/* ── HERO ── */}
        <header style={{ position:"relative",overflow:"hidden",padding:"3.5rem 2rem 3rem",borderBottom:"1px solid rgba(200,16,46,0.1)" }}>
          <CircuitSVG />

          {/* system status bar */}
          <div style={{ maxWidth:"1200px",margin:"0 auto 2.2rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"12px",fontFamily:"'DM Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.18em",textTransform:"uppercase" }}>
              <div className="node-dot"/>
              <span style={{ color:"var(--muted)" }}>SYS // TEMPLATE REGISTRY</span>
              <div style={{ width:"50px",height:"1px",background:"linear-gradient(90deg,rgba(200,16,46,0.3),transparent)" }}/>
              <span style={{ color:"var(--red)" }}>ONLINE</span>
            </div>
            <div style={{ display:"flex",gap:"20px",fontFamily:"'DM Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)" }}>
              <span>NODES: <span style={{ color:"var(--red)" }}>{ALL_TEMPLATES.length}</span></span>
              <span>SECTORS: <span style={{ color:"var(--red)" }}>{CATEGORIES.length - 1}</span></span>
              <span>STATUS: <span style={{ color:"#22C55E" }}>READY</span></span>
            </div>
          </div>

          {/* headline + stats */}
          <div style={{ maxWidth:"1200px",margin:"0 auto",position:"relative",zIndex:2,display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:"2.5rem" }}>
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.28em",color:"var(--red)",marginBottom:"0.9rem",display:"flex",alignItems:"center",gap:"10px" }}>
                <span style={{ display:"inline-block",width:"18px",height:"1px",background:"var(--red)" }}/>
                TEMPLATE GALLERY // V2.0
                <span style={{ display:"inline-block",width:"18px",height:"1px",background:"var(--red)" }}/>
              </div>

              <h1 className="glitch-text" style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(2.6rem,5.5vw,5rem)",letterSpacing:"0.06em",lineHeight:0.92,textTransform:"uppercase",color:"var(--text)",margin:0 }}>
                PICK A TEMPLATE
              </h1>
              <h1 style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(2.6rem,5.5vw,5rem)",letterSpacing:"0.06em",lineHeight:0.92,textTransform:"uppercase",color:"var(--red)",marginBottom:"1.6rem",textShadow:"0 0 40px rgba(200,16,46,0.45)" }}>
                SHIP IT TODAY.
              </h1>

              <p style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:"0.76rem",color:"var(--muted)",lineHeight:2,maxWidth:"360px" }}>
                // Every template is a live editable app.<br/>
                // Clone it. Describe your changes.<br/>
                // Agent rewrites code instantly.
              </p>
            </div>

            {/* stat blocks */}
            <div style={{ display:"flex",gap:"1px",alignSelf:"flex-start",marginTop:"1rem" }}>
              {[
                { label:"TEMPLATES",  value: ALL_TEMPLATES.length },
                { label:"CATEGORIES", value: CATEGORIES.length - 1 },
                { label:"BUILD TIME", value: "<60S" },
              ].map((s,i) => (
                <div key={i} style={{ background:"var(--surface2)",border:"1px solid rgba(200,16,46,0.14)",borderLeft:i>0?"none":"1px solid rgba(200,16,46,0.14)",padding:"14px 22px" }}>
                  <div style={{ fontFamily:"'Rajdhani',sans-serif",fontSize:"2rem",fontWeight:700,color:"var(--red)",lineHeight:1,letterSpacing:"0.04em" }}>{s.value}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.48rem",color:"var(--muted)",letterSpacing:"0.16em",marginTop:"5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── FILTER BAR ── */}
        <div style={{ position:"sticky",top:"72px",zIndex:40,background:"rgba(4,4,6,0.95)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(200,16,46,0.09)" }}>
          <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"0.75rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.75rem" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap" }}>
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.2em",color:"var(--muted)",textTransform:"uppercase",marginRight:"4px" }}>
                SECTOR //
              </span>
              {CATEGORIES.map(cat => (
                <button key={cat} className={`filter-btn${active===cat?" active":""}`} onClick={() => setActive(cat)}>{cat}</button>
              ))}
            </div>

            <div style={{ display:"flex",alignItems:"center",gap:"8px",background:"var(--surface2)",border:`1px solid ${focused?"rgba(200,16,46,0.38)":"rgba(200,16,46,0.1)"}`,padding:"6px 12px",transition:"border-color 0.2s",minWidth:"190px" }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <circle cx="4.5" cy="4.5" r="3.5" stroke="#3A3A46" strokeWidth="1"/>
                <path d="M7.5 7.5L10 10" stroke="#3A3A46" strokeWidth="1" strokeLinecap="square"/>
              </svg>
              <input type="text" placeholder="SEARCH..." value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                className="search-input"
                style={{ background:"transparent",border:"none",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.1em",width:"100%" }}
              />
              {search && <button onClick={()=>setSearch("")} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:"0.8rem",padding:0 }}>✕</button>}
            </div>
          </div>
        </div>

        {/* ── GRID ── */}
        <main style={{ maxWidth:"1200px",margin:"0 auto",padding:"2rem 2rem 8rem" }}>

          <div style={{ display:"flex",alignItems:"center",gap:"10px",fontFamily:"'DM Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.16em",color:"var(--muted)",textTransform:"uppercase",marginBottom:"1.4rem" }}>
            <div className="node-dot" style={{ width:"4px",height:"4px" }}/>
            <span>
              {filtered.length} NODE{filtered.length!==1?"S":""} LOADED
              {active!=="All"&&` // SECTOR: ${active.toUpperCase()}`}
              {search&&` // QUERY: "${search.toUpperCase()}"`}
            </span>
            <div className="trace-h" style={{ flex:1,maxWidth:"100px" }}/>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:"center",padding:"5rem 2rem",border:"1px solid rgba(200,16,46,0.1)",background:"var(--surface)" }}>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.58rem",color:"var(--red)",letterSpacing:"0.2em",marginBottom:"0.6rem" }}>// ERROR 404</div>
              <p style={{ fontFamily:"'Rajdhani',sans-serif",fontSize:"1.4rem",fontWeight:700,color:"var(--muted)",letterSpacing:"0.06em",textTransform:"uppercase" }}>NO NODES FOUND</p>
              <p style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.6rem",color:"var(--dim)",marginTop:"0.4rem" }}>Try a different sector or clear the query.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:"1px",background:"rgba(200,16,46,0.06)",border:"1px solid rgba(200,16,46,0.08)" }}>
                {filtered.map((t,i) => (
                  <div key={`${t.job_id}-${t.title}`} style={{ background:"var(--bg)" }}>
                    <TemplateCard template={t} index={i} onUse={handleUse}/>
                  </div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </main>

        {/* ── BOTTOM CTA ── */}
        <div style={{ borderTop:"1px solid rgba(200,16,46,0.1)",background:"var(--surface)",position:"relative",overflow:"hidden" }}>
          <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.1,pointerEvents:"none" }} xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#C8102E" strokeWidth="0.5" strokeDasharray="20 10"/>
            {[80,240,400,560,720,880].map(x=>(
              <line key={x} x1={x} y1="0" x2={x} y2="100%" stroke="#C8102E" strokeWidth="0.5" strokeDasharray="10 18"/>
            ))}
            {[[80,60],[240,100],[400,60],[560,100],[720,60]].map(([x,y],i)=>(
              <rect key={i} x={x-3} y={y-3} width="6" height="6" fill="none" stroke="#C8102E" strokeWidth="0.8" opacity="0.6"/>
            ))}
          </svg>

          <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"4rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"2rem",position:"relative",zIndex:1 }}>
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.22em",color:"var(--red)",marginBottom:"0.5rem",textTransform:"uppercase" }}>
                // CUSTOM BUILD
              </div>
              <h2 style={{ fontFamily:"'Rajdhani',sans-serif",fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"var(--text)",lineHeight:1.05,marginBottom:"0.6rem" }}>
                DON'T SEE WHAT<br/>YOU NEED?
              </h2>
              <p style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:"0.7rem",color:"var(--muted)",lineHeight:1.9 }}>
                // Describe any app. Agent builds from scratch.<br/>
                // Deploys in under 60 seconds.
              </p>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:"12px",alignItems:"flex-start" }}>
              <button className="use-btn" onClick={()=>navigate(isLoggedIn?"/studio":"/register")} style={{ fontSize:"0.78rem",padding:"14px 40px" }}>
                {isLoggedIn ? "OPEN STUDIO →" : "START BUILDING FREE →"}
              </button>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"0.48rem",color:"var(--muted)",letterSpacing:"0.12em",display:"flex",alignItems:"center",gap:"8px" }}>
                <div className="node-dot" style={{ width:"4px",height:"4px" }}/>
                NO CREDIT CARD REQUIRED
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}