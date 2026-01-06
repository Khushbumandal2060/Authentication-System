import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Register from "./components/Register";
import VerifyOTP from "./components/VerifyOTP";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-900">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-base">
                A
              </span>
              SecureAuth
            </Link>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Link to="/register" className="hover:text-white">Register</Link>
              <Link to="/verify-otp" className="hover:text-white">Verify OTP</Link>
              <Link to="/login" className="hover:text-white">Login</Link>
              <Link to="/forgot-password" className="hover:text-white">Forgot</Link>
              <Link to="/reset-password" className="hover:text-white">Reset</Link>
            </div>
          </div>
        </nav>

        <main className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_18%),radial-gradient(circle_at_bottom,_rgba(139,92,246,0.12),_transparent_18%)]" />
          <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Login />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;