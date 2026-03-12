import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import API from "./api/api";
import SignIn from "./pages/SignIn";
import Legal from "./pages/legal";
import VerifyCode from "./pages/VerifyCode";
import Register from "./pages/Register";
import EnterPassword from "./pages/EnterPassword";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import LandingPage from "./pages/LandingPage";
import PaddleCheckoutPage from "./pages/PaddleCheckoutPage";
import SubscribePage from "./pages/SubscribePage";
import Studio from "./pages/Studio";
import AdminDashboard from "./pages/AdminDashboard";
import TemplatesPage from "./pages/TemplatesPage";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import GithubCallback from "./pages/GithubCallback";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

/* ─── Stable device fingerprint ─── */
function getDeviceId() {
  const KEY = "hb_did";
  let id = localStorage.getItem(KEY);
  if (!id || id.length < 8) {
    id = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}

function getSessionId() {
  const KEY = "hb_sid";
  let id = sessionStorage.getItem(KEY);
  if (!id || id.length < 8) {
    id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

function PageTracker() {
  const location = useLocation();
  const lastTracked = useRef(null);
  const sessionId = useRef(getSessionId());
  const deviceId = useRef(getDeviceId());
  const pageEntryTime = useRef(Date.now());

  useEffect(() => {
    const page = location.pathname;
    if (page === lastTracked.current) return;

    /* ── Send time-on-page for PREVIOUS page ── */
    const timeSpent = Math.round((Date.now() - pageEntryTime.current) / 1000);
    if (lastTracked.current && timeSpent > 0) {
      API.post("/auth/track", {
        page: lastTracked.current,
        session_id: sessionId.current,
        device_id: deviceId.current,
        referrer: document.referrer || "",
        time_on_page: timeSpent,
      }).catch(() => {});
    }

    /* ── Track entry to NEW page ── */
    pageEntryTime.current = Date.now();
    lastTracked.current = page;
    API.post("/auth/track", {
      page,
      session_id: sessionId.current,
      device_id: deviceId.current,
      referrer: document.referrer || "",
      time_on_page: 0,
    }).catch(() => {});
  }, [location.pathname]);

  /* ── Beacon on tab close (proper JSON Blob so Flask parses it) ── */
  useEffect(() => {
    const handleUnload = () => {
      const timeSpent = Math.round((Date.now() - pageEntryTime.current) / 1000);
      if (lastTracked.current && timeSpent > 2) {
        const blob = new Blob(
          [JSON.stringify({
            page: lastTracked.current,
            session_id: sessionId.current,
            device_id: deviceId.current,
            referrer: document.referrer || "",
            time_on_page: timeSpent,
          })],
          { type: "application/json" }
        );
        navigator.sendBeacon("/api-backend/auth/track", blob);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return null;
}

function App() {
  const token = localStorage.getItem("token");
  return (
    <>
      <PageTracker />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/studio" /> : <LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/enter-password" element={<EnterPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyCode />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/paddle-checkout" element={<PaddleCheckoutPage />} />
        <Route path="/subscribe" element={<SubscribePage />} />
        <Route path="/studio" element={<PrivateRoute><Studio /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/github-callback" element={<GithubCallback />} />
      </Routes>
    </>
  );
}

export default App;