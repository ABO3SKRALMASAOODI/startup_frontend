import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../api/api";

function EnterPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const params   = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || null;
  const prompt   = params.get("prompt")   || null;
  const template = params.get("template") || null;

  useEffect(() => {
    const emailFromURL = params.get("email");
    if (emailFromURL) setEmail(emailFromURL);
    else navigate("/login");
  }, [location, navigate, params]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/auth/login", { email, password });
      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user_email", email);

      // Restore name from localStorage if already set (returning user)
      // No name modal on login — that only fires after first registration

      // Template clone flow
      if (template) {
        try {
          setMessage("Cloning template...");
          const res = await API.post("/auth/template/clone", { template_id: template });
          navigate(`/studio?cloned=${res.data.job_id}`);
          return;
        } catch (err) {
          console.error("Template clone failed after login:", err);
        }
      }

      if (redirect === "studio" && prompt) {
        navigate(`/studio?prompt=${prompt}`);
        return;
      }

      navigate("/studio");
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
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

      <div style={boxStyle}>
        <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Enter Your Password</h3>

        {prompt && (
          <div style={infoBannerStyle}>
            <strong style={{ color: "#ff6666" }}>Your prompt is saved:</strong><br />
            "{decodeURIComponent(prompt).slice(0, 80)}{decodeURIComponent(prompt).length > 80 ? "..." : ""}"
          </div>
        )}

        {template && !prompt && (
          <div style={infoBannerStyle}>
            <strong style={{ color: "#ff6666" }}>Template ready to clone after login</strong>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ ...btnStyle, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p style={messageStyle}>{message}</p>}

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          <Link to="/change-password" style={linkStyle}>Forgot or Change Password?</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle    = { minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" };
const headerStyle  = { padding: "1rem", background: "#000", borderBottom: "1px solid #222", display: "flex", alignItems: "center", position: "relative" };
const backBtnStyle = { background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", padding: "6px 14px", fontSize: "0.85rem", cursor: "pointer", transition: "border-color 0.2s" };
const boxStyle     = { maxWidth: "400px", margin: "2rem auto", padding: "2rem", backgroundColor: "#111", borderRadius: "16px", boxShadow: "0 0 20px rgba(0,0,0,0.6)" };
const infoBannerStyle = { background: "#1a0000", border: "1px solid #3a0000", borderRadius: "10px", padding: "10px 14px", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#ffaaaa" };
const inputStyle   = { width: "100%", padding: "12px", marginBottom: "14px", borderRadius: "8px", border: "1px solid #444", backgroundColor: "#222", color: "#fff", fontSize: "1rem", boxSizing: "border-box" };
const btnStyle     = { width: "100%", padding: "12px", backgroundColor: "#8b0000", color: "#fff", border: "none", borderRadius: "10px", fontSize: "1rem", cursor: "pointer" };
const messageStyle = { marginTop: "1rem", color: "#ccc", fontSize: "0.95rem", textAlign: "center" };
const linkStyle    = { color: "#f55", textDecoration: "underline", cursor: "pointer" };

export default EnterPassword;