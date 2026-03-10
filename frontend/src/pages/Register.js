import React, { useState } from "react";
import API from "../api/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLoginButton, OrDivider } from "../components/GoogleAuth";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || null;
  const prompt = searchParams.get("prompt") || null;
  const template = searchParams.get("template") || null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/auth/register", { email, password });
      localStorage.setItem("verify_email", email);
      sessionStorage.setItem("pending_password", password);
      if (redirect) sessionStorage.setItem("post_verify_redirect", redirect);
      if (prompt) sessionStorage.setItem("post_verify_prompt", prompt);
      if (template) sessionStorage.setItem("post_verify_template", template);
      setMessage("Verification code sent to your email.");
      setMsgType("success");
      navigate("/verify");
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
      setMsgType("error");
    }
  };

  const msgColor = msgType === "success" ? "#4caf50" : msgType === "error" ? "#ff4444" : "#aaa";

  return (
    <div style={{ height: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "1rem", background: "#000", borderBottom: "1px solid #222", display: "flex", alignItems: "center", position: "relative" }}>
        <button
          onClick={() => navigate("/login")}
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
        <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Create Your Account</h3>

        {template && (
          <div style={{
            background: "#1a0000", border: "1px solid #3a0000",
            borderRadius: "10px", padding: "10px 14px",
            marginBottom: "1.5rem", fontSize: "0.85rem", color: "#ffaaaa",
          }}>
            <strong style={{ color: "#ff6666" }}>Template ready to clone after signup</strong>
          </div>
        )}

        <GoogleLoginButton label="Sign up with Google" />
        <OrDivider />

        <form onSubmit={handleRegister}>
          <input type="email" placeholder="Email" value={email} required onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} required onChange={e => setPassword(e.target.value)} style={inputStyle} />
          <button type="submit" style={btnStyle}>Register</button>
        </form>

        {message && <p style={{ marginTop: "1rem", fontSize: "0.95rem", color: msgColor }}>{message}</p>}

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link
            to={`/login${redirect ? `?redirect=${redirect}` : ""}${prompt ? `&prompt=${prompt}` : ""}${template ? `${redirect || prompt ? "&" : "?"}template=${template}` : ""}`}
            style={linkStyle}
          >
            Login
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
  background: "transparent",
  border: "1px solid #333",
  color: "#aaa",
  borderRadius: "8px",
  padding: "6px 14px",
  fontSize: "0.85rem",
  cursor: "pointer",
  transition: "border-color 0.2s",
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

export default Register;