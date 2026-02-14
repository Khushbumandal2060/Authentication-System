import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Check, X, ShieldAlert, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import API from '../api/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // CAPTCHA state
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer('');
    try {
      const res = await API.get('/captcha');
      setCaptchaId(res.data.captchaId);
      setCaptchaSvg(res.data.svg);
    } catch (err) {
      setCaptchaSvg('');
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const password = form.password;
  
  // Security checks
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!password) return { label: 'Empty', color: 'bg-slate-800', text: 'text-slate-500' };
    if (score <= 2) return { label: 'Weak Account Security', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score === 3) return { label: 'Moderate Security', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score === 4) return { label: 'High Security', color: 'bg-indigo-500', text: 'text-indigo-400' };
    return { label: 'Excellent Security', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async e => {
    e.preventDefault();
    if (score < 4) {
      setMessage('Please choose a stronger password matching at least 4 constraints.');
      setIsError(true);
      return;
    }

    if (!captchaAnswer.trim()) {
      setMessage('Please solve the CAPTCHA to continue.');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/register', { ...form, captchaId, captchaAnswer });
      setMessage(res.data.message);
      setIsError(false);
      
      // Save email for verification path
      localStorage.setItem("unverifiedEmail", form.email);
      
      // Redirect to verification after short latency
      setTimeout(() => {
        navigate('/verify-otp');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
      setIsError(true);
      // CAPTCHA is single-use server-side (deleted on every attempt), so always refresh it
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card relative overflow-hidden">
      {/* Visual Accent Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          Create Secure Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">Join our unified encryption portal</p>
      </div>

      {message && (
        <div className={`mb-5 ${isError ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            name="name" 
            placeholder="Full name" 
            value={form.name}
            onChange={handleChange} 
            className="auth-input pl-11" 
            required 
          />
        </div>

        {/* Email Address */}
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

        {/* Password Entry */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Secure password" 
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

        {/* Password Strength Widget */}
        {password && (
          <div className="rounded-2xl border border-white/[0.04] bg-slate-950/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Password Strength:</span>
              <span className={strength.text}>{strength.label}</span>
            </div>
            
            {/* 5 bars */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level} 
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    level <= score ? strength.color : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                {checks.minLength ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-slate-600" />}
                <span className={checks.minLength ? 'text-slate-300' : ''}>8+ Characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                {checks.hasUpper ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-slate-600" />}
                <span className={checks.hasUpper ? 'text-slate-300' : ''}>Uppercase Letter</span>
              </div>
              <div className="flex items-center gap-1.5">
                {checks.hasLower ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-slate-600" />}
                <span className={checks.hasLower ? 'text-slate-300' : ''}>Lowercase Letter</span>
              </div>
              <div className="flex items-center gap-1.5">
                {checks.hasDigit ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-slate-600" />}
                <span className={checks.hasDigit ? 'text-slate-300' : ''}>Numeric Digit</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                {checks.hasSpecial ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-slate-600" />}
                <span className={checks.hasSpecial ? 'text-slate-300' : ''}>Special Character (e.g. !@#$)</span>
              </div>
            </div>
          </div>
        )}

        {/* CAPTCHA Widget */}
        <div className="rounded-2xl border border-white/[0.04] bg-slate-950/30 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Security Check:</span>
            <button
              type="button"
              onClick={fetchCaptcha}
              disabled={captchaLoading}
              className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors disabled:opacity-50"
              title="Get a new question"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${captchaLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-slate-900/60 flex items-center justify-center"
              style={{ minHeight: '70px' }}
            >
              {captchaSvg ? (
                <div
                  className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
              ) : (
                <span className="text-xs text-slate-500">{captchaLoading ? 'Loading…' : 'Unavailable'}</span>
              )}
            </div>
            <input
              type="text"
              placeholder="Enter code"
              value={captchaAnswer}
              onChange={e => setCaptchaAnswer(e.target.value)}
              className="auth-input w-32 text-center"
              autoComplete="off"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="auth-button gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Register Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Login</Link>
      </p>
    </div>
  );
};

export default Register;