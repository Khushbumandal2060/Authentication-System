import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import API from '../api/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/forgot-password', { email });
      setMessage(res.data.message);
      setIsError(false);

      // Save email for reset password prefill
      localStorage.setItem('resetEmail', email);

      // Redirect to Reset page after a short delay
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending password reset code');
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
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
          Recover Password
        </h2>
        <p className="mt-1 text-xs text-slate-400">Request a secure code to reset your credentials</p>
      </div>

      {message && <div className={`mb-5 ${isError ? 'message-error' : 'message-success'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="auth-input pl-11" 
            required 
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Request Reset Code <ArrowRight className="h-4 w-4" />
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

export default ForgotPassword;