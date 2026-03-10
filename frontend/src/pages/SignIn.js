import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { GoogleLoginButton, GoogleAuthHandler, OrDivider } from "../components/GoogleAuth";

function SignIn() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || null;
  const prompt = searchParams.get("prompt") || null;
  const template = searchParams.get("template") || null;

  const handleNext = (e) => {
    e.preventDefault();
    setMessage("");
    if (!email) { setMessage("Please enter your email"); return; }
    localStorage.removeItem("seen_intro");

    let nextUrl = `/enter-password?email=${encodeURIComponent(email)}`;
    if (redirect) nextUrl += `&redirect=${encodeURIComponent(redirect)}`;
    if (prompt) nextUrl += `&prompt=${encodeURIComponent(prompt)}`;
    if (template) nextUrl += `&template=${encodeURIComponent(template)}`;
    navigate(nextUrl);
  };

  return (
    <div style={{ height: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Handles token from Google OAuth redirect */}
      <GoogleAuthHandler />

      {/* Header */}
      <div style={{ padding: "1rem", background: "#000", borderBottom: "1px solid #222", display: "flex", alignItems: "center", position: "relative" }}>
        <button
          onClick={() => navigate("/home")}
          style={backBtnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#fff", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          The Hustler Bot
        </h2>
      </div>

      {/* Form */}
      <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem", backgroundColor: "#111", borderRadius: "16px", boxShadow: "0 0 20px rgba(0,0,0,0.6)" }}>
        <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Welcome Back</h3>

        {prompt && (
          <div style={{ background: "#1a0000", border: "1px solid #3a0000", borderRadius: "10px", padding: "10px 14px", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#ffaaaa" }}>
            <strong style={{ color: "#ff6666" }}>Your prompt is saved:</strong><br />
            "{decodeURIComponent(prompt).slice(0, 80)}{decodeURIComponent(prompt).length > 80 ? "..." : ""}"
          </div>
        )}

        {template && !prompt && (
          <div style={{ background: "#1a0000", border: "1px solid #3a0000", borderRadius: "10px", padding: "10px 14px", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#ffaaaa" }}>
            <strong style={{ color: "#ff6666" }}>Template ready to clone after login</strong>
          </div>
        )}

        <GoogleLoginButton label="Continue with Google" />
        <OrDivider />

        <form onSubmit={handleNext}>
          <input type="email" placeholder="Email" value={email} required onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <button type="submit" style={btnStyle}>Next →</button>
        </form>

        {message && <p style={{ marginTop: "1rem", color: "#ccc", fontSize: "0.95rem", textAlign: "center" }}>{message}</p>}

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link
            to={`/register${redirect ? `?redirect=${redirect}` : ""}${prompt ? `&prompt=${prompt}` : ""}${template ? `${redirect || prompt ? "&" : "?"}template=${template}` : ""}`}
            style={linkStyle}
          >
            Register
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
          <Link to="/legal" style={linkStyle}>View Terms & Policies</Link>
        </p>
      </div>
    </div>
  );
}

const backBtnStyle = {
  background: "transparent", border: "1px solid #333",
  color: "#aaa", borderRadius: "8px", padding: "6px 14px",
  fontSize: "0.85rem", cursor: "pointer", transition: "border-color 0.2s",
};

const inputStyle = {
  width: "100%", padding: "12px", marginBottom: "14px",
  borderRadius: "8px", border: "1px solid #444",
  backgroundColor: "#222", color: "#fff", fontSize: "1rem",
  boxSizing: "border-box",
};

const btnStyle = {
  width: "100%", padding: "12px", backgroundColor: "#8b0000",
  color: "#fff", border: "none", borderRadius: "10px",
  fontSize: "1rem", cursor: "pointer",
};

const linkStyle = { color: "#f55", textDecoration: "underline", cursor: "pointer" };

export default SignIn;