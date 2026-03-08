import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info");
  const email = localStorage.getItem("reset_email");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/auth/reset-password", { email, password });
      setMessage("Password updated!");
      setMsgType("success");
      localStorage.removeItem("reset_email");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to reset password");
      setMsgType("error");
    }
  };

  if (!email) {
    navigate("/login");
    return null;
  }

  const msgColor = msgType === "success" ? "#4caf50" : msgType === "error" ? "#ff4444" : "#aaa";

  return (
    <div style={{ height: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{
        padding: "1rem", background: "#000", borderBottom: "1px solid #222",
        display: "flex", alignItems: "center", position: "relative"
      }}>
        <button
          onClick={() => navigate(-1)}
          style={backBtnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#fff", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>The Hustler Bot</h2>
      </div>

      <div style={{
        maxWidth: "400px", margin: "2rem auto", padding: "2rem",
        backgroundColor: "#111", borderRadius: "16px", boxShadow: "0 0 20px rgba(0,0,0,0.6)"
      }}>
        <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Set New Password</h3>

        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={btnStyle}>Update Password</button>
        </form>

        {message && <p style={{ marginTop: "1rem", fontSize: "0.95rem", color: msgColor }}>{message}</p>}
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

export default ResetPassword;