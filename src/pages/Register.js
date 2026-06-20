import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../api/api";
import { Accessibility, User, Mail, Lock, Eye, EyeOff, Building2, ChevronRight, Check } from "lucide-react";

const DISABILITY_OPTIONS = [
  "Visual Impairment", "Hearing Impairment", "Physical / Mobility",
  "Cognitive / Intellectual", "Autism Spectrum", "Speech / Language",
  "Chronic Illness", "Mental Health", "Multiple Disabilities", "Prefer not to say"
];

const ACCOMMODATION_OPTIONS = [
  "Screen reader software", "Sign language interpreter", "Wheelchair accessibility",
  "Flexible working hours", "Work from home", "Large-print materials",
  "Speech-to-text software", "Mental health days", "Quiet workspace", "Job coaching support"
];

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get("role") || "candidate");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    disabilityType: "", skills: "",
    accommodationsNeeded: [],
    openToRemote: true,
    companyName: "", companyWebsite: "", companyDescription: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r) setRole(r);
  }, [searchParams]);

  const toggleAccommodation = (item) => {
    setForm(prev => ({
      ...prev,
      accommodationsNeeded: prev.accommodationsNeeded.includes(item)
        ? prev.accommodationsNeeded.filter(a => a !== item)
        : [...prev.accommodationsNeeded, item]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const payload = { ...form, role };
      delete payload.confirmPassword;
      const { data } = await register(payload);
      loginUser(data.token, data.user);
      const routes = { candidate: "/jobs", employer: "/employer/jobs" };
      navigate(routes[role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
          <div className="hero-orb" style={{ width: 320, height: 320, top: -60, right: -60 }} />
          <div className="hero-orb" style={{ width: 200, height: 200, bottom: 60, left: 20, background: "radial-gradient(circle, rgba(212,134,10,0.25), transparent 70%)" }} />
        </div>
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <Accessibility size={24} color="white" strokeWidth={2} />
            </div>
            <span className="auth-brand-name">Ability<em>Bridge</em></span>
          </div>
          <h2 className="auth-tagline">
            Start Your<br /><em>Inclusive</em><br />Career Today
          </h2>
          <p className="auth-desc">
            Join thousands of talented professionals who've found their perfect role on AbilityBridge — where ability shines and barriers break.
          </p>
          <div className="auth-features">
            {[
              "100% free for candidates",
              "Disability-friendly job filters",
              "Employer accommodation badges",
              "Application status tracking",
            ].map((item, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-dot" style={{ background: "rgba(212,134,10,0.2)" }}>
                  <Check size={14} color="var(--gold)" />
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
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--gold), var(--teal))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Accessibility size={18} color="white" />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>AbilityBridge</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Create Account</h1>
            <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>Join the inclusive employment revolution.</p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs" style={{ marginBottom: 24 }}>
            {[
              { id: "candidate", icon: <User size={15} />, label: "I'm Looking for Work" },
              { id: "employer", icon: <Building2 size={15} />, label: "I'm Hiring" },
            ].map(r => (
              <button key={r.id} type="button" className={`role-tab ${role === r.id ? "active" : ""}`} onClick={() => setRole(r.id)}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {r.icon}{r.label}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "var(--rose-light)", border: "1px solid var(--rose)", borderRadius: "var(--radius-sm)", padding: "11px 14px", marginBottom: 18, fontSize: 13, color: "var(--rose)" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Common fields */}
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{role === "employer" ? "Contact Name" : "Full Name"} <span>*</span></label>
                <div className="input-icon-wrap">
                  <User size={15} className="icon-left" />
                  <input className="form-input" type="text" placeholder="Your full name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span>*</span></label>
                <div className="input-icon-wrap">
                  <Mail size={15} className="icon-left" />
                  <input className="form-input" type="email" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Password <span>*</span></label>
                <div className="input-icon-wrap" style={{ position: "relative" }}>
                  <Lock size={15} className="icon-left" />
                  <input className="form-input" type={showPass ? "text" : "password"} placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    required style={{ paddingLeft: 38, paddingRight: 38 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", padding: 2 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span>*</span></label>
                <input className="form-input" type="password" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>

            {/* Candidate-specific */}
            {role === "candidate" && (
              <>
                <div className="form-group">
                  <label className="form-label">Disability Type</label>
                  <select className="form-select" value={form.disabilityType} onChange={e => setForm({ ...form, disabilityType: e.target.value })}>
                    <option value="">Select your disability type (optional)</option>
                    {DISABILITY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="form-hint">This helps us show you the most relevant accessible jobs.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <input className="form-input" type="text" placeholder="e.g. Excel, Customer Service, Typing, Coding"
                    value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                  <span className="form-hint">Separate skills with commas</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Accommodations Needed</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6, marginTop: 4 }}>
                    {ACCOMMODATION_OPTIONS.map(opt => (
                      <label key={opt} style={{
                        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                        padding: "7px 10px", borderRadius: 8,
                        border: `1.5px solid ${form.accommodationsNeeded.includes(opt) ? "var(--teal)" : "var(--border)"}`,
                        background: form.accommodationsNeeded.includes(opt) ? "var(--teal-light)" : "var(--surface)",
                        fontSize: 12, fontWeight: 500, color: form.accommodationsNeeded.includes(opt) ? "var(--teal-dark)" : "var(--ink-muted)",
                        transition: "all 0.2s",
                        userSelect: "none",
                      }}>
                        <input type="checkbox" style={{ display: "none" }} checked={form.accommodationsNeeded.includes(opt)} onChange={() => toggleAccommodation(opt)} />
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, border: "1.5px solid",
                          borderColor: form.accommodationsNeeded.includes(opt) ? "var(--teal)" : "var(--border)",
                          background: form.accommodationsNeeded.includes(opt) ? "var(--teal)" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                        }}>
                          {form.accommodationsNeeded.includes(opt) && <Check size={10} color="white" />}
                        </div>
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--surface)", userSelect: "none" }}>
                  <input type="checkbox" checked={form.openToRemote} onChange={e => setForm({ ...form, openToRemote: e.target.checked })} style={{ width: 16, height: 16, accentColor: "var(--teal)" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-soft)" }}>✅ I'm open to remote work opportunities</span>
                </label>
              </>
            )}

            {/* Employer-specific */}
            {role === "employer" && (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name <span>*</span></label>
                  <div className="input-icon-wrap">
                    <Building2 size={15} className="icon-left" />
                    <input className="form-input" type="text" placeholder="Your company name"
                      value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Company Website</label>
                  <input className="form-input" type="url" placeholder="https://yourcompany.com"
                    value={form.companyWebsite} onChange={e => setForm({ ...form, companyWebsite: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">About Your Company</label>
                  <textarea className="form-textarea" rows={3} placeholder="Tell candidates about your inclusive workplace culture..."
                    value={form.companyDescription} onChange={e => setForm({ ...form, companyDescription: e.target.value })} />
                </div>
              </>
            )}

            <button className="btn btn-teal btn-lg btn-full" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Creating account...</> : <>Create Account <ChevronRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--teal)", fontWeight: 600 }}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
