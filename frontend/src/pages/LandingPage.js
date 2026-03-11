import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRive } from "rive-react";
import StickyNavbar from "../components/StickyNavbar";
import { useEffect, useState, useRef } from "react";
import API from "../api/api";

// ── Typing animation (floating bubble) ───────────────────────────────────────
function TypingText({ text = "", speed = 50, loop = true }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!text) return;
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (loop) {
      const r = setTimeout(() => { setDisplayedText(""); setIndex(0); }, 10000);
      return () => clearTimeout(r);
    }
  }, [index, text, speed, loop]);
  return (
    <span className="text-sm text-white opacity-90 whitespace-nowrap inline-block overflow-hidden" style={{ width: "100%", maxWidth: "400px" }}>
      {displayedText}<span className="animate-pulse">|</span>
    </span>
  );
}

// ── Template data ─────────────────────────────────────────────────────────────
const TEMPLATES = [
  { job_id: "6a1def90", title: "SaaS Landing Page",      desc: "Modern SaaS marketing page with hero, pricing, and feature sections." },
  { job_id: "ea5cb482", title: "Developer Portfolio",     desc: "Clean developer portfolio with projects, skills, and contact sections." },
  { job_id: "70d042cf", title: "E-commerce Product Page", desc: "Product showcase with gallery, reviews, and add-to-cart flow." },
  { job_id: "515567f6", title: "Analytics Dashboard",     desc: "Data dashboard with charts, stats cards, and sidebar navigation." },
  { job_id: "0fa66551", title: "Waitlist / Coming Soon",  desc: "Pre-launch page with email capture, countdown, and social proof." },
  { job_id: "4338edbb", title: "Restaurant / Menu",       desc: "Restaurant site with menu, reservations, and location info." },
];

function TemplateCard({ template, index, onUse, disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const [cloning, setCloning] = useState(false);
  const previewUrl = `https://entrepreneur-bot-backend.onrender.com/auth/preview/${template.job_id}/`;
  const handleClick = async () => {
    if (cloning || disabled) return;
    setCloning(true);
    try { await onUse(template); } finally { setCloning(false); }
  };
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: index * 0.1 }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{ position: "relative", borderRadius: "16px", overflow: "hidden", cursor: disabled ? "default" : cloning ? "wait" : "pointer", border: hovered ? "1px solid rgba(220,0,0,0.6)" : "1px solid rgba(40,40,40,0.8)", background: "#0a0a0a", transition: "all 0.3s ease", boxShadow: hovered ? "0 0 40px rgba(180,0,0,0.3),0 8px 32px rgba(0,0,0,0.6)" : "0 2px 16px rgba(0,0,0,0.4)", transform: hovered ? "translateY(-4px)" : "translateY(0)" }}
    >
      <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative", background: "#111", borderBottom: "1px solid rgba(40,40,40,0.6)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28px", background: "rgba(20,20,20,0.95)", display: "flex", alignItems: "center", gap: "5px", padding: "0 10px", zIndex: 2, borderBottom: "1px solid rgba(40,40,40,0.5)" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffbd2e" }} />
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#28c840" }} />
          <span style={{ marginLeft: "8px", flex: 1, height: "14px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
        </div>
        <div style={{ position: "absolute", top: "28px", left: 0, width: "200%", height: "424px", transform: "scale(0.5)", transformOrigin: "top left", pointerEvents: "none" }}>
          <iframe src={previewUrl} title={template.title} style={{ width: "100%", height: "100%", border: "none", background: "#fff" }} sandbox="allow-scripts allow-same-origin" loading="eager" />
        </div>
        <div style={{ position: "absolute", inset: 0, zIndex: 3, background: hovered ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
          {hovered && !disabled && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
              style={{ padding: "10px 24px", background: "linear-gradient(135deg,#cc0000,#8b0000)", borderRadius: "10px", color: "#fff", fontSize: "0.88rem", fontWeight: 700, boxShadow: "0 0 24px rgba(200,0,0,0.5)", letterSpacing: "0.03em" }}>
              {cloning ? "Cloning..." : "Use Template →"}
            </motion.div>
          )}
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{template.title}</h3>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, margin: 0 }}>{template.desc}</p>
      </div>
    </motion.div>
  );
}

// ── Bottom glowing prompt box ─────────────────────────────────────────────────
function BottomPromptBox({ onSend }) {
  const [prompt, setPrompt] = useState("Build a SaaS landing page for a fitness app");
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + "px";
    }
  }, [prompt]);

  const examples = [
    "Create a portfolio site for a photographer",
    "Make a dashboard for tracking crypto prices",
    "Build an e-commerce product page",
    "Build a restaurant website with a menu",
  ];

  return (
    <div style={{ width: "100%", maxWidth: "680px", margin: "0 auto" }}>
      <div
        style={{
          background: "rgba(8,2,2,0.95)",
          border: focused ? "1.5px solid rgba(255,40,40,0.8)" : "1.5px solid rgba(200,0,0,0.6)",
          borderRadius: "20px",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          boxShadow: focused
            ? "0 0 50px rgba(220,0,0,0.7), 0 0 100px rgba(180,0,0,0.35), inset 0 0 30px rgba(180,0,0,0.08)"
            : "0 0 30px rgba(200,0,0,0.5), 0 0 60px rgba(180,0,0,0.25), inset 0 0 20px rgba(150,0,0,0.05)",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
          animation: focused ? "none" : "glowPulse 2.5s ease-in-out infinite",
        }}
      >
        <div style={{ padding: "12px 22px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,80,80,0.7)", fontWeight: 600 }}>Ready to build</span>
          <span style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(200,0,0,0.3), transparent)" }} />
          <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>edit or use as-is</span>
        </div>
        <textarea ref={ref} value={prompt} onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(prompt); } }}
          rows={2}
          style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: focused ? "#ffffff" : "rgba(255,180,180,0.9)", fontSize: "1.08rem", padding: "10px 22px 12px", resize: "none", fontFamily: "Segoe UI, sans-serif", lineHeight: 1.6, minHeight: "68px", maxHeight: "160px", caretColor: "#ff3333", textShadow: focused ? "0 0 18px rgba(255,80,80,0.6), 0 0 40px rgba(255,30,30,0.3)" : "0 0 12px rgba(255,60,60,0.4)", transition: "text-shadow 0.3s ease, color 0.3s ease" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 14px 16px" }}>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>Enter to build · Shift+Enter for new line</span>
          <button onClick={() => onSend(prompt)} disabled={!prompt.trim()}
            style={{ background: prompt.trim() ? "linear-gradient(135deg, #ff2020 0%, #cc0000 40%, #8b0000 100%)" : "rgba(40,40,40,0.8)", color: prompt.trim() ? "#fff" : "rgba(255,255,255,0.25)", border: "none", borderRadius: "12px", padding: "12px 32px", fontSize: "1rem", fontWeight: 700, cursor: prompt.trim() ? "pointer" : "default", letterSpacing: "0.03em", transition: "all 0.25s ease", boxShadow: prompt.trim() ? "0 0 28px rgba(255,30,30,0.8), 0 0 60px rgba(200,0,0,0.4)" : "none" }}
            onMouseEnter={e => { if (prompt.trim()) { e.currentTarget.style.boxShadow = "0 0 40px rgba(255,40,40,0.9), 0 0 80px rgba(220,0,0,0.5)"; e.currentTarget.style.transform = "scale(1.04) translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = prompt.trim() ? "0 0 28px rgba(255,30,30,0.8), 0 0 60px rgba(200,0,0,0.4)" : "none"; e.currentTarget.style.transform = "scale(1)"; }}
          >Build it</button>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginTop: "14px" }}>
        {examples.map((p, i) => (
          <button key={i} onClick={() => setPrompt(p)}
            style={{ background: "rgba(15,4,4,0.8)", border: "1px solid rgba(80,0,0,0.4)", borderRadius: "100px", padding: "6px 14px", color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s ease", backdropFilter: "blur(8px)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(180,0,0,0.6)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(60,0,0,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(80,0,0,0.4)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(15,4,4,0.8)"; }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main LandingPage ──────────────────────────────────────────────────────────
function LandingPage() {
  const navigate    = useNavigate();
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef(null);

  const token      = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const getRawName = () => {
    const stored = localStorage.getItem("user_name");
    if (stored) return stored;
    const email = localStorage.getItem("user_email") || "";
    return email.split("@")[0] || "";
  };
  const [userName] = useState(getRawName());

  const { rive: heroRive,   RiveComponent: HeroBot   } = useRive({ src: "/hustler-robot.riv",      autoplay: true, stateMachines: ["State Machine 1"] });
  const { rive: bubbleRive, RiveComponent: BubbleBot } = useRive({ src: "/hustler-bubble-bot.riv", autoplay: true, stateMachines: ["State Machine 1"] });

  useEffect(() => {
    let lastCall = 0;
    const handleMouse = (x) => {
      const now = Date.now();
      if (now - lastCall < 32) return;
      lastCall = now;
      const mx = x / window.innerWidth;
      const hi = heroRive?.inputs?.find((i) => i.name === "mouseX");
      const bi = bubbleRive?.inputs?.find((i) => i.name === "mouseX");
      if (hi) hi.value = mx;
      if (bi) bi.value = mx;
    };
    const onMove   = (e) => handleMouse(e.clientX);
    const onScroll = ()  => handleMouse(window.scrollY % window.innerWidth);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll",    onScroll);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll); };
  }, [heroRive, bubbleRive]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [prompt]);

  useEffect(() => {
    API.post("/admin/track", { page: "/" }).catch(() => {});
  }, []);

  const handleSend = (text) => {
    const t = (typeof text === "string" ? text : prompt).trim();
    if (!t) return;
    const encoded = encodeURIComponent(t);
    if (isLoggedIn) navigate(`/studio?prompt=${encoded}`);
    else            navigate(`/login?redirect=studio&prompt=${encoded}`);
  };

  const handleUseTemplate = async (template) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("pending_template", template.job_id);
      navigate(`/login?redirect=studio&template=${template.job_id}`);
      return;
    }
    try {
      const res = await API.post("/auth/template/clone", { template_id: template.job_id });
      navigate(`/studio?cloned=${res.data.job_id}`);
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to clone template");
    }
  };

  const examplePrompts = [
    "Build a SaaS landing page for a fitness app",
    "Create a portfolio site for a photographer",
    "Make a dashboard for tracking crypto prices",
    "Build an e-commerce product page",
  ];

  const roadmapSteps = [
    { title: "Describe Your App",         desc: "Type what you want to build in plain English. The more detail, the better — but even a single sentence works." },
    { title: "Agent Builds in Real Time", desc: "Watch the agent write components, styling, and logic. A live preview appears as soon as the build finishes." },
    { title: "Interact & Iterate",        desc: "Click around your app. Ask for changes in the chat. The agent edits your code and rebuilds instantly." },
    { title: "Download & Deploy",         desc: "Export your code as a clean React project. Deploy to Vercel, Netlify, or anywhere in minutes." },
  ];

  const badgeText = isLoggedIn ? `Welcome back · ${userName}` : "Welcome";

  // The robot sits at roughly top:50%, transform: translate(-50%, -65%)
  // meaning its center is near 50% - 65%*0.5 ≈ 17.5% from top of section.
  // The robot div is 700px tall, so it spans roughly 0% to ~55% of the section height.
  // We stop the beam at 55% height so no light bleeds below the robot's feet.
  const BEAM_STOP = "55%";

  return (
    <>
      <StickyNavbar userName={userName} />

      <div style={{ paddingTop: "72px" }} className="bg-black text-white font-sans overflow-x-hidden">
        <style>{`
          @keyframes badgePulse { 0%,100%{opacity:1;box-shadow:0 0 6px #ff3333,0 0 12px #ff3333} 50%{opacity:0.6;box-shadow:0 0 3px #ff3333} }
          @keyframes glowPulse  { 0%,100%{box-shadow:0 0 30px rgba(200,0,0,0.5),0 0 60px rgba(180,0,0,0.3)} 50%{box-shadow:0 0 50px rgba(220,0,0,0.8),0 0 100px rgba(200,0,0,0.5)} }
          @keyframes spotDust   { 0%,100%{opacity:0.6} 50%{opacity:1} }
          .prompt-wrap { transition: box-shadow 0.3s ease, border-color 0.3s ease; }
          .prompt-wrap:focus-within { border-color:rgba(200,0,0,0.7)!important; box-shadow:0 0 0 1px rgba(180,0,0,0.25),0 0 60px rgba(180,0,0,0.2)!important; }
          .example-btn:hover { border-color:rgba(180,0,0,0.6)!important; color:#fff!important; background:rgba(60,0,0,0.4)!important; }
          .send-btn:hover:not(:disabled) { box-shadow:0 0 30px rgba(220,0,0,0.6)!important; transform:scale(1.02); }
          @keyframes templateArrowBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
          .template-arrow { animation: templateArrowBounce 1.8s ease-in-out infinite; }
          @keyframes templateShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        `}</style>

        {/* ── HERO ── */}
        <section
          className="relative flex flex-col justify-center items-center px-6 overflow-hidden"
          style={{ minHeight: "100vh", paddingBottom: "300px", paddingTop: "60px" }}
        >

          {/*
            ══════════════════════════════════════════════════════
            THEATRE SPOTLIGHT — single flat uniform beam
            One cone, one brightness level, no banding, no waves.
            Hard edges left and right, stops at robot level.
            ══════════════════════════════════════════════════════
          */}

          {/* ── SINGLE BEAM — flat uniform cone, no layers, no gradients ── */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: `calc(100% - ${BEAM_STOP})`,
            clipPath: "polygon(46% 0%, 54% 0%, 72% 100%, 28% 100%)",
            background: "rgba(255, 252, 230, 0.22)",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          {/* ── Lamp source glow — hot point at top-center ── */}
          <div style={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "160px",
            height: "90px",
            background: "radial-gradient(ellipse 50% 60% at 50% 20%, rgba(255,255,240,0.65) 0%, rgba(255,252,220,0.35) 35%, rgba(255,248,200,0.12) 65%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          {/* ── Top vignette — darkens ceiling outside beam ── */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "35%",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          {/* ── Bottom fade — floor fades back to black ── */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          <motion.div
            className="z-10 text-center w-full max-w-3xl"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
          >
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(139,0,0,0.35)", border: "1px solid rgba(220,0,0,0.5)", borderRadius: "100px", padding: "6px 16px 6px 10px", marginBottom: "28px", backdropFilter: "blur(12px)", boxShadow: "0 0 20px rgba(180,0,0,0.3),inset 0 0 12px rgba(180,0,0,0.1)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff3333", display: "inline-block", boxShadow: "0 0 6px #ff3333,0 0 12px #ff3333", animation: "badgePulse 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.82rem", color: "rgba(255,200,200,0.95)", letterSpacing: "0.04em" }}>{badgeText}</span>
            </motion.div>

            <div style={{ marginBottom: "32px" }}>
              <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-tight mb-4">
                The Hustler Bot
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-3 max-w-xl mx-auto">
                Build any app. Just describe it.
              </p>
              <p className="text-base text-gray-400 max-w-lg mx-auto">
                Type what you want and the agent writes the code, builds it live, and shows you a working preview — in seconds.
              </p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} style={{ width: "100%", marginBottom: "16px" }}>
              <div className="prompt-wrap" style={{ background: "rgba(8,2,2,0.92)", border: "1px solid rgba(120,0,0,0.5)", borderRadius: "20px", backdropFilter: "blur(20px)", boxShadow: "0 4px 40px rgba(100,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
                <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Describe the app you want to build..." rows={2}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "1.05rem", padding: "20px 22px 12px", resize: "none", fontFamily: "Segoe UI, sans-serif", lineHeight: 1.6, minHeight: "72px", maxHeight: "160px", caretColor: "#ff3333" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px 14px" }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>Enter to build · Shift+Enter for new line</span>
                  <button className="send-btn" onClick={() => handleSend()} disabled={!prompt.trim()}
                    style={{ background: prompt.trim() ? "linear-gradient(135deg,#cc0000 0%,#8b0000 100%)" : "rgba(40,40,40,0.8)", color: prompt.trim() ? "#fff" : "rgba(255,255,255,0.25)", border: "none", borderRadius: "12px", padding: "11px 26px", fontSize: "0.95rem", fontWeight: 600, cursor: prompt.trim() ? "pointer" : "default", transition: "all 0.2s ease", boxShadow: prompt.trim() ? "0 0 20px rgba(180,0,0,0.4)" : "none" }}>
                    Build it
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
              {examplePrompts.map((p, i) => (
                <button key={i} className="example-btn" onClick={() => { setPrompt(p); textareaRef.current?.focus(); }}
                  style={{ background: "rgba(15,4,4,0.8)", border: "1px solid rgba(80,0,0,0.4)", borderRadius: "100px", padding: "6px 14px", color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s ease", backdropFilter: "blur(8px)" }}>
                  {p}
                </button>
              ))}
            </motion.div>

            {isLoggedIn && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                style={{ marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <button onClick={() => navigate("/studio")}
                  style={{ background: "linear-gradient(135deg,#cc0000,#8b0000)", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "1rem", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 0 28px rgba(200,0,0,0.6),0 0 56px rgba(180,0,0,0.25)", transition: "all 0.2s ease", letterSpacing: "0.02em" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(220,0,0,0.8),0 0 80px rgba(200,0,0,0.4)"; e.currentTarget.style.transform = "scale(1.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 28px rgba(200,0,0,0.6),0 0 56px rgba(180,0,0,0.25)"; e.currentTarget.style.transform = "scale(1)"; }}>
                  Open Dashboard
                </button>
                {localStorage.getItem("user_email") === "thehustlerbot@gmail.com" && (
                  <button onClick={() => navigate("/admin")}
                    style={{ background: "rgba(220,0,0,0.08)", border: "1px solid rgba(220,0,0,0.25)", borderRadius: "10px", padding: "8px 22px", fontSize: "0.78rem", fontWeight: 600, color: "rgba(220,0,0,0.6)", cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,0,0,0.15)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220,0,0,0.08)"; e.currentTarget.style.color = "rgba(220,0,0,0.6)"; }}>
                    ⚙ Admin
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Robot — inside the spotlight */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -65%)", width: "700px", height: "700px", zIndex: 1, opacity: 0.9, pointerEvents: "none" }}>
            <HeroBot style={{ width: "100%", height: "100%" }} />
          </div>
        </section>

        {/* ── TEMPLATES ── */}
        <section className="py-36 bg-black text-white px-4 md:px-12 z-10 relative">
          <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <h2 className="text-5xl md:text-6xl font-bold mb-5" style={{ textShadow: "0 0 30px rgba(255,26,26,0.3)" }}>Start from a Template</h2>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.4)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>Pick a pre-built project, make it yours, and iterate with the agent. Every template is fully editable.</p>
          </motion.div>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {TEMPLATES.slice(0, 3).map((t, i) => (
                <TemplateCard key={t.job_id} template={t} index={i} onUse={handleUseTemplate} />
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                style={{ filter: "blur(5px)", opacity: 0.35, pointerEvents: "none", userSelect: "none" }}>
                {TEMPLATES.slice(3).map((t, i) => (
                  <TemplateCard key={t.job_id} template={t} index={i + 3} onUse={() => {}} disabled />
                ))}
              </div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.96) 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "2.5rem" }}>
                <div style={{ width: "120px", height: "1px", marginBottom: "20px", background: "linear-gradient(90deg, transparent, rgba(200,0,0,0.6), rgba(255,80,80,0.9), rgba(200,0,0,0.6), transparent)", backgroundSize: "200% auto", animation: "templateShimmer 2.5s linear infinite" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(10,0,0,0.7)", border: "1px solid rgba(120,0,0,0.4)", borderRadius: "100px", padding: "5px 16px 5px 10px", marginBottom: "18px", backdropFilter: "blur(12px)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff3333", boxShadow: "0 0 6px #ff3333", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,180,180,0.7)", letterSpacing: "0.06em" }}>12 more templates across 6 categories</span>
                </div>
                <div onClick={() => navigate("/templates")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.04em", color: "rgba(255,255,255,0.85)", textShadow: "0 0 20px rgba(255,255,255,0.4)", transition: "all 0.2s ease", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "2px" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.textShadow = "0 0 30px rgba(255,100,100,0.7)"; e.currentTarget.style.borderBottomColor = "rgba(255,80,80,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.textShadow = "0 0 20px rgba(255,255,255,0.4)"; e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)"; }}
                  >Browse all templates</span>
                  <span className="template-arrow" style={{ fontSize: "1.2rem", color: "rgba(220,60,60,0.8)" }}>↓</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-36 bg-black relative z-10 overflow-hidden px-4 md:px-12">
          <motion.h2 className="text-5xl md:text-6xl font-bold text-center mb-24 text-white" style={{ textShadow: "0 0 30px rgba(255,26,26,0.3)" }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>How It Works</motion.h2>
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute left-1/2 top-0 h-full w-[3px] bg-gradient-to-b from-red-600 via-transparent to-black animate-pulse z-0 transform -translate-x-1/2" />
            {roadmapSteps.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? "" : "md:flex-row-reverse"} items-center justify-between gap-10 mb-24 z-10`}>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                  <div className="w-6 h-6 bg-red-600 rounded-full shadow-[0_0_20px_#ff1a1a]" />
                </div>
                <div className="bg-[#111] border border-red-900 rounded-2xl p-6 md:max-w-lg w-full shadow-[0_0_30px_rgba(255,26,26,0.2)] z-20">
                  <div className="text-red-500 font-bold text-sm mb-2 uppercase tracking-widest">Step {index + 1}</div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-md">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="relative py-36 bg-gradient-to-b from-black via-[#110000] to-black overflow-hidden z-20 px-4">
          <motion.div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[200%] h-full bg-gradient-radial from-red-800/30 to-transparent blur-2xl opacity-60 pointer-events-none" initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5 }} />
          <motion.h2 initial={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-bold text-white text-center z-10 relative mb-4" style={{ textShadow: "0 0 30px rgba(255,26,26,0.3)" }}>
            Your next app is one sentence away.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="mb-14 text-lg text-center text-gray-400 max-w-xl mx-auto z-10 relative">
            No coding required. Just describe it and watch it come to life.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="z-10 relative">
            <BottomPromptBox onSend={handleSend} />
          </motion.div>
        </section>
      </div>

      {/* ── FLOATING BUBBLE ── */}
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#111] border border-red-700 rounded-full px-4 py-2 shadow-[0_0_25px_#ff1a1a] hover:scale-105 transition cursor-pointer"
        onClick={() => {
          if (isLoggedIn) navigate("/studio");
          else { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => textareaRef.current?.focus(), 600); }
        }}
        style={{ height: "64px", minWidth: "260px", maxWidth: "380px" }}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <BubbleBot style={{ width: "100%", height: "100%" }} />
        </div>
        <TypingText text={isLoggedIn ? "Welcome back! Open the Dashboard" : "Describe your app and I'll build it!"} speed={50} />
      </div>
    </>
  );
}

export default LandingPage;