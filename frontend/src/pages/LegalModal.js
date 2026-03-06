import React from "react";

function LegalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem"
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontSize: "1.5rem",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
        >
          ×
        </button>

        <h2 style={{ marginTop: 0 }}>Privacy Policy</h2>
        <p>
          Your privacy is important to us. We collect and use personal data solely
          for account creation, billing, and improving the chatbot experience. We do not
          sell your data.
        </p>

        <h2>Terms of Use</h2>
        <p>
          By using this chatbot, you agree to use it responsibly and lawfully. You may
          not share harmful content, misuse AI outputs, or violate any applicable laws.
        </p>

        <h2>Refund Policy</h2>
        <p>
          All purchases are final. If you encounter a technical issue or billing error,
          please contact support for assistance. Refunds are reviewed on a case-by-case basis.
        </p>
      </div>
    </div>
  );
}

export default LegalModal;
