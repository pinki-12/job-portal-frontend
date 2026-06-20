import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/api";
import { Accessibility, Mail, Lock, Eye, EyeOff, ChevronRight, Check } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      const routes = { candidate: "/jobs", employer: "/employer/jobs", admin: "/admin/dashboard" };
      navigate(routes[data.user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-panel-left">
        <div className="hero-bg-gradient" />
        <div className="hero-grid" style={{ opacity: 0.04 }} />
        <div className="hero-orbs">
          <div className="hero-orb" style={{ width: 350, height: 350, top: -80, left: -80 }} />
          <div className="hero-orb" style={{ width: 250, height: 250, bottom: 40, right: -60, background: "radial-gradient(circle, rgba(212,134,10,0.2), transparent 70%)" }} />
        </div>

        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <Accessibility size={24} color="white" strokeWidth={2} />
            </div>
            <span className="auth-brand-name">Ability<em>Bridge</em></span>
          </div>

          <h2 className="auth-tagline">
            Welcome<br />Back to<br /><em>Your Journey</em>
          </h2>

          <p className="auth-desc">
            Sign in to discover thousands of inclusive job opportunities designed to celebrate your abilities, not just accommodate your needs.
          </p>

          <div className="auth-features">
            {[
              "Wheelchair accessible & remote jobs",
              "Flexible hours & mental health support",
              "Verified inclusive employers",
              "Real-time application tracking",
            ].map((item, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-dot" style={{ background: "rgba(11,138,143,0.25)" }}>
                  <Check size={14} color="var(--teal-light)" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-panel-right">
        <div className="auth-form-box">
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--gold), var(--teal))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Accessibility size={18} color="white" />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ink)" }}>AbilityBridge</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, marginBottom: 6 }}>Sign In</h1>
            <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>Welcome back! Enter your credentials to continue.</p>
          </div>

          {error && (
            <div style={{ background: "var(--rose-light)", border: "1px solid var(--rose)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: 20, fontSize: 14, color: "var(--rose)", display: "flex", gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address <span>*</span></label>
              <div className="input-icon-wrap">
                <Mail size={16} className="icon-left" />
                <input
                  className="form-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  required autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password <span>*</span></label>
              <div className="input-icon-wrap" style={{ position: "relative" }}>
                <Lock size={16} className="icon-left" />
                <input
                  className="form-input" type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required autoComplete="current-password"
                  style={{ paddingLeft: 38, paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", padding: 4 }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn btn-teal btn-lg btn-full" type="submit" disabled={loading}>
              {loading ? <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Signing in...</> : <>Sign In <ChevronRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--teal)", fontWeight: 600 }}>
                Create one free →
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop: 20, background: "var(--teal-light)", borderRadius: "var(--radius-sm)", padding: "12px 14px", fontSize: 12, color: "var(--teal-dark)" }}>
            <strong>Demo Access:</strong> Register any account to get started. 
            For admin, set role in DB or use seed script.
          </div>
        </div>
      </div>
    </div>
  );
}
