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

function PageTracker() {
  const location = useLocation();
  const lastTracked = useRef(null);

  const sessionId = useRef(
    sessionStorage.getItem("hb_sid") || (() => {
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("hb_sid", id);
      return id;
    })()
  );

  const deviceId = useRef(
    localStorage.getItem("hb_did") || (() => {
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("hb_did", id);
      return id;
    })()
  );

  const pageEntryTime = useRef(Date.now());

  useEffect(() => {
    const page = location.pathname;
    if (page === lastTracked.current) return;

    const timeSpent = Math.round((Date.now() - pageEntryTime.current) / 1000);
    if (lastTracked.current) {
      API.post("/auth/track", {
        page: lastTracked.current,
        session_id: sessionId.current,
        device_id: deviceId.current,
        referrer: document.referrer || "",
        time_on_page: timeSpent,
      }).catch(() => {});
    }

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

  useEffect(() => {
    const handleUnload = () => {
      const timeSpent = Math.round((Date.now() - pageEntryTime.current) / 1000);
      if (lastTracked.current && timeSpent > 2) {
        navigator.sendBeacon(
          "/api-backend/auth/track",
          JSON.stringify({
            page: lastTracked.current,
            session_id: sessionId.current,
            device_id: deviceId.current,
            referrer: document.referrer || "",
            time_on_page: timeSpent,
          })
        );
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