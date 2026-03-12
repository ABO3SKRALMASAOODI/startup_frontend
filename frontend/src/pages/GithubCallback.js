import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function GithubCallback() {
  const navigate  = useNavigate();
  const [status, setStatus] = useState("Connecting to GitHub...");
  const [error,  setError]  = useState("");

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const code    = params.get("code");
    const jobId   = sessionStorage.getItem("github_push_job_id");
    const jobTitle = sessionStorage.getItem("github_push_job_title") || "your project";

    if (!code) {
      setError("No code returned from GitHub.");
      return;
    }

    const run = async () => {
      try {
        setStatus("Exchanging token with GitHub...");
        const tokenRes = await API.post("/auth/github/token", { code });
        const accessToken = tokenRes.data.access_token;

        if (!jobId) {
          // No job to push — just save token and go back to studio
          sessionStorage.setItem("github_access_token", accessToken);
          navigate("/studio");
          return;
        }

        setStatus(`Pushing "${jobTitle}" to GitHub...`);
        const pushRes = await API.post(`/auth/github/push/${jobId}`, {
          access_token: accessToken,
        });

        sessionStorage.removeItem("github_push_job_id");
        sessionStorage.removeItem("github_push_job_title");

        const repoUrl = pushRes.data.repo_url;
        sessionStorage.setItem("github_result", JSON.stringify({
          repo_url:     repoUrl,
          files_pushed: pushRes.data.files_pushed,
          job_id:       jobId,
        }));

        setStatus("Done! Redirecting...");
        window.location.href = repoUrl;
      } catch (err) {
        const msg = err?.response?.data?.error || "Something went wrong.";
        setError(msg);
      }
    };

    run();
  }, []); // eslint-disable-line

  return (
    <div style={{
      minHeight: "100vh", background: "#05050A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif", gap: "20px",
    }}>
      {/* GitHub logo */}
      <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff" style={{ opacity: 0.9 }}>
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>

      {error ? (
        <>
          <p style={{ color: "#ff6b6b", fontSize: "1rem", textAlign: "center", maxWidth: "320px" }}>
            ❌ {error}
          </p>
          <button
            onClick={() => navigate("/studio")}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #cc0000, #8b0000)",
              border: "none", borderRadius: "8px",
              color: "#fff", fontSize: "0.9rem",
              cursor: "pointer", fontWeight: 600,
            }}
          >
            Back to Studio
          </button>
        </>
      ) : (
        <>
          <div style={{
            width: "32px", height: "32px",
            border: "3px solid #1a1a1a",
            borderTop: "3px solid #cc0000",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ color: "#aaa", fontSize: "0.95rem" }}>{status}</p>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}