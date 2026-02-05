import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import Register from "./components/Register";
import VerifyOTP from "./components/VerifyOTP";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
        {/* Animated Glow Background Effects */}
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-pink-600/10 blur-[150px] animate-float-medium pointer-events-none" />

        {/* Global Navigation bar */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to="/login" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/25">
                <ShieldCheck className="h-5.5 w-5.5" />
              </span>
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                SecureAuth
              </span>
            </Link>
            <div className="flex items-center gap-5 text-sm font-medium text-slate-400">
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              <Link to="/verify-otp" className="hover:text-white transition-colors">Verify OTP</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </nav>

        {/* Primary Screen Area */}
        <main className="relative z-10 flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;