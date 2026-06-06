import React, { useState } from "react";
import "./Login.css";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL || "http://localhost:4000"}/api/user/login`,
        form
      );
      if (data.success) {
        if (data.isAdmin) {
          localStorage.setItem("adminToken", data.token);
          onLogin(data.token);
        } else {
          setError("You don't have admin access.");
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Make sure backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span>🍔</span>
          <h1>BiteBuddy</h1>
          <p>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <h2>Sign In</h2>
          <p className="admin-login-sub">Enter your admin credentials to continue</p>

          {error && <div className="admin-login-error">⚠️ {error}</div>}

          <div className="admin-field">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="admin@bitebuddy.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="admin-login-footer">BiteBuddy © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Login;