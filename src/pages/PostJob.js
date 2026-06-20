import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/api";
import {
  Briefcase, MapPin, DollarSign, Clock, Wifi, Accessibility,
  Eye, Ear, Brain, Heart, CheckCircle, AlertCircle, ChevronRight, Info
} from "lucide-react";

const ACCESS_FEATURES = [
  { key: "remote", icon: <Wifi size={16} />, label: "Remote Work Available", desc: "Candidates can work fully or partially remote" },
  { key: "wheelchairAccessible", icon: <Accessibility size={16} />, label: "Wheelchair Accessible Office", desc: "Ramps, elevators, accessible restrooms" },
  { key: "flexibleHours", icon: <Clock size={16} />, label: "Flexible Working Hours", desc: "Flexi-time, compressed weeks, part-time options" },
  { key: "screenReaderFriendly", icon: <Eye size={16} />, label: "Screen Reader Friendly", desc: "Digital tools compatible with screen readers" },
  { key: "signLanguageSupport", icon: <Ear size={16} />, label: "Sign Language Support", desc: "Interpreters or deaf-friendly communication" },
  { key: "assistiveTechnologyAllowed", icon: <Brain size={16} />, label: "Assistive Technology Allowed", desc: "Candidates can use personal assistive devices" },
  { key: "mentalHealthSupport", icon: <Heart size={16} />, label: "Mental Health Support", desc: "Counseling, wellness days, EAP programs" },
];

const DISABILITY_TYPES = [
  "Visual Impairment", "Hearing Impairment", "Physical / Mobility",
  "Cognitive / Intellectual", "Autism Spectrum", "Speech / Language",
  "Chronic Illness", "Mental Health", "Multiple Disabilities"
];

export default function PostJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", location: "",
    requiredSkills: "",
    jobType: "full-time", experienceLevel: "entry",
    salary: { min: "", max: "", currency: "INR", period: "monthly" },
    applicationDeadline: "",
    remote: false, wheelchairAccessible: false, flexibleHours: false,
    screenReaderFriendly: false, signLanguageSupport: false,
    assistiveTechnologyAllowed: false, mentalHealthSupport: false,
    accessibilityNotes: "",
    disabilitiesWelcome: [],
    accommodationsProvided: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleFeature = (key) => setForm(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleDisability = (d) => setForm(prev => ({
    ...prev,
    disabilitiesWelcome: prev.disabilitiesWelcome.includes(d)
      ? prev.disabilitiesWelcome.filter(x => x !== d)
      : [...prev.disabilitiesWelcome, d]
  }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showToast("Title and description are required.", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        salary: {
          min: Number(form.salary.min) || 0,
          max: Number(form.salary.max) || 0,
          currency: form.salary.currency,
          period: form.salary.period,
        },
      };
      await createJob(payload);
      showToast("Job posted! It will be published after admin approval. 🎉");
      setTimeout(() => navigate("/employer/jobs"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to post job.", "error");
    } finally { setLoading(false); }
  };

  const steps = [
    { num: 1, label: "Job Details" },
    { num: 2, label: "Accessibility" },
    { num: 3, label: "Review & Post" },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>Post an Inclusive Job</h1>
          <p>Reach thousands of talented professionals with disabilities who are ready to contribute.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container" style={{ maxWidth: 760 }}>

          {/* Step Indicator */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: i < steps.length - 1 ? "none" : 1 }}>
                  <div onClick={() => step > s.num && setStep(s.num)} style={{
                    width: 36, height: 36, borderRadius: "50%", cursor: step > s.num ? "pointer" : "default",
                    background: step >= s.num ? "var(--teal)" : "var(--surface-alt)",
                    border: `2px solid ${step >= s.num ? "var(--teal)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14,
                    color: step >= s.num ? "white" : "var(--ink-muted)",
                    boxShadow: step === s.num ? "0 0 0 4px var(--teal-glow)" : "none",
                    transition: "all 0.25s",
                  }}>
                    {step > s.num ? <CheckCircle size={18} /> : s.num}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.num ? "var(--teal-dark)" : "var(--ink-muted)", marginTop: 6, whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: step > s.num ? "var(--teal)" : "var(--border)", margin: "0 8px", marginBottom: 18, transition: "background 0.3s" }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="card" style={{ padding: "32px 36px" }}>

            {/* Step 1 — Job Details */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Job Details</h2>

                <div className="form-group">
                  <label className="form-label">Job Title <span>*</span></label>
                  <div className="input-icon-wrap">
                    <Briefcase size={15} className="icon-left" />
                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Customer Support Executive, Data Entry Specialist" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description <span>*</span></label>
                  <textarea className="form-textarea" rows={6} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and what makes your workplace inclusive..." style={{ minHeight: 160 }} />
                </div>

                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <div className="input-icon-wrap">
                      <MapPin size={15} className="icon-left" />
                      <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State or Remote" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Application Deadline</label>
                    <input className="form-input" type="date" value={form.applicationDeadline}
                      onChange={e => setForm({ ...form, applicationDeadline: e.target.value })} />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select className="form-select" value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })}>
                      {["full-time", "part-time", "contract", "internship", "freelance"].map(t => (
                        <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t.replace("-", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select className="form-select" value={form.experienceLevel} onChange={e => setForm({ ...form, experienceLevel: e.target.value })}>
                      {[["no-experience", "No Experience Required"], ["entry", "Entry Level"], ["mid", "Mid Level"], ["senior", "Senior"], ["lead", "Lead / Manager"]].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Salary Range (₹)</label>
                  <div className="grid-3" style={{ gap: 10 }}>
                    <div className="input-icon-wrap">
                      <DollarSign size={14} className="icon-left" />
                      <input className="form-input" type="number" placeholder="Min"
                        value={form.salary.min} onChange={e => setForm({ ...form, salary: { ...form.salary, min: e.target.value } })} />
                    </div>
                    <input className="form-input" type="number" placeholder="Max"
                      value={form.salary.max} onChange={e => setForm({ ...form, salary: { ...form.salary, max: e.target.value } })} />
                    <select className="form-select" value={form.salary.period} onChange={e => setForm({ ...form, salary: { ...form.salary, period: e.target.value } })}>
                      <option value="monthly">Per Month</option>
                      <option value="yearly">Per Year</option>
                      <option value="hourly">Per Hour</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills</label>
                  <input className="form-input" value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })}
                    placeholder="e.g. Excel, Communication, Customer Service (comma-separated)" />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button className="btn btn-teal btn-lg" onClick={() => setStep(2)}>
                    Next: Accessibility <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Accessibility */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Accessibility Features</h2>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "var(--teal-light)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--teal-dark)" }}>
                    <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    These badges are shown on your job listing and help candidates with disabilities find roles suited to their needs. Be honest — it builds trust.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ACCESS_FEATURES.map(f => (
                    <label key={f.key} onClick={() => toggleFeature(f.key)} style={{
                      display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                      padding: "14px 16px", borderRadius: "var(--radius)",
                      border: `1.5px solid ${form[f.key] ? "var(--teal)" : "var(--border)"}`,
                      background: form[f.key] ? "var(--teal-light)" : "var(--surface)",
                      transition: "all 0.2s", userSelect: "none"
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: form[f.key] ? "var(--teal)" : "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: form[f.key] ? "white" : "var(--ink-muted)", transition: "all 0.2s" }}>
                        {f.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: form[f.key] ? "var(--teal-dark)" : "var(--ink)" }}>{f.label}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{f.desc}</div>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        border: `2px solid ${form[f.key] ? "var(--teal)" : "var(--border)"}`,
                        background: form[f.key] ? "var(--teal)" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s"
                      }}>
                        {form[f.key] && <CheckCircle size={13} color="white" />}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Accessibility Notes</label>
                  <textarea className="form-textarea" rows={3} value={form.accessibilityNotes}
                    onChange={e => setForm({ ...form, accessibilityNotes: e.target.value })}
                    placeholder="Any other accessibility features, accommodations, or inclusive practices at your workplace..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Especially Welcoming To</label>
                  <p className="form-hint" style={{ marginBottom: 10 }}>Select disability types this role is especially suited for (optional)</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 8 }}>
                    {DISABILITY_TYPES.map(d => {
                      const sel = form.disabilitiesWelcome.includes(d);
                      return (
                        <label key={d} onClick={() => toggleDisability(d)} style={{
                          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                          padding: "8px 12px", borderRadius: 8, userSelect: "none",
                          border: `1.5px solid ${sel ? "var(--gold)" : "var(--border)"}`,
                          background: sel ? "var(--gold-light)" : "var(--surface)",
                          fontSize: 12, fontWeight: 500,
                          color: sel ? "var(--gold-dark)" : "var(--ink-muted)",
                          transition: "all 0.2s"
                        }}>
                          <div style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${sel ? "var(--gold)" : "var(--border)"}`, background: sel ? "var(--gold)" : "white", flexShrink: 0 }} />
                          {d}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-teal btn-lg" onClick={() => setStep(3)}>
                    Review Listing <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Review Your Listing</h2>

                <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "20px 22px", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{form.title || "Untitled Job"}</h3>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    {form.location && <span className="tag"><MapPin size={12} />{form.location}</span>}
                    <span className="tag" style={{ textTransform: "capitalize" }}>{form.jobType?.replace("-", " ")}</span>
                    <span className="tag" style={{ textTransform: "capitalize" }}>{form.experienceLevel?.replace("-", " ")}</span>
                    {form.salary.min && <span className="badge badge-gold">₹{Number(form.salary.min).toLocaleString()}–{Number(form.salary.max).toLocaleString()}/{form.salary.period === "monthly" ? "mo" : "yr"}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7 }}>{form.description?.slice(0, 300)}{form.description?.length > 300 ? "..." : ""}</p>
                </div>

                {/* Accessibility summary */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Accessibility Features</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ACCESS_FEATURES.filter(f => form[f.key]).map(f => (
                      <span key={f.key} className="badge badge-teal">{f.icon}{f.label}</span>
                    ))}
                    {ACCESS_FEATURES.filter(f => form[f.key]).length === 0 && (
                      <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>No accessibility features selected. Consider adding some!</p>
                    )}
                  </div>
                </div>

                {form.disabilitiesWelcome.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Especially Welcoming To</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {form.disabilitiesWelcome.map(d => <span key={d} className="badge badge-gold">{d}</span>)}
                    </div>
                  </div>
                )}

                <div style={{ background: "var(--gold-light)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13, color: "var(--gold-dark)", display: "flex", gap: 8 }}>
                  <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  Your job will be reviewed by our team before going live. This typically takes a few hours.
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                    {loading ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Posting...</> : "🚀 Post This Job"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={18} color="var(--teal)" /> : <AlertCircle size={18} color="var(--rose)" />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
