import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const email = localStorage.getItem("reset_email");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.post("/auth/reset-password", { email, password });
      setMessage("✅ Password updated!");
      localStorage.removeItem("reset_email");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to reset password");
    }
  };

  if (!email) {
    navigate("/login");
    return null;
  }

  return (
    <div style={{ height: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{
        padding: "1rem", background: "#000", borderBottom: "1px solid #222",
        display: "flex", justifyContent: "center", alignItems: "center"
      }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>The Hustler Bot</h2>
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
        {message && <p style={{ marginTop: "1rem", color: "#ccc", fontSize: "0.95rem" }}>{message}</p>}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px", marginBottom: "14px",
  borderRadius: "8px", border: "1px solid #444",
  backgroundColor: "#222", color: "#fff", fontSize: "1rem"
};

const btnStyle = {
  width: "100%", padding: "12px", backgroundColor: "#8b0000",
  color: "#fff", border: "none", borderRadius: "10px",
  fontSize: "1rem", cursor: "pointer"
};

export default ResetPassword;
