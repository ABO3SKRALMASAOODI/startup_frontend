import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PurchaseSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire Google Ads purchase conversion
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-18011432056/_4tiCMrMqoccEPjIwoxD",
        value: 1.0,
        currency: "AED",
        transaction_id: "",
      });
    }

    // Redirect to studio after 2 seconds
    const timer = setTimeout(() => navigate("/studio"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ padding: "50px", textAlign: "center", background: "#05050A", minHeight: "100vh", color: "#EEEAE2", fontFamily: "sans-serif" }}>
      <h1>Payment successful!</h1>
      <p style={{ marginTop: "1rem", color: "#58585F" }}>Redirecting you to the studio...</p>
    </div>
  );
}