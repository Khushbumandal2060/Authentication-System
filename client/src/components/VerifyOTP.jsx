import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const VerifyOTP = () => {
  const [form, setForm] = useState({ email: '', otp: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/verify-otp', form);
      setMessage(`${res.data.message}. Token: ${res.data.token}`);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
      setIsError(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-xl font-bold text-white">
          O
        </div>
        <h2 className="text-3xl font-semibold text-slate-800">Verify OTP</h2>
        <p className="mt-2 text-sm text-slate-500">Enter the code sent to your email</p>
      </div>

      {message && <p className={isError ? 'message-error mb-4' : 'message-success mb-4'}>{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" placeholder="Email address" onChange={handleChange} className="auth-input" required />
        <input name="otp" placeholder="OTP code" onChange={handleChange} className="auth-input" required />
        <button type="submit" className="auth-button">Verify OTP</button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="auth-link">Back to login</Link>
      </p>
    </div>
  );
};

export default VerifyOTP;