import React, { useState, useEffect, useRef } from "react";
import API from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info"); // "success" | "error" | "info" | "warning"
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

      if (isResetMode) {
        setMessage("Code verified");
        setMsgType("success");
        setTimeout(() => navigate("/reset-password"), 1000);
      } else {
        // Problem 2: Auto-login after successful email verification
        setMessage("Email verified — logging you in...");
        setMsgType("success");

        // Get the password from the registration flow (we'll store it temporarily)
        const tempPassword = sessionStorage.getItem("pending_password");
        
        if (tempPassword) {
          try {
            const loginRes = await API.post("/auth/login", { email, password: tempPassword });
            const token = loginRes.data.token;
            localStorage.setItem("token", token);
            localStorage.setItem("user_email", email);
            localStorage.setItem("user_plan", loginRes.data.plan || "free");
            localStorage.removeItem("verify_email");
            sessionStorage.removeItem("pending_password");

            // Trigger name modal on landing
            localStorage.setItem("show_name_modal", "1");

            // Check for redirect params saved during auto-register flow
            const savedRedirect = sessionStorage.getItem("post_verify_redirect");
            const savedPrompt = sessionStorage.getItem("post_verify_prompt");
            const savedTemplate = sessionStorage.getItem("post_verify_template");
            sessionStorage.removeItem("post_verify_redirect");
            sessionStorage.removeItem("post_verify_prompt");
            sessionStorage.removeItem("post_verify_template");

            // Handle template clone
            if (savedTemplate) {
              try {
                const res = await API.post("/auth/template/clone", { template_id: savedTemplate });
                navigate(`/studio?cloned=${res.data.job_id}`);
                return;
              } catch {
                // Fall through to normal redirect
              }
            }

            // Handle prompt redirect
            if (savedRedirect === "studio" && savedPrompt) {
              navigate(`/studio?prompt=${savedPrompt}`);
              return;
            }

            // Default: go to studio with name modal flag
            setTimeout(() => navigate("/studio"), 500);
          } catch {
            // Auto-login failed, fallback to manual login
            setMessage("Verified! Please log in.");
            setMsgType("success");
            localStorage.removeItem("verify_email");
            localStorage.setItem("show_name_modal", "1");
            setTimeout(() => navigate("/login"), 1500);
          }
        } else {
          // No stored password — fallback to manual login
          setMessage("Verified! Redirecting to login...");
          setMsgType("success");
          localStorage.removeItem("verify_email");
          localStorage.setItem("show_name_modal", "1");
          setTimeout(() => navigate("/login"), 1500);
        }
      }
    } catch (err) {
      const error = err.response?.data?.error;

      if (error === "Code has expired") {
        setMessage("This code has expired. You can request a new one below.");
        setMsgType("error");
      } else if (error === "Invalid code" || error === "Incorrect code") {
        setMessage("The code you entered is incorrect.");
        setMsgType("error");
      } else if (error === "No code found for this email" || error === "No code found") {
        setMessage("No code found. Please try registering again.");
        setMsgType("error");
      } else if (error === "You have reached the maximum of 5 codes today") {
        setMessage("You've hit the daily limit for code requests. Try again tomorrow.");
        setMsgType("warning");
      } else {
        setMessage("Verification failed. Please try again.");
        setMsgType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setMessage("");
    setCooldown(30);
    try {
      if (isResetMode) {
        // Problem 3: Resend code in reset mode uses the reset endpoint
        await API.post("/auth/send-reset-code", { email });
      } else {
        await API.post("/verify/send-code", { email });
      }
      setMessage("A new code has been sent to your email.");
      setMsgType("success");
    } catch (err) {
      setMessage("Failed to resend code. Try again shortly.");
      setMsgType("error");
      setCooldown(0);
    }
  };

  const msgColor = msgType === "success" ? "#4caf50" : msgType === "error" ? "#ff4444" : msgType === "warning" ? "#f0a500" : "#aaa";

  return (
    <div style={{ height: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: "1rem", background: "#000", borderBottom: "1px solid #222",
        display: "flex", alignItems: "center", position: "relative"
      }}>
        <button
          onClick={() => navigate(isResetMode ? "/login" : "/register")}
          style={{ background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", padding: "6px 14px", fontSize: "0.85rem", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#8b0000"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#fff", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>The Hustler Bot</h2>
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

        {message && <p style={{ marginTop: "1rem", fontSize: "0.95rem", color: msgColor }}>{message}</p>}

        {/* Problem 3: Show resend button in BOTH modes */}
        <button
          onClick={handleResendCode}
          disabled={cooldown > 0}
          style={{ ...btnStyle, marginTop: "1rem", backgroundColor: "#444", opacity: cooldown > 0 ? 0.6 : 1 }}
        >
          {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Code"}
        </button>
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