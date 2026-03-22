import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import { useRive } from "rive-react";
import API from "../api/api";
import NameModal from "../components/NameModal";
import ModelSelector from "../components/ModelSelector";

// ── Inject global styles ─────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin         { to{transform:rotate(360deg)} }
  @keyframes redPulse     { 0%,100%{filter:drop-shadow(0 0 3px rgba(130,25,25,0.92)) drop-shadow(0 0 7px rgba(110,20,20,0.65)) drop-shadow(0 0 14px rgba(90,15,15,0.3))} 50%{filter:drop-shadow(0 0 5px rgba(160,40,40,1)) drop-shadow(0 0 12px rgba(130,25,25,0.85)) drop-shadow(0 0 22px rgba(110,20,20,0.55))} }
  @keyframes buildingDot  { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }
  @keyframes fadeIn        { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer      { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes slideIn      { from{opacity:0;transform:translateY(-4px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes progressPulse { 0%{box-shadow:0 0 4px rgba(130,25,25,0.65)} 50%{box-shadow:0 0 12px rgba(130,25,25,0.92)} 100%{box-shadow:0 0 4px rgba(130,25,25,0.65)} }
  @keyframes nodeAppear   { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }



  :root {
    --font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace;
    --bg-0: #060608;
    --bg-1: #0a0a0d;
    --bg-2: #0e0e12;
    --bg-3: #14141a;
    --border-subtle: rgba(255,255,255,0.04);
    --border-default: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.12);
    --text-primary: #e8e8ec;
    --text-secondary: #8a8a96;
    --text-tertiary: #4a4a56;
    --text-muted: #2a2a34;
    --red-accent: #a02020;
    --red-glow: rgba(140,35,35,0.18);
    --red-subtle: rgba(140,35,35,0.1);
    --green-accent: #10b981;
    --green-subtle: rgba(16,185,129,0.08);
    --yellow-accent: #f59e0b;
  }
  html, body, #root { height: 100dvh; overflow: hidden; }
  @media screen and (max-width: 768px) {
    input, textarea, select { font-size: 16px !important; }
  }
  .studio-scroll::-webkit-scrollbar { width: 4px; }
  .studio-scroll::-webkit-scrollbar-track { background: transparent; }
  .studio-scroll::-webkit-scrollbar-thumb { background: var(--bg-3); border-radius: 4px; }
  .studio-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

  .msg-content { word-break: break-word; overflow-wrap: anywhere; min-width: 0; }
  .msg-content p  { margin: 0 0 0.5em; }
  .msg-content ul { margin: 0.4em 0; padding-left: 1.4em; }
  .msg-content li { margin-bottom: 0.25em; }
  .msg-content code {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border-subtle);
    border-radius: 4px;
    padding: 1px 5px;
    font-family: var(--font-mono);
    font-size: 0.82em;
    color: #ff9999;
  }
  .msg-content pre {
    background: var(--bg-0);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 12px;
    overflow-x: auto;
    margin: 0.5em 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .msg-content pre code {
    background: none; border: none; padding: 0; color: #c9d1d9;
  }

  .msg-row { animation: fadeIn 0.2s ease forwards; }
  .input-area:focus-within { border-color: rgba(140,35,35,0.45) !important; box-shadow: 0 0 0 1px rgba(140,35,35,0.18) !important; }


`;

function GlobalStyles() {
  useEffect(() => {
    const id = "studio-styles";
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = GLOBAL_STYLES;
    document.head.appendChild(tag);

    // Re-assert favicon to prevent iframe favicon leak
    const existingIcon = document.querySelector("link[rel='icon']");
    if (existingIcon) {
      existingIcon.href = "/favicon.ico?" + Date.now();
    }
  }, []);
  return null;
}

// ── Mobile detection ─────────────────────────────────────────────────────────
function useIsMobile() {
  const check = () => ({
    isMobilePortrait:  window.innerWidth <= 768 && window.innerHeight > window.innerWidth,
    isMobileLandscape: window.innerWidth <= 926 && window.innerHeight <= 500 && window.innerWidth > window.innerHeight,
    isMobile: window.innerWidth <= 768 || (window.innerWidth <= 926 && window.innerHeight <= 500),
  });
  const [state, setState] = useState(check);
  useEffect(() => {
    const handler = () => setState(check());
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => { window.removeEventListener("resize", handler); window.removeEventListener("orientationchange", handler); };
  }, []);
  return state;
}



// ── Bot avatar ───────────────────────────────────────────────────────────────
function BotAvatar({ size = 30 }) {
  const { RiveComponent, rive } = useRive({ src:"/hustler-robot11.riv", autoplay:true, stateMachines:["State Machine 1"] });
  const ref = useRef(null);

  const setMouseX = useCallback((val) => {
    if (!rive) return;
    try {
      const inputs = rive.stateMachineInputs("State Machine 1");
      const mx = inputs?.find(i => i.name === "mouseX");
      if (mx) mx.value = val;
    } catch {}
  }, [rive]);

  useEffect(() => { if (rive) { const t = setTimeout(() => setMouseX(0.5), 200); return () => clearTimeout(t); } }, [rive, setMouseX]);

  return (
    <div ref={ref}
      onMouseMove={e => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setMouseX(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))); }}
      onMouseLeave={() => setMouseX(0.5)}
      style={{ width:size,height:size,flexShrink:0,filter:"drop-shadow(0 0 3px rgba(140,35,35,0.92)) drop-shadow(0 0 8px rgba(140,35,35,0.55))",animation:"redPulse 2.4s ease-in-out infinite" }}>
      <div style={{ position:"absolute",inset:0,zIndex:1,background:"transparent" }} />
      <RiveComponent style={{ width:"100%",height:"100%",display:"block" }} />
    </div>
  );
}

function BotAvatarStatic({ size = 56 }) {
  const { RiveComponent } = useRive({ src:"/hustler-robot11.riv", autoplay:true, stateMachines:["State Machine 1"] });
  return <div style={{ width:size,height:size }}><RiveComponent style={{ width:"100%",height:"100%" }} /></div>;
}

// ── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:"3px",padding:"2px 0" }}>
      {[0,1,2].map(i => <span key={i} style={{ width:"5px",height:"5px",borderRadius:"50%",background:"var(--red-accent)",display:"inline-block",animation:`buildingDot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
    </div>
  );
}

// ── Title generation ─────────────────────────────────────────────────────────
const generateTitle = async (prompt) => {
  try { const res = await API.post("/auth/job/title", { prompt }); return res.data.title || prompt.slice(0,40); }
  catch { return prompt.slice(0,40); }
};

// ── API helpers ──────────────────────────────────────────────────────────────
const generateProject = async (prompt, title, model, files = []) => {
  if (files.length > 0) {
    const fd = new FormData(); fd.append("prompt",prompt); fd.append("title",title); fd.append("model",model);
    files.forEach(f => fd.append("files",f));
    const res = await API.post("/auth/generate", fd, { headers:{"Content-Type":"multipart/form-data"} });
    return res.data.job_id;
  }
  const res = await API.post("/auth/generate", { prompt, title, model });
  return res.data.job_id;
};
const sendFollowUp = async (jobId, message, model, files = []) => {
  if (files.length > 0) {
    const fd = new FormData(); fd.append("message",message); if (model) fd.append("model",model);
    files.forEach(f => fd.append("files",f));
    await API.post(`/auth/job/${jobId}/message`, fd, { headers:{"Content-Type":"multipart/form-data"} });
    return;
  }
  await API.post(`/auth/job/${jobId}/message`, { message, model });
};
const getJobStatus = async (jobId) => { const res = await API.get(`/auth/job/${jobId}/status`); return res.data; };
const getCredits = async () => { const res = await API.get("/auth/credits"); return res.data; };
const fetchProjects = async () => { const res = await API.get("/auth/jobs"); return res.data.jobs || []; };
const fetchJobFiles = async (jobId) => { const res = await API.get(`/auth/job/${jobId}/files`); return res.data.files || []; };

// ── Backend API helpers ───────────────────────────────────────────────────────
// enableBackend now just fires the kick-off call and returns immediately (202).
// The caller is responsible for polling getBackendStatus until done.
const enableBackend  = async (jobId) => { const res = await API.post(`/supabase/job/${jobId}/enable-backend`); return res.data; };
const getBackendStatus = async (jobId) => { const res = await API.get(`/supabase/job/${jobId}/backend-status`); return res.data; };

const enableStripe = async (jobId, publishableKey, secretKey) => {
  const res = await API.post(`/stripe/job/${jobId}/enable-stripe`, {
    publishable_key: publishableKey,
    secret_key: secretKey,
  });
  return res.data;
};
const getStripeStatus = async (jobId) => {
  const res = await API.get(`/stripe/job/${jobId}/stripe-status`);
  return res.data;
};
const downloadProjectZip = async (jobId, title) => {
  const res = await API.get(`/auth/job/${jobId}/download`, { responseType:"blob" });
  const url = URL.createObjectURL(new Blob([res.data], { type:"application/zip" }));
  const a = document.createElement("a"); a.href = url; a.download = `${(title||jobId).replace(/\s+/g,"-")}.zip`; a.click();
  URL.revokeObjectURL(url);
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const LANG_MAP = { js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",css:"css",html:"html",json:"json",md:"markdown",py:"python",sh:"bash",txt:"plaintext" };
const getLang = p => LANG_MAP[p.split(".").pop().toLowerCase()] || "plaintext";
const getFileIcon = p => { const ext = p.split(".").pop().toLowerCase(); const m = { jsx:"R",tsx:"R",js:"J",ts:"T",css:"S",html:"H",json:"{",md:"M",svg:"V" }; return m[ext] || "F"; };

// ── Long input threshold ─────────────────────────────────────────────────────
const LONG_INPUT_THRESHOLD = 500;

// ── Syntax highlighting ──────────────────────────────────────────────────────
let hljsReady = false; let hljsCallbacks = [];
function loadHljs(cb) {
  if (hljsReady) { cb(); return; } hljsCallbacks.push(cb);
  if (document.getElementById("hljs-css")) return;
  const link = document.createElement("link"); link.id = "hljs-css"; link.rel = "stylesheet";
  link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"; document.head.appendChild(link);
  const script = document.createElement("script"); script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
  script.onload = () => { hljsReady = true; hljsCallbacks.forEach(fn => fn()); hljsCallbacks = []; }; document.head.appendChild(script);
}

function HighlightedCode({ code, lang }) {
  const ref = useRef(null);
  useEffect(() => { loadHljs(() => { if (ref.current && window.hljs) { ref.current.removeAttribute("data-highlighted"); ref.current.textContent = code; ref.current.className = `language-${lang}`; window.hljs.highlightElement(ref.current); } }); }, [code, lang]);
  return (
    <pre style={{ margin:0,padding:"1rem 1.2rem",fontSize:"0.78rem",lineHeight:1.7,fontFamily:"var(--font-mono)",background:"var(--bg-0)",whiteSpace:"pre",overflowX:"visible" }}>
      <code ref={ref} className={`language-${lang}`}>{code}</code>
    </pre>
  );
}

// ── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, label = "Copy", size = "sm" }) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => { setCopied(false); copyTimerRef.current = null; }, 2000);
  };
  return (
    <button onClick={handleCopy} style={{
      background: copied ? "rgba(16,185,129,0.1)" : "transparent",
      border: "none",
      color: copied ? "var(--green-accent)" : "var(--text-secondary)",
      borderRadius:"4px", padding:"2px 6px",
      fontSize:"0.6rem", cursor:"pointer", transition:"all 0.15s",
      fontFamily:"var(--font-mono)", opacity: copied ? 1 : 0.75,
    }}
      onMouseEnter={e=>{if(!copied)e.currentTarget.style.opacity="1";e.currentTarget.style.color="var(--text-secondary)";}}
      onMouseLeave={e=>{if(!copied){e.currentTarget.style.opacity="0.5";e.currentTarget.style.color="var(--text-muted)";}}}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

// ── Code Viewer ──────────────────────────────────────────────────────────────
function CodeViewer({ jobId, title }) {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treeOpen, setTreeOpen] = useState(true);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => { if (!jobId) return; setLoading(true); fetchJobFiles(jobId).then(f => { setFiles(f); if (f.length>0) setSelected(f[0].path); }).catch(()=>{}).finally(()=>setLoading(false)); }, [jobId]);

  const selectedFile = files.find(f => f.path === selected);

  const handleDownloadZip = async () => { setZipLoading(true); try { await downloadProjectZip(jobId,title); } catch {} finally { setZipLoading(false); } };

  const tree = useMemo(() => {
    const t = {};
    files.forEach(f => { const parts = f.path.split("/"); let node = t; parts.forEach((part,i) => { if (!node[part]) node[part] = i===parts.length-1 ? null : {}; node = node[part] || {}; }); });
    return t;
  }, [files]);

  const renderTree = (node, prefix = "") => Object.entries(node).map(([name, children]) => {
    const fullPath = prefix ? `${prefix}/${name}` : name;
    const isFile = children === null;
    const isActive = selected === fullPath;
    if (isFile) return (
      <div key={fullPath} onClick={() => setSelected(fullPath)} style={{
        padding:"3px 8px 3px 12px", fontSize:"0.73rem", cursor:"pointer", borderRadius:"4px",
        color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
        background: isActive ? "var(--red-subtle)" : "transparent",
        borderLeft: isActive ? "2px solid var(--red-accent)" : "2px solid transparent",
        display:"flex", alignItems:"center", gap:"6px", transition:"all 0.1s",
        fontFamily:"var(--font-mono)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
      }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color="var(--text-secondary)"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color="var(--text-tertiary)"; }}
      >
        <span style={{ fontSize:"0.6rem",color: isActive ? "var(--red-accent)" : "var(--text-muted)",fontWeight:600,width:"12px",textAlign:"center" }}>{getFileIcon(name)}</span>
        {name}
      </div>
    );
    return <FolderNode key={fullPath} name={name} fullPath={fullPath} children={children} renderTree={renderTree} />;
  });

  if (loading) return (
    <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",height:"100%" }}>
      <Spinner />
      <span style={{ color:"var(--text-tertiary)",fontSize:"0.8rem" }}>Loading files...</span>
    </div>
  );
  if (files.length === 0) return <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",height:"100%" }}><span style={{ color:"var(--text-muted)",fontSize:"0.8rem" }}>No source files yet.</span></div>;

  return (
    <div style={{ flex:1,display:"flex",overflow:"hidden",height:"100%" }}>
      <div style={{ width:treeOpen?"200px":"36px",flexShrink:0,borderRight:`1px solid var(--border-subtle)`,background:"var(--bg-1)",display:"flex",flexDirection:"column",overflow:"hidden",transition:"width 0.2s" }}>
        <div style={{ padding:"6px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid var(--border-subtle)`,flexShrink:0 }}>
          {treeOpen && <span style={{ fontSize:"0.6rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>Files</span>}
          <button onClick={() => setTreeOpen(o=>!o)} style={{ background:"none",border:"none",color:"var(--text-tertiary)",cursor:"pointer",fontSize:"0.7rem",padding:"2px 4px",marginLeft:"auto",fontFamily:"var(--font-mono)" }}>{treeOpen ? "◀" : "▶"}</button>
        </div>
        {treeOpen && <div className="studio-scroll" style={{ flex:1,overflowY:"auto",overflowX:"hidden",padding:"4px" }}>{renderTree(tree)}</div>}
      </div>
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0 }}>
        <div style={{ padding:"6px 12px",borderBottom:`1px solid var(--border-subtle)`,background:"var(--bg-1)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <span style={{ fontSize:"0.72rem",color:"var(--text-tertiary)",fontFamily:"var(--font-mono)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{selectedFile ? selectedFile.path : ""}</span>
          <div style={{ display:"flex",gap:"6px",flexShrink:0 }}>
            {selectedFile && <CopyButton text={selectedFile.content} label="Copy" />}
            <button onClick={handleDownloadZip} disabled={zipLoading} style={{
              background:"linear-gradient(135deg,#a02020,#701818)",
              border:"1px solid rgba(160,32,32,0.5)",
              color:"#fff",
              borderRadius:"6px",padding:"3px 12px",fontSize:"0.7rem",
              cursor:zipLoading?"wait":"pointer",fontWeight:600,
              fontFamily:"var(--font-mono)",opacity:zipLoading?0.6:1,
              transition:"all 0.15s",
              boxShadow:"0 0 10px rgba(140,30,30,0.4)",
            }}
              onMouseEnter={e=>{ if(!zipLoading){ e.currentTarget.style.boxShadow="0 0 18px rgba(180,40,40,0.7)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 0 10px rgba(140,30,30,0.4)"; e.currentTarget.style.transform="translateY(0)"; }}
            >{zipLoading ? "Zipping..." : "Download ZIP"}</button>
          </div>
        </div>
        <div className="studio-scroll" style={{ flex:1,overflowY:"auto",overflowX:"auto",minHeight:0 }}>
          {selectedFile && <HighlightedCode code={selectedFile.content} lang={getLang(selectedFile.path)} />}
        </div>
      </div>
    </div>
  );
}

function FolderNode({ name, children, fullPath, renderTree }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div onClick={() => setOpen(o=>!o)} style={{ padding:"3px 8px 3px 12px",fontSize:"0.73rem",cursor:"pointer",color:"var(--text-tertiary)",display:"flex",alignItems:"center",gap:"5px",userSelect:"none",fontFamily:"var(--font-mono)" }}
        onMouseEnter={e=>e.currentTarget.style.color="var(--text-secondary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-tertiary)"}>
        <span style={{ fontSize:"0.6rem" }}>{open ? "▾" : "▸"}</span>{name}
      </div>
      {open && <div style={{ paddingLeft:"10px" }}>{renderTree(children,fullPath)}</div>}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 20, color = "var(--red-accent)" }) {
  return <div style={{ width:size,height:size,border:`2px solid var(--bg-3)`,borderTop:`2px solid ${color}`,borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />;
}

// ── Progress computation ─────────────────────────────────────────────────────
function computeProgress(progress, buildPhase) {
  if (buildPhase === "rendering") return 100;
  if (buildPhase === "compiling") return 85;
  if (buildPhase === "building" || buildPhase === "editing") {
    const fw = progress.reduce((max, p) => Math.max(max, p.files_written || 0), 0);
    return Math.round(25 + Math.min(1, fw / Math.max(8, fw + 2)) * 50);
  }
  if (buildPhase === "thinking") return Math.max(5, Math.min(25, progress.filter(p => p.action === "planning" || p.action === "thinking").length * 5));
  return 0;
}

// ── Build View — Step timeline + minimap ──────────────────────────────────────
function BuildView({ progress, buildPhase, progressPercent }) {
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [progress]);

  const phases = useMemo(() => {
    const p = [];
    let currentPhase = null;
    for (const entry of progress) {
      const phase = entry.action === "thinking" || entry.action === "planning" ? "Planning" :
                    entry.action === "writing" || entry.action === "editing" ? "Building" :
                    entry.action === "installing" ? "Installing" :
                    entry.action === "building" ? "Compiling" :
                    entry.action === "generating image" || entry.action === "editing image" ? "Assets" :
                    entry.action === "requesting backend" ? "Backend" :
                    entry.action === "requesting stripe" ? "Payments" :
                    entry.action === "requesting ai" ? "AI Setup" :
                    entry.action === "scanning" || entry.action === "reading" || entry.action === "searching" ? "Analyzing" : "Processing";
      if (!currentPhase || currentPhase.name !== phase) {
        currentPhase = { name: phase, entries: [] };
        p.push(currentPhase);
      }
      currentPhase.entries.push(entry);
    }
    return p;
  }, [progress]);

  const filesCreated = useMemo(() => {
    const files = new Set();
    progress.forEach(p => { if (p.file && (p.action === "writing" || p.action === "editing")) files.add(p.file); });
    return Array.from(files);
  }, [progress]);

  const latestDetail = progress.length > 0 ? progress[progress.length - 1]?.detail : "Initializing...";

  return (
    <div style={{ flex:1,display:"flex",overflow:"hidden",background:"var(--bg-0)" }}>
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <div style={{ flexShrink:0,padding:"12px 16px",background:"var(--bg-1)",borderBottom:`1px solid var(--border-subtle)`,display:"flex",alignItems:"center",gap:"12px" }}>
          <div style={{ position:"relative",width:"32px",height:"32px",flexShrink:0 }}>
            <svg width="32" height="32" viewBox="0 0 36 36" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-3)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--red-accent)" strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressPercent / 100)}`}
                strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
            </svg>
            <span style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.55rem",fontWeight:700,color:"var(--text-primary)",fontFamily:"var(--font-mono)" }}>{progressPercent}%</span>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:"0.72rem",color:"var(--text-primary)",fontWeight:600,fontFamily:"var(--font-mono)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%" }} title={latestDetail}>{latestDetail}</div>
 
            <div style={{ fontSize:"0.62rem",color:"var(--text-tertiary)",marginTop:"2px",fontFamily:"var(--font-mono)" }}>
              {filesCreated.length} file{filesCreated.length !== 1 ? "s" : ""} written
            </div>
          </div>
          <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:"var(--red-accent)",boxShadow:"0 0 8px rgba(140,35,35,0.85)",animation:"pulse 1.5s infinite",flexShrink:0 }} />
          <span style={{ fontSize:"0.55rem",color:"var(--text-muted)",letterSpacing:"0.12em",fontFamily:"var(--font-mono)" }}>LIVE</span>
        </div>

        <div ref={scrollRef} className="studio-scroll" style={{ flex:1,overflowY:"auto",padding:"16px 20px" }}>
          {phases.length === 0 && (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"16px" }}>
              <Spinner size={28} />
              <span style={{ color:"var(--text-tertiary)",fontSize:"0.8rem",fontFamily:"var(--font-mono)" }}>Preparing your app...</span>
            </div>
          )}
          {phases.map((phase, pi) => (
            <div key={pi} style={{ marginBottom:"16px",animation:"fadeIn 0.2s ease forwards" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px" }}>
                <div style={{
                  width:"20px",height:"20px",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  background: pi === phases.length - 1 ? "var(--red-subtle)" : "var(--bg-3)",
                  border: `1px solid ${pi === phases.length - 1 ? "rgba(140,35,35,0.35)" : "var(--border-subtle)"}`,
                }}>
                  {pi === phases.length - 1
                    ? <div style={{ width:"5px",height:"5px",borderRadius:"50%",background:"var(--red-accent)",animation:"pulse 1.2s infinite" }} />
                    : <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 8L7 11L12 5" stroke="var(--green-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </div>
                <span style={{ fontSize:"0.68rem",fontWeight:700,color: pi === phases.length - 1 ? "var(--text-primary)" : "var(--text-secondary)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em",textTransform:"uppercase" }}>{phase.name}</span>
                <span style={{ fontSize:"0.58rem",color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{phase.entries.length} step{phase.entries.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ marginLeft:"10px",borderLeft:`1px solid ${pi === phases.length - 1 ? "rgba(140,35,35,0.25)" : "var(--border-subtle)"}`,paddingLeft:"16px" }}>
                {phase.entries.slice(-6).map((entry, ei) => (
                  <div key={ei} style={{ fontSize:"0.68rem",color:"var(--text-tertiary)",padding:"2px 0",fontFamily:"var(--font-mono)",wordBreak:"break-word",whiteSpace:"normal",lineHeight:1.4 }}>
                    {entry.file && <span style={{ color:"var(--red-accent)",marginRight:"6px" }}>{entry.file.split("/").pop()}</span>}
                    <span>{entry.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flexShrink:0,padding:"8px 16px 10px",background:"var(--bg-1)",borderTop:`1px solid var(--border-subtle)` }}>
          <div style={{ height:"2px",background:"var(--bg-3)",borderRadius:"2px",overflow:"hidden" }}>
            <div style={{
              height:"100%",width:`${progressPercent}%`,
              background:"linear-gradient(90deg,var(--red-accent),#c03030)",
              borderRadius:"2px",
              transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: progressPercent > 0 ? "0 0 8px rgba(140,35,35,0.65)" : "none",
            }} />
          </div>
        </div>
      </div>

      <div style={{ width:"160px",flexShrink:0,borderLeft:`1px solid var(--border-subtle)`,background:"var(--bg-1)",display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <div style={{ padding:"8px 10px",borderBottom:`1px solid var(--border-subtle)` }}>
          <span style={{ fontSize:"0.55rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>File Map</span>
        </div>
        <div className="studio-scroll" style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {filesCreated.length === 0 && <span style={{ fontSize:"0.62rem",color:"var(--text-muted)",fontFamily:"var(--font-mono)",padding:"4px" }}>Waiting...</span>}
          {filesCreated.map((file, i) => {
            const isLatest = i === filesCreated.length - 1;
            return (
              <div key={file} style={{
                display:"flex",alignItems:"center",gap:"5px",padding:"3px 4px",borderRadius:"4px",
                animation:"nodeAppear 0.2s ease forwards",
                background: isLatest ? "var(--red-subtle)" : "transparent",
              }}>
                <div style={{
                  width:"4px",height:"4px",borderRadius:"50%",flexShrink:0,
                  background: isLatest ? "var(--red-accent)" : "var(--green-accent)",
                  boxShadow: isLatest ? "0 0 6px rgba(140,35,35,0.85)" : "none",
                }} />
                <span style={{ fontSize:"0.58rem",color: isLatest ? "var(--text-primary)" : "var(--text-tertiary)",fontFamily:"var(--font-mono)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {file.split("/").pop()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Thinking line ────────────────────────────────────────────────────────────
function ThinkingLine({ text }) {
  const [expanded, setExpanded] = useState(false);
  const cleaned = text.replace(/^(plan|planning|task list|aesthetic direction)[:\s]*/i,"").replace(/^[-\u2500\u2550—]+\s*/gm,"").replace(/^\[.?\]\s*/gm,"").replace(/\n+/g," ").trim();
  if (!cleaned || cleaned.length < 5) return null;
  const short = cleaned.length > 160 ? cleaned.slice(0,160)+"..." : cleaned;
  return (
    <div onClick={() => setExpanded(e=>!e)} style={{
      marginTop:"6px",cursor:"pointer",padding:"4px 8px",borderRadius:"6px",
      background: expanded ? "rgba(140,35,35,0.08)" : "rgba(140,35,35,0.04)",
      border:"1px solid rgba(140,35,35,0.12)",transition:"all 0.15s"
    }}>
      <p style={{ fontSize:"0.65rem",color: expanded ? "var(--text-secondary)" : "var(--text-tertiary)",lineHeight:1.5,margin:0,fontStyle:"italic",fontFamily:"var(--font-mono)" }}>
        <span style={{ color:"var(--red-accent)",marginRight:"4px",fontSize:"0.55rem" }}>{expanded ? "▾" : "▸"}</span>
        <span style={{ color:"var(--text-muted)",fontStyle:"normal",marginRight:"4px",fontSize:"0.58rem",letterSpacing:"0.04em" }}>reasoning:</span>
        {expanded ? cleaned : short}
      </p>
    </div>
  );
}

// ── Backend approval — INLINE in chat ────────────────────────────────────────
function BackendApprovalCard({ onAllow, onDeny, isLoading }) {
  return (
    <div style={{ animation:"fadeIn 0.2s ease forwards",maxWidth:"360px" }}>
      <div style={{
        padding:"16px",borderRadius:"12px",
        background:"var(--bg-2)",border:"1px solid rgba(16,185,129,0.15)",
      }}>
        {isLoading ? (
          <div style={{ textAlign:"center",padding:"8px 0" }}>
            <Spinner size={24} color="var(--green-accent)" />
            <p style={{ fontSize:"0.78rem",fontWeight:600,color:"var(--green-accent)",marginTop:"12px",fontFamily:"var(--font-mono)" }}>Setting up backend...</p>
            <p style={{ fontSize:"0.65rem",color:"var(--text-tertiary)",marginTop:"4px",lineHeight:1.5 }}>Provisioning database, auth, and security. This usually takes 60–90 seconds.</p>
          </div>
        ) : (
          <>
            <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px" }}>
              <div style={{ width:"28px",height:"28px",borderRadius:"8px",background:"var(--green-subtle)",border:"1px solid rgba(16,185,129,0.2)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" stroke="var(--green-accent)" strokeWidth="1.5"/><path d="M2 4l6 4 6-4" stroke="var(--green-accent)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize:"0.78rem",fontWeight:700,color:"var(--text-primary)",fontFamily:"var(--font-mono)" }}>Enable Backend</div>
                <div style={{ fontSize:"0.62rem",color:"var(--text-tertiary)" }}>Database + Auth required</div>
              </div>
            </div>
            <p style={{ fontSize:"0.72rem",color:"var(--text-secondary)",lineHeight:1.5,margin:"0 0 12px" }}>
              Your app needs a database and authentication. This will set up PostgreSQL, Auth, and Row-Level Security.
            </p>
            <div style={{ display:"flex",gap:"8px" }}>
              <button onClick={onDeny} style={{
                flex:1,padding:"8px",background:"var(--bg-3)",border:`1px solid var(--border-default)`,borderRadius:"8px",
                color:"var(--text-secondary)",fontSize:"0.75rem",cursor:"pointer",fontFamily:"var(--font-sans)",transition:"all 0.15s"
              }}>Skip</button>
              <button onClick={onAllow} style={{
                flex:1,padding:"8px",
                background:"linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.15))",
                border:"1px solid rgba(16,185,129,0.3)",borderRadius:"8px",
                color:"var(--green-accent)",fontSize:"0.75rem",fontWeight:700,
                cursor:"pointer",fontFamily:"var(--font-mono)",transition:"all 0.15s"
              }}>Allow</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Stripe approval — INLINE in chat ─────────────────────────────────────────
function StripeApprovalCard({ onSubmit, onDeny, isLoading }) {
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!pubKey.startsWith("pk_")) { setErr("Publishable key must start with pk_"); return; }
    if (!secKey.startsWith("sk_")) { setErr("Secret key must start with sk_"); return; }
    setErr("");
    onSubmit(pubKey.trim(), secKey.trim());
  };

  return (
    <div style={{ animation:"fadeIn 0.2s ease forwards", maxWidth:"360px" }}>
      <div style={{
        padding:"16px", borderRadius:"12px",
        background:"var(--bg-2)", border:"1px solid rgba(99,102,241,0.2)",
      }}>
        {isLoading ? (
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <Spinner size={24} color="#6366f1" />
            <p style={{ fontSize:"0.78rem", fontWeight:600, color:"#6366f1", marginTop:"12px", fontFamily:"var(--font-mono)" }}>
              Activating Stripe...
            </p>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#6366f1" strokeWidth="1.5"/>
                  <path d="M2 10h20" stroke="#6366f1" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--text-primary)", fontFamily:"var(--font-mono)" }}>Enable Stripe Payments</div>
                <div style={{ fontSize:"0.62rem", color:"var(--text-tertiary)" }}>Your keys stay server-side</div>
              </div>
            </div>
            <p style={{ fontSize:"0.72rem", color:"var(--text-secondary)", lineHeight:1.5, margin:"0 0 10px" }}>
              Your app needs payment processing. Enter your Stripe API keys — they're stored securely and never exposed in your app's code.
            </p>
            <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer"
              style={{ fontSize:"0.65rem", color:"#6366f1", display:"block", marginBottom:"10px", textDecoration:"none", opacity:0.8 }}>
              → Get keys from Stripe Dashboard
            </a>
            {err && <p style={{ fontSize:"0.65rem", color:"var(--red-accent)", marginBottom:"6px", margin:"0 0 6px" }}>{err}</p>}
            <input
              type="text" placeholder="pk_test_... or pk_live_..."
              value={pubKey} onChange={e => setPubKey(e.target.value)}
              style={{ width:"100%", background:"var(--bg-0)", border:`1px solid var(--border-subtle)`, borderRadius:"6px", padding:"7px 10px", color:"var(--text-primary)", fontSize:"0.72rem", fontFamily:"var(--font-mono)", outline:"none", marginBottom:"6px", boxSizing:"border-box" }}
            />
            <input
              type="password" placeholder="sk_test_... or sk_live_..."
              value={secKey} onChange={e => setSecKey(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              style={{ width:"100%", background:"var(--bg-0)", border:`1px solid var(--border-subtle)`, borderRadius:"6px", padding:"7px 10px", color:"var(--text-primary)", fontSize:"0.72rem", fontFamily:"var(--font-mono)", outline:"none", marginBottom:"10px", boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onDeny} style={{
                flex:1, padding:"8px", background:"var(--bg-3)", border:`1px solid var(--border-default)`,
                borderRadius:"8px", color:"var(--text-secondary)", fontSize:"0.75rem", cursor:"pointer", fontFamily:"var(--font-sans)"
              }}>Skip</button>
              <button onClick={handleSubmit} style={{
                flex:1, padding:"8px",
                background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(79,70,229,0.15))",
                border:"1px solid rgba(99,102,241,0.3)", borderRadius:"8px",
                color:"#6366f1", fontSize:"0.75rem", fontWeight:700,
                cursor:"pointer", fontFamily:"var(--font-mono)"
              }}>Activate</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Credits badge ────────────────────────────────────────────────────────────
function CreditsBadge({ balance, planLimit, onUpgrade }) {
  const max = Math.max(planLimit || 800, balance, 800);
  const pct = Math.max(0, Math.min(100, (balance / max) * 100));
  const isLow = pct <= 10;
  return (
    <div style={{ padding:"10px",background:"#000000",borderRadius:"8px",border:`1px solid ${isLow ? "rgba(140,35,35,0.4)" : "rgba(255,255,255,0.12)"}`,marginBottom:"12px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px" }}>
        <span style={{ fontSize:"0.65rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"var(--font-mono)" }}>Credits</span>
        <span style={{ fontSize:"0.85rem",fontWeight:700,color: isLow ? "var(--red-accent)" : "var(--text-primary)",fontFamily:"var(--font-mono)" }}>{typeof balance === "number" ? balance.toFixed(2) : balance}</span>
      </div>
      <div style={{ height:"3px",background:"var(--bg-3)",borderRadius:"2px",overflow:"hidden",marginBottom:"8px" }}>
        <div style={{ height:"100%",width:`${pct}%`,background: isLow ? "var(--red-accent)" : pct <= 30 ? "var(--yellow-accent)" : "var(--green-accent)",borderRadius:"2px",transition:"width 0.4s ease" }} />
      </div>
      <button onClick={onUpgrade}
        onMouseEnter={e=>{ e.currentTarget.style.background="#e8e8e8"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="#ffffff"; }}
        style={{
          width:"100%",padding:"8px",
          background:"#ffffff",
          border:"none",
          borderRadius:"6px",
          color:"#0a0a0a",
          fontSize:"0.72rem",fontWeight:700,
          cursor:"pointer",fontFamily:"var(--font-sans)",transition:"background 0.15s",
          letterSpacing:"0.04em",
        }}>Upgrade</button>
    </div>
  );
}

// ── Cost tooltip ─────────────────────────────────────────────────────────────
function CostDots({ credits }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (!open) return; const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); }, [open]);
  const display = credits != null ? (typeof credits === "number" ? credits.toFixed(2) : credits) : "—";
  return (
    <div ref={ref} style={{ position:"relative",display:"inline-block" }}>
      <button onClick={() => setOpen(o=>!o)} style={{
        background:"none",border:"none",cursor:"pointer",
        color: open ? "var(--red-accent)" : "var(--text-muted)",
        fontSize:"0.85rem",padding:"0 2px",letterSpacing:"2px",lineHeight:1,
        transition:"color 0.15s",fontFamily:"var(--font-mono)",
      }}
        onMouseEnter={e=>e.currentTarget.style.color="var(--text-secondary)"}
        onMouseLeave={e=>{if(!open)e.currentTarget.style.color="var(--text-muted)"}}
      >···</button>
      {open && (
        <div style={{
          position:"absolute",bottom:"calc(100% + 4px)",right:0,
          background:"var(--bg-3)",border:`1px solid var(--border-default)`,
          borderRadius:"8px",padding:"6px 12px",whiteSpace:"nowrap",zIndex:300,
          boxShadow:"0 4px 20px rgba(0,0,0,0.6)",fontSize:"0.72rem",
          animation:"slideIn 0.12s ease",
        }}>
          <span style={{ color:"var(--text-tertiary)" }}>Credits: </span>
          <span style={{ color:"var(--yellow-accent)",fontWeight:700,fontFamily:"var(--font-mono)" }}>{display}</span>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, userEmail, credits, planLimit, projects, currentJobId, onNewProject, onLoadProject, onLogout, onUpgrade, onHome }) {
  const ref = useRef(null);
  useEffect(() => { if (!open) return; const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); }, [open, onClose]);

  const btnStyle = { width:"100%",padding:"8px 10px",borderRadius:"6px",border:`1px solid rgba(255,255,255,0.1)`,background:"#000000",color:"var(--text-secondary)",fontSize:"0.78rem",cursor:"pointer",textAlign:"left",fontFamily:"var(--font-sans)",transition:"all 0.12s",marginBottom:"4px" };

  return (
    <>
      {open && <div style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(3px)" }} />}
      <div ref={ref} style={{
        position:"fixed",top:0,left:0,bottom:0,width:"260px",zIndex:500,background:"#000000",borderRight:`1px solid var(--border-subtle)`,
        transform:open?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        display:"flex",flexDirection:"column",padding:"16px 12px",overflowY:"auto",
        scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.1) transparent"
      }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px" }}>
          <span style={{ fontSize:"0.88rem",fontWeight:700,color:"var(--text-primary)",fontFamily:"var(--font-sans)" }}>Studio</span>
          <button onClick={onClose} style={{ background:"var(--bg-3)",border:"none",borderRadius:"50%",width:"24px",height:"24px",color:"var(--text-secondary)",fontSize:"0.85rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>
        <p style={{ fontSize:"0.7rem",color:"var(--text-muted)",marginBottom:"12px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--font-mono)" }}>{userEmail}</p>
        {credits !== null && <CreditsBadge balance={credits} planLimit={planLimit} onUpgrade={() => { onUpgrade(); onClose(); }} />}
        <button onClick={() => { onHome(); onClose(); }} style={btnStyle}>Home</button>
        <button onClick={() => { onNewProject(); onClose(); }} style={btnStyle}>+ New Project</button>
        <button onClick={() => { onLogout(); onClose(); }} style={btnStyle}>Logout</button>
        <div style={{ fontSize:"0.58rem",color:"var(--text-muted)",margin:"16px 0 6px",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)" }}>Projects</div>
        {projects.length === 0 && <p style={{ color:"var(--text-muted)",fontSize:"0.72rem" }}>No projects yet.</p>}
        {projects.map(p => (
          <div key={p.job_id} onClick={() => { onLoadProject(p); onClose(); }} style={{
            padding:"8px",borderRadius:"6px",border:`1px solid ${currentJobId===p.job_id ? "rgba(140,35,35,0.35)" : "rgba(255,255,255,0.1)"}`,
            background: currentJobId===p.job_id ? "var(--red-subtle)" : "#000000",cursor:"pointer",marginBottom:"3px",transition:"all 0.12s"
          }}>
            <span style={{ fontSize:"0.78rem",color:"var(--text-primary)",display:"block" }}>{p.title || "Untitled"}</span>
            <span style={{ fontSize:"0.6rem",color: p.state==="completed" ? "var(--green-accent)" : p.state==="running" ? "var(--yellow-accent)" : "var(--text-muted)",fontFamily:"var(--font-mono)" }}>
              {p.state==="running"?"Building...":p.state==="completed"?"Ready":p.state==="failed"?"Failed":""}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Confirm modals ───────────────────────────────────────────────────────────
function ConfirmModal({ open, title, description, warning, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"var(--bg-2)",border:`1px solid var(--border-default)`,borderRadius:"14px",padding:"24px 28px",maxWidth:"360px",width:"90%",boxShadow:"0 0 40px rgba(0,0,0,0.7)",textAlign:"center",animation:"slideIn 0.15s ease" }}>
        <h3 style={{ margin:"0 0 8px",fontSize:"1rem",color:"var(--text-primary)",fontWeight:700,fontFamily:"var(--font-sans)" }}>{title}</h3>
        <p style={{ margin:"0 0 8px",fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.5 }}>{description}</p>
        {warning && <p style={{ margin:"0 0 16px",fontSize:"0.72rem",color:"var(--yellow-accent)",lineHeight:1.5 }}>{warning}</p>}
        <div style={{ display:"flex",gap:"8px" }}>
          <button onClick={onCancel} style={{ flex:1,padding:"9px",background:"var(--bg-3)",border:`1px solid var(--border-default)`,borderRadius:"8px",color:"var(--text-secondary)",fontSize:"0.82rem",cursor:"pointer",fontFamily:"var(--font-sans)" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1,padding:"9px",background:"linear-gradient(135deg,var(--red-accent),#701818)",border:"none",borderRadius:"8px",color:"#fff",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",fontFamily:"var(--font-sans)" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Publish Popover ──────────────────────────────────────────────────────────
function PublishPopover({ jobId, previewUrl, publishedUrl, hasChanges, isRunning, onPublishSuccess }) {
  const [open, setOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("main");
  const [propagating, setPropagating] = useState(false);
  const [propagateSeconds, setPropagateSeconds] = useState(0);
  const propagateRef = useRef(null);
  const ref = useRef(null);

  const isPublished = !!publishedUrl;
  const currentDomain = publishedUrl?.replace("https://","").replace(/\/$/,"");
  const cannotOpen = isRunning || !previewUrl;

  useEffect(() => { if (!open) return; const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h); }, [open]);
  useEffect(() => { if (!open) setTimeout(() => { setView("main"); setNewName(""); setNameError(""); setError(""); }, 200); }, [open]);
  useEffect(() => { return () => { if (propagateRef.current) clearInterval(propagateRef.current); }; }, []);

  const startPropagationTimer = () => {
    setPropagating(true);
    setPropagateSeconds(300);
    if (propagateRef.current) clearInterval(propagateRef.current);
    propagateRef.current = setInterval(() => {
      setPropagateSeconds(s => {
        if (s <= 1) { clearInterval(propagateRef.current); setPropagating(false); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => { const m = Math.floor(s/60); const sec = s%60; return `${m}:${String(sec).padStart(2,"0")}`; };

  const validate = v => { if (!v||v.length<3) return "Min 3 chars"; if (v.length>40) return "Max 40 chars"; if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(v)&&v.length>2) return "Lowercase, numbers, hyphens"; return ""; };

  const handleAction = async (isUpdate) => {
    if (!jobId||publishing) return;
    if (!isUpdate) { const err = validate(newName); if (err) { setNameError(err); return; } }
    setPublishing(true); setError("");
    try {
      const body = isUpdate ? { update_only:true } : { name:newName };
      const res = await API.post(`/deploy/${jobId}`, body);
      onPublishSuccess(res.data.url, !isUpdate);
      if (!isUpdate) startPropagationTimer();
      setOpen(false);
    } catch (err) { setError(err?.response?.data?.error || "Failed. Try again."); }
    finally { setPublishing(false); }
  };

  return (
    <div ref={ref} style={{ position:"relative",flexShrink:0 }}>
      <button onClick={() => { if (!cannotOpen) setOpen(o=>!o); }} disabled={cannotOpen} style={{
        display:"flex",alignItems:"center",gap:"5px",padding:"5px 12px",height:"28px",borderRadius:"8px",
        border: isPublished ? "1px solid rgba(16,185,129,0.3)" : `1px solid var(--border-subtle)`,
        background: isPublished ? "var(--green-subtle)" : "transparent",
        color: cannotOpen ? "var(--text-muted)" : isPublished ? "var(--green-accent)" : "var(--text-secondary)",
        fontSize:"0.72rem",fontWeight:700,fontFamily:"var(--font-mono)",cursor: cannotOpen ? "not-allowed" : "pointer",transition:"all 0.15s"
      }}>
        <span style={{ width:"5px",height:"5px",borderRadius:"50%",background: isPublished ? "var(--green-accent)" : "var(--text-muted)" }} />
        {isPublished ? "Published" : "Publish"}
      </button>

      {open && (
        <div style={{ position:"absolute",top:"calc(100% + 6px)",right:0,background:"var(--bg-2)",border:`1px solid var(--border-default)`,borderRadius:"12px",padding:"8px",width:"260px",zIndex:500,boxShadow:"0 12px 40px rgba(0,0,0,0.8)",animation:"slideIn 0.12s ease" }}>
          {error && <div style={{ margin:"0 4px 6px",padding:"6px 10px",background:"rgba(140,35,35,0.1)",border:"1px solid rgba(140,35,35,0.25)",borderRadius:"8px",fontSize:"0.68rem",color:"#ff8080" }}>{error}</div>}

          {propagating && (
            <div style={{ margin:"0 4px 6px",padding:"8px 10px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:"8px",fontSize:"0.65rem",color:"var(--green-accent)",display:"flex",alignItems:"center",gap:"8px",lineHeight:1.4 }}>
              <span style={{ fontSize:"0.6rem",fontFamily:"var(--font-mono)",background:"rgba(16,185,129,0.12)",padding:"2px 6px",borderRadius:"4px",flexShrink:0 }}>{formatTime(propagateSeconds)}</span>
              <span>Domain is propagating. Your site will be live shortly.</span>
            </div>
          )}

          {view === "main" && <>
            {isPublished && (
              <div style={{ display:"flex",alignItems:"center",gap:"6px",padding:"6px 8px",background:"var(--green-subtle)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:"8px",marginBottom:"6px" }}>
                <div style={{ width:"5px",height:"5px",borderRadius:"50%",background:"var(--green-accent)",boxShadow:"0 0 4px rgba(16,185,129,0.7)" }} />
                <a href={publishedUrl} target="_blank" rel="noreferrer" style={{ fontSize:"0.68rem",color:"var(--green-accent)",fontFamily:"var(--font-mono)",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{currentDomain}</a>
              </div>
            )}
            {!isPublished && (
              <div style={{ padding:"4px 4px 6px" }}>
                <div style={{ display:"flex",alignItems:"center",background:"var(--bg-0)",border:`1px solid ${nameError ? "rgba(140,35,35,0.45)" : "var(--border-subtle)"}`,borderRadius:"8px",overflow:"hidden",marginBottom:"4px" }}>
                  <input type="text" value={newName} onChange={e => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,40); setNewName(v); setNameError(validate(v)); }}
                    onKeyDown={e => { if (e.key==="Enter"&&!nameError&&newName.length>=3) handleAction(false); }}
                    placeholder="my-app" autoFocus style={{ flex:1,background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:"0.75rem",padding:"8px 10px",fontFamily:"var(--font-mono)" }} />
                  <span style={{ padding:"8px",color:"var(--text-muted)",fontSize:"0.6rem",fontFamily:"var(--font-mono)",borderLeft:`1px solid var(--border-subtle)`,whiteSpace:"nowrap" }}>.thehustlerbot.com</span>
                </div>
                {nameError && <p style={{ fontSize:"0.62rem",color:"var(--red-accent)",margin:"0 0 4px 4px" }}>{nameError}</p>}
              </div>
            )}
            <div style={{ display:"flex",flexDirection:"column",gap:"3px" }}>
              {isPublished ? (
                <button onClick={() => hasChanges && handleAction(true)} disabled={!hasChanges||publishing} style={{
                  display:"flex",alignItems:"center",gap:"6px",width:"100%",padding:"7px 8px",background: hasChanges ? "var(--green-subtle)" : "transparent",
                  border: hasChanges ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",borderRadius:"8px",
                  cursor: !hasChanges||publishing ? "not-allowed" : "pointer",opacity: !hasChanges ? 0.4 : 1,textAlign:"left",outline:"none",transition:"all 0.12s"
                }}>
                  <span style={{ fontSize:"0.72rem",fontWeight:700,color: hasChanges ? "var(--text-primary)" : "var(--text-tertiary)",fontFamily:"var(--font-mono)" }}>{publishing ? "Updating..." : "Update"}</span>
                </button>
              ) : (
                <button onClick={() => newName.length>=3&&!nameError&&handleAction(false)} disabled={publishing||newName.length<3||!!nameError} style={{
                  width:"100%",padding:"7px",background: newName.length>=3&&!nameError ? "var(--green-subtle)" : "var(--bg-3)",
                  border:`1px solid ${newName.length>=3&&!nameError ? "rgba(16,185,129,0.2)" : "var(--border-subtle)"}`,borderRadius:"8px",
                  color: newName.length>=3&&!nameError ? "var(--green-accent)" : "var(--text-muted)",fontSize:"0.72rem",fontWeight:700,
                  cursor: publishing||newName.length<3||!!nameError ? "not-allowed" : "pointer",fontFamily:"var(--font-mono)",transition:"all 0.12s"
                }}>{publishing ? "Publishing..." : "Publish"}</button>
              )}
              {isPublished && (
                <button onClick={() => { setView("domain"); setNewName(""); setNameError(""); setError(""); }} style={{
                  width:"100%",padding:"7px 8px",background:"transparent",border:"1px solid transparent",borderRadius:"8px",
                  cursor:"pointer",textAlign:"left",color:"var(--text-secondary)",fontSize:"0.7rem",fontFamily:"var(--font-mono)",transition:"all 0.12s"
                }}>Change domain</button>
              )}
            </div>
          </>}

          {view === "domain" && (
            <div style={{ padding:"4px" }}>
              <button onClick={() => { setView("main"); setNewName(""); setNameError(""); setError(""); }} style={{ background:"none",border:"none",color:"var(--text-tertiary)",cursor:"pointer",fontSize:"0.68rem",marginBottom:"6px",fontFamily:"var(--font-mono)" }}>← back</button>
              <div style={{ display:"flex",alignItems:"center",background:"var(--bg-0)",border:`1px solid ${nameError ? "rgba(140,35,35,0.45)" : "var(--border-subtle)"}`,borderRadius:"8px",overflow:"hidden",marginBottom:"6px" }}>
                <input type="text" value={newName} onChange={e => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,40); setNewName(v); setNameError(validate(v)); }}
                  onKeyDown={e => { if (e.key==="Enter"&&!nameError&&newName.length>=3) handleAction(false); }}
                  placeholder="new-domain" autoFocus style={{ flex:1,background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:"0.75rem",padding:"8px 10px",fontFamily:"var(--font-mono)" }} />
                <span style={{ padding:"8px",color:"var(--text-muted)",fontSize:"0.6rem",fontFamily:"var(--font-mono)",borderLeft:`1px solid var(--border-subtle)`,whiteSpace:"nowrap" }}>.thehustlerbot.com</span>
              </div>
              {nameError && <p style={{ fontSize:"0.62rem",color:"var(--red-accent)",margin:"0 0 4px 4px" }}>{nameError}</p>}
              <button onClick={() => newName.length>=3&&!nameError&&handleAction(false)} disabled={publishing||newName.length<3||!!nameError} style={{
                width:"100%",padding:"8px",background: newName.length>=3&&!nameError ? "var(--green-subtle)" : "var(--bg-3)",
                border:`1px solid ${newName.length>=3&&!nameError ? "rgba(16,185,129,0.2)" : "var(--border-subtle)"}`,borderRadius:"8px",
                color: newName.length>=3&&!nameError ? "var(--green-accent)" : "var(--text-muted)",fontSize:"0.72rem",fontWeight:700,
                cursor: publishing||newName.length<3||!!nameError ? "not-allowed" : "pointer",fontFamily:"var(--font-mono)"
              }}>{publishing ? "Changing..." : "Confirm"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Safe preview URL ─────────────────────────────────────────────────────────
function _safePreview(url) { if (!url) return null; if (/^http:\/\/127\.0\.0\.1:\d+$/.test(url)) return null; return url; }

// ── Long input chip ───────────────────────────────────────────────────────────
function LongInputChip({ content }) {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split("\n").length;
  const chars = content.length;
  const preview = content.slice(0, 120).trim() + (chars > 120 ? "…" : "");

  return (
    <div style={{ marginTop:"4px" }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          background:"rgba(140,35,35,0.08)",
          border:"1px solid rgba(140,35,35,0.18)",
          borderRadius:"8px",
          padding:"8px 12px",
          cursor:"pointer",
          transition:"all 0.15s",
          userSelect:"none",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor="rgba(140,35,35,0.35)"}
        onMouseLeave={e => e.currentTarget.style.borderColor="rgba(140,35,35,0.18)"}
      >
        <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom: expanded ? "8px" : "0" }}>
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path d="M1 1h7l3 3v9a1 1 0 01-1 1H1a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="var(--red-accent)" strokeWidth="1.2"/>
            <path d="M8 1v3h3" stroke="var(--red-accent)" strokeWidth="1.2"/>
          </svg>
          <span style={{ fontSize:"0.68rem",fontWeight:600,color:"var(--text-secondary)",fontFamily:"var(--font-mono)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {preview}
          </span>
          <span style={{ fontSize:"0.58rem",color:"var(--text-muted)",fontFamily:"var(--font-mono)",flexShrink:0,marginLeft:"4px" }}>
            {lines} lines · {chars > 999 ? (chars/1000).toFixed(1)+"k" : chars} chars
          </span>
          <span style={{ fontSize:"0.6rem",color:"var(--red-accent)",flexShrink:0 }}>{expanded ? "▲" : "▼"}</span>
        </div>
        {expanded && (
          <pre style={{
            margin:0,padding:"8px",background:"var(--bg-0)",borderRadius:"6px",
            fontSize:"0.72rem",fontFamily:"var(--font-mono)",color:"var(--text-secondary)",
            overflowY:"auto",overflowX:"auto",maxHeight:"320px",
            whiteSpace:"pre-wrap",wordBreak:"break-all",lineHeight:1.5,
          }}>
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN STUDIO
// ═══════════════════════════════════════════════════════════════════════════════

export default function Studio() {
  const navigate = useNavigate();
  const { isMobilePortrait, isMobileLandscape, isMobile } = useIsMobile();
  const [mobilePanel, setMobilePanel] = useState("chat"); // "chat" or "preview"
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  // ── NEW: separate interval ref for backend-status polling ─────────────────
  const backendPollRef = useRef(null);
  const inputRef = useRef(null);

  const userEmail = localStorage.getItem("user_email") || "anonymous";

  const [projects, setProjects] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [state, setState] = useState("idle");
  const [prompt, setPrompt] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [credits, setCredits] = useState(null);
  const [planLimit, setPlanLimit] = useState(20);
  const [userPlan, setUserPlan] = useState(localStorage.getItem("user_plan") || "free");
  const [panelView, setPanelView] = useState("preview");
  const [progress, setProgress] = useState([]);
  const [thinkingText, setThinkingText] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const cancelledRef = useRef(false);
  const [previewError, setPreviewError] = useState(false);
  const [codeChanged, setCodeChanged] = useState(false);
  const [buildOk, setBuildOk] = useState(true);
  const [selectedModel, setSelectedModel] = useState("hb-6");
  const [publishedUrl, setPublishedUrl] = useState(null);
  const [changesSincePublish, setChangesSincePublish] = useState(false);
  const [domainPropagating, setDomainPropagating] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [backendEnabled, setBackendEnabled] = useState(false);
  const [backendLoading, setBackendLoading] = useState(false);
  const [showBackendInChat, setShowBackendInChat] = useState(false);
  const backendRespondedRef = useRef(false);
  // ── Stripe state ─────────────────────────────────────────────────────────
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [showStripeInChat, setShowStripeInChat] = useState(false);
  const stripeRespondedRef = useRef(false);
  const [showNameModal, setShowNameModal] = useState(localStorage.getItem("show_name_modal") === "1");
  const [imagePreview, setImagePreview] = useState(null);
  const attachmentUrlsRef = useRef({});

  const isRunning = state === "running";
  const isRendering = state === "completed" && !previewUrl && currentJobId && codeChanged;

  const prevStateRef = useRef(state);
  useEffect(() => { if (prevStateRef.current === "running" && state === "completed" && publishedUrl) setChangesSincePublish(true); prevStateRef.current = state; }, [state, publishedUrl]);

  const buildPhase = (() => {
    if (isRendering) return "rendering";
    if (!isRunning) return "idle";
    if (progress.length === 0) return "thinking";
    const hasWrites = progress.some(p => p.action === "writing" || p.action === "editing");
    const isCompiling = progress.some(p => p.action === "building");
    if (isCompiling) return "compiling";
    if (hasWrites) return previewUrl ? "editing" : "building";
    return "thinking";
  })();

  const phaseLabel = { thinking:"Thinking...",building:"Building...",editing:"Editing...",compiling:"Compiling...",rendering:"Rendering...",idle:"" }[buildPhase] || "Thinking...";
  const progressPercent = computeProgress(progress, buildPhase);

  useEffect(() => { fetchProjects().then(jobs => setProjects(jobs)).catch(()=>{}); }, []);

  const prevMsgCount = useRef(0);
  useEffect(() => { if (messages.length > prevMsgCount.current) bottomRef.current?.scrollIntoView({ behavior:"smooth" }); prevMsgCount.current = messages.length; }, [messages]);

  useEffect(() => { getCredits().then(d => { setCredits(d.balance); if (d.plan_limit) setPlanLimit(d.plan_limit); }).catch(()=>{}); setUserPlan(localStorage.getItem("user_plan")||"free"); }, []);

  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (currentJobId) {
      sessionStorage.setItem("studio_current_job", currentJobId);
      hasRestoredRef.current = true;
    } else if (hasRestoredRef.current) {
      sessionStorage.removeItem("studio_current_job");
    }
  }, [currentJobId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("prompt")||params.get("cloned")) return;
    const savedId = sessionStorage.getItem("studio_return_job_id")||sessionStorage.getItem("studio_current_job");
    sessionStorage.removeItem("studio_return_job_id");
    if (savedId) {
      setChatLoading(true);
      fetchProjects().then(async jobs => {
        setProjects(jobs);
        const p = jobs.find(j=>j.job_id===savedId);
        if (p) { await loadProjectState(p); if (p.state==="running") startPolling(p.job_id); }
        setChatLoading(false);
      }).catch(()=>setChatLoading(false));
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const up = params.get("prompt");
    if (up?.trim()) { window.history.replaceState({},"","/studio"); setTimeout(()=>handleSendWithText(decodeURIComponent(up).trim()),500); }
  }, []); // eslint-disable-line

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("cloned");
    if (cid?.trim()) {
      window.history.replaceState({},"","/studio");
      setTimeout(async()=>{
        try { const d=await getJobStatus(cid); setCurrentJobId(cid); setState(d.state||"completed"); setCodeChanged(true);
          if (d.preview_url) { setPreviewUrl(d.preview_url); setPreviewError(false); setPreviewKey(k=>k+1); }
          mergeServerMessages(d.messages);
          fetchProjects().then(j=>setProjects(j)).catch(()=>{});
        } catch(e) { console.error("Clone load failed:",e); }
      },300);
    }
  }, []); // eslint-disable-line

  const mergeServerMessages = useCallback((serverMsgs) => {
    const mapped = (serverMsgs||[]).map(m=>({ role:m.role,content:m.text,tokens_used:m.tokens_used,credits_used:m.credits_used,attachments:m.attachments||undefined }));
    setMessages(prev => {
      return mapped.map((msg, i) => {
        const existing = prev[i];
        if (existing && existing.role === msg.role) {
          // Preserve attachments and collapsed state from previous render
          const merged = { ...msg };
          if (existing.attachments) merged.attachments = existing.attachments;
          if (existing.collapsed) merged.collapsed = existing.collapsed;
          return merged;
        }
        return msg;
      });
    });
  }, []);

  const loadProjectState = async (project) => {
    setCurrentJobId(project.job_id); setError(""); setPreviewError(false); setMessages([]); setAttachedFiles([]);
    setPublishedUrl(null); setChangesSincePublish(false);
    setStripeEnabled(false); setShowStripeInChat(false); stripeRespondedRef.current = false;
    const safeUrl = _safePreview(project.preview_url);
    setPreviewUrl(safeUrl); setState(project.state||"completed"); setCodeChanged(!!safeUrl);
    if (safeUrl) setPreviewKey(k=>k+1);
    try {
      const d = await getJobStatus(project.job_id);
      mergeServerMessages(d.messages);
      if (d.state) setState(d.state); if (d.code_changed!==undefined) setCodeChanged(d.code_changed);if (d.build_ok!==undefined) setBuildOk(d.build_ok); if (d.model) setSelectedModel(d.model);
      if (d.preview_url) { const u=_safePreview(d.preview_url); setPreviewUrl(u); setPreviewError(false); setPreviewKey(k=>k+1); }
      if (d.published_url) { setPublishedUrl(d.published_url); setChangesSincePublish(false); }
    } catch { setMessages([]); }
    try { const bd = await getBackendStatus(project.job_id); setBackendEnabled(!!bd.supabase_enabled); } catch { setBackendEnabled(false); }
    try { const sd = await getStripeStatus(project.job_id); setStripeEnabled(!!sd.stripe_enabled); } catch { setStripeEnabled(false); }
  };

  const startPolling = (jobId) => {
    stopPolling();
    cancelledRef.current = false;
    pollRef.current = setInterval(async () => {
      if (cancelledRef.current) return;
      try {
        const d = await getJobStatus(jobId);
        if (cancelledRef.current) return;
        mergeServerMessages(d.messages);
        setState(d.state); if (d.code_changed!==undefined) setCodeChanged(d.code_changed);
        if (d.credits_balance!==undefined) setCredits(d.credits_balance);
        if (d.plan) { const ml={free:0,plus:1000,pro:2400,ultra:5000,titan:10000,ace:25000}; setPlanLimit(20+(ml[d.plan]||0)); setUserPlan(d.plan); localStorage.setItem("user_plan",d.plan); }
        if (d.model) setSelectedModel(d.model);
        if (d.published_url) setPublishedUrl(d.published_url);
        if (d.progress?.length>0) {
          setProgress(d.progress);
          const la = d.progress[d.progress.length-1]?.action;
          if (la==="building") setThinkingText(""); else { const te=d.progress.filter(p=>p.action==="planning"&&p.detail); if(te.length>0) setThinkingText(te[te.length-1].detail); }
        }
        if (d.backend_requested && !backendEnabled && !showBackendInChat && !backendRespondedRef.current) setShowBackendInChat(true);
        if (d.stripe_requested && !stripeEnabled && !showStripeInChat && !stripeRespondedRef.current) setShowStripeInChat(true);
        if (d.preview_url) { setPreviewUrl(d.preview_url); setPreviewError(false); if (d.code_changed) setPreviewKey(k=>k+1); }
        setProjects(prev=>prev.map(p=>p.job_id===jobId?{...p,state:d.state,preview_url:d.preview_url||p.preview_url}:p));
        if (d.state==="completed"||d.state==="failed") { stopPolling(); setProgress([]); setThinkingText(""); setShowBackendInChat(false); setShowStripeInChat(false); fetchProjects().then(j=>setProjects(j)).catch(()=>{}); }
      } catch (e) { console.error("Poll error:",e); }
    }, 3000);
  };

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  useEffect(() => () => { stopPolling(); stopBackendPolling(); }, []); // eslint-disable-line

  // ── Backend-status poller (runs independently of the job poller) ───────────
  const stopBackendPolling = () => {
    if (backendPollRef.current) { clearInterval(backendPollRef.current); backendPollRef.current = null; }
  };

  const startBackendPolling = (jobId) => {
    stopBackendPolling();
    backendPollRef.current = setInterval(async () => {
      try {
        const bd = await getBackendStatus(jobId);

        if (bd.supabase_enabled) {
          // Provisioning finished successfully
          stopBackendPolling();
          setBackendEnabled(true);
          setBackendLoading(false);
          setShowBackendInChat(false);
          // Signal the AI agent that the backend is ready
          try { await API.post(`/auth/job/${jobId}/backend-ready`); } catch {}
        } else if (bd.provisioning_failed) {
          // Hard failure reported by the backend thread
          stopBackendPolling();
          setBackendLoading(false);
          setShowBackendInChat(false);
          setError("Failed to enable backend. Please try again.");
        }
        // If still provisioning, just keep polling — card stays in loading state
      } catch (e) {
        console.error("Backend poll error:", e);
      }
    }, 4000);
  };

  const ALLOWED_EXT = ['png','jpg','jpeg','gif','webp','svg','pdf','txt','md','csv','json','py','js','ts','jsx','tsx','css','html','env','yaml','yml','xml','sql','sh','toml'];
  const addFiles = fl => { const nf = Array.from(fl).filter(f => ALLOWED_EXT.includes(f.name.split('.').pop().toLowerCase()) && f.size <= 10*1024*1024); setAttachedFiles(prev=>[...prev,...nf].slice(0,5)); };
  const removeFile = i => setAttachedFiles(prev=>prev.filter((_,j)=>j!==i));

  const handlePaste = (e) => {
    const text = e.clipboardData?.getData("text");
    if (!text || text.split("\n").length < 100) return;
    e.preventDefault();
    const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    const filename = `pasted-${timestamp}.txt`;
    const file = new File([text], filename, { type: "text/plain" });
    setAttachedFiles(prev => [...prev, file].slice(0, 5));
  };

  const handleSendWithText = async (text) => {
    if (!text||isRunning) return; setPrompt(""); setError("");
    try {
      setState("running"); setProgress([]); setThinkingText(""); setCodeChanged(false);
      const fs=[...attachedFiles];
      const fn=fs.map(f=>{
        const url = URL.createObjectURL(f);
        attachmentUrlsRef.current[f.name] = url;
        return {name:f.name,type:f.type};
      });
      setAttachedFiles([]);
      setMessages([{ role:"user", content:text, attachments:fn.length>0?fn:undefined }]);
      const [jobId,smartTitle] = await Promise.all([generateProject(text,"",selectedModel,fs),generateTitle(text)]);
      setCurrentJobId(jobId); setPublishedUrl(null); setChangesSincePublish(false);
      setProjects(prev=>[{ job_id:jobId,title:smartTitle,state:"running",preview_url:null },...prev]);
      API.patch(`/auth/job/${jobId}/title`,{title:smartTitle}).catch(()=>{});
      startPolling(jobId);
    } catch (err) { setError(err?.response?.data?.error||"Something went wrong"); setState("failed"); }
  };

  const handleSend = async (e) => {
    e.preventDefault(); const text=prompt.trim();
    if (!text&&attachedFiles.length===0) return; if (isRunning) return;
    setPrompt(""); setError("");
    try {
      if (!currentJobId) { await handleSendWithText(text||"Build based on attached files"); }
      else {
        setState("running"); setProgress([]); setThinkingText(""); setCodeChanged(false);
        const fs=[...attachedFiles];
        const fn=fs.map(f=>{
          const url = URL.createObjectURL(f);
          attachmentUrlsRef.current[f.name] = url;
          return {name:f.name,type:f.type};
        });
        setAttachedFiles([]);
        setMessages(prev=>[...prev,{role:"user",content:text||"(attached files)",attachments:fn.length>0?fn:undefined}]);
        await sendFollowUp(currentJobId,text||"See attached files",selectedModel,fs);
        startPolling(currentJobId);
      }
    } catch (err) { setError(err?.response?.data?.error||"Something went wrong"); setState("failed"); }
  };

  const handleNewProject = () => {
    stopPolling(); stopBackendPolling();
    setCurrentJobId(null); setMessages([]); setPreviewUrl(null); setPreviewError(false); setCodeChanged(false);
    setState("idle"); setPrompt(""); setError(""); setAttachedFiles([]); setPublishedUrl(null); setChangesSincePublish(false);
    setBackendEnabled(false); setShowBackendInChat(false); backendRespondedRef.current = false;
    setStripeEnabled(false); setShowStripeInChat(false); stripeRespondedRef.current = false;
    setTimeout(()=>inputRef.current?.focus(),100);
  };

  const handleLoadProject = async (p) => {
    stopPolling(); stopBackendPolling();
    setChatLoading(true); await loadProjectState(p); setChatLoading(false);
    if (p.state==="running") startPolling(p.job_id);
  };

  const handleStop = () => { if (currentJobId) setShowStopModal(true); };

  const confirmStop = async () => {
    setShowStopModal(false); if (!currentJobId) return;
    cancelledRef.current = true;
    stopPolling(); stopBackendPolling();
    setState("failed"); setProgress([]); setThinkingText("");
    setShowBackendInChat(false); setShowStripeInChat(false);
    setBackendLoading(false);
    try { await API.post(`/auth/job/${currentJobId}/cancel`); } catch {}
    try { const c = await getCredits(); setCredits(c.balance); } catch {}
    fetchProjects().then(j=>setProjects(j)).catch(()=>{});
  };

  // ── FIXED: kick off provisioning and poll instead of blocking await ────────
  const handleBackendAllow = async () => {
    if (!currentJobId) return;
    backendRespondedRef.current = true;
    setBackendLoading(true);
    try {
      // This now returns 202 immediately — provisioning runs in a background thread
      await enableBackend(currentJobId);
      // Start polling backend-status every 4s until enabled or failed
      startBackendPolling(currentJobId);
    } catch (err) {
      setBackendLoading(false);
      setShowBackendInChat(false);
      setError(err?.response?.data?.error || "Failed to enable backend");
    }
  };

  const handleBackendDeny = () => {
    backendRespondedRef.current = true;
    setShowBackendInChat(false);
    if (currentJobId) API.post(`/auth/job/${currentJobId}/backend-denied`).catch(()=>{});
  };

  const handleStripeSubmit = async (pubKey, secKey) => {
    if (!currentJobId) return;
    stripeRespondedRef.current = true;
    setStripeLoading(true);
    try {
      await enableStripe(currentJobId, pubKey, secKey);
      setStripeEnabled(true);
      setShowStripeInChat(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to enable Stripe");
      setShowStripeInChat(false);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleStripeDeny = () => {
    stripeRespondedRef.current = true;
    setShowStripeInChat(false);
    if (currentJobId) API.post(`/stripe/job/${currentJobId}/stripe-denied`).catch(()=>{});
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => { setShowLogoutModal(false); localStorage.removeItem("token"); localStorage.removeItem("user_email"); sessionStorage.removeItem("studio_current_job"); navigate("/home"); };
  const handleUpgrade = () => { if (currentJobId) sessionStorage.setItem("studio_return_job_id",currentJobId); navigate("/subscribe"); };

  const placeholder = currentJobId ? "Ask for changes..." : "Describe the app you want to build...";

  // ── Credits button ────────────────────────────────────────────────────────
  const renderCreditsButton = () => {
    const label = userPlan === "free" ? "Get Credits" : "Upgrade";
    return (
      <button
        onClick={handleUpgrade}
        onMouseEnter={e=>{ e.currentTarget.style.background="rgba(200,40,40,0.35)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="rgba(180,35,35,0.22)"; }}
        style={{
          padding:"3px 14px",
          height:"26px",
          background:"rgba(180,35,35,0.22)",
          border:"none",
          borderRadius:"6px",
          color:"#ffffff",
          fontSize:"0.62rem",
          fontWeight:700,
          cursor:"pointer",
          fontFamily:"var(--font-mono)",
          flexShrink:0,
          letterSpacing:"0.04em",
          transition:"background 0.15s",
        }}
      >
        {label}
      </button>
    );
  };

  // ── Shared browser chrome buttons ──────────────────────────────────────────
  const renderChromeButtons = () => (
    <>
      <div style={{ display:"flex",background:"var(--bg-0)",borderRadius:"5px",border:`1px solid var(--border-subtle)`,padding:"1px",flexShrink:0 }}>
        {["preview","code"].map(v => (
          <button key={v} onClick={()=>setPanelView(v)} style={{
            padding:"2px 10px",borderRadius:"4px",border:"none",
            background:panelView===v?"rgba(30,10,10,0.95)":"transparent",
            // eslint-disable-next-line no-dupe-keys
            border:panelView===v?"1px solid rgba(120,30,30,0.5)":"none",
            color:panelView===v?"#ffffff":"var(--text-tertiary)",
            fontSize:"0.62rem",fontWeight:600,cursor:"pointer",fontFamily:"var(--font-mono)"
          }}>{v==="preview"?"Preview":"Code"}</button>
        ))}
      </div>
      <div style={{ flex:1,display:"flex",alignItems:"center",background:"var(--bg-0)",borderRadius:"5px",padding:"3px 8px",border:`1px solid var(--border-subtle)`,minWidth:0 }}>
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0,marginRight:"5px" }}><path d="M8 1L2 4.5V11.5L8 15L14 11.5V4.5L8 1Z" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinejoin="round"/></svg>
        <span style={{ fontSize:"0.58rem",color: domainPropagating ? "var(--yellow-accent)" : "var(--text-tertiary)",fontFamily:"var(--font-mono)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
          {domainPropagating
            ? `${publishedUrl?.replace("https://","").replace(/\/$/,"") || "yourapp.thehustlerbot.com"} — propagating`
            : publishedUrl ? publishedUrl.replace("https://","").replace(/\/$/,"") : "yourapp.thehustlerbot.com"}
        </span>
      </div>
      {previewUrl && <button onClick={()=>{setPreviewError(false);setPreviewKey(k=>k+1);}} style={{ background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:"0.7rem",padding:"2px",flexShrink:0 }} onMouseEnter={e=>e.currentTarget.style.color="var(--text-secondary)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>↻</button>}
      {renderCreditsButton()}
      {currentJobId&&!isRunning && (
        <button onClick={()=>{ const p=projects.find(p=>p.job_id===currentJobId); sessionStorage.setItem("github_push_job_id",currentJobId); sessionStorage.setItem("github_push_job_title",p?.title||"project"); window.location.href=`https://github.com/login/oauth/authorize?client_id=Ov23liUC5tA7pNQbfiWo&scope=repo&redirect_uri=https://thehustlerbot.com/github-callback`; }} style={{ padding:"3px 8px",height:"24px",background:"var(--bg-3)",border:`1px solid var(--border-subtle)`,borderRadius:"5px",color:"var(--text-secondary)",fontSize:"0.6rem",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"3px",fontFamily:"var(--font-mono)",flexShrink:0 }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#58a6ff";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-subtle)";e.currentTarget.style.color="var(--text-secondary)";}}
        ><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg></button>
      )}
      {currentJobId && <PublishPopover jobId={currentJobId} previewUrl={previewUrl} publishedUrl={publishedUrl} hasChanges={changesSincePublish} isRunning={isRunning} onPublishSuccess={(url,isNew)=>{setPublishedUrl(url);setChangesSincePublish(false);if(isNew){setDomainPropagating(true);setTimeout(()=>setDomainPropagating(false),300000);}}} />}
    </>
  );

  const chatFlex = isMobilePortrait ? "1 1 100%" : isMobileLandscape ? "0 0 260px" : "0 0 380px";
 

  return (
    <div style={{ height:"100dvh",width:"100vw",display:"flex",background:"var(--bg-0)",color:"var(--text-primary)",fontFamily:"var(--font-sans)",overflow:"hidden",flexDirection:isMobilePortrait?"column":"row" }}>
      <GlobalStyles />
      {showNameModal && <NameModal onDone={name => { localStorage.setItem("user_name",name); localStorage.removeItem("show_name_modal"); setShowNameModal(false); }} />}
      <ConfirmModal open={showLogoutModal} title="Log out?" description="You'll need to sign in again." confirmLabel="Log out" onConfirm={confirmLogout} onCancel={()=>setShowLogoutModal(false)} />
      <ConfirmModal open={showStopModal} title="Stop building?" description="The AI agent is still working." warning="Credits used so far will still be charged." confirmLabel="Stop" onConfirm={confirmStop} onCancel={()=>setShowStopModal(false)} />

      {imagePreview && (
        <div onClick={()=>setImagePreview(null)} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out" }}>
          {imagePreview.type === "doc" ? (
            <iframe src={imagePreview.url} title="Document Preview" style={{ width:"80vw",height:"85vh",borderRadius:"12px",border:"none",boxShadow:"0 0 60px rgba(0,0,0,0.8)" }} onClick={e=>e.stopPropagation()} />
          ) : (
            <img src={typeof imagePreview === "string" ? imagePreview : imagePreview.url} alt="Preview" style={{ maxWidth:"90vw",maxHeight:"85vh",borderRadius:"12px",boxShadow:"0 0 60px rgba(0,0,0,0.8)",objectFit:"contain" }} onClick={e=>e.stopPropagation()} />
          )}
          <button onClick={()=>setImagePreview(null)} style={{ position:"absolute",top:"20px",right:"20px",background:"var(--bg-3)",border:`1px solid var(--border-default)`,borderRadius:"50%",width:"32px",height:"32px",color:"var(--text-primary)",fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>&times;</button>
        </div>
      )}
      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} userEmail={userEmail} credits={credits} planLimit={planLimit} projects={projects} currentJobId={currentJobId}
        onNewProject={handleNewProject} onLoadProject={handleLoadProject} onLogout={handleLogout} onUpgrade={handleUpgrade} onHome={()=>navigate("/home")} />
      {/* ── Chat panel ── */}
      {(!isMobilePortrait || mobilePanel === "chat") && (
      <div
        onDragOver={e=>{e.preventDefault();e.stopPropagation();setIsDragging(true);}}
        onDragLeave={e=>{e.preventDefault();e.stopPropagation();if(!e.currentTarget.contains(e.relatedTarget))setIsDragging(false);}}
        onDrop={e=>{e.preventDefault();e.stopPropagation();setIsDragging(false);if(e.dataTransfer.files?.length)addFiles(e.dataTransfer.files);}}
        style={{ flex:chatFlex,display:"flex",flexDirection:"column",borderRight:isMobilePortrait?"none":`1px solid var(--border-subtle)`,overflow:"hidden",background:"var(--bg-0)",position:"relative",height:isMobilePortrait?"100%":"auto" }}>
        {isDragging && (
          <div style={{ position:"absolute",inset:0,zIndex:20,background:"rgba(140,35,35,0.08)",border:"2px dashed var(--red-accent)",borderRadius:"0",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
            <div style={{ background:"var(--bg-2)",border:"1px solid rgba(140,35,35,0.35)",borderRadius:"12px",padding:"16px 24px",boxShadow:"0 8px 30px rgba(0,0,0,0.5)" }}>
              <span style={{ color:"var(--red-accent)",fontSize:"0.82rem",fontWeight:600,fontFamily:"var(--font-mono)" }}>Drop files here</span>
            </div>
          </div>
        )}
        {/* Top bar */}
        <div style={{ padding:"10px 12px",background:"var(--bg-0)",borderBottom:`1px solid var(--border-subtle)`,display:"flex",alignItems:"center",gap:"8px",flexShrink:0 }}>
          <button onClick={()=>setSidebarOpen(true)} style={{ background:"none",border:"none",color:"var(--text-tertiary)",fontSize:"0.95rem",cursor:"pointer",padding:"2px 4px",flexShrink:0 }}>&#9776;</button>
          <div style={{ flex:1,textAlign:"center",minWidth:0 }}>
            <h2 style={{ margin:0,fontSize:"0.82rem",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--font-sans)" }}>
              {currentJobId ? (projects.find(p=>p.job_id===currentJobId)?.title||"Project") : "The Hustler Bot"}
            </h2>
          </div>
          {isMobilePortrait ? (
            <button onClick={() => setMobilePanel(p => p === "chat" ? "preview" : "chat")} style={{ background:"none",border:`1px solid var(--border-subtle)`,borderRadius:"6px",color:"var(--text-secondary)",cursor:"pointer",padding:"3px 8px",flexShrink:0,display:"flex",alignItems:"center",gap:"4px",fontSize:"0.6rem",fontFamily:"var(--font-mono)",fontWeight:600 }}>
              {mobilePanel === "chat" ? "Preview" : "Chat"}
            </button>
          ) : (
            <div style={{ width:"30px",flexShrink:0 }} />
          )}
        </div>

        {/* Chat messages */}
        <div className="studio-scroll" style={{ flexGrow:1,overflowY:"auto",overflowX:"hidden",padding:"16px 12px",display:"flex",flexDirection:"column",gap:"12px",minHeight:0 }}>
          {chatLoading && messages.length===0 && <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px" }}><Spinner /><span style={{ color:"var(--text-tertiary)",fontSize:"0.78rem" }}>Loading...</span></div>}

          {!chatLoading && messages.length===0 && !isRunning && (
            <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"2rem",gap:"12px" }}>
              <div style={{ animation:"redPulse 2.4s ease-in-out infinite" }}><BotAvatarStatic size={56} /></div>
              <p style={{ color:"var(--text-primary)",fontSize:"0.9rem",fontWeight:600 }}>The Hustler Bot</p>
              <p style={{ color:"var(--text-tertiary)",fontSize:"0.78rem",maxWidth:"200px",lineHeight:1.6 }}>Describe an app and I'll build it for you.</p>
            </div>
          )}

          {messages.map((msg,i) => {
            const isLastBot = msg.role==="assistant"&&!messages.slice(i+1).some(m=>m.role==="assistant")&&!isRunning;
            return (
              <div key={i} className="msg-row" style={{ display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",alignItems:"flex-end",gap:"8px",minWidth:0 }}>
                {msg.role==="assistant" && (isLastBot ? <BotAvatar size={28} /> : <div style={{ width:"28px",flexShrink:0 }} />)}
                <div style={{ maxWidth:"80%",minWidth:0,display:"flex",flexDirection:"column",alignItems:msg.role==="user"?"flex-end":"flex-start",overflow:"hidden" }}>
                  <span style={{ fontSize:"0.6rem",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",color:msg.role==="user"?"rgba(140,35,35,0.55)":"rgba(140,35,35,0.75)",fontFamily:"var(--font-mono)",marginBottom:"3px" }}>
                    {msg.role==="user"?"You":"Hustler Bot"}
                  </span>
                  <div style={{
                    padding:"10px 14px",borderRadius: msg.role==="user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role==="user" ? "rgba(30,10,10,0.95)" : "var(--bg-0)",
                    border: msg.role==="assistant" ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(120,30,30,0.4)",
                    boxShadow: msg.role==="user" ? "0 1px 8px rgba(0,0,0,0.4)" : "0 1px 8px rgba(0,0,0,0.3)",
                    minWidth:0, overflow:"hidden",
                  }}>
                    {msg.collapsed ? (
                      <LongInputChip content={msg.content} />
                    ) : (
                      <div style={{ color:"var(--text-primary)",fontSize:"0.82rem",lineHeight:1.65 }} dangerouslySetInnerHTML={{ __html:marked.parse(msg.content||"") }} className="msg-content" />
                    )}
                    {msg.attachments?.length>0 && (
                      <div style={{ display:"flex",gap:"4px",flexWrap:"wrap",marginTop:"6px",paddingTop:"6px",borderTop:`1px solid var(--border-subtle)` }}>
                        {msg.attachments.map((att,ai) => {
                          const isImg = att.type?.startsWith("image/");
                          const fileUrl = attachmentUrlsRef.current[att.name] || att.url || null;
                          const canOpen = !!fileUrl;
                          return (
                            <span key={ai}
                              onClick={() => {
                                if (!canOpen) return;
                                if (isImg) setImagePreview(fileUrl);
                                else setImagePreview({ type:"doc", url:fileUrl });
                              }}
                              style={{ display:"flex",alignItems:"center",gap:"4px",background:"var(--bg-3)",border:`1px solid var(--border-subtle)`,borderRadius:"4px",padding:"2px 6px",fontSize:"0.62rem",color:"var(--text-tertiary)",fontFamily:"var(--font-mono)",cursor: canOpen ? "pointer" : "default",transition:"border-color 0.12s" }}
                              onMouseEnter={e=>{ if (canOpen) e.currentTarget.style.borderColor="var(--red-accent)"; }}
                              onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border-subtle)"; }}
                            >
                              {isImg && fileUrl ? <img src={fileUrl} alt="" style={{ width:"18px",height:"18px",borderRadius:"2px",objectFit:"cover" }} /> : <span style={{ fontSize:"0.55rem",color:"var(--text-muted)",fontWeight:600 }}>{isImg ? "IMG" : "DOC"}</span>}
                              <span style={{ maxWidth:"80px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{att.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"6px",paddingTop:"4px",borderTop: msg.role==="assistant" ? `1px solid var(--border-subtle)` : "none" }}>
                      <CopyButton text={msg.content||""} label="Copy" size="sm" />
                      {msg.role==="assistant"&&msg.credits_used!==undefined ? <CostDots credits={msg.credits_used} /> : <div />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Backend card — shown while backendLoading OR while the job is still running and requesting it */}
          {showBackendInChat && (isRunning || backendLoading) && (
            <div className="msg-row" style={{ display:"flex",alignItems:"flex-end",gap:"8px" }}>
              <BotAvatar size={28} />
              <BackendApprovalCard onAllow={handleBackendAllow} onDeny={handleBackendDeny} isLoading={backendLoading} />
            </div>
          )}

          {showStripeInChat && isRunning && (
            <div className="msg-row" style={{ display:"flex",alignItems:"flex-end",gap:"8px" }}>
              <BotAvatar size={28} />
              <StripeApprovalCard onSubmit={handleStripeSubmit} onDeny={handleStripeDeny} isLoading={stripeLoading} />
            </div>
          )}

          {(isRunning||isRendering) && !showBackendInChat && !showStripeInChat && (() => {
            const last = messages.length>0?messages[messages.length-1]:null;
            const botReplied = last&&last.role==="assistant";
            if (botReplied) {
              const isBuild = isRendering||buildPhase==="compiling"||buildPhase==="building";
              if (!isBuild&&!codeChanged) return null;
              if (isBuild) return (
                <div className="msg-row" style={{ display:"flex",alignItems:"flex-end",gap:"8px" }}>
                  <BotAvatar size={28} />
                  <div style={{ padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:"var(--bg-2)",border:`1px solid var(--border-subtle)`,width:"240px" }}>
                    <span style={{ fontSize:"0.68rem",color:"var(--text-secondary)",display:"block",marginBottom:"6px",fontFamily:"var(--font-mono)" }}>
                      {isRendering?"Rendering...":buildPhase==="compiling"?"Compiling...":"Building..."}
                    </span>
                    <div style={{ height:"2px",background:"var(--bg-3)",borderRadius:"2px",overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${progressPercent}%`,background:"linear-gradient(90deg,var(--red-accent),#c03030)",borderRadius:"2px",transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 0 6px rgba(140,35,35,0.65)" }} />
                    </div>
                  </div>
                </div>
              );
              return null;
            }
            return (
              <div className="msg-row" style={{ display:"flex",alignItems:"flex-end",gap:"8px" }}>
                <BotAvatar size={28} />
                <div style={{ maxWidth:"80%",display:"flex",flexDirection:"column",alignItems:"flex-start" }}>
                  <div style={{ padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:"var(--bg-2)",border:`1px solid var(--border-subtle)` }}>
                    <TypingDots />
                    <span style={{ fontSize:"0.68rem",color:"var(--red-accent)",display:"block",marginTop:"3px",fontFamily:"var(--font-mono)" }}>{phaseLabel}</span>
                    {thinkingText && <ThinkingLine text={thinkingText} />}
                  </div>
                </div>
              </div>
            );
          })()}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding:"10px",borderTop:`1px solid var(--border-subtle)`,background:"var(--bg-0)",flexShrink:0 }}>
          <div className="input-area"
            style={{
              display:"flex",flexDirection:"column",gap:"8px",
              background:"var(--bg-1)",
              border:`1px solid var(--border-subtle)`,
              borderRadius:"12px",padding:"10px",transition:"all 0.15s",position:"relative"
            }}>

            {attachedFiles.length>0 && (
              <div style={{ display:"flex",gap:"6px",flexWrap:"wrap" }}>
                {attachedFiles.map((f,i) => {
                  const isImg = f.type.startsWith("image/");
                  const objUrl = URL.createObjectURL(f);
                  return (
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:"5px",background:"var(--bg-3)",border:`1px solid var(--border-subtle)`,borderRadius:"6px",padding:"3px 8px",maxWidth:"160px",cursor:"pointer",transition:"border-color 0.12s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="var(--red-accent)"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-subtle)"}
                    >
                      {isImg
                        ? <img src={objUrl} alt="" onClick={()=>setImagePreview(objUrl)} style={{ width:"26px",height:"26px",borderRadius:"3px",objectFit:"cover",cursor:"pointer" }} />
                        : <span onClick={()=>setImagePreview({type:"doc",url:objUrl})} style={{ fontSize:"0.65rem",color:"var(--text-tertiary)",fontFamily:"var(--font-mono)",cursor:"pointer" }}>DOC</span>
                      }
                      <span onClick={()=>{ if (isImg) setImagePreview(objUrl); else setImagePreview({type:"doc",url:objUrl}); }} style={{ fontSize:"0.65rem",color:"var(--text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"90px",cursor:"pointer" }}>{f.name}</span>
                      <button onClick={(e)=>{e.stopPropagation();removeFile(i);}} style={{ background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:"0.75rem",padding:"0 1px",lineHeight:1,flexShrink:0 }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display:"flex",alignItems:"flex-end",gap:"8px" }}>
              <button onClick={()=>fileInputRef.current?.click()} disabled={isRunning} style={{ background:"none",border:"none",color:"var(--text-muted)",cursor:isRunning?"default":"pointer",fontSize:"1rem",padding:"4px",flexShrink:0,opacity:isRunning?0.3:1,transition:"color 0.12s" }}
                onMouseEnter={e=>{if(!isRunning)e.currentTarget.style.color="var(--red-accent)";}} onMouseLeave={e=>{if(!isRunning)e.currentTarget.style.color="var(--text-muted)";}}
              >+</button>
              <input ref={fileInputRef} type="file" multiple accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.pdf,.txt,.md,.csv,.json,.py,.js,.ts,.jsx,.tsx,.css,.html,.env,.yaml,.yml,.xml,.sql,.sh,.toml" style={{ display:"none" }} onChange={e=>{if(e.target.files?.length){addFiles(e.target.files);e.target.value="";}}} />
              <textarea ref={inputRef} value={prompt} onChange={e=>{setPrompt(e.target.value);const el=e.target;el.style.height="auto";el.style.height=Math.min(el.scrollHeight,140)+"px";}}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend(e);}}} onPaste={handlePaste} placeholder={placeholder} rows={1} disabled={isRunning}
                style={{ flex:1,background:"transparent",color:"var(--text-primary)",border:"none",outline:"none",fontSize:"0.82rem",resize:"none",fontFamily:"var(--font-sans)",lineHeight:1.5,maxHeight:"140px",minHeight:"36px",overflowY:"auto",opacity:isRunning?0.4:1,padding:0,margin:0 }} />
              {isRunning ? (
                <button onClick={handleStop} title="Stop" style={{ width:"32px",height:"32px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,var(--red-accent),#701818)",color:"#fff",fontSize:"0.65rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>&#9632;</button>
              ) : (
                <button onClick={handleSend} disabled={!prompt.trim()&&attachedFiles.length===0} style={{
                  width:"32px",height:"32px",borderRadius:"8px",border:"none",
                  background:(!prompt.trim()&&attachedFiles.length===0)?"var(--bg-3)":"linear-gradient(135deg,var(--red-accent),#701818)",
                  color:(!prompt.trim()&&attachedFiles.length===0)?"var(--text-muted)":"#fff",fontSize:"0.85rem",
                  cursor:(!prompt.trim()&&attachedFiles.length===0)?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"
                }}>&#10148;</button>
              )}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"6px",paddingLeft:"2px" }}>
            <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} plan={userPlan} />
            <span style={{ fontSize:"0.58rem",color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>Enter to send</span>
          </div>
        </div>

        {error && (
          <div style={{ padding:"8px 12px",color:"#ff8080",background:"rgba(140,35,35,0.08)",fontSize:"0.78rem",display:"flex",alignItems:"center",borderTop:`1px solid rgba(140,35,35,0.18)`,flexShrink:0,gap:"8px" }}>
            <span style={{ flex:1 }}>{error}</span>
            {error.toLowerCase().includes("credits") && <button onClick={handleUpgrade} style={{ background:"var(--red-accent)",border:"none",color:"#fff",borderRadius:"6px",padding:"3px 10px",cursor:"pointer",fontSize:"0.72rem",fontWeight:600,whiteSpace:"nowrap" }}>Get Credits</button>}
          </div>
          )}
        </div>
        )}
  
        {/* ── Preview panel ── */}
      {(!isMobilePortrait || mobilePanel === "preview") && (
      <div style={{ flex:1,display:"flex",flexDirection:"column",background:"var(--bg-0)",overflow:"hidden",minWidth:0,height:isMobilePortrait?"100%":"auto" }}>
 
 {panelView==="preview" && <>
          {isMobilePortrait && (
            <div style={{ padding:"10px 12px",background:"var(--bg-0)",borderBottom:`1px solid var(--border-subtle)`,display:"flex",alignItems:"center",gap:"8px",flexShrink:0 }}>
              <div style={{ flex:1,textAlign:"center",minWidth:0 }}>
                <span style={{ fontSize:"0.72rem",fontWeight:600,color:"var(--text-secondary)",fontFamily:"var(--font-mono)" }}>Preview</span>
              </div>
              <button onClick={() => setMobilePanel("chat")} style={{ background:"none",border:`1px solid var(--border-subtle)`,borderRadius:"6px",color:"var(--text-secondary)",cursor:"pointer",padding:"3px 8px",flexShrink:0,display:"flex",alignItems:"center",gap:"4px",fontSize:"0.6rem",fontFamily:"var(--font-mono)",fontWeight:600 }}>
                Chat
              </button>
            </div>
          )}
          <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",margin:isMobilePortrait?"0":"6px 8px 8px",borderRadius:isMobilePortrait?"0":"12px",border:isMobilePortrait?"none":"1px solid rgba(255,255,255,0.22)",background:"#000000",boxShadow:isMobilePortrait?"none":"0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}>
            <div style={{ flexShrink:0,padding:"6px 10px",background:"#000000",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"6px",borderRadius:isMobilePortrait?"0":"12px 12px 0 0" }}>
              <div style={{ display:"flex",gap:"4px",flexShrink:0,marginRight:"4px" }}>
                <div style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#ff5f57" }} />
                <div style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#febc2e" }} />
                <div style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#28c840" }} />
              </div>
              {renderChromeButtons()}
            </div>
            <div style={{ flex:1,overflow:"hidden",borderRadius:"0 0 11px 11px",display:"flex",flexDirection:"column" }}>
            {(isRunning||isRendering) && !previewUrl && progress.some(p => ["writing","editing","building","installing","generating image","editing image","requesting backend","requesting stripe","requesting ai","compiling"].includes(p.action)) && (
                <BuildView progress={progress} buildPhase={buildPhase} progressPercent={progressPercent} />
              )}
              {previewError && !isRunning && (
                <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"14px",background:"var(--bg-0)" }}>
                  <span style={{ color:"var(--text-tertiary)",fontSize:"0.8rem",textAlign:"center",maxWidth:"200px",lineHeight:1.6 }}>Preview couldn't load.</span>
                  <button onClick={()=>{setPreviewError(false);setPreviewKey(k=>k+1);}} style={{ padding:"8px 20px",background:"linear-gradient(135deg,var(--red-accent),#701818)",border:"none",borderRadius:"8px",color:"#fff",fontSize:"0.78rem",fontWeight:600,cursor:"pointer" }}>Reload</button>
                </div>
              )}
              {previewUrl && !previewError && (
                <div style={{ flex:1,overflow:"hidden",background:"#ffffff",borderRadius:"0 0 11px 11px" }}>
                  <iframe key={previewKey} src={previewUrl} title="Preview" style={{ width:"100%",height:"100%",border:"none",display:"block" }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onError={()=>setPreviewError(true)} onLoad={()=>{setPreviewError(false);const ic=document.querySelector("link[rel='icon']");if(ic)ic.href="/favicon.ico?"+Date.now();}} />
                </div>
              )}
              {!previewUrl && !isRunning && !isRendering && !previewError && (
                <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--bg-0)",gap:"8px" }}>
                  {state === "completed" && codeChanged && !buildOk ? (
                    <>
                      <span style={{ color:"var(--yellow-accent)",fontSize:"0.82rem",fontWeight:600 }}>Build failed</span>
                      <span style={{ color:"var(--text-tertiary)",fontSize:"0.72rem",maxWidth:"240px",textAlign:"center",lineHeight:1.5 }}>
                        The code compiled with errors. Send a follow-up message describing what went wrong and the bot will try to fix it.
                      </span>
                    </>
                  ) : (
                    <span style={{ color:"var(--text-muted)",fontSize:"0.78rem" }}>Your app preview will appear here.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </>}

        {panelView==="code" && <>
          {isMobilePortrait && (
            <div style={{ padding:"10px 12px",background:"var(--bg-0)",borderBottom:`1px solid var(--border-subtle)`,display:"flex",alignItems:"center",gap:"8px",flexShrink:0 }}>
              <div style={{ flex:1,textAlign:"center",minWidth:0 }}>
                <span style={{ fontSize:"0.72rem",fontWeight:600,color:"var(--text-secondary)",fontFamily:"var(--font-mono)" }}>Code</span>
              </div>
              <button onClick={() => setMobilePanel("chat")} style={{ background:"none",border:`1px solid var(--border-subtle)`,borderRadius:"6px",color:"var(--text-secondary)",cursor:"pointer",padding:"3px 8px",flexShrink:0,display:"flex",alignItems:"center",gap:"4px",fontSize:"0.6rem",fontFamily:"var(--font-mono)",fontWeight:600 }}>
                Chat
              </button>
            </div>
          )}
          <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",margin:isMobilePortrait?"0":"6px 8px 8px",borderRadius:isMobilePortrait?"0":"12px",border:isMobilePortrait?"none":"1px solid rgba(255,255,255,0.22)",background:"#000000",boxShadow:isMobilePortrait?"none":"0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}>
            <div style={{ padding:"6px 10px",background:"var(--bg-2)",borderBottom:`1px solid var(--border-subtle)`,display:"flex",alignItems:"center",gap:"6px",flexShrink:0,borderRadius:isMobilePortrait?"0":"12px 12px 0 0" }}>
              <div style={{ display:"flex",gap:"4px",flexShrink:0,marginRight:"4px" }}>
                <div style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#ff5f57" }} />
                <div style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#febc2e" }} />
                <div style={{ width:"7px",height:"7px",borderRadius:"50%",background:"#28c840" }} />
              </div>
              {renderChromeButtons()}
            </div>
            <div style={{ flex:1,overflow:"hidden",borderRadius:"0 0 11px 11px",display:"flex",flexDirection:"column" }}>
              {!currentJobId
                ? <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-0)" }}><span style={{ color:"var(--text-muted)",fontSize:"0.78rem" }}>Build a project first.</span></div>
                : <CodeViewer jobId={currentJobId} title={projects.find(p=>p.job_id===currentJobId)?.title||currentJobId} />
              }
            </div>
          </div>
        </>}
      </div>
      )}
      
    </div>
  );
}