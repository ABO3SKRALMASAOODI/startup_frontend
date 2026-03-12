import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import { useRive } from "rive-react";
import API from "../api/api";
import NameModal from "../components/NameModal";
import ModelSelector from "../components/ModelSelector";

// ── Inject global styles (animations, scrollbar, markdown) ───────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin         { to{transform:rotate(360deg)} }
  @keyframes redPulse     { 0%,100%{filter:drop-shadow(0 0 3px rgba(200,0,0,0.9)) drop-shadow(0 0 7px rgba(160,0,0,0.6)) drop-shadow(0 0 14px rgba(120,0,0,0.3))} 50%{filter:drop-shadow(0 0 5px rgba(255,0,0,1)) drop-shadow(0 0 12px rgba(200,0,0,0.8)) drop-shadow(0 0 22px rgba(160,0,0,0.5))} }
  @keyframes buildingDot  { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }
  @keyframes fadeSlideIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer     { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .chat-window::-webkit-scrollbar { width: 4px; }
  .chat-window::-webkit-scrollbar-track { background: transparent; }
  .chat-window::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 4px; }
  .chat-window::-webkit-scrollbar-thumb:hover { background: #8b0000; }

  .message-content {
    word-break: break-word;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  .message-content p  { margin: 0 0 0.5em; }
  .message-content ul { margin: 0.4em 0; padding-left: 1.4em; }
  .message-content li { margin-bottom: 0.25em; }
  .message-content code {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 1px 5px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82em;
    color: #ff9999;
  }
  .message-content pre {
    background: #0d0d0d;
    border: 1px solid #1f1f1f;
    border-radius: 8px;
    padding: 12px;
    overflow-x: auto;
    margin: 0.5em 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .message-content pre code {
    background: none;
    border: none;
    padding: 0;
    color: #c9d1d9;
  }

  .msg-row { animation: fadeSlideIn 0.22s ease forwards; }

  .input-wrap:focus-within {
    border-color: rgba(180,0,0,0.6) !important;
    box-shadow: 0 0 0 1px rgba(140,0,0,0.2), 0 0 24px rgba(140,0,0,0.15) !important;
  }
`;

function GlobalStyles() {
  useEffect(() => {
    const id  = "studio-global-styles";
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id    = id;
    tag.textContent = GLOBAL_STYLES;
    document.head.appendChild(tag);
  }, []);
  return null;
}

// ── Mobile detection ─────────────────────────────────────────────────────────
function useIsMobile() {
  const check = () => ({
    isMobilePortrait:  window.innerWidth <= 768 && window.innerHeight > window.innerWidth,
    isMobileLandscape: window.innerWidth <= 926 && window.innerHeight <= 430 && window.innerWidth > window.innerHeight,
  });
  const [state, setState] = React.useState(check);
  useEffect(() => {
    const handler = () => setState(check());
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, []);
  return state;
}

// ── Rotate screen prompt ─────────────────────────────────────────────────────
function RotateScreen() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#000",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "24px",
    }}>
      <div style={{
        fontSize: "3.5rem",
        animation: "spin 2.5s ease-in-out infinite",
        filter: "drop-shadow(0 0 12px rgba(200,0,0,0.7))",
      }}>
        ⟳
      </div>
      <div style={{ textAlign: "center", maxWidth: "260px", padding: "0 24px" }}>
        <p style={{
          color: "#fff", fontSize: "1.1rem", fontWeight: 700,
          marginBottom: "10px", letterSpacing: "0.02em",
        }}>
          Rotate your phone
        </p>
        <p style={{ color: "#555", fontSize: "0.84rem", lineHeight: 1.65 }}>
          The Hustler Bot is designed for landscape mode on mobile.
        </p>
      </div>
      <div style={{
        width: "48px", height: "2px",
        background: "linear-gradient(90deg, #8b0000, #cc0000)",
        borderRadius: "2px",
        boxShadow: "0 0 10px rgba(200,0,0,0.5)",
      }} />
      <p style={{ color: "#2a2a2a", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        The Hustler Bot
      </p>
    </div>
  );
}

// ── Hustler Bot avatar ──
function BotAvatar() {
  const { RiveComponent, rive } = useRive({
    src: "/hustler-robot.riv",
    autoplay: true,
    stateMachines: ["State Machine 1"],
  });

  const containerRef = useRef(null);

  const setMouseX = (val) => {
    if (!rive) return;
    try {
      const inputs = rive.stateMachineInputs("State Machine 1");
      const mx = inputs?.find(i => i.name === "mouseX");
      if (mx) mx.value = val;
    } catch (_) {}
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setMouseX(Math.max(0, Math.min(1, x)));
  };

  const handleMouseLeave = () => setMouseX(0.5);

  useEffect(() => {
    if (!rive) return;
    const t = setTimeout(() => setMouseX(0.5), 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearTimeout(t);
  }, [rive]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: "34px", height: "34px",
        flexShrink: 0,
        filter: "drop-shadow(0 0 3px rgba(220,0,0,0.95)) drop-shadow(0 0 7px rgba(180,0,0,0.7)) drop-shadow(0 0 14px rgba(140,0,0,0.4))",
        animation: "redPulse 2.4s ease-in-out infinite",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "transparent",
      }} />
      <RiveComponent style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

// ── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 2px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: "#8b0000",
          display: "inline-block",
          animation: `buildingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── generate a smart project title from the user's prompt ────────────────────
const generateTitle = async (prompt) => {
  try {
    const res = await API.post("/auth/job/title", { prompt });
    return res.data.title || prompt.slice(0, 40);
  } catch {
    return prompt.slice(0, 40);
  }
};

// ─── API helpers ──────────────────────────────────────────────────────────────

const generateProject = async (prompt, title, model) => {
  const res = await API.post("/auth/generate", { prompt, title, model });
  return res.data.job_id;
};

const sendFollowUp = async (jobId, message, model) => {
  await API.post(`/auth/job/${jobId}/message`, { message, model });
};

const getJobStatus = async (jobId) => {
  const res = await API.get(`/auth/job/${jobId}/status`);
  return res.data;
};

const getCredits = async () => {
  const res = await API.get("/auth/credits");
  return res.data;
};

const fetchProjects = async () => {
  const res = await API.get("/auth/jobs");
  return res.data.jobs || [];
};

const fetchJobFiles = async (jobId) => {
  const res = await API.get(`/auth/job/${jobId}/files`);
  return res.data.files || [];
};

const downloadProjectZip = async (jobId, title) => {
  const res = await API.get(`/auth/job/${jobId}/download`, { responseType: "blob" });
  const url  = URL.createObjectURL(new Blob([res.data], { type: "application/zip" }));
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${(title || jobId).replace(/\s+/g, "-")}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Static bot avatar for empty state ────────────────────────────────────────
function BotAvatarStatic() {
  const { RiveComponent } = useRive({
    src: "/hustler-robot.riv",
    autoplay: true,
    stateMachines: ["State Machine 1"],
  });
  return <RiveComponent style={{ width: "100%", height: "100%" }} />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LANG_MAP = {
  js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
  css: "css", html: "html", json: "json", md: "markdown",
  py: "python", sh: "bash", txt: "plaintext",
};

const getLang = (path) => {
  const ext = path.split(".").pop().toLowerCase();
  return LANG_MAP[ext] || "plaintext";
};

const getFileIcon = (path) => {
  const ext = path.split(".").pop().toLowerCase();
  const icons = { jsx: "⚛", tsx: "⚛", js: "𝐉", ts: "𝐓", css: "🎨", html: "🌐", json: "{ }", md: "📝", svg: "🖼" };
  return icons[ext] || "📄";
};

// ─── Syntax highlighting via highlight.js ────────────────────────────────────

let hljsReady = false;
let hljsCallbacks = [];

function loadHljs(cb) {
  if (hljsReady) { cb(); return; }
  hljsCallbacks.push(cb);
  if (document.getElementById("hljs-css")) return;

  const link  = document.createElement("link");
  link.id     = "hljs-css";
  link.rel    = "stylesheet";
  link.href   = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
  document.head.appendChild(link);

  const script   = document.createElement("script");
  script.src     = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
  script.onload  = () => {
    hljsReady = true;
    hljsCallbacks.forEach(fn => fn());
    hljsCallbacks = [];
  };
  document.head.appendChild(script);
}

function HighlightedCode({ code, lang }) {
  const ref = useRef(null);

  useEffect(() => {
    loadHljs(() => {
      if (ref.current && window.hljs) {
        ref.current.removeAttribute("data-highlighted");
        ref.current.textContent = code;
        ref.current.className   = `language-${lang}`;
        window.hljs.highlightElement(ref.current);
      }
    });
  }, [code, lang]);

  return (
    <pre style={{
      margin: 0,
      padding: "1rem 1.2rem",
      fontSize: "0.78rem",
      lineHeight: 1.7,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      background: "#0d1117",
      whiteSpace: "pre",
      minHeight: "100%",
      overflowX: "visible",
    }}>
      <code ref={ref} className={`language-${lang}`}>{code}</code>
    </pre>
  );
}

// ─── Code Viewer ──────────────────────────────────────────────────────────────

function CodeViewer({ jobId, title }) {
  const [files,       setFiles]       = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [copied,      setCopied]      = useState(false);
  const [treeOpen,    setTreeOpen]    = useState(true);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetchJobFiles(jobId)
      .then(f => {
        setFiles(f);
        if (f.length > 0) setSelected(f[0].path);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  const selectedFile = files.find(f => f.path === selected);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [zipLoading, setZipLoading] = useState(false);

  const handleDownloadZip = async () => {
    setZipLoading(true);
    try {
      await downloadProjectZip(jobId, title);
    } catch (e) {
      console.error("ZIP download failed", e);
    } finally {
      setZipLoading(false);
    }
  };

  const tree = {};
  files.forEach(f => {
    const parts = f.path.split("/");
    let node = tree;
    parts.forEach((part, i) => {
      if (!node[part]) node[part] = i === parts.length - 1 ? null : {};
      node = node[part] || {};
    });
  });

  const renderTree = (node, prefix = "") => {
    return Object.entries(node).map(([name, children]) => {
      const fullPath = prefix ? `${prefix}/${name}` : name;
      const isFile   = children === null;
      const isActive = selected === fullPath;

      if (isFile) {
        return (
          <div
            key={fullPath}
            onClick={() => setSelected(fullPath)}
            style={{
              padding: "4px 8px 4px 12px",
              fontSize: "0.76rem",
              cursor: "pointer",
              borderRadius: "5px",
              color: isActive ? "#fff" : "#777",
              background: isActive ? "#1a0000" : "transparent",
              borderLeft: isActive ? "2px solid #8b0000" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: "5px",
              transition: "all 0.12s",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#bbb"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#777"; }}
          >
            <span style={{ fontSize: "0.7rem" }}>{getFileIcon(name)}</span>
            {name}
          </div>
        );
      }

      return (
        <FolderNode key={fullPath} name={name} fullPath={fullPath} children={children} renderTree={renderTree} />
      );
    });
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
        <div style={S.spinner} />
        <p style={{ color: "#333", fontSize: "0.82rem" }}>Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#2a2a2a", fontSize: "0.82rem" }}>No source files available yet.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{
        width: treeOpen ? "200px" : "36px",
        flexShrink: 0,
        borderRight: "1px solid #111",
        background: "#070707",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.2s ease",
      }}>
        <div style={{ padding: "6px 6px 4px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #111" }}>
          {treeOpen && <span style={{ fontSize: "0.65rem", color: "#333", textTransform: "uppercase", letterSpacing: "0.1em" }}>Files</span>}
          <button
            onClick={() => setTreeOpen(o => !o)}
            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "0.8rem", padding: "2px 4px", marginLeft: "auto" }}
            title={treeOpen ? "Collapse" : "Expand"}
          >
            {treeOpen ? "◀" : "▶"}
          </button>
        </div>
        {treeOpen && (
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 4px" }}>
            {renderTree(tree)}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "6px 12px", borderBottom: "1px solid #111", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: "0.75rem", color: "#555", fontFamily: "monospace" }}>
            {selectedFile ? selectedFile.path : ""}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={handleCopy}
              style={{ background: "#111", border: "1px solid #1f1f1f", color: copied ? "#4caf50" : "#666", borderRadius: "5px", padding: "3px 10px", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s" }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={zipLoading}
              style={{ background: "linear-gradient(135deg, #cc0000, #8b0000)", border: "none", color: "#fff", borderRadius: "5px", padding: "3px 12px", fontSize: "0.72rem", cursor: zipLoading ? "wait" : "pointer", fontWeight: 600, opacity: zipLoading ? 0.7 : 1, transition: "all 0.2s" }}
              title="Download complete project as ZIP — unzip, run npm install, then npm run dev"
            >
              {zipLoading ? "Zipping..." : "⬇ Download Project"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
          {selectedFile && (
            <HighlightedCode
              code={selectedFile.content}
              lang={getLang(selectedFile.path)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Expandable thinking line ────────────────────────────────────────────────

function ThinkingLine({ text }) {
  const [expanded, setExpanded] = useState(false);

  const cleaned = text
    .replace(/^(plan|planning|task list|aesthetic direction)[:\s]*/i, "")
    .replace(/^[-─═—]+\s*/gm, "")
    .replace(/^\[.?\]\s*/gm, "")
    .replace(/\n+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 5) return null;

  const short = cleaned.length > 70 ? cleaned.slice(0, 70) + "..." : cleaned;

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        marginTop: "8px",
        cursor: "pointer",
        animation: "fadeSlideIn 0.2s ease forwards",
        padding: "5px 8px",
        borderRadius: "6px",
        background: expanded ? "rgba(140,0,0,0.08)" : "rgba(140,0,0,0.04)",
        border: "1px solid rgba(140,0,0,0.12)",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(140,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.background = expanded ? "rgba(140,0,0,0.08)" : "rgba(140,0,0,0.04)"}
    >
      <p style={{
        fontSize: "0.68rem",
        color: expanded ? "#cc8888" : "#884444",
        lineHeight: 1.5,
        margin: 0,
        fontStyle: "italic",
        transition: "all 0.2s",
        textShadow: "0 0 6px rgba(200,0,0,0.2)",
      }}>
        <span style={{
          color: "#cc0000",
          marginRight: "5px",
          fontSize: "0.6rem",
          textShadow: "0 0 4px rgba(200,0,0,0.5)",
        }}>
          {expanded ? "▾" : "▸"}
        </span>
        <span style={{ color: "#666", fontStyle: "normal", marginRight: "4px", fontSize: "0.62rem", letterSpacing: "0.04em" }}>
          reasoning:
        </span>
        {expanded ? cleaned : short}
      </p>
    </div>
  );
}

// ─── FIX Issue 4: Compute a real progress percentage from build phases ────────

function computeProgressPercent(progress, buildPhase) {
  if (buildPhase === "rendering") return 100;
  if (buildPhase === "compiling") return 85;

  if (buildPhase === "building" || buildPhase === "editing") {
    const filesWritten = progress.reduce((max, p) => Math.max(max, p.files_written || 0), 0);
    const estimatedTotal = Math.max(8, filesWritten + 2);
    const filePct = Math.min(1, filesWritten / estimatedTotal);
    return Math.round(25 + filePct * 50);
  }

  if (buildPhase === "thinking") {
    const thinkingEntries = progress.filter(p => p.action === "planning" || p.action === "thinking");
    const pct = Math.min(25, thinkingEntries.length * 5);
    return Math.max(5, pct);
  }

  return 0;
}

// ─── Building View — Live Code Editor ─────────────────────────────────────────

const TIPS = [
  "Be specific about colors, fonts, and layout to get better results.",
  "You can ask for changes after the first build — the agent remembers everything.",
  "Try: \"Make the hero section more dramatic with a gradient background.\"",
  "Ask for specific pages: \"Add an About page with a team section.\"",
  "You can request animations: \"Add a fade-in effect on scroll.\"",
  "Download your project anytime and deploy to Vercel or Netlify.",
  "The more detail you give, the better the result. Describe your vision.",
  "Ask for responsive design: \"Make sure it looks great on mobile.\"",
];

function _syntaxColor(line) {
  if (!line) return "#c9d1d9";
  const t = line.trim();
  if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) return "#555";
  if (t.startsWith("import ") || t.startsWith("export ") || t.startsWith("from ")) return "#ff7b72";
  if (t.startsWith("const ") || t.startsWith("let ") || t.startsWith("var ") || t.startsWith("function ")) return "#d2a8ff";
  if (t.startsWith("return ")) return "#ff7b72";
  if (t.startsWith("<") || t.startsWith("</")) return "#7ee787";
  if (t.includes("className=")) return "#79c0ff";
  return "#c9d1d9";
}

function BuildingView({ progress, isRendering }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentFile, setCurrentFile] = useState("");
  const codeEndRef = useRef(null);
  const animTimerRef = useRef(null);
  const processedCountRef = useRef(0);
  const codeQueueRef = useRef([]);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 6000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const codeEntries = progress.filter(p => p.code);
    const newCount = codeEntries.length;
    const alreadyProcessed = processedCountRef.current;

    if (newCount <= alreadyProcessed) return;

    const newEntries = codeEntries.slice(alreadyProcessed);
    processedCountRef.current = newCount;

    for (const entry of newEntries) {
      codeQueueRef.current.push(entry);
    }

    if (!isAnimatingRef.current) {
      playNextInQueue();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const playNextInQueue = () => {
    if (codeQueueRef.current.length === 0) {
      isAnimatingRef.current = false;
      return;
    }

    isAnimatingRef.current = true;
    const entry = codeQueueRef.current.shift();
    const lines = (entry.code || "").split("\n");

    setCurrentFile(entry.file || "");
    setDisplayedLines([]);

    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    let idx = 0;
    const addLine = () => {
      if (idx >= lines.length) {
        animTimerRef.current = setTimeout(() => playNextInQueue(), 300);
        return;
      }
      const line = lines[idx];
      idx++;
      setDisplayedLines(prev => [...prev, line ?? ""]);
      const delay = Math.min(60, 10 + (line?.length || 0) * 0.25);
      animTimerRef.current = setTimeout(addLine, delay);
    };
    animTimerRef.current = setTimeout(addLine, 40);
  };

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  useEffect(() => {
    codeEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedLines]);

  const filesWritten = progress.reduce((max, p) => Math.max(max, p.files_written || 0), 0);
  const latest = progress.length > 0 ? progress[progress.length - 1] : null;
  const hasCode = displayedLines.length > 0;

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: "#0d1117", overflow: "hidden",
    }}>
      <div style={{
        flexShrink: 0,
        padding: "10px 16px",
        background: "#0a0a0a",
        borderBottom: "1px solid #161b22",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#cc0000", flexShrink: 0,
          boxShadow: "0 0 6px rgba(200,0,0,0.9), 0 0 16px rgba(200,0,0,0.4)",
          animation: "redPulse 2.4s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: "0.75rem", color: "#888",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          flex: 1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {latest?.detail || "Initializing..."}
        </span>
        {filesWritten > 0 && (
          <span style={{
            fontSize: "0.65rem", color: "#cc0000",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "2px 10px",
            border: "1px solid rgba(140,0,0,0.3)",
            borderRadius: "100px",
            background: "rgba(140,0,0,0.08)",
            flexShrink: 0,
            boxShadow: "0 0 8px rgba(140,0,0,0.15)",
          }}>
            {filesWritten} file{filesWritten !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {hasCode ? (
        <>
          <div style={{
            flexShrink: 0,
            display: "flex", alignItems: "center",
            padding: "6px 16px",
            background: "#161b22",
            borderBottom: "1px solid #1a1a1a",
          }}>
            <span style={{
              fontSize: "0.7rem", color: "#8b0000",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {getFileIcon(currentFile)} {currentFile}
            </span>
            <div style={{
              marginLeft: "auto",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <div style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: "#cc0000",
                boxShadow: "0 0 4px rgba(200,0,0,0.8)",
                animation: "pulse 1.2s infinite",
              }} />
              <span style={{ fontSize: "0.6rem", color: "#444", letterSpacing: "0.1em" }}>LIVE</span>
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: "auto", overflowX: "auto",
            padding: "8px 0",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontSize: "0.74rem",
            lineHeight: 1.8,
          }}>
            {displayedLines.map((line, i) => {
              const safeLine = line ?? "";
              const isLast = i === displayedLines.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    animation: isLast ? "fadeSlideIn 0.15s ease forwards" : "none",
                    background: isLast ? "rgba(140,0,0,0.05)" : "transparent",
                  }}
                >
                  <span style={{
                    width: "44px", flexShrink: 0,
                    textAlign: "right", paddingRight: "12px",
                    color: isLast ? "#8b0000" : "#333",
                    fontSize: "0.65rem",
                    userSelect: "none",
                    borderRight: "1px solid #1a1a1a",
                    lineHeight: "inherit",
                  }}>
                    {i + 1}
                  </span>
                  <pre style={{
                    margin: 0, padding: "0 14px",
                    color: _syntaxColor(safeLine),
                    whiteSpace: "pre",
                    lineHeight: "inherit",
                  }}>
                    {safeLine}
                    {isLast && (
                      <span style={{
                        display: "inline-block",
                        width: "7px", height: "13px",
                        background: "#cc0000",
                        marginLeft: "1px",
                        animation: "pulse 0.8s infinite",
                        verticalAlign: "middle",
                        boxShadow: "0 0 6px rgba(200,0,0,0.5)",
                      }} />
                    )}
                  </pre>
                </div>
              );
            })}
            <div ref={codeEndRef} />
          </div>
        </>
      ) : (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "20px",
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "44px", height: "44px",
              border: "3px solid #161b22",
              borderTop: "3px solid #cc0000",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              boxShadow: "0 0 20px rgba(200,0,0,0.3)",
            }} />
            <div style={{
              position: "absolute", inset: "-12px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(200,0,0,0.12) 0%, transparent 70%)",
              animation: "pulse 2.4s ease-in-out infinite",
              pointerEvents: "none",
            }} />
          </div>

          <span style={{
            color: "#cc0000", fontSize: "0.82rem",
            fontFamily: "'JetBrains Mono', monospace",
            textShadow: "0 0 12px rgba(200,0,0,0.4)",
            animation: "pulse 2.4s ease-in-out infinite",
          }}>
            {latest?.detail || (isRendering ? "Rendering preview..." : "Preparing your app...")}
          </span>

          <div style={{
            display: "flex", flexDirection: "column", gap: "4px",
            alignItems: "center", marginTop: "8px", maxWidth: "300px",
          }}>
            {progress.slice(-3).map((entry, i) => (
              <span key={i} style={{
                fontSize: "0.68rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: i === Math.min(progress.length, 3) - 1 ? "#555" : "#2a2a2a",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: "100%",
              }}>
                {entry.file || entry.detail}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        flexShrink: 0,
        padding: "10px 16px 12px",
        background: "#0a0a0a",
        borderTop: "1px solid #161b22",
      }}>
        <div style={{
          height: "2px", background: "#161b22", borderRadius: "2px",
          overflow: "hidden", marginBottom: "8px",
        }}>
          <div style={{
            height: "100%", width: "100%",
            background: "linear-gradient(90deg, transparent, #cc0000, transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }} />
        </div>
        <p style={{
          fontSize: "0.7rem", color: "#333",
          lineHeight: 1.5, margin: 0,
          fontFamily: "Inter, Segoe UI, sans-serif",
        }}>
          💡 {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
}

function FolderNode({ name, fullPath, children, renderTree }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: "4px 8px 4px 12px", fontSize: "0.76rem", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", gap: "5px", userSelect: "none" }}
        onMouseEnter={e => e.currentTarget.style.color = "#888"}
        onMouseLeave={e => e.currentTarget.style.color = "#555"}
      >
        <span style={{ fontSize: "0.65rem" }}>{open ? "▾" : "▸"}</span>
        <span style={{ fontSize: "0.7rem" }}>📁</span>
        {name}
      </div>
      {open && (
        <div style={{ paddingLeft: "10px" }}>
          {renderTree(children, fullPath)}
        </div>
      )}
    </div>
  );
}

// ─── Credits badge ────────────────────────────────────────────────────────────

function SidebarCreditsBadge({ balance, onGetCredits }) {
  const maxCredits = 50;
  const pct = Math.max(0, Math.min(100, (balance / maxCredits) * 100));
  const isLow = balance <= 5;
  const isMedium = balance <= 15;
  const textColor = isLow ? "#e53935" : isMedium ? "#f0a500" : "#fff";

  return (
    <div style={{ padding: "12px", background: "#0d0d0d", borderRadius: "10px", border: isLow ? "1px solid rgba(229,57,53,0.3)" : "1px solid #1a1a1a", marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "0.72rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Credits Remaining</span>
        <span style={{
          fontSize: "0.9rem", fontWeight: 700, color: textColor,
          textShadow: isLow ? "0 0 8px rgba(229,57,53,0.5)" : "none",
        }}>{balance}</span>
      </div>
      <div style={{ height: "4px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden", marginBottom: "10px" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: isLow
            ? "linear-gradient(90deg, #e53935, #b71c1c)"
            : isMedium
              ? "linear-gradient(90deg, #f0a500, #c68400)"
              : "linear-gradient(90deg, #4caf50, #388e3c)",
          borderRadius: "2px",
          transition: "width 0.5s ease, background 0.3s ease",
          boxShadow: isLow ? "0 0 8px rgba(229,57,53,0.5)" : "none",
          animation: isLow ? "pulse 1.5s ease-in-out infinite" : "none",
        }} />
      </div>
      {isLow && (
        <p style={{ fontSize: "0.68rem", color: "#e53935", marginBottom: "8px", textAlign: "center" }}>
          Credits running low!
        </p>
      )}
      <button
        onClick={onGetCredits}
        style={{
          width: "100%", padding: "8px",
          background: "linear-gradient(135deg, #cc0000, #8b0000)",
          border: "none", borderRadius: "8px",
          color: "#fff", fontSize: "0.78rem", fontWeight: 600,
          cursor: "pointer", letterSpacing: "0.03em",
          boxShadow: "0 0 14px rgba(180,0,0,0.35)",
          transition: "box-shadow 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(200,0,0,0.55)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(180,0,0,0.35)"}
      >
        Upgrade for More Credits
      </button>
    </div>
  );
}

// ─── Cost tooltip ─────────────────────────────────────────────────────────────

function CostDots({ credits }) {
  const [open,    setOpen]  = useState(false);
  const [hovered, setHover] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block", marginTop: "6px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: hovered ? "#cc0000" : "#333",
          fontSize: "1rem", padding: "0 2px",
          letterSpacing: "2px", lineHeight: 1,
          textShadow: hovered ? "0 0 10px rgba(200,0,0,0.8)" : "none",
          transition: "color 0.2s, text-shadow 0.2s",
        }}
        title="Show credit cost"
      >
        ···
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: 0,
          background: "#141414", border: "1px solid #222",
          borderRadius: "10px", padding: "10px 16px",
          whiteSpace: "nowrap", zIndex: 300,
          boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
          fontSize: "0.8rem",
        }}>
          <span style={{ color: "#555" }}>Credits used: </span>
          <span style={{ color: "#f0a500", fontWeight: 700 }}>{credits ?? "—"}</span>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar drawer ───────────────────────────────────────────────────────────

function SidebarDrawer({ open, onClose, userEmail, credits, projects, currentJobId, onNewProject, onLoadProject, onLogout, onGetCredits, onHome }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
        }} />
      )}
      <div
        ref={drawerRef}
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "280px", zIndex: 500,
          background: "#0a0a0a",
          borderRight: "1px solid #1a1a1a",
          boxShadow: open ? "4px 0 40px rgba(0,0,0,0.8)" : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column",
          padding: "1.2rem 1rem",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>Studio</span>
          <button onClick={onClose} style={{ background: "#1a1a1a", border: "none", borderRadius: "50%", width: "26px", height: "26px", color: "#aaa", fontSize: "1rem", cursor: "pointer" }}>×</button>
        </div>

        <p style={{ fontSize: "0.75rem", color: "#444", marginBottom: "1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>

        {credits !== null && <SidebarCreditsBadge balance={credits} onGetCredits={onGetCredits} />}

        <button
          onClick={() => { onHome(); onClose(); }}
          style={{ ...DS.btn, background: "#111", border: "1px solid #1f1f1f", color: "#aaa", marginBottom: "6px" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
        >
          Home
        </button>

        <button
          onClick={() => { onNewProject(); onClose(); }}
          style={{ ...DS.btn, background: "#111", border: "1px solid #1f1f1f", color: "#aaa", marginBottom: "6px" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
        >
          + New Project
        </button>

        <button
          onClick={() => { onLogout(); onClose(); }}
          style={{ ...DS.btn, background: "#111", border: "1px solid #1f1f1f", color: "#aaa", marginTop: "6px" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
        >
          Logout
        </button>

        <h4 style={{ fontSize: "0.65rem", color: "#333", margin: "1.5rem 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Projects
        </h4>

        {projects.length === 0 && (
          <p style={{ color: "#333", fontSize: "0.78rem" }}>No projects yet.</p>
        )}

        {projects.map(p => (
          <div
            key={p.job_id}
            onClick={() => { onLoadProject(p); onClose(); }}
            style={{
              padding: "9px 10px", borderRadius: "8px",
              border: `1px solid ${currentJobId === p.job_id ? "#8b0000" : "#1a1a1a"}`,
              backgroundColor: currentJobId === p.job_id ? "#1a0000" : "#0d0d0d",
              cursor: "pointer", marginBottom: "5px",
              display: "flex", flexDirection: "column",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (currentJobId !== p.job_id) e.currentTarget.style.borderColor = "#333"; }}
            onMouseLeave={e => { if (currentJobId !== p.job_id) e.currentTarget.style.borderColor = "#1a1a1a"; }}
          >
            <span style={{ fontSize: "0.82rem", color: "#ddd" }}>{p.title || "Untitled"}</span>
            <span style={{
              fontSize: "0.65rem", marginTop: "3px",
              color: p.state === "completed" ? "#4caf50" : p.state === "running" ? "#f0a500" : "#444",
            }}>
              {p.state === "running" ? "Building..." : p.state === "completed" ? "Ready" : p.state === "failed" ? "Failed" : ""}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Logout Confirmation Modal ────────────────────────────────────────────────

function LogoutModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#111", border: "1px solid #2a0000",
        borderRadius: "16px", padding: "28px 32px",
        maxWidth: "340px", width: "90%",
        boxShadow: "0 0 40px rgba(140,0,0,0.3)",
        textAlign: "center",
      }}>
        <div style={{
          width: "48px", height: "48px", margin: "0 auto 16px",
          borderRadius: "50%",
          background: "rgba(140,0,0,0.15)",
          border: "1px solid rgba(140,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem",
          color: "#cc0000",
        }}>
          ⏻
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", color: "#fff", fontWeight: 700 }}>
          Log out?
        </h3>
        <p style={{ margin: "0 0 24px", fontSize: "0.82rem", color: "#666", lineHeight: 1.5 }}>
          You'll need to sign in again to access your projects.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px",
              background: "#1a1a1a", border: "1px solid #333",
              borderRadius: "10px", color: "#aaa",
              fontSize: "0.85rem", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#555"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "10px",
              background: "linear-gradient(135deg, #cc0000, #8b0000)",
              border: "none", borderRadius: "10px",
              color: "#fff", fontSize: "0.85rem", fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 0 14px rgba(180,0,0,0.35)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(200,0,0,0.55)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(180,0,0,0.35)"}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

const DS = {
  btn: { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "none", color: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.2s" },
};

// ─── Safe preview URL ─────────────────────────────────────────────────────────
function _getSafePreviewUrl(url, jobId) {
  if (!url && !jobId) return null;
  if (url && /^http:\/\/127\.0\.0\.1:\d+$/.test(url)) {
    return null;
  }
  if (url) return url;
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Studio() {
  const navigate  = useNavigate();
  const { isMobilePortrait, isMobileLandscape } = useIsMobile();
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const inputRef  = useRef(null);

  const userEmail = localStorage.getItem("user_email") || "anonymous";

  const [projects, setProjects] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [chatLoading,  setChatLoading]  = useState(false);
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [state,        setState]        = useState("idle");
  const [prompt,       setPrompt]       = useState("");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [error,        setError]        = useState("");
  const [previewKey,   setPreviewKey]   = useState(0);
  const [credits,      setCredits]      = useState(null);
  const [userPlan,     setUserPlan]     = useState(localStorage.getItem("user_plan") || "free");
  const [panelView,      setPanelView]      = useState("preview");
  const [progress,       setProgress]       = useState([]);
  const [thinkingText,   setThinkingText]   = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [previewError,  setPreviewError]  = useState(false);

  const [codeChanged,  setCodeChanged]  = useState(false);
  const [selectedModel, setSelectedModel] = useState("hb-6");

  // NameModal
  const [showNameModal, setShowNameModal] = useState(
    localStorage.getItem("show_name_modal") === "1"
  );

  const isRunning   = state === "running";

  const isRendering = state === "completed" && !previewUrl && currentJobId && codeChanged;

  const buildPhase = (() => {
    if (isRendering) return "rendering";
    if (!isRunning) return "idle";
    if (progress.length === 0) return "thinking";

    const hasCodeWrites = progress.some(p => p.action === "writing" || p.action === "editing");
    const isCompiling = progress.some(p => p.action === "building");

    if (isCompiling) return "compiling";
    if (hasCodeWrites) return previewUrl ? "editing" : "building";
    return "thinking";
  })();

  const phaseLabel = {
    thinking: "Thinking...",
    building: "Building your app...",
    editing: "Editing your app...",
    compiling: "Compiling & deploying...",
    rendering: "Rendering preview...",
    idle: "",
  }[buildPhase] || "Thinking...";

  const displayPhase = phaseLabel;

  const progressPercent = computeProgressPercent(progress, buildPhase);

  useEffect(() => {
    fetchProjects()
      .then(jobs => setProjects(jobs))
      .catch(() => {});
  }, []);

  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    getCredits().then(d => setCredits(d.balance)).catch(() => {});
    setUserPlan(localStorage.getItem("user_plan") || "free");
  }, []);

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (!currentJobId) return;
    }
    if (currentJobId) {
      sessionStorage.setItem("studio_current_job", currentJobId);
    } else {
      sessionStorage.removeItem("studio_current_job");
    }
  }, [currentJobId]);

  // Restore session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("prompt") || params.get("cloned")) return;

    const savedJobId = sessionStorage.getItem("studio_return_job_id")
      || sessionStorage.getItem("studio_current_job");

    sessionStorage.removeItem("studio_return_job_id");

    if (savedJobId) {
      setChatLoading(true);
      fetchProjects().then(async jobs => {
        setProjects(jobs);
        const project = jobs.find(p => p.job_id === savedJobId);
        if (project) {
          setCurrentJobId(project.job_id);
          const safeUrl = _getSafePreviewUrl(project.preview_url, project.job_id);
          setPreviewUrl(safeUrl);
          setPreviewError(false);
          setState(project.state || "completed");
          setCodeChanged(!!safeUrl);
          if (safeUrl) setPreviewKey(k => k + 1);
          try {
            const data = await getJobStatus(project.job_id);
            const serverMessages = (data.messages || []).map(m => ({
              role: m.role, content: m.text,
              tokens_used: m.tokens_used, credits_used: m.credits_used,
            }));
            setMessages(serverMessages);
            if (data.state) setState(data.state);
            if (data.code_changed !== undefined) setCodeChanged(data.code_changed);
            if (data.preview_url) {
              const url = _getSafePreviewUrl(data.preview_url, project.job_id);
              setPreviewUrl(url);
              setPreviewError(false);
              setPreviewKey(k => k + 1);
            }
          } catch { setMessages([]); }
          if (project.state === "running") startPolling(project.job_id);
        }
        setChatLoading(false);
      }).catch(() => setChatLoading(false));
    }
  }, []); // eslint-disable-line

  // Auto-send prompt from landing page URL
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const urlPrompt = params.get("prompt");
    if (urlPrompt?.trim()) {
      window.history.replaceState({}, "", "/studio");
      setTimeout(() => handleSendWithText(decodeURIComponent(urlPrompt).trim()), 500);
    }
  }, []); // eslint-disable-line

  // Auto-load cloned template from URL param
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const clonedId = params.get("cloned");
    if (clonedId?.trim()) {
      window.history.replaceState({}, "", "/studio");
      setTimeout(async () => {
        try {
          const data = await getJobStatus(clonedId);
          setCurrentJobId(clonedId);
          setState(data.state || "completed");
          setCodeChanged(true);
          if (data.preview_url) {
            setPreviewUrl(data.preview_url);
            setPreviewError(false);
            setPreviewKey(k => k + 1);
          }
          const serverMessages = (data.messages || []).map(m => ({
            role: m.role, content: m.text,
            tokens_used: m.tokens_used, credits_used: m.credits_used,
          }));
          setMessages(serverMessages);
          fetchProjects().then(jobs => setProjects(jobs)).catch(() => {});
        } catch (err) {
          console.error("Failed to load cloned project:", err);
        }
      }, 300);
    }
  }, []); // eslint-disable-line

  // ── Polling ───────────────────────────────────────────────────────────────

  const startPolling = (jobId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const data           = await getJobStatus(jobId);
        const serverMessages = (data.messages || []).map(m => ({
          role:         m.role,
          content:      m.text,
          tokens_used:  m.tokens_used,
          credits_used: m.credits_used,
        }));

        setMessages(serverMessages);
        setState(data.state);

        if (data.code_changed !== undefined) {
          setCodeChanged(data.code_changed);
        }

        if (data.credits_balance !== undefined) setCredits(data.credits_balance);
        if (data.model) setSelectedModel(data.model);
        if (data.plan) {
          setUserPlan(data.plan);
          localStorage.setItem("user_plan", data.plan);
        }

        if (data.progress && data.progress.length > 0) {
          setProgress(data.progress);

          const latestEntry = data.progress[data.progress.length - 1];
          const latestAction = latestEntry?.action || "";

          if (latestAction === "building") {
            setThinkingText("");
          } else {
            const thinkingEntries = data.progress.filter(p => p.action === "planning" && p.detail);
            if (thinkingEntries.length > 0) {
              setThinkingText(thinkingEntries[thinkingEntries.length - 1].detail);
            }
          }
        }

        if (data.preview_url) {
          setPreviewUrl(data.preview_url);
          setPreviewError(false);
          if (data.code_changed) {
            setPreviewKey(k => k + 1);
          }
        }

        setProjects(prev => prev.map(p =>
          p.job_id === jobId
            ? { ...p, state: data.state, preview_url: data.preview_url || p.preview_url }
            : p
        ));

        if (data.state === "completed" || data.state === "failed") {
          stopPolling();
          setProgress([]);
          setThinkingText("");
          fetchProjects().then(jobs => setProjects(jobs)).catch(() => {});
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSendWithText = async (text) => {
    if (!text || state === "running") return;
    setPrompt(""); setError("");
    try {
      setState("running");
      setProgress([]);
      setThinkingText("");
      setCodeChanged(false);
      setMessages([{ role: "user", content: text }]);

      const [jobId, smartTitle] = await Promise.all([
        generateProject(text, "", selectedModel),
        generateTitle(text),
      ]);

      setCurrentJobId(jobId);
      setProjects(prev => [{
        job_id: jobId, title: smartTitle,
        state: "running", preview_url: null,
      }, ...prev]);

      API.patch(`/auth/job/${jobId}/title`, { title: smartTitle }).catch(() => {});

      startPolling(jobId);
    } catch (err) {
      const msg = err?.response?.data?.error || "Something went wrong";
      setError(msg);
      setState("failed");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || state === "running") return;
    setPrompt(""); setError("");
    try {
      if (!currentJobId) {
        await handleSendWithText(text);
      } else {
        setState("running");
        setProgress([]);
        setThinkingText("");
        setCodeChanged(false);
        setMessages(prev => [...prev, { role: "user", content: text }]);
        await sendFollowUp(currentJobId, text, selectedModel);
        startPolling(currentJobId);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Something went wrong";
      setError(msg);
      setState("failed");
    }
  };

  const handleNewProject = () => {
    stopPolling();
    setCurrentJobId(null); setMessages([]); setPreviewUrl(null);
    setPreviewError(false);
    setCodeChanged(false);
    setState("idle"); setPrompt(""); setError("");
    setSelectedModel(userPlan === "free" ? "hb-6" : "hb-6");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleLoadProject = async (project) => {
    stopPolling();
    setChatLoading(true);
    setCurrentJobId(project.job_id);
    setError("");
    setPreviewError(false);
    setMessages([]);

    const safePreviewUrl = _getSafePreviewUrl(project.preview_url, project.job_id);
    setPreviewUrl(safePreviewUrl);
    setState(project.state || "completed");
    setCodeChanged(!!safePreviewUrl);
    if (safePreviewUrl) setPreviewKey(k => k + 1);

    try {
      const data = await getJobStatus(project.job_id);
      const serverMessages = (data.messages || []).map(m => ({
        role:         m.role,
        content:      m.text,
        tokens_used:  m.tokens_used,
        credits_used: m.credits_used,
      }));
      setMessages(serverMessages);
      if (data.state) setState(data.state);
      if (data.code_changed !== undefined) setCodeChanged(data.code_changed);
      if (data.model) setSelectedModel(data.model);
      if (data.preview_url) {
        const url = _getSafePreviewUrl(data.preview_url, project.job_id);
        setPreviewUrl(url);
        setPreviewError(false);
        setPreviewKey(k => k + 1);
      }
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }

    if (project.state === "running") startPolling(project.job_id);
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    sessionStorage.removeItem("studio_current_job");
    navigate("/home");
  };

  const handleNavigateToSubscribe = () => {
    if (currentJobId) sessionStorage.setItem("studio_return_job_id", currentJobId);
    navigate("/subscribe");
  };

  const handleHome = () => navigate("/home");

  const handleStop = async () => {
    if (!currentJobId) return;
    stopPolling();
    setState("failed");
    setProgress([]);
    setThinkingText("");
    try {
      await API.post(`/auth/job/${currentJobId}/cancel`);
    } catch {}
    fetchProjects().then(jobs => setProjects(jobs)).catch(() => {});
  };

  const placeholder = currentJobId ? "Ask for changes..." : "Describe the app you want to build...";

  // ── Render ────────────────────────────────────────────────────────────────

  if (isMobilePortrait) return <><GlobalStyles /><RotateScreen /></>;

  const chatPanelFlex = isMobileLandscape ? "0 0 260px" : "0 0 400px";

  return (
    <div style={S.layout}>
      <GlobalStyles />

      {showNameModal && (
        <NameModal
          onDone={(name) => {
            localStorage.setItem("user_name", name);
            localStorage.removeItem("show_name_modal");
            setShowNameModal(false);
          }}
        />
      )}

      <LogoutModal
        open={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <SidebarDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={userEmail}
        credits={credits}
        projects={projects}
        currentJobId={currentJobId}
        onNewProject={handleNewProject}
        onLoadProject={handleLoadProject}
        onLogout={handleLogout}
        onGetCredits={handleNavigateToSubscribe}
        onHome={handleHome}
      />

      {/* ── Chat panel ── */}
      <div style={{ ...S.chatPanel, flex: chatPanelFlex }}>

        <div style={S.topBar}>
          <button onClick={() => setSidebarOpen(true)} style={S.iconBtn} title="Menu">☰</button>
          <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentJobId ? (projects.find(p => p.job_id === currentJobId)?.title || "Project") : "The Hustler Bot"}
            </h2>
          </div>
          <div style={{ width: "34px", flexShrink: 0 }} />
        </div>

        <div className="chat-window" style={S.chatWindow}>

          {chatLoading && messages.length === 0 && (
            <div style={S.emptyState}>
              <div style={{
                width: "32px", height: "32px",
                border: "3px solid #1a1a1a",
                borderTop: "3px solid #8b0000",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ color: "#444", fontSize: "0.82rem", marginTop: "12px" }}>Loading conversation...</p>
            </div>
          )}

          {!chatLoading && messages.length === 0 && !isRunning && (
            <div style={S.emptyState}>
              <div style={{
                width: "64px", height: "64px",
                animation: "redPulse 2.4s ease-in-out infinite",
                overflow: "hidden", marginBottom: "16px",
              }}>
                <BotAvatarStatic />
              </div>
              <p style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 600, marginBottom: "6px" }}>The Hustler Bot</p>
              <p style={{ color: "#444", fontSize: "0.82rem", maxWidth: "220px", lineHeight: 1.6 }}>
                Describe an app and I'll build it for you in seconds.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLastAssistant = msg.role === "assistant" &&
              !messages.slice(i + 1).some(m => m.role === "assistant") &&
              !isRunning;

            return (
              <div
                key={i}
                className="msg-row"
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: "8px",
                  minWidth: 0,
                }}
              >
                {msg.role === "assistant" && (
                  isLastAssistant
                    ? <BotAvatar />
                    : <div style={{ width: "34px", flexShrink: 0 }} />
                )}

                <div style={{
                  maxWidth: "78%",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  overflow: "hidden",
                }}>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: msg.role === "user" ? "rgba(255,150,150,0.6)" : "rgba(180,0,0,0.8)",
                    marginBottom: "4px",
                    paddingLeft: msg.role === "user" ? 0 : "2px",
                    paddingRight: msg.role === "user" ? "2px" : 0,
                  }}>
                    {msg.role === "user" ? "You" : "The Hustler Bot"}
                  </span>

                  <div style={{
                    padding: "10px 14px",
                    borderRadius: msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #8b0000, #5a0000)"
                      : "#0f0f0f",
                    border: msg.role === "assistant"
                      ? "1px solid rgba(140,0,0,0.25)"
                      : "none",
                    boxShadow: msg.role === "user"
                      ? "0 2px 16px rgba(180,0,0,0.25)"
                      : "0 2px 12px rgba(0,0,0,0.4)",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    minWidth: 0,
                    maxWidth: "100%",
                  }}>
                    <div
                      style={{ color: "#ddd", fontSize: "0.86rem", lineHeight: 1.65 }}
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || "") }}
                      className="message-content"
                    />
                    {msg.role === "assistant" && msg.credits_used !== undefined && (
                      <CostDots credits={msg.credits_used} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Loading indicators ── */}
          {(isRunning || isRendering) && (() => {
            const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
            const agentAlreadyReplied = lastMsg && lastMsg.role === "assistant";

            if (agentAlreadyReplied) {
              const isBuildPhase = isRendering || buildPhase === "compiling" || buildPhase === "building";
              if (!isBuildPhase && !codeChanged) return null;
              if (isBuildPhase) {
                return (
                  <div className="msg-row" style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <BotAvatar />
                    <div style={{
                      padding: "10px 16px", borderRadius: "16px 16px 16px 4px",
                      background: "#0f0f0f", border: "1px solid rgba(140,0,0,0.25)",
                      width: "260px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                    }}>
                      <span style={{ fontSize: "0.7rem", color: "#888", display: "block", marginBottom: "8px" }}>
                        {isRendering ? "Rendering preview..." : buildPhase === "compiling" ? "Compiling..." : "Building..."}
                      </span>
                      <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${progressPercent}%`,
                          background: "linear-gradient(90deg, #8b0000, #cc0000, #ff1a1a)",
                          borderRadius: "3px",
                          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: "0 0 6px rgba(200,0,0,0.8), 0 0 12px rgba(180,0,0,0.4)",
                        }} />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }

            return (
              <div className="msg-row" style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <BotAvatar />
                <div style={{ maxWidth: "78%", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", overflow: "hidden" }}>
                  <div style={{
                    padding: "10px 16px", borderRadius: "16px 16px 16px 4px",
                    background: "#0f0f0f", border: "1px solid rgba(140,0,0,0.25)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                  }}>
                    <TypingDots />
                    <span style={{
                      fontSize: "0.72rem", color: "#8b0000", display: "block",
                      marginTop: "4px", letterSpacing: "0.06em",
                      textShadow: "0 0 8px rgba(140,0,0,0.3)",
                    }}>
                      {displayPhase}
                    </span>
                    {thinkingText && <ThinkingLine text={thinkingText} />}
                  </div>
                </div>
              </div>
            );
          })()}

          <div ref={bottomRef} />
        </div>

        {/* ── Input area ── */}
        <div style={{ padding: "10px", borderTop: "1px solid #111", background: "#000", flexShrink: 0 }}>
          <div
            className="input-wrap"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              borderRadius: "14px",
              padding: "10px",
              transition: "all 0.2s",
            }}
          >
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={e => {
                setPrompt(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder={placeholder}
              rows={2}
              disabled={isRunning}
              style={{
                flex: 1,
                background: "transparent",
                color: "#fff",
                border: "none",
                outline: "none",
                fontSize: "0.87rem",
                resize: "none",
                fontFamily: "Inter, Segoe UI, sans-serif",
                lineHeight: 1.5,
                maxHeight: "160px",
                minHeight: "44px",
                overflowY: "auto",
                opacity: isRunning ? 0.4 : 1,
                padding: "0",
                margin: "0",
                display: "block",
                verticalAlign: "middle",
              }}
            />
            {isRunning ? (
              <button
                onClick={handleStop}
                title="Stop generation"
                style={{
                  width: "34px", height: "34px",
                  borderRadius: "10px", border: "none",
                  background: "linear-gradient(135deg, #cc0000, #8b0000)",
                  color: "#fff", fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 0 12px rgba(180,0,0,0.5)",
                  transition: "all 0.2s",
                }}
              >
                ■
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!prompt.trim()}
                style={{
                  width: "34px", height: "34px",
                  borderRadius: "10px", border: "none",
                  background: !prompt.trim() ? "#1a1a1a" : "linear-gradient(135deg, #cc0000, #8b0000)",
                  color: !prompt.trim() ? "#333" : "#fff",
                  fontSize: "0.95rem",
                  cursor: !prompt.trim() ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: !prompt.trim() ? "none" : "0 0 12px rgba(180,0,0,0.4)",
                  transition: "all 0.2s",
                }}
              >
                ➤
              </button>
            )}
          </div>

          {/* ── Model selector + hint below the input box ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", paddingLeft: "2px", paddingRight: "2px" }}>
            <ModelSelector
              selectedModel={selectedModel}
              onSelect={setSelectedModel}
              plan={userPlan}
            />
            <p style={{ fontSize: "0.65rem", color: "#222", margin: 0, letterSpacing: "0.04em" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

        {error && (
          <div style={S.errorBar}>
            ❌ {error}
            {error.toLowerCase().includes("credits") && (
              <button
                onClick={handleNavigateToSubscribe}
                style={{ marginLeft: "12px", background: "#8b0000", border: "none", color: "#fff", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "0.78rem" }}
              >
                Get Credits
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Preview / Code panel ── */}
      <div style={S.previewPanel}>
        <div style={S.previewTopBar}>

          <div style={{ display: "flex", background: "#0d0d0d", borderRadius: "8px", border: "1px solid #1a1a1a", padding: "2px", flexShrink: 0 }}>
            {["preview", "code"].map(view => (
              <button
                key={view}
                onClick={() => setPanelView(view)}
                style={{
                  padding: "4px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: panelView === view ? "#8b0000" : "transparent",
                  color: panelView === view ? "#fff" : "#555",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {view === "preview" ? "⬡ Preview" : "〈/〉 Code"}
              </button>
            ))}
          </div>

          {panelView === "preview" && (
            <span style={{ color: "#333", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginLeft: "10px", minWidth: 0 }}>
              {previewUrl || "Preview will appear here"}
            </span>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "auto" }}>
            {userPlan === "free" && (
              <button
                onClick={handleNavigateToSubscribe}
                style={{
                  padding: "6px 16px",
                  background: "linear-gradient(135deg, #cc0000, #8b0000)",
                  border: "none", borderRadius: "8px",
                  color: "#fff", fontSize: "0.76rem", fontWeight: 600,
                  cursor: "pointer", letterSpacing: "0.03em",
                  boxShadow: "0 0 14px rgba(180,0,0,0.35)",
                  transition: "box-shadow 0.2s, transform 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(200,0,0,0.55)";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 0 14px rgba(180,0,0,0.35)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Get Credits
              </button>
            )}

            {currentJobId && !isRunning && (
              <button
                onClick={() => {
                  const project = projects.find(p => p.job_id === currentJobId);
                  sessionStorage.setItem("github_push_job_id", currentJobId);
                  sessionStorage.setItem("github_push_job_title", project?.title || "project");
                  window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liUC5tA7pNQbfiWo&scope=repo&redirect_uri=https://thehustlerbot.com/github-callback`;
                }}
                style={{ padding: "6px 14px", background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", color: "#fff", fontSize: "0.76rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#58a6ff"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                Push to GitHub
              </button>
            )}
            {panelView === "preview" && previewUrl && !previewError && (
              <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: "#8b0000", fontSize: "0.75rem", textDecoration: "none", fontWeight: "bold" }}>
                ↗ Open
              </a>
            )}
          </div>
        </div>

        {panelView === "preview" && (
          <>
            {!previewUrl ? (
              (isRunning || isRendering) ? (
                <BuildingView progress={progress} isRendering={isRendering} />
              ) : (
                <div style={S.previewEmpty}>
                  <p style={{ color: "#2a2a2a", fontSize: "0.82rem" }}>Your app preview will appear here.</p>
                </div>
              )
            ) : (
              previewError ? (
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  background: "#050505", gap: "16px",
                }}>
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "50%",
                    background: "rgba(140,0,0,0.12)", border: "1px solid rgba(140,0,0,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.5rem",
                  }}>⚠</div>
                  <p style={{ color: "#555", fontSize: "0.82rem", textAlign: "center", maxWidth: "220px", lineHeight: 1.6 }}>
                    Preview couldn't load. The app may still be building or deploying.
                  </p>
                  <button
                    onClick={() => { setPreviewError(false); setPreviewKey(k => k + 1); }}
                    style={{
                      padding: "9px 22px",
                      background: "linear-gradient(135deg, #cc0000, #8b0000)",
                      border: "none", borderRadius: "8px",
                      color: "#fff", fontSize: "0.8rem", fontWeight: 600,
                      cursor: "pointer", boxShadow: "0 0 14px rgba(180,0,0,0.35)",
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(200,0,0,0.55)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(180,0,0,0.35)"}
                  >
                    ↺ Reload Preview
                  </button>
                </div>
              ) : (
                <iframe
                  key={previewKey}
                  src={previewUrl}
                  title="App Preview"
                  style={S.iframe}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onError={() => setPreviewError(true)}
                  onLoad={() => setPreviewError(false)}
                />
              )
            )}
          </>
        )}

        {panelView === "code" && (
          <>
            {!currentJobId ? (
              <div style={S.previewEmpty}>
                <p style={{ color: "#2a2a2a", fontSize: "0.82rem" }}>Build a project first to see its code.</p>
              </div>
            ) : (
              <CodeViewer jobId={currentJobId} title={projects.find(p => p.job_id === currentJobId)?.title || currentJobId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  layout:       { height: "100vh", width: "100vw", display: "flex", backgroundColor: "#000", color: "#eee", fontFamily: "Inter, Segoe UI, sans-serif", overflow: "hidden" },
  chatPanel:    { display: "flex", flexDirection: "column", borderRight: "1px solid #0f0f0f", overflow: "hidden", background: "#000" },
  previewPanel: { flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#050505", overflow: "hidden", minWidth: 0 },
  topBar:       { padding: "0.6rem 0.75rem", background: "#000", borderBottom: "1px solid #0f0f0f", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 1px 0 rgba(140,0,0,0.15)", flexShrink: 0 },
  previewTopBar:{ padding: "0.5rem 1rem", background: "#0a0a0a", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexShrink: 0 },
  chatWindow:   { flexGrow: 1, overflowY: "auto", overflowX: "hidden", padding: "1.2rem 1rem", display: "flex", flexDirection: "column", gap: "1rem", minHeight: 0 },
  bubble:       { padding: "10px 14px", borderRadius: "14px", maxWidth: "92%", wordBreak: "break-word" },
  inputRow:     { padding: "0.6rem", borderTop: "1px solid #111", display: "flex", gap: "8px", backgroundColor: "#000" },
  inputBox:     { flex: 1, backgroundColor: "#0d0d0d", color: "#fff", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "10px", fontSize: "0.87rem", resize: "none", fontFamily: "Inter, Segoe UI, sans-serif", outline: "none" },
  sendBtn:      { backgroundColor: "#8b0000", color: "#fff", border: "none", borderRadius: "10px", padding: "0 14px", fontSize: "1rem", cursor: "pointer" },
  iconBtn:      { backgroundColor: "transparent", border: "none", color: "#555", fontSize: "1rem", cursor: "pointer", padding: "4px 6px", flexShrink: 0, transition: "color 0.2s" },
  iframe:       { flex: 1, width: "100%", border: "none", backgroundColor: "#fff", minHeight: 0 },
  previewEmpty: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  emptyState:   { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" },
  errorBar:     { padding: "0.5rem 1rem", color: "#ff8080", backgroundColor: "#100505", fontSize: "0.82rem", display: "flex", alignItems: "center", borderTop: "1px solid #2a0000", flexShrink: 0 },
  pulse:        { display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#8b0000", animation: "pulse 1.2s infinite" },
  spinner:      { width: "28px", height: "28px", border: "3px solid #1a1a1a", borderTop: "3px solid #8b0000", borderRadius: "50%", animation: "spin 1s linear infinite" },
  closeBtn:     { backgroundColor: "#1a1a1a", border: "none", borderRadius: "50%", width: "24px", height: "24px", color: "#fff", fontSize: "1rem", cursor: "pointer" },
};