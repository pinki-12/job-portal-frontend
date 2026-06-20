import React, { useState, useEffect } from "react";
import { getMyApplications, withdrawApplication } from "../api/api";
import {
  Briefcase, MapPin, Wifi, Clock, CheckCircle,
  XCircle, AlertCircle, Eye, ChevronRight, FileText
} from "lucide-react";

const STATUS_CONFIG = {
  applied:            { label: "Applied",            color: "badge-blue",   icon: <FileText size={11} /> },
  under_review:       { label: "Under Review",       color: "badge-gold",   icon: <Eye size={11} /> },
  shortlisted:        { label: "Shortlisted",        color: "badge-teal",   icon: <CheckCircle size={11} /> },
  interview_scheduled:{ label: "Interview Scheduled",color: "badge-violet", icon: <Clock size={11} /> },
  rejected:           { label: "Not Selected",       color: "badge-rose",   icon: <XCircle size={11} /> },
  hired:              { label: "Hired! 🎉",           color: "badge-green",  icon: <CheckCircle size={11} /> },
};

const STEPS = ["applied", "under_review", "shortlisted", "interview_scheduled", "hired"];

function StatusTracker({ status }) {
  if (status === "rejected") {
    return (
      <div style={{ background: "var(--rose-light)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--rose)", display: "flex", gap: 8, alignItems: "center" }}>
        <XCircle size={15} />Not selected for this role. Keep applying — the right job is out there!
      </div>
    );
  }
  const currentIdx = STEPS.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "4px 0" }}>
      {STEPS.map((step, i) => {
        const isDone = i <= currentIdx;
        const isActive = i === currentIdx;
        return (
          <React.Fragment key={step}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: isDone ? "var(--teal)" : "var(--surface-alt)",
                border: `2px solid ${isActive ? "var(--teal)" : isDone ? "var(--teal)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isActive ? "0 0 0 4px var(--teal-glow)" : "none",
                transition: "all 0.3s",
              }}>
                {isDone && <CheckCircle size={14} color="white" />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: isDone ? "var(--teal-dark)" : "var(--ink-muted)", marginTop: 5, textAlign: "center", lineHeight: 1.3, textTransform: "capitalize", whiteSpace: "nowrap" }}>
                {STATUS_CONFIG[step]?.label || step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 2, flex: 1, background: isDone && i < currentIdx ? "var(--teal)" : "var(--border)", minWidth: 20, marginBottom: 18, transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState({});
  const [toast, setToast] = useState(null);
  const [expanded, setExpanded] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyApplications();
        setApplications(data);
      } catch { showToast("Could not load applications.", "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm("Withdraw this application?")) return;
    setWithdrawing(p => ({ ...p, [id]: true }));
    try {
      await withdrawApplication(id);
      setApplications(prev => prev.filter(a => a._id !== id));
      showToast("Application withdrawn.");
    } catch { showToast("Could not withdraw.", "error"); }
    finally { setWithdrawing(p => ({ ...p, [id]: false })); }
  };

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => ["shortlisted", "interview_scheduled", "hired"].includes(a.status)).length,
    hired: applications.filter(a => a.status === "hired").length,
    pending: applications.filter(a => ["applied", "under_review"].includes(a.status)).length,
  };

  if (loading) return (
    <div className="loading-screen"><div className="loading-spinner" /><p>Loading your applications...</p></div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>My Applications</h1>
          <p>Track every application and never miss an update.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container" style={{ maxWidth: 860 }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
            {[
              { label: "Total Applied", value: stats.total, color: "var(--teal-light)", accent: "var(--teal)" },
              { label: "In Progress", value: stats.pending, color: "var(--gold-light)", accent: "var(--gold)" },
              { label: "Shortlisted", value: stats.shortlisted, color: "var(--violet-light)", accent: "var(--violet)" },
              { label: "Hired", value: stats.hired, color: "var(--green-light)", accent: "var(--green)" },
            ].map((s, i) => (
              <div key={i} className="card card-flat" style={{ padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: s.accent, lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Briefcase size={32} /></div>
              <h3>No applications yet</h3>
              <p>Start browsing inclusive jobs and apply to your first opportunity!</p>
              <a href="/jobs" className="btn btn-teal">Browse Jobs <ChevronRight size={15} /></a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {applications.map(app => {
                const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                const isExp = expanded[app._id];
                return (
                  <div key={app._id} className="card" style={{ padding: "22px 24px", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{app.job?.title}</h3>
                          <span className={`badge ${sc.color}`}>{sc.icon}{sc.label}</span>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Briefcase size={12} />{app.job?.employer?.companyName || app.job?.employer?.name}
                          </span>
                          {app.job?.location && (
                            <span style={{ fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                              <MapPin size={12} />{app.job.location}
                            </span>
                          )}
                          {app.job?.remote && (
                            <span style={{ fontSize: 13, color: "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}>
                              <Wifi size={12} />Remote
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                            Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(p => ({ ...p, [app._id]: !p[app._id] }))}>
                          {isExp ? "Less" : "Details"}
                        </button>
                        {["applied", "under_review"].includes(app.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(app._id)} disabled={withdrawing[app._id]}>
                            {withdrawing[app._id] ? "..." : "Withdraw"}
                          </button>
                        )}
                      </div>
                    </div>

                    <StatusTracker status={app.status} />

                    {isExp && (
                      <div style={{ marginTop: 16, borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                        {app.coverLetter && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Your Cover Letter</div>
                            <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, background: "var(--surface)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>{app.coverLetter}</p>
                          </div>
                        )}
                        {app.employerNotes && (
                          <div style={{ background: "var(--gold-light)", borderRadius: "var(--radius-sm)", padding: "12px 14px", borderLeft: "3px solid var(--gold)" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-dark)", marginBottom: 4 }}>Message from Employer</div>
                            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>{app.employerNotes}</p>
                          </div>
                        )}
                        {app.interviewDate && (
                          <div style={{ background: "var(--violet-light)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                            <Clock size={14} color="var(--violet)" />
                            <span style={{ fontSize: 13, color: "var(--violet)", fontWeight: 600 }}>
                              Interview scheduled: {new Date(app.interviewDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
