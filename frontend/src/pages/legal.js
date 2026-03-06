import React from "react";
import { useNavigate } from "react-router-dom";

function Legal() {
  const navigate = useNavigate();

  return (
    <div style={container}>
      <button onClick={() => navigate(-1)} style={backButton}>← Back</button>

      <div style={content}>
        <h1 style={title}>About The Hustler Bot</h1>
        <p style={paragraph}>
          The Hustler Bot is an AI-powered chatbot developed by DIYAR TAREQ TRADING L.L.C to help aspiring and experienced entrepreneurs build successful businesses and strategies. The chatbot offers guidance on startup ideas, marketing tactics, funding tips, growth planning, and other essential tools that empower users to make better business decisions. Whether you're validating a business model or refining your pitch, The Hustler Bot is designed to act like a smart, always-available AI business assistant.
        </p>

        <h1 style={title}>Privacy Policy</h1>
        <p style={paragraph}>
          At DIYAR TAREQ TRADING L.L.C, we care deeply about your privacy. This policy explains what information we collect when you use our AI chatbot service, and how we protect and use that information.
        </p>
        <p style={paragraph}>
          <strong>What we collect:</strong> When you sign up or interact with our platform, we may collect your email address, subscription details, and general usage data (like time of access or feature usage). We do not save your conversations unless it's required for diagnostics.
        </p>
        <p style={paragraph}>
          <strong>How we use your data:</strong> Your information helps us verify your access, provide technical support, improve features, and communicate important updates. We never sell or share your personal data with unrelated third parties.
        </p>
        <p style={paragraph}>
          <strong>Security:</strong> Your data is securely stored, encrypted, and only accessed by authorized team members. We also work with trusted providers like Paddle for billing and secure payment handling.
        </p>
        <p style={paragraph}>
          <strong>Want your data deleted or changed?</strong> Just email us at <a href="mailto:support@thehustlerbot.com" style={link}>support@thehustlerbot.com</a> and we’ll take care of it promptly.
        </p>

        <h1 style={title}>Terms of Use</h1>
        <p style={paragraph}>
          By using this service, you agree to follow these terms. If you don’t agree with them, please don’t use the chatbot.
        </p>
        <p style={paragraph}>
          <strong>Fair use:</strong> You can use the chatbot for your own personal or business productivity, research, or learning. Please don’t use it for anything harmful, abusive, illegal, or misleading.
        </p>
        <p style={paragraph}>
          <strong>Don't misuse the system:</strong>
        </p>
        <ul style={list}>
          <li>No spamming or flooding the system with requests</li>
          <li>No scraping, hacking, or reverse engineering</li>
          <li>No attempts to trick the system into producing dangerous content</li>
        </ul>
        <p style={paragraph}>
          <strong>Disclaimer:</strong> The chatbot is powered by AI and generates content automatically. While we strive for accuracy, we can't guarantee every output will be perfect. Always double-check information before making important decisions.
        </p>
        <p style={paragraph}>
          <strong>Access and enforcement:</strong> DIYAR TAREQ TRADING L.L.C may suspend or restrict access if misuse is detected or if payments fail. We may also update these terms from time to time.
        </p>

        <h1 style={title}>Refund Policy</h1>
        <p style={paragraph}>
          We want you to be satisfied with your subscription, but we also need to keep things fair and sustainable.
        </p>
        <p style={paragraph}>
          <strong>Refunds are granted if requested within 14 days:</strong>
        </p>
        <ul style={list}>
          <li>You were charged incorrectly or multiple times</li>
          <li>You paid but couldn’t access the service due to a technical issue</li>
          <li>Key features promised at purchase were not available</li>
        </ul>
        <p style={paragraph}>
          <strong>Refunds are not granted if:</strong>
        </p>
        <ul style={list}>
          <li>You used the service and simply changed your mind</li>
          <li>You expected different results from the chatbot’s responses</li>
          <li>You forgot to cancel before your subscription renewed</li>
        </ul>
        <p style={paragraph}>
          To request a refund, please email <a href="mailto:support@thehustlerbot.com" style={link}>support@thehustlerbot.com</a> within 14 days of the charge. Include your email, payment ID, and a brief explanation. We’ll review your case within 5 business days.
        </p>
        <p style={paragraph}>
          You can cancel your subscription anytime to avoid future charges. Canceling does not refund the current billing period.
        </p>
      </div>
    </div>
  );
}

// 💄 Styling
const container = {
  backgroundColor: "#000",
  color: "#eee",
  fontFamily: "Segoe UI, sans-serif",
  minHeight: "100vh",
  padding: "2rem",
  overflowY: "auto",
};

const content = {
  maxWidth: "800px",
  margin: "0 auto",
  backgroundColor: "#111",
  borderRadius: "1.5rem",
  padding: "2rem",
  boxShadow: "0 0 40px rgba(0,0,0,0.7)",
};

const title = {
  fontSize: "1.6rem",
  color: "#fff",
  marginTop: "2rem",
};

const paragraph = {
  fontSize: "1rem",
  lineHeight: "1.6",
  color: "#ccc",
  marginBottom: "1rem",
};

const list = {
  paddingLeft: "1.5rem",
  marginBottom: "1rem",
  color: "#ccc",
  lineHeight: "1.6",
};

const link = {
  color: "#f66",
  textDecoration: "underline",
};

const backButton = {
  backgroundColor: "#8b0000",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 18px",
  fontSize: "1rem",
  cursor: "pointer",
  marginBottom: "2rem",
};

export default Legal;
