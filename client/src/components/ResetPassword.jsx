import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import API from '../api/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 6-digit OTP code inputs
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prefill email if cached
  useEffect(() => {
    const cachedEmail = localStorage.getItem('resetEmail') || '';
    setEmail(cachedEmail);
  }, []);

  const handleDigitChange = (index, value) => {
    if (value && isNaN(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.substring(value.length - 1);
    setOtpDigits(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    if (pastedText.length === 6 && !isNaN(pastedText)) {
      const digits = pastedText.split("");
      setOtpDigits(digits);
      otpRefs[5].current.focus();
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setMessage('Please fill in the 6-digit reset code');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/reset-password', { email, otp, newPassword });
      setMessage(res.data.message + ' Redirecting to sign in...');
      setIsError(false);
      
      localStorage.removeItem('resetEmail'); // clear temporary email cache

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card relative overflow-hidden">
      {/* Visual Accent Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          Define New Password
        </h2>
        <p className="mt-1 text-xs text-slate-400">Establish a new secure pass-signature</p>
      </div>

      {message && <div className={`mb-5 ${isError ? 'message-error' : 'message-success'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            type="email" 
            name="email" 
            placeholder="Email address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="auth-input pl-11" 
            required 
          />
        </div>

        {/* 6-box input */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            6-digit password reset code
          </label>
          <div className="flex justify-between gap-2.5" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(index, e.target.value)}
                onKeyDown={e => handleDigitKeyDown(index, e)}
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-slate-950/40 text-center text-lg font-bold text-white transition-all focus:border-indigo-500 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
              />
            ))}
          </div>
        </div>

        {/* New Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            type={showPassword ? 'text' : 'password'} 
            name="newPassword" 
            placeholder="New secure password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
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

        <button type="submit" disabled={loading} className="auth-button gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Reset Credentials <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        <Link to="/login" className="auth-link">Back to sign in</Link>
      </p>
    </div>
  );
};

export default ResetPassword;