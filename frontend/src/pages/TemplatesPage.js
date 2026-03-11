import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StickyNavbar from "../components/StickyNavbar";
import API from "../api/api";

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

  :root {
    --red:       #C8102E;
    --red-glow:  rgba(200,16,46,0.25);
    --bg:        #060608;
    --surface:   #0C0C10;
    --border:    rgba(255,255,255,0.06);
    --text:      #F0EDE6;
    --muted:     #4A4A52;
    --dim:       #22222A;
  }

  @keyframes tplFadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes tplGlow {
    0%,100% { opacity:0.5; }
    50%      { opacity:1; }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }

  .tpl-card {
    transition: transform 0.32s cubic-bezier(0.16,1,0.3,1),
                box-shadow 0.32s ease,
                border-color 0.22s ease;
    cursor: pointer;
  }
  .tpl-card:hover {
    transform: translateY(-8px);
    border-color: rgba(200,16,46,0.55) !important;
    box-shadow: 0 0 0 1px rgba(200,16,46,0.3),
                0 24px 64px rgba(200,16,46,0.15),
                0 8px 24px rgba(0,0,0,0.6) !important;
  }

  .filter-btn {
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    cursor: pointer;
    border: none;
    outline: none;
  }

  .use-btn {
    transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.15s ease;
  }
  .use-btn:hover {
    transform: translateY(-2px) scale(1.03);
    filter: brightness(1.1);
  }
  .use-btn:active { transform: scale(0.97); }

  /* preview iframe container */
  .preview-frame {
    position:absolute; top:28px; left:0;
    width:200%; height:calc(200% - 28px);
    transform:scale(0.5); transform-origin:top left;
    pointer-events:none;
    border:none;
  }

  /* noise */
  .page-noise {
    position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.018;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
`;

/* ─── ALL TEMPLATES ──────────────────────────────────────────────────────── */
/*
  The 6 real job_ids are what's on disk. Everything else shares a job_id
  from those 6 — it just shows a different title/desc/category but clones
  the same base. You can swap job_ids once you add more templates.
*/
const ALL_TEMPLATES = [
  /* ── MARKETING ── */
  {
    job_id: "6a1def90", category: "Marketing",
    title: "SaaS Landing Page",
    desc:  "Hero, feature grid, pricing table, and CTA — everything a modern SaaS needs to convert.",
    tags:  ["SaaS", "Conversion", "Pricing"],
  },
  {
    job_id: "0fa66551", category: "Marketing",
    title: "Waitlist / Coming Soon",
    desc:  "Pre-launch page with email capture, countdown timer, and social proof section.",
    tags:  ["Launch", "Email", "Countdown"],
  },
  {
    job_id: "ea5cb482", category: "Marketing",
    title: "Agency Landing Page",
    desc:  "Bold agency homepage with services, case studies, team, and contact form.",
    tags:  ["Agency", "Services", "Portfolio"],
  },

  /* ── PORTFOLIO ── */
  {
    job_id: "ea5cb482", category: "Portfolio",
    title: "Developer Portfolio",
    desc:  "Clean developer portfolio with projects, skills, GitHub stats, and contact sections.",
    tags:  ["Developer", "CV", "GitHub"],
  },
  {
    job_id: "ea5cb482", category: "Portfolio",
    title: "Designer Showcase",
    desc:  "Visual-first portfolio with full-bleed case studies and a minimal nav.",
    tags:  ["Design", "Case Studies", "Visual"],
  },
  {
    job_id: "ea5cb482", category: "Portfolio",
    title: "Freelancer Profile",
    desc:  "One-page freelancer site with rates, testimonials, and a booking form.",
    tags:  ["Freelance", "Booking", "Rates"],
  },

  /* ── ECOMMERCE ── */
  {
    job_id: "70d042cf", category: "E-commerce",
    title: "Product Page",
    desc:  "Product showcase with image gallery, reviews, size selector, and add-to-cart.",
    tags:  ["Product", "Cart", "Reviews"],
  },
  {
    job_id: "70d042cf", category: "E-commerce",
    title: "Storefront",
    desc:  "Multi-product catalog with filters, sort controls, and a cart sidebar.",
    tags:  ["Catalog", "Filters", "Cart"],
  },
  {
    job_id: "70d042cf", category: "E-commerce",
    title: "Checkout Flow",
    desc:  "Multi-step checkout with address, payment, and order confirmation screens.",
    tags:  ["Checkout", "Payment", "Steps"],
  },

  /* ── DASHBOARDS ── */
  {
    job_id: "515567f6", category: "Dashboard",
    title: "Analytics Dashboard",
    desc:  "Data dashboard with charts, KPI cards, date filters, and sidebar navigation.",
    tags:  ["Analytics", "Charts", "KPIs"],
  },
  {
    job_id: "515567f6", category: "Dashboard",
    title: "Admin Panel",
    desc:  "Full admin panel with users table, actions, stats overview, and dark sidebar.",
    tags:  ["Admin", "Tables", "Users"],
  },
  {
    job_id: "515567f6", category: "Dashboard",
    title: "CRM Dashboard",
    desc:  "Customer pipeline with deal stages, activity feed, and contact management.",
    tags:  ["CRM", "Pipeline", "Contacts"],
  },

  /* ── APPS ── */
  {
    job_id: "515567f6", category: "App",
    title: "Task Manager",
    desc:  "Kanban-style task board with drag-and-drop columns and priority labels.",
    tags:  ["Kanban", "Tasks", "Productivity"],
  },
  {
    job_id: "6a1def90", category: "App",
    title: "Finance Tracker",
    desc:  "Personal finance app with income/expense charts and category breakdown.",
    tags:  ["Finance", "Charts", "Budget"],
  },
  {
    job_id: "515567f6", category: "App",
    title: "Habit Tracker",
    desc:  "Daily habit tracker with streaks, completion rings, and progress history.",
    tags:  ["Habits", "Streaks", "Health"],
  },

  /* ── BUSINESS ── */
  {
    job_id: "4338edbb", category: "Business",
    title: "Restaurant Website",
    desc:  "Restaurant site with online menu, gallery, reservation form, and location map.",
    tags:  ["Food", "Menu", "Reservations"],
  },
  {
    job_id: "6a1def90", category: "Business",
    title: "Law Firm Site",
    desc:  "Professional law firm site with practice areas, team bios, and contact form.",
    tags:  ["Legal", "Professional", "Services"],
  },
  {
    job_id: "6a1def90", category: "Business",
    title: "Real Estate Listing",
    desc:  "Property listing page with photo carousel, specs, map embed, and agent contact.",
    tags:  ["Real Estate", "Listing", "Map"],
  },
];

const CATEGORIES = ["All", "Marketing", "Portfolio", "E-commerce", "Dashboard", "App", "Business"];

/* ─── PREVIEW URL ────────────────────────────────────────────────────────── */
const BACKEND = "https://entrepreneur-bot-backend.onrender.com";
const previewUrl = (job_id) => `${BACKEND}/auth/preview/${job_id}/`;

/* ─── TEMPLATE CARD ─────────────────────────────────────────────────────── */
function TemplateCard({ template, index, onUse, isLoggedIn }) {
  const [cloning, setCloning]   = useState(false);
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35) }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handleUse}
      style={{
        background: "#0C0C10",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* live preview window */}
      <div style={{
        height: "220px",
        background: "#111",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* browser chrome */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "28px", zIndex: 2,
          background: "rgba(16,16,20,0.98)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", gap: "5px",
          padding: "0 10px",
        }}>
          {["#FF5F57","#FFBD2E","#28C840"].map((c,i) => (
            <span key={i} style={{ width:"7px", height:"7px", borderRadius:"50%", background:c, opacity:0.7 }} />
          ))}
          <span style={{
            marginLeft: "8px", flex: 1, height: "13px",
            background: "rgba(255,255,255,0.04)", borderRadius: "3px",
          }} />
        </div>

        {/* scaled iframe */}
        <iframe
          src={previewUrl(template.job_id)}
          title={template.title}
          className="preview-frame"
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />

        {/* hover overlay */}
        <AnimatePresence>
          {hovering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute", inset: 0, zIndex: 3,
                background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <motion.button
                className="use-btn"
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.16 }}
                onClick={handleUse}
                disabled={cloning}
                style={{
                  background: cloning ? "rgba(200,16,46,0.4)" : "#C8102E",
                  border: "none", borderRadius: "8px",
                  padding: "11px 28px",
                  color: "#fff", fontSize: "0.88rem", fontWeight: 600,
                  cursor: cloning ? "wait" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.03em",
                  boxShadow: "0 0 32px rgba(200,16,46,0.5)",
                  position: "relative", overflow: "hidden",
                }}
              >
                {/* shimmer */}
                {!cloning && (
                  <span style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
                    animation: "shimmer 1.6s ease infinite",
                  }} />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {cloning ? "Cloning..." : "Use Template →"}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* card body */}
      <div style={{ padding: "16px 18px 20px" }}>
        {/* category tag */}
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.55rem", fontWeight: 500,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#C8102E",
          marginBottom: "7px", display: "block",
        }}>
          {template.category}
        </span>

        <h3 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "1rem", fontWeight: 600,
          color: "#F0EDE6", marginBottom: "6px", lineHeight: 1.2,
          letterSpacing: "0.01em",
        }}>
          {template.title}
        </h3>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.78rem", color: "#4A4A52",
          lineHeight: 1.6, margin: "0 0 12px",
        }}>
          {template.desc}
        </p>

        {/* tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {template.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.58rem", letterSpacing: "0.06em",
              color: "#2E2E38",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "3px", padding: "2px 7px",
            }}>
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
  const navigate   = useNavigate();
  const [active, setActive]   = useState("All");
  const [search, setSearch]   = useState("");
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
    const matchSearch = !q ||
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q)  ||
      t.tags.some(tag => tag.toLowerCase().includes(q));
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
      alert(err?.response?.data?.error || "Failed to clone template. Please try again.");
    }
  };

  const userName = (() => {
    const stored = localStorage.getItem("user_name");
    if (stored) return stored;
    const email = localStorage.getItem("user_email") || "";
    return email.split("@")[0] || "";
  })();

  return (
    <>
      <StickyNavbar userName={userName} />
      <div className="page-noise" />

      <div style={{
        minHeight: "100vh",
        background: "#060608",
        paddingTop: "72px",
        fontFamily: "'Space Grotesk', sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}>

        {/* ambient top glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "900px", height: "400px", pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(200,16,46,0.1) 0%, transparent 65%)",
        }} />

        {/* ── HERO ── */}
        <header style={{
          textAlign: "center",
          padding: "5rem 2rem 3.5rem",
          position: "relative",
          animation: "tplFadeUp 0.55s ease both",
        }}>
          {/* top label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "2rem",
          }}>
            <div style={{ width: "28px", height: "1px", background: "#C8102E" }} />
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.62rem", fontWeight: 600,
              letterSpacing: "0.28em", color: "#C8102E",
              textTransform: "uppercase",
            }}>
              Template Gallery
            </span>
            <div style={{ width: "28px", height: "1px", background: "#C8102E" }} />
          </div>

          {/* main headline — all-caps, tight, sharp */}
          <h1 style={{
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "#F0EDE6",
            marginBottom: "0.5rem",
            textTransform: "uppercase",
          }}>
            PICK A TEMPLATE.
          </h1>
          <h1 style={{
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "#C8102E",
            marginBottom: "2rem",
            textTransform: "uppercase",
          }}>
            SHIP IT TODAY.
          </h1>

          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.9rem", color: "#4A4A52",
            fontWeight: 400, maxWidth: "400px",
            margin: "0 auto 2.5rem", lineHeight: 1.75,
            letterSpacing: "0.01em",
          }}>
            Every template is a live, editable app. Clone it, describe your changes,
            and the agent rewrites the code instantly.
          </p>

          {/* count badge — sharp corners */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "7px 16px",
            background: "rgba(200,16,46,0.05)",
            border: "1px solid rgba(200,16,46,0.18)",
            borderRadius: "3px",
          }}>
            <div style={{
              width: "6px", height: "6px",
              background: "#C8102E",
              boxShadow: "0 0 6px #C8102E",
              animation: "tplGlow 2s ease-in-out infinite",
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.62rem", fontWeight: 500,
              color: "#C8102E", letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              {ALL_TEMPLATES.length} templates — {CATEGORIES.length - 1} categories
            </span>
          </div>
        </header>

        {/* ── FILTERS + SEARCH ── */}
        <div style={{
          maxWidth: "1440px", margin: "0 auto",
          padding: "0 2rem 2rem",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between",
          gap: "1rem",
          position: "sticky", top: "72px", zIndex: 40,
          background: "rgba(6,6,8,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          paddingTop: "1rem",
        }}>
          {/* category filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className="filter-btn"
                onClick={() => setActive(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "100px",
                  background: active === cat ? "#C8102E" : "rgba(255,255,255,0.04)",
                  color: active === cat ? "#fff" : "#4A4A52",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: active === cat ? 600 : 400,
                  letterSpacing: "0.02em",
                  border: `1px solid ${active === cat ? "#C8102E" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${focused ? "rgba(200,16,46,0.4)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: "8px",
            padding: "7px 14px",
            transition: "border-color 0.2s",
            minWidth: "220px",
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="#4A4A52" strokeWidth="1.2"/>
              <path d="M9 9L11.5 11.5" stroke="#4A4A52" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#F0EDE6", fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8rem", fontWeight: 300,
                width: "100%",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "#4A4A52", fontSize: "0.9rem", lineHeight: 1,
                padding: "0",
              }}>×</button>
            )}
          </div>
        </div>

        {/* ── GRID ── */}
        <main style={{
          maxWidth: "1440px", margin: "0 auto",
          padding: "2.5rem 2rem 8rem",
        }}>

          {/* result count */}
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.6rem", letterSpacing: "0.14em",
            color: "#22222A", textTransform: "uppercase",
            marginBottom: "1.8rem",
          }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {active !== "All" && ` in ${active}`}
            {search && ` for "${search}"`}
          </div>

          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "6rem 2rem",
            }}>
              <p style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.6rem", color: "#22222A",
                marginBottom: "0.5rem",
              }}>
                No templates found.
              </p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.85rem", color: "#22222A",
              }}>
                Try a different category or clear the search.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.25rem",
              }}>
                {filtered.map((template, i) => (
                  <TemplateCard
                    key={`${template.job_id}-${template.title}`}
                    template={template}
                    index={i}
                    onUse={handleUse}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </main>

        {/* ── BOTTOM CTA ── */}
        <div style={{
          textAlign: "center",
          padding: "0 2rem 6rem",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%",
            transform: "translateX(-50%)",
            width: "600px", height: "200px", pointerEvents: "none",
            background: "radial-gradient(ellipse at 50% 100%, rgba(200,16,46,0.08) 0%, transparent 65%)",
          }} />
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            color: "#F0EDE6", marginBottom: "0.6rem",
            fontWeight: 700, letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}>
            Don't see what you need?
          </p>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.85rem", color: "#4A4A52",
            marginBottom: "1.8rem", fontWeight: 400,
            letterSpacing: "0.01em",
          }}>
            Describe any app and the agent builds it from scratch — in seconds.
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/studio" : "/register")}
            style={{
              background: "#C8102E", border: "none", borderRadius: "8px",
              padding: "14px 36px", color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.95rem", fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.03em",
              boxShadow: "0 0 32px rgba(200,16,46,0.4)",
              transition: "filter 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.filter = "brightness(1.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isLoggedIn ? "Open Studio →" : "Start Building Free →"}
          </button>
        </div>

      </div>
    </>
  );
}