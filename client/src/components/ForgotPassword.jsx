import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/forgot-password', { email });
      setMessage(res.data.message);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending OTP');
      setIsError(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-xl font-bold text-white">
          F
        </div>
        <h2 className="text-3xl font-semibold text-slate-800">Forgot password</h2>
        <p className="mt-2 text-sm text-slate-500">We'll send a one-time code</p>
      </div>

      {message && <p className={isError ? 'message-error mb-4' : 'message-success mb-4'}>{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" required />
        <button type="submit" className="auth-button">Send OTP</button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="auth-link">Back to login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;