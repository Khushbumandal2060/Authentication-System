import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/register', form);
      setMessage(res.data.message);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
      setIsError(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-xl font-bold text-white">
          R
        </div>
        <h2 className="text-3xl font-semibold text-slate-800">Create account</h2>
        <p className="mt-2 text-sm text-slate-500">Join us today</p>
      </div>

      {message && <p className={isError ? 'message-error mb-4' : 'message-success mb-4'}>{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Full name" onChange={handleChange} className="auth-input" required />
        <input type="email" name="email" placeholder="Email address" onChange={handleChange} className="auth-input" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="auth-input" required />
        <button type="submit" className="auth-button">Register</button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Login</Link>
      </p>
    </div>
  );
};

export default Register;