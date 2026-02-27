import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Register from "./components/Register";
import VerifyOTP from "./components/VerifyOTP";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col">

        {/* Navbar */}
        <nav className="bg-white/20 backdrop-blur-md text-white p-4 flex justify-center gap-6 font-semibold">
          <Link to="/register">Register</Link>
          <Link to="/verify-otp">Verify OTP</Link>
          <Link to="/login">Login</Link>
          <Link to="/forgot-password">Forgot</Link>
          <Link to="/reset-password">Reset</Link>
        </nav>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center p-6">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;