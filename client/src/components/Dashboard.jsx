import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Activity,
  Monitor,
  Smartphone,
  LogOut,
  Clock,
  User as UserIcon,
  MapPin,
  AlertCircle,
  Key,
  Shield,
  Trash2,
  RefreshCw,
  Info,
  Loader2,
  Inbox,
} from 'lucide-react';
import API from '../api/api';

const STATUS_DOT = {
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  neutral: 'bg-slate-500',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'sessions', 'activity'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const meRes = await API.get('/me');
      setUser(meRes.data.user);

      // Fetch security activities
      const actRes = await API.get('/activities');
      setActivities(actRes.data.activities || []);

      // Fetch active sessions
      const sessRes = await API.get('/sessions');
      setSessions(sessRes.data.sessions || []);

      setLoading(false);
    } catch (err) {
      console.error('Session validation failed:', err);
      // Clear invalid credentials
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleRevokeSession = async (sessionId) => {
    setActionLoading(true);
    try {
      await API.post('/sessions/revoke', { sessionId });

      // If revoking current token, log out immediately
      const currentToken = localStorage.getItem('authToken');
      const revokedSession = sessions.find((s) => s._id === sessionId);
      if (revokedSession && revokedSession.token === currentToken) {
        handleLogout();
        return;
      }

      // Re-fetch sessions list & audit trails
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to revoke session:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to parse simple user agents
  const parseUA = (ua) => {
    if (!ua) return { browser: 'Unknown browser', os: 'Unknown device', mobile: false };
    let browser = 'Unknown browser';
    let os = 'Unknown device';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    let mobile = false;
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('iPhone')) { os = 'iPhone'; mobile = true; }
    else if (ua.includes('iPad')) { os = 'iPad'; mobile = true; }
    else if (ua.includes('Android')) { os = 'Android'; mobile = true; }
    else if (ua.includes('Linux')) os = 'Linux';

    return { browser, os, mobile };
  };

  // "2h ago" style formatting; falls back to a date for older entries
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const diffSec = Math.round((Date.now() - date.getTime()) / 1000);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.round(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  // Maps backend actions to readable copy, an icon, and a status (drives the dot color)
  const getActionDetails = (action) => {
    switch (action) {
      case 'REGISTER':
        return { text: 'Account created', status: 'neutral', icon: UserIcon };
      case 'LOGIN_SUCCESS':
        return { text: 'Signed in with password', status: 'success', icon: ShieldCheck };
      case 'LOGIN_FAILED':
        return { text: 'Sign-in failed — incorrect credentials', status: 'danger', icon: AlertCircle };
      case 'LOGIN_UNVERIFIED':
        return { text: 'Sign-in blocked — email not verified', status: 'warning', icon: Info };
      case 'VERIFY_OTP_SUCCESS':
        return { text: 'Email verified', status: 'success', icon: ShieldCheck };
      case 'VERIFY_OTP_FAILED':
        return { text: 'Verification code incorrect or expired', status: 'danger', icon: AlertCircle };
      case 'PASSWORD_RESET_REQ':
        return { text: 'Password reset requested', status: 'warning', icon: Key };
      case 'PASSWORD_RESET_SUCCESS':
        return { text: 'Password changed', status: 'success', icon: Key };
      case 'PASSWORDLESS_REQ':
        return { text: 'Requested a one-time sign-in code', status: 'neutral', icon: Clock };
      case 'LOGIN_PASSWORDLESS_SUCCESS':
        return { text: 'Signed in with a one-time code', status: 'success', icon: ShieldCheck };
      case 'ACCOUNT_LOCKOUT':
        return { text: 'Account temporarily locked — too many failed attempts', status: 'danger', icon: Shield };
      case 'OTP_RESEND':
        return { text: 'Verification code resent', status: 'neutral', icon: RefreshCw };
      case 'SESSION_REVOKED':
        return { text: 'Signed out of a device', status: 'neutral', icon: Trash2 };
      default:
        return { text: action, status: 'neutral', icon: Activity };
    }
  };

  if (loading) {
    return (
      <div className="auth-card relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading your account…</p>
      </div>
    );
  }

  const currentToken = localStorage.getItem('authToken');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: `Sessions (${sessions.length})` },
    { id: 'activity', label: 'Activity log' },
  ];

  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-900/40 p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-indigo-500/20 sm:p-8">
      {/* Visual Accent Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Account security</p>
            <h1 className="truncate bg-gradient-to-r from-white to-slate-200 bg-clip-text text-lg font-bold text-transparent">
              {user.name}
            </h1>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-slate-950/40 px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition-all duration-300 hover:border-indigo-500/70 hover:bg-slate-950/70 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-xl border border-white/[0.04] bg-slate-950/60 p-1">
        {tabs.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`flex-1 whitespace-nowrap rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
              activeTab === id
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="mt-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                <p className="text-xs text-slate-500">Email</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-sm font-medium text-white">Verified</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                <p className="text-xs text-slate-500">Login protection</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <p className="text-sm font-medium text-white">Locks for 15m after 5 failed attempts</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
                <p className="text-xs text-slate-500">Last sign-in</p>
                <p className="mt-1.5 text-sm font-medium text-white">
                  {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'First session'}
                </p>
                {user.lastLogin && (
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-200">How your account is protected</h3>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-slate-500">
                <li>Passwords are hashed with bcrypt before they're stored — we never keep the plain text.</li>
                <li>One-time verification codes expire automatically and can only be used once.</li>
                <li>You can review every signed-in device and end any session below.</li>
              </ul>
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Devices currently signed in to your account</p>
              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={actionLoading}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-1 text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300 disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
              >
                <RefreshCw className={`h-3 w-3 ${actionLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/40">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <Inbox className="h-5 w-5 text-slate-600" />
                  <p className="text-xs text-slate-500">No active sessions.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {sessions.map((session) => {
                    const { browser, os, mobile } = parseUA(session.userAgent);
                    const isCurrent = session.token === currentToken;
                    const DeviceIcon = mobile ? Smartphone : Monitor;

                    return (
                      <div
                        key={session._id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <DeviceIcon className="h-4 w-4 shrink-0 text-slate-500" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-slate-100">
                                {browser} on {os}
                              </span>
                              {isCurrent && (
                                <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                                  Current session
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {session.ipAddress}
                              </span>
                              <span title={new Date(session.createdAt).toLocaleString()}>
                                · Signed in {formatRelativeTime(session.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session._id)}
                          disabled={actionLoading}
                          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-50 sm:self-center focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isCurrent ? 'Sign out' : 'Sign out device'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY LOG */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Recent activity on your account</p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/40">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <Inbox className="h-5 w-5 text-slate-600" />
                  <p className="text-xs text-slate-500">No activity recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {activities.map((log) => {
                    const details = getActionDetails(log.action);
                    const LogIcon = details.icon;
                    const { browser, os } = parseUA(log.userAgent);

                    return (
                      <div key={log._id} className="flex items-start gap-3 p-4">
                        <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-slate-900/60">
                          <LogIcon className="h-3.5 w-3.5 text-slate-400" />
                          <span
                            className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-slate-950 ${STATUS_DOT[details.status]}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-slate-200">{details.text}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {log.ipAddress || '127.0.0.1'}
                            </span>
                            <span>· {browser} on {os}</span>
                            <span title={new Date(log.timestamp).toLocaleString()}>
                              · {formatRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
