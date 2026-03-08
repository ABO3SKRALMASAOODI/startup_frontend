import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRive } from "rive-react";

const StickyNavbar = ({ userName }) => {
  const [scrolled, setScrolled] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const hideBot    = location.pathname === "/";
  const isLoggedIn = !!localStorage.getItem("token");
  const userEmail  = localStorage.getItem("user_email") || "";

  // Display initial: first letter of name if available, else email
  const displayName = userName || localStorage.getItem("user_name") || userEmail.split("@")[0] || "U";
  const initial = displayName[0]?.toUpperCase() || "U";

  const { RiveComponent: SmallBot } = useRive({
    src: "/small-navbar-bot.riv",
    autoplay: true,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 w-full px-6 py-4 z-50 backdrop-blur-md"
      style={{
        background: scrolled ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.6)",
        borderBottom: scrolled ? "1px solid rgba(80,0,0,0.3)" : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.5)" : "none",
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LEFT: account avatar (logged-in) + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {isLoggedIn && (
            <button
              onClick={() => navigate("/account")}
              title={displayName}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg,#8b0000,#4a0000)",
                border: "2px solid rgba(140,0,0,0.5)",
                color: "#fff", fontSize: "0.88rem", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 14px rgba(140,0,0,0.5)",
                transition: "all 0.2s ease", flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "linear-gradient(135deg,#cc0000,#7a0000)";
                e.currentTarget.style.boxShadow = "0 0 22px rgba(200,0,0,0.7)";
                e.currentTarget.style.borderColor = "rgba(255,80,80,0.5)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "linear-gradient(135deg,#8b0000,#4a0000)";
                e.currentTarget.style.boxShadow = "0 0 14px rgba(140,0,0,0.5)";
                e.currentTarget.style.borderColor = "rgba(140,0,0,0.5)";
              }}
            >
              {initial}
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-[0_0_5px_#ff1a1a]"
          >
            {!hideBot && (
              <div className="w-8 h-8">
                <SmallBot style={{ width: "100%", height: "100%" }} />
              </div>
            )}
            The Hustler Bot
          </Link>
        </div>

        {/* RIGHT: nav links */}
        <div className="flex items-center gap-6">
          <Link to="/features" className="text-white hover:text-red-500 transition">
            Features
          </Link>

          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => navigate("/studio")}
                style={{
                  background: "linear-gradient(135deg,#cc0000,#8b0000)",
                  border: "none", borderRadius: "10px",
                  padding: "8px 20px", color: "#fff",
                  fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 0 14px rgba(180,0,0,0.4)",
                  transition: "box-shadow 0.2s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(200,0,0,0.65)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(180,0,0,0.4)"}
              >
                Dashboard
              </button>

              {userEmail === "thehustlerbot@gmail.com" && (
                <button
                  onClick={() => navigate("/admin")}
                  style={{
                    background: "rgba(220,0,0,0.08)",
                    border: "1px solid rgba(220,0,0,0.25)",
                    borderRadius: "10px", padding: "8px 14px",
                    color: "rgba(220,0,0,0.7)", fontSize: "0.82rem",
                    fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(220,0,0,0.18)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(220,0,0,0.08)";
                    e.currentTarget.style.color = "rgba(220,0,0,0.7)";
                  }}
                >
                  ⚙ Admin
                </button>
              )}
            </div>
          ) : (
            <>
              <Link to="/register" className="text-white hover:text-red-500 transition">
                Register
              </Link>
              <Link to="/login" className="text-white hover:text-red-500 transition">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default StickyNavbar;