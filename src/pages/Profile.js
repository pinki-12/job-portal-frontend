import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile, changePassword,
  uploadResume, uploadProfilePicture, uploadCompanyLogo,
} from "../api/api";
import {
  User, Mail, Briefcase, Heart, Wifi, Upload, Lock, Camera, Building2,
  CheckCircle, AlertCircle, Edit3, Save, X, Plus, Trash2,
} from "lucide-react";

const DISABILITY_OPTIONS = [
  "Visual Impairment", "Hearing Impairment", "Physical / Mobility",
  "Cognitive / Intellectual", "Autism Spectrum", "Speech / Language",
  "Chronic Illness", "Mental Health", "Multiple Disabilities", "Prefer not to say",
];

const ACCOMMODATION_OPTIONS = [
  "Screen reader software", "Sign language interpreter", "Wheelchair accessibility",
  "Flexible working hours", "Work from home", "Large-print materials",
  "Speech-to-text software", "Mental health days", "Quiet workspace", "Job coaching support",
];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
// Cloudinary URLs are absolute (https://res.cloudinary.com/…)
// Old local URLs were relative (/uploads/filename.pdf)
const isCloudinaryUrl = (url) => url && url.startsWith("http");

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [editing, setEditing]   = useState(false);
  const [tab, setTab]           = useState("profile");
  const [form, setForm]         = useState({
    name:                user?.name                || "",
    bio:                 user?.bio                 || "",
    disabilityType:      user?.disabilityType      || "",
    skills:              user?.skills?.join(", ")  || "",
    accommodationsNeeded: user?.accommodationsNeeded || [],
    openToRemote:        user?.openToRemote ?? true,
    linkedinUrl:         user?.linkedinUrl          || "",
    portfolioUrl:        user?.portfolioUrl         || "",
    companyName:         user?.companyName          || "",
    companyWebsite:      user?.companyWebsite       || "",
    companyDescription:  user?.companyDescription   || "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills]         = useState(user?.skills || []);

  // File states
  const [resumeFile,    setResumeFile]    = useState(null);
  const [picFile,       setPicFile]       = useState(null);
  const [picPreview,    setPicPreview]    = useState(null);
  const [logoFile,      setLogoFile]      = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);

  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null);

  const [pwForm,    setPwForm]    = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState("");

  const picInputRef  = useRef();
  const logoInputRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleAccommodation = (item) =>
    setForm(prev => ({
      ...prev,
      accommodationsNeeded: prev.accommodationsNeeded.includes(item)
        ? prev.accommodationsNeeded.filter(a => a !== item)
        : [...prev.accommodationsNeeded, item],
    }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(""); }
  };
  const removeSkill = (s) => setSkills(skills.filter(sk => sk !== s));

  // ── Handle profile picture preview ──────────────────────────────────────────
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  };

  // ── Handle company logo preview ──────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // ── Save all profile changes ─────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Upload profile picture to Cloudinary if changed
      if (picFile) {
        await uploadProfilePicture(picFile);
      }

      // 2. Upload company logo to Cloudinary if changed (employers only)
      if (logoFile && user?.role === "employer") {
        await uploadCompanyLogo(logoFile);
      }

      // 3. Upload resume to Cloudinary if changed
      if (resumeFile) {
        await uploadResume(resumeFile);
      }

      // 4. Save text fields via regular JSON update
      const textPayload = {
        ...form,
        skills: skills.join(","),
      };
      // Strip empty strings so we don't overwrite existing data with blanks
      Object.keys(textPayload).forEach(k => {
        if (textPayload[k] === "" || textPayload[k] === null) delete textPayload[k];
      });
      await updateProfile(textPayload);

      await refreshUser();
      setEditing(false);
      setPicFile(null); setPicPreview(null);
      setLogoFile(null); setLogoPreview(null);
      setResumeFile(null);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirmNew) return setPwError("Passwords do not match.");
    if (pwForm.newPassword.length < 6) return setPwError("Minimum 6 characters required.");
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      showToast("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmNew: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Password change failed.");
    } finally { setPwLoading(false); }
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  // Avatar: show uploaded preview → existing Cloudinary URL → initials fallback
  const avatarSrc = picPreview || (isCloudinaryUrl(user?.profilePicture) ? user.profilePicture : null);

  // Company logo: show uploaded preview → existing Cloudinary URL → null
  const logoSrc = logoPreview || (isCloudinaryUrl(user?.companyLogo) ? user.companyLogo : null);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>Keep your profile updated to attract the best inclusive employers.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="profile-layout" style={{ gap: 24 }}>

            {/* ── Sidebar ── */}
            <div>
              <div className="card" style={{ textAlign: "center", padding: "28px 20px", marginBottom: 16 }}>

                {/* Avatar with optional upload button */}
                <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name}
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--teal-light)" }}
                    />
                  ) : (
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--teal), var(--gold))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, fontWeight: 800, color: "white",
                      fontFamily: "var(--font-display)",
                    }}>{initials}</div>
                  )}
                  {editing && (
                    <>
                      <button
                        onClick={() => picInputRef.current?.click()}
                        title="Change profile picture"
                        style={{
                          position: "absolute", bottom: 0, right: 0,
                          width: 26, height: 26, borderRadius: "50%",
                          background: "var(--teal)", border: "2px solid white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", color: "white",
                        }}
                      >
                        <Camera size={13} />
                      </button>
                      <input
                        ref={picInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        style={{ display: "none" }}
                        onChange={handlePicChange}
                      />
                    </>
                  )}
                </div>

                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{user?.name}</h3>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 10 }}>{user?.email}</p>

                {user?.disabilityType && (
                  <span className="badge badge-teal" style={{ fontSize: 11 }}>{user.disabilityType}</span>
                )}
                {user?.openToRemote && (
                  <div style={{ marginTop: 8 }}>
                    <span className="badge badge-green" style={{ fontSize: 11 }}>
                      <Wifi size={10} />Open to Remote
                    </span>
                  </div>
                )}

                {/* Resume link — Cloudinary URL is absolute, old local URL was relative */}
                {user?.resume && (
                  <div style={{ marginTop: 12 }}>
                    <a
                      href={isCloudinaryUrl(user.resume) ? user.resume : `http://localhost:5000${user.resume}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm btn-full"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </div>

              {/* Tab nav */}
              <div className="card card-flat" style={{ padding: "8px" }}>
                {[
                  { id: "profile", icon: <User size={15} />,     label: "Personal Info" },
                  { id: "skills",  icon: <Briefcase size={15} />, label: "Skills & Access" },
                  ...(user?.role === "employer"
                    ? [{ id: "company", icon: <Building2 size={15} />, label: "Company" }]
                    : []),
                  { id: "security", icon: <Lock size={15} />, label: "Security" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)",
                      background: tab === t.id ? "var(--teal-light)" : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                      fontSize: 13, fontWeight: 600,
                      color: tab === t.id ? "var(--teal-dark)" : "var(--ink-muted)",
                      transition: "all 0.2s", marginBottom: 2,
                    }}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Main panel ── */}
            <div className="card" style={{ padding: "28px 30px" }}>

              {/* ── Personal Info Tab ── */}
              {tab === "profile" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Personal Information</h2>
                    {!editing ? (
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Edit3 size={14} />Edit</button>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setPicFile(null); setPicPreview(null); }}><X size={14} />Cancel</button>
                        <button className="btn btn-teal btn-sm" onClick={handleSave} disabled={loading}>
                          {loading ? "Saving…" : <><Save size={14} />Save</>}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      {editing
                        ? <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        : <p style={{ fontSize: 15, fontWeight: 500 }}>{user?.name}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <p style={{ fontSize: 14, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Mail size={14} />{user?.email}
                        <span className="badge badge-teal" style={{ fontSize: 10, marginLeft: 4 }}>Verified</span>
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bio / About Me</label>
                      {editing
                        ? <textarea className="form-textarea" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell employers about yourself…" />
                        : <p style={{ fontSize: 14, color: user?.bio ? "var(--ink-soft)" : "var(--ink-muted)", lineHeight: 1.65 }}>{user?.bio || "No bio added yet."}</p>}
                    </div>

                    <div className="grid-2" style={{ gap: 14 }}>
                      <div className="form-group">
                        <label className="form-label">LinkedIn URL</label>
                        {editing
                          ? <input className="form-input" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/…" />
                          : <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>{user?.linkedinUrl || "—"}</p>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Portfolio / Website</label>
                        {editing
                          ? <input className="form-input" value={form.portfolioUrl} onChange={e => setForm({ ...form, portfolioUrl: e.target.value })} placeholder="https://yourportfolio.com" />
                          : <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>{user?.portfolioUrl || "—"}</p>}
                      </div>
                    </div>

                    {/* Resume upload — only shown in edit mode */}
                    {editing && (
                      <div className="form-group">
                        <label className="form-label">
                          Upload Resume <span style={{ fontWeight: 400, color: "var(--ink-muted)" }}>(PDF, DOC — max 5 MB • stored on Cloudinary)</span>
                        </label>
                        <label style={{
                          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                          padding: "12px 16px", borderRadius: "var(--radius-sm)",
                          border: "2px dashed var(--border)", background: "var(--surface)",
                          fontSize: 13, color: "var(--ink-muted)", transition: "all 0.2s",
                        }}>
                          <Upload size={18} color="var(--teal)" />
                          {resumeFile ? resumeFile.name : "Click to upload or drag & drop"}
                          <input type="file" style={{ display: "none" }} accept=".pdf,.doc,.docx"
                            onChange={e => setResumeFile(e.target.files[0])} />
                        </label>
                        {user?.resume && !resumeFile && (
                          <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 6 }}>
                            Current:&nbsp;
                            <a href={isCloudinaryUrl(user.resume) ? user.resume : `http://localhost:5000${user.resume}`}
                              target="_blank" rel="noreferrer" style={{ color: "var(--teal)" }}>
                              View existing resume ↗
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Skills & Accessibility Tab ── */}
              {tab === "skills" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Skills & Accessibility</h2>
                    {!editing
                      ? <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Edit3 size={14} />Edit</button>
                      : <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={14} />Cancel</button>
                          <button className="btn btn-teal btn-sm" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving…" : <><Save size={14} />Save</>}
                          </button>
                        </div>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div className="form-group">
                      <label className="form-label">Disability Type</label>
                      {editing
                        ? <select className="form-select" value={form.disabilityType} onChange={e => setForm({ ...form, disabilityType: e.target.value })}>
                            <option value="">Prefer not to say</option>
                            {DISABILITY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        : <span className={`badge ${user?.disabilityType ? "badge-teal" : "badge-gray"}`} style={{ fontSize: 12, padding: "5px 12px" }}>
                            {user?.disabilityType || "Not specified"}
                          </span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Skills</label>
                      {editing ? (
                        <>
                          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                            <input className="form-input" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                              placeholder="Add a skill…" onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                            <button type="button" className="btn btn-teal btn-sm" onClick={addSkill}><Plus size={14} /></button>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {skills.map(s => (
                              <span key={s} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--teal-light)", color: "var(--teal-dark)", borderRadius: "var(--radius-full)", padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
                                {s}
                                <button onClick={() => removeSkill(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", padding: 0, display: "flex" }}><X size={12} /></button>
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(user?.skills || []).length > 0
                            ? user.skills.map(s => <span key={s} className="tag">{s}</span>)
                            : <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>No skills added yet.</p>}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Accommodations Needed</label>
                      {editing ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                          {ACCOMMODATION_OPTIONS.map(opt => {
                            const checked = form.accommodationsNeeded.includes(opt);
                            return (
                              <label key={opt} onClick={() => toggleAccommodation(opt)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, cursor: "pointer", border: `1.5px solid ${checked ? "var(--teal)" : "var(--border)"}`, background: checked ? "var(--teal-light)" : "var(--surface)", fontSize: 12, fontWeight: 500, color: checked ? "var(--teal-dark)" : "var(--ink-muted)", transition: "all 0.2s", userSelect: "none" }}>
                                <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${checked ? "var(--teal)" : "var(--border)"}`, background: checked ? "var(--teal)" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {checked && <CheckCircle size={10} color="white" />}
                                </div>
                                {opt}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(user?.accommodationsNeeded || []).length > 0
                            ? user.accommodationsNeeded.map(a => <span key={a} className="badge badge-teal" style={{ fontSize: 11 }}><Heart size={10} />{a}</span>)
                            : <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>No accommodations specified.</p>}
                        </div>
                      )}
                    </div>

                    {editing && (
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--surface)", userSelect: "none" }}>
                        <input type="checkbox" checked={form.openToRemote} onChange={e => setForm({ ...form, openToRemote: e.target.checked })} style={{ width: 16, height: 16, accentColor: "var(--teal)" }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          <Wifi size={14} style={{ verticalAlign: "middle", marginRight: 6, color: "var(--teal)" }} />
                          Open to remote work
                        </span>
                      </label>
                    )}
                  </div>
                </>
              )}

              {/* ── Company Tab (employers only) ── */}
              {tab === "company" && user?.role === "employer" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Company Profile</h2>
                    {!editing
                      ? <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Edit3 size={14} />Edit</button>
                      : <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setLogoFile(null); setLogoPreview(null); }}><X size={14} />Cancel</button>
                          <button className="btn btn-teal btn-sm" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving…" : <><Save size={14} />Save</>}
                          </button>
                        </div>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* Company logo */}
                    <div className="form-group">
                      <label className="form-label">Company Logo</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {logoSrc ? (
                          <img src={logoSrc} alt="Company logo" style={{ width: 72, height: 72, borderRadius: "var(--radius)", objectFit: "contain", border: "1px solid var(--border)", background: "#fff", padding: 4 }} />
                        ) : (
                          <div style={{ width: 72, height: 72, borderRadius: "var(--radius)", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Building2 size={28} color="var(--teal)" />
                          </div>
                        )}
                        {editing && (
                          <div>
                            <button className="btn btn-outline btn-sm" onClick={() => logoInputRef.current?.click()}>
                              <Upload size={13} />Upload Logo
                            </button>
                            <p style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>JPG, PNG, WEBP — max 2 MB • stored on Cloudinary</p>
                            <input ref={logoInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={handleLogoChange} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      {editing
                        ? <input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
                        : <p style={{ fontSize: 15, fontWeight: 500 }}>{user?.companyName || "—"}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Website</label>
                      {editing
                        ? <input className="form-input" value={form.companyWebsite} onChange={e => setForm({ ...form, companyWebsite: e.target.value })} placeholder="https://yourcompany.com" />
                        : user?.companyWebsite
                          ? <a href={user.companyWebsite} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--teal)" }}>{user.companyWebsite}</a>
                          : <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>—</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">About Your Company</label>
                      {editing
                        ? <textarea className="form-textarea" rows={4} value={form.companyDescription} onChange={e => setForm({ ...form, companyDescription: e.target.value })} placeholder="Tell candidates about your inclusive culture…" />
                        : <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65 }}>{user?.companyDescription || "No description added yet."}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* ── Security Tab ── */}
              {tab === "security" && (
                <>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Change Password</h2>
                  {pwError && (
                    <div style={{ background: "var(--rose-light)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "var(--rose)", display: "flex", gap: 8 }}>
                      <AlertCircle size={15} />{pwError}
                    </div>
                  )}
                  <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
                    {[
                      { label: "Current Password",     key: "currentPassword", placeholder: "Your current password" },
                      { label: "New Password",          key: "newPassword",     placeholder: "Min 6 characters" },
                      { label: "Confirm New Password",  key: "confirmNew",      placeholder: "Repeat new password" },
                    ].map(f => (
                      <div className="form-group" key={f.key}>
                        <label className="form-label">{f.label} <span>*</span></label>
                        <input className="form-input" type="password" placeholder={f.placeholder}
                          value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} required />
                      </div>
                    ))}
                    <button className="btn btn-teal" type="submit" disabled={pwLoading} style={{ alignSelf: "flex-start" }}>
                      {pwLoading ? "Updating…" : <><Lock size={14} />Update Password</>}
                    </button>
                  </form>
                </>
              )}
            </div>
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
