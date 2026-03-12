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

  useEffect(() => {
    const page = location.pathname;
    if (page === lastTracked.current) return;
    lastTracked.current = page;
    API.post("/auth/track", { page }).catch(() => {});
  }, [location.pathname]);

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