import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.post("/auth/send-reset-code", { email });
      localStorage.setItem("reset_email", email);
      setMessage("✅ Code sent to your email");
      setTimeout(() => navigate("/verify?mode=reset"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send code");
    }
  };

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
        <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Reset Your Password</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={btnStyle}>Send Code</button>
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

export default ChangePassword;
