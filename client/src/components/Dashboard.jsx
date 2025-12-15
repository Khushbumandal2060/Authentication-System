import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const userEmail = localStorage.getItem('userEmail') || 'welcome@secureauth.com';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  return (
    <div className="w-full max-w-6xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">SecureAuth</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300">You are logged in as <span className="font-medium text-white">{userEmail}</span>.</p>
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
          <p className="mt-2 text-xl font-semibold text-white">Active</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Security</p>
          <p className="mt-2 text-xl font-semibold text-white">Protected</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Next Step</p>
          <p className="mt-2 text-xl font-semibold text-white">Explore features</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 p-6">
        <h2 className="text-xl font-semibold text-white">Your secure dashboard</h2>
        <p className="mt-2 text-sm text-slate-300">This is your landing page after a successful login. You can now expand it with profile, settings, or analytics views.</p>
        <Link to="/login" className="mt-4 inline-flex text-sm font-medium text-indigo-200 hover:text-white">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
