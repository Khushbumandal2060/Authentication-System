import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const ResetPassword = () => {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/reset-password', form);
      setMessage(res.data.message);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
      setIsError(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xl font-bold text-white">
          P
        </div>
        <h2 className="text-3xl font-semibold text-slate-800">Reset password</h2>
        <p className="mt-2 text-sm text-slate-500">Set a new secure password</p>
      </div>

      {message && <p className={isError ? 'message-error mb-4' : 'message-success mb-4'}>{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} className="auth-input" required />
        <input name="otp" placeholder="OTP code" value={form.otp} onChange={handleChange} className="auth-input" required />
        <input type="password" name="newPassword" placeholder="New password" value={form.newPassword} onChange={handleChange} className="auth-input" required />
        <button type="submit" className="auth-button">Reset password</button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="auth-link">Back to login</Link>
      </p>
    </div>
  );
};

export default ResetPassword;