import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", form);
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("userEmail", form.email);
      setMessage(res.data.message);
      setIsError(false);
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setIsError(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-xl font-bold text-white">
          S
        </div>
        <h2 className="text-3xl font-semibold text-slate-800">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue</p>
      </div>

      {message && (
        <p className={isError ? "message-error mb-4" : "message-success mb-4"}>{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          className="auth-input"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="auth-input pr-20"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" className="auth-button">
          Login
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/register" className="auth-link">Create account</Link>
        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
      </div>
    </div>
  );
};

export default Login;