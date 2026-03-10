// src/components/GoogleAuth.js
//
// Two exports:
//   1. GoogleLoginButton  — drop into SignIn.js and Register.js
//   2. GoogleAuthHandler  — add once to App.js (or SignIn.js) to consume
//      the token Google sends back in the URL fragment after OAuth redirect

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── 1. Button ─────────────────────────────────────────────────────────────────

export function GoogleLoginButton({ label = "Continue with Google" }) {
  const BACKEND = process.env.REACT_APP_BACKEND_URL || "/api-backend";

  const handleClick = () => {
    // Redirect browser to backend which redirects to Google
    window.location.href = `${BACKEND}/auth/google/login`;
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%",
        padding: "11px 16px",
        background: "#fff",
        border: "1px solid #333",
        borderRadius: "10px",
        color: "#111",
        fontSize: "0.88rem",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        transition: "all 0.2s",
        fontFamily: "Inter, Segoe UI, sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#f5f5f5";
        e.currentTarget.style.borderColor = "#555";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "#333";
      }}
    >
      {/* Google SVG logo */}
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      {label}
    </button>
  );
}

// ── 2. Handler — reads token from URL after Google redirects back ─────────────
// Place this component inside your SignIn page's render.
// It runs once on mount, reads the URL fragment, stores the token, redirects.

export function GoogleAuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Google redirects to: /signin?google=1#token=xxx&plan=yyy&email=zzz
    if (!window.location.hash) return;

    const params = new URLSearchParams(window.location.hash.replace("#", ""));
    const token  = params.get("token");
    const plan   = params.get("plan");
    const email  = params.get("email");

    if (!token) return;

    // Store exactly the same way regular login does
    localStorage.setItem("token", token);
    if (plan)  localStorage.setItem("user_plan", plan);
    if (email) localStorage.setItem("user_email", decodeURIComponent(email));

    // Clear the fragment from the URL so token isn't visible
    window.history.replaceState(null, "", "/signin");

    // Go straight to studio
    navigate("/studio");
  }, [navigate]);

  return null;
}

// ── 3. Divider — "or" separator between Google and email form ────────────────

export function OrDivider() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: "16px 0",
    }}>
      <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
      <span style={{ color: "#333", fontSize: "0.75rem", letterSpacing: "0.08em" }}>OR</span>
      <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
    </div>
  );
}