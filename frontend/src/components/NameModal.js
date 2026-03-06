import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * NameModal
 * Shown once after a new user lands on the page post-registration.
 * Triggered by:  localStorage.getItem("show_name_modal") === "1"
 * On submit or skip: saves user_name to localStorage, removes the flag.
 */
function NameModal({ onDone }) {
  const [name, setName] = useState("");

  const save = (value) => {
    const email = localStorage.getItem("user_email") || "";
    const fallback = email.split("@")[0] || "there";
    const finalName = value.trim() || fallback;
    localStorage.setItem("user_name", finalName);
    localStorage.removeItem("show_name_modal");
    onDone(finalName);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{    opacity: 0, y: 32, scale: 0.95 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            width: "100%", maxWidth: "420px",
            background: "rgba(10,0,0,0.97)",
            border: "1px solid rgba(140,0,0,0.5)",
            borderRadius: "20px",
            padding: "36px 32px 28px",
            boxShadow: "0 0 60px rgba(180,0,0,0.3), 0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Pulse dot + heading */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{
              width: "9px", height: "9px", borderRadius: "50%",
              background: "#ff3333", flexShrink: 0,
              boxShadow: "0 0 8px #ff3333, 0 0 16px #ff3333",
              animation: "badgePulse 1.5s ease-in-out infinite",
            }} />
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
              What should we call you?
            </h2>
          </div>
          <p style={{ margin: "0 0 24px 19px", fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            We'll greet you by name every time you visit. Skip and we'll use your email handle.
          </p>

          {/* Input */}
          <input
            autoFocus
            type="text"
            placeholder="Your name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(name); }}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(140,0,0,0.4)",
              borderRadius: "12px",
              padding: "13px 16px",
              color: "#fff",
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "16px",
              caretColor: "#ff3333",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => {
              e.target.style.borderColor = "rgba(200,0,0,0.6)";
              e.target.style.boxShadow = "0 0 0 3px rgba(180,0,0,0.15)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "rgba(140,0,0,0.4)";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => save("")}
              style={{
                flex: 1, padding: "11px",
                background: "rgba(30,0,0,0.6)",
                border: "1px solid rgba(80,0,0,0.4)",
                borderRadius: "12px", color: "rgba(255,255,255,0.4)",
                fontSize: "0.9rem", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(140,0,0,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(80,0,0,0.4)"; }}
            >
              Skip
            </button>
            <button
              onClick={() => save(name)}
              style={{
                flex: 2, padding: "11px",
                background: "linear-gradient(135deg,#cc0000,#8b0000)",
                border: "none", borderRadius: "12px",
                color: "#fff", fontSize: "0.95rem", fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(180,0,0,0.4)",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(220,0,0,0.6)"; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(180,0,0,0.4)"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              Let's go
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NameModal;