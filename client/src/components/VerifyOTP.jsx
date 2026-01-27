import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Clock, RefreshCw, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../api/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  // 6-digit OTP states
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  // Timer state (10 mins = 600s)
  const [timeLeft, setTimeLeft] = useState(600);

  // Load prefilled email if available
  useEffect(() => {
    const cachedEmail = localStorage.getItem('unverifiedEmail') || '';
    setEmail(cachedEmail);
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Format time (600s -> 10:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle individual input changes
  const handleDigitChange = (index, value) => {
    if (value && isNaN(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.substring(value.length - 1); // keep last digit
    setOtpDigits(newOtp);

    // Focus next digit box
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Backspace to focus previous box
  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Paste OTP helper
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    if (pastedText.length === 6 && !isNaN(pastedText)) {
      const digits = pastedText.split("");
      setOtpDigits(digits);
      otpRefs[5].current.focus();
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage('Please enter your email to resend the code.');
      setIsError(true);
      return;
    }

    setResending(true);
    setMessage('');
    try {
      const res = await API.post('/resend-verification-otp', { email });
      setMessage(res.data.message);
      setIsError(false);
      setTimeLeft(600); // Reset timer
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs[0].current.focus();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resending verification code');
      setIsError(true);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email) {
      setMessage('Email address is required');
      setIsError(true);
      return;
    }

    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setMessage('Please fill in the 6-digit code');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/verify-otp', { email, otp });
      
      // Save credentials for instant login
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('userEmail', email);
      localStorage.removeItem('unverifiedEmail'); // Clear temporary cached email
      
      setMessage('Email verified successfully! Opening secure session...');
      setIsError(false);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
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
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          Verify Security Code
        </h2>
        <p className="mt-1 text-xs text-slate-400">Validate the one-time code sent to your email</p>
      </div>

      {message && <div className={`mb-5 ${isError ? 'message-error' : 'message-success'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* 6-box layout */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            One-time verification code
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

        {/* Timer countdown and Resend actions */}
        <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {timeLeft > 0 ? (
              <span>Code expires in: <span className="font-mono font-semibold text-white">{formatTime(timeLeft)}</span></span>
            ) : (
              <span className="text-rose-400 font-semibold">Verification Code Expired</span>
            )}
          </div>
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
          >
            {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Resend
          </button>
        </div>

        <button type="submit" disabled={loading} className="auth-button gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Confirm Code <ArrowRight className="h-4 w-4" />
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

export default VerifyOTP;