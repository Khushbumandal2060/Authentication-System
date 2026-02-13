import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, KeyRound, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import API from "../api/api";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("password"); // "password" or "passwordless"
  const [step, setStep] = useState(1); // 1: send email, 2: enter OTP (only for passwordless)
  const [form, setForm] = useState({ email: "", password: "" });
  
  // OTP array for passwordless
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle individual OTP digits change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && isNaN(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.substring(value.length - 1); // take only last char
    setOtpDigits(newOtp);

    // Focus next box
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Handle backspace to jump back
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && !isNaN(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      otpRefs[5].current.focus();
    }
  };

  const handlePasswordlessRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await API.post("/passwordless-login-request", { email: form.email });
      setMessage(res.data.message);
      setIsError(false);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification request failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordlessVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setMessage("Please enter a valid 6-digit code");
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/passwordless-login-verify", { email: form.email, otp });
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("userEmail", form.email);
      setMessage("Sign-in successful!");
      setIsError(false);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid sign-in code");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await API.post("/login", form);
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("userEmail", form.email);
      setMessage(res.data.message);
      setIsError(false);
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setIsError(true);
      
      // If user is unverified, redirect to verify-otp
      if (err.response?.data?.unverified) {
        localStorage.setItem("unverifiedEmail", form.email);
        setTimeout(() => {
          navigate("/verify-otp");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "password" ? "passwordless" : "password");
    setStep(1);
    setMessage("");
    setOtpDigits(["", "", "", "", "", ""]);
  };

  return (
    <div className="auth-card relative overflow-hidden">
      {/* Visual Accent Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          Welcome back
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          {mode === "password" 
            ? "Sign in to access your secure environment" 
            : "Sign in instantly via one-time secure email code"}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-slate-950/60 p-1 border border-white/[0.04]">
        <button
          type="button"
          onClick={() => mode !== "password" && toggleMode()}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
            mode === "password" 
              ? "bg-slate-800 text-white shadow" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Password Access
        </button>
        <button
          type="button"
          onClick={() => mode !== "passwordless" && toggleMode()}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
            mode === "passwordless" 
              ? "bg-slate-800 text-white shadow" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Email OTP
        </button>
      </div>

      {message && (
        <div className={`mb-6 ${isError ? "message-error" : "message-success"}`}>
          {message}
        </div>
      )}

      {/* Standard Login */}
      {mode === "password" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="auth-input pl-11"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="auth-input pl-11 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="auth-button gap-2 mt-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Login <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Passwordless OTP Flow */}
      {mode === "passwordless" && (
        <>
          {step === 1 ? (
            <form onSubmit={handlePasswordlessRequest} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className="auth-input pl-11"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="auth-button gap-2 mt-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send Login Code <KeyRound className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordlessVerify} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-300">
                  Verification code sent to <span className="font-semibold text-white">{form.email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Edit email address
                </button>
              </div>

              {/* 6-digit code input */}
              <div className="flex justify-between gap-2.5" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-slate-950/40 text-center text-lg font-bold text-white transition-all focus:border-indigo-500 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading} className="auth-button gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify & Login <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}

      <div className="mt-8 flex items-center justify-between text-xs">
        <Link to="/register" className="auth-link">Create an account</Link>
        {mode === "password" && (
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        )}
      </div>
    </div>
  );
};

export default Login;