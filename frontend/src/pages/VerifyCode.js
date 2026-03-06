import React, { useState, useEffect, useRef } from "react";
import API from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef(null);

  const isResetMode = new URLSearchParams(location.search).get("mode") === "reset";

  useEffect(() => {
    const storedEmail = localStorage.getItem(isResetMode ? "reset_email" : "verify_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate("/login");
    }
    inputRef.current?.focus();
  }, [isResetMode, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isResetMode ? "/auth/verify-reset-code" : "/verify/verify-code";
      await API.post(endpoint, { email, code });

      setMessage("✅ Code verified");

      setTimeout(() => {
        if (isResetMode) {
          navigate("/reset-password");
        } else {
          localStorage.removeItem("verify_email");
          // ── Trigger the name modal on the landing page ──
          localStorage.setItem("show_name_modal", "1");
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      const error = err.response?.data?.error;

      if (error === "Code has expired") {
        setMessage("❌ This code has expired. You can request a new one below.");
      } else if (error === "Invalid code") {
        setMessage("❌ The code you entered is incorrect.");
      } else if (error === "No code found for this email") {
        setMessage("❌ No code found. Please try registering again.");
      } else if (error === "You have reached the maximum of 5 codes today") {
        setMessage("⚠️ You've hit the daily limit for code requests. Try again tomorrow.");
      } else {
        setMessage("❌ Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setMessage("");
    setCooldown(30);
    try {
      await API.post("/verify/send-code", { email });
      setMessage("📨 A new code has been sent to your email.");
    } catch (err) {
      setMessage("❌ Failed to resend code. Try again shortly.");
      setCooldown(0);
    }
  };

  return (
    <div style={{ height: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: "1rem", background: "#000", borderBottom: "1px solid #222",
        display: "flex", justifyContent: "center", alignItems: "center"
      }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#fff" }}>The Hustler Bot</h2>
      </div>

      {/* Form */}
      <div style={{
        maxWidth: "400px", margin: "2rem auto", padding: "2rem",
        backgroundColor: "#111", borderRadius: "16px", boxShadow: "0 0 20px rgba(0,0,0,0.6)"
      }}>
        <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          {isResetMode ? "Reset Password: Enter Code" : "Verify Your Email"}
        </h3>

        <form onSubmit={handleVerify}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            required
            onChange={(e) => setCode(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {message && <p style={{ marginTop: "1rem", color: "#ccc", fontSize: "0.95rem" }}>{message}</p>}

        {!isResetMode && (
          <button
            onClick={handleResendCode}
            disabled={cooldown > 0}
            style={{ ...btnStyle, marginTop: "1rem", backgroundColor: "#444", opacity: cooldown > 0 ? 0.6 : 1 }}
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Code"}
          </button>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px", marginBottom: "14px",
  borderRadius: "8px", border: "1px solid #444",
  backgroundColor: "#222", color: "#fff", fontSize: "1rem",
};

const btnStyle = {
  width: "100%", padding: "12px", backgroundColor: "#8b0000",
  color: "#fff", border: "none", borderRadius: "10px",
  fontSize: "1rem", cursor: "pointer",
};

export default VerifyCode;