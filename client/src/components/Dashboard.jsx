import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await API.get('/me');
        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        console.error('Session validation failed:', err);
        // Clear expired or invalid credentials
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl text-center text-white">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm font-semibold tracking-wider text-slate-300">Verifying Secure Session...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">SecureAuth Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back, <span className="text-indigo-200">{user.name}</span>!</h1>
          <p className="mt-2 text-sm text-slate-300">
            You are logged in as <span className="font-medium text-white">{user.email}</span>.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          Logout
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Account Status</p>
          <p className="mt-2 text-xl font-semibold text-emerald-400">Verified</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Security Cache</p>
          <p className="mt-2 text-xl font-semibold text-white">Active (In-Memory)</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Last Session Login</p>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First Session'}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 p-6">
        <h2 className="text-xl font-semibold text-white">Your secure workspace</h2>
        <p className="mt-2 text-sm text-slate-300">
          This system is fully operational. Short-lived verification tokens and reset OTP codes are handled securely in transient RAM memory, avoiding database pollution. Session updates instantly invalidate cache keys.
        </p>
        <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-indigo-200 hover:text-white">
          Back to login screen
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
