import React, { useState, useEffect } from "react";
import { getEmployerJobs, getApplicants, updateApplicationStatus, deleteJob } from "../api/api";
import {
  Briefcase, Users, MapPin, Wifi, Clock, CheckCircle, AlertCircle,
  Trash2, ChevronDown, ChevronUp, Eye, X, BadgeCheck, FileText
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_OPTS = [
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "rejected", label: "Not Selected" },
  { value: "hired", label: "Hired ✓" },
];

const STATUS_COLORS = {
  applied: "badge-blue", under_review: "badge-gold", shortlisted: "badge-teal",
  interview_scheduled: "badge-violet", rejected: "badge-rose", hired: "badge-green",
};

const JOB_STATUS_COLOR = { pending: "badge-gold", approved: "badge-green", rejected: "badge-rose", closed: "badge-gray" };

function ApplicantCard({ app, onStatusUpdate }) {
  const [status, setStatus] = useState(app.status);
  const [notes, setNotes] = useState(app.employerNotes || "");
  const [interviewDate, setInterviewDate] = useState(app.interviewDate ? app.interviewDate.slice(0, 16) : "");
  const [saving, setSaving] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateApplicationStatus(app._id, { status, employerNotes: notes, interviewDate: interviewDate || undefined });
      onStatusUpdate(app._id, status);
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px 20px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--teal-light), var(--gold-light))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--teal-dark)", flexShrink: 0 }}>
            {app.candidate?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{app.candidate?.name}</span>
              <span className={`badge ${STATUS_COLORS[app.status]}`} style={{ fontSize: 10 }}>{STATUS_OPTS.find(s => s.value === app.status)?.label}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 3 }}>{app.candidate?.email}</div>
            {app.candidate?.disabilityType && (
              <div style={{ marginTop: 5 }}>
                <span className="badge badge-teal" style={{ fontSize: 10 }}>{app.candidate.disabilityType}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDetail(!showDetail)} style={{ fontSize: 12 }}>
            {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDetail ? "Less" : "Manage"}
          </button>
        </div>
      </div>

      {app.candidate?.skills?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {app.candidate.skills.slice(0, 5).map(s => <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>)}
        </div>
      )}

      {showDetail && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
          {app.coverLetter && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Cover Letter</div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, background: "var(--card)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>{app.coverLetter}</p>
            </div>
          )}

          {app.candidate?.bio && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>About Candidate</div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7 }}>{app.candidate.bio}</p>
            </div>
          )}

          {app.candidate?.accommodationsNeeded?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Accommodations Needed</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {app.candidate.accommodationsNeeded.map(a => <span key={a} className="badge badge-violet" style={{ fontSize: 10 }}>{a}</span>)}
              </div>
            </div>
          )}

          <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11 }}>Update Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize: 13 }}>
                {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {status === "interview_scheduled" && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11 }}>Interview Date & Time</label>
                <input className="form-input" type="datetime-local" value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)} style={{ fontSize: 13 }} />
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" style={{ fontSize: 11 }}>Note to Candidate (optional)</label>
            <textarea className="form-textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Add a personal note visible to the candidate..." style={{ fontSize: 13, minHeight: 70 }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-teal btn-sm" onClick={handleUpdate} disabled={saving}>
              {saving ? "Saving..." : <><CheckCircle size={13} />Save Changes</>}
            </button>
            {app.candidate?.resume && (
              <a href={app.candidate.resume?.startsWith("http") ? app.candidate.resume : `http://localhost:5000${app.candidate.resume}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                <FileText size={13} />View Resume
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function JobRow({ job, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [appStatuses, setAppStatuses] = useState({});

  const loadApplicants = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    setLoadingApplicants(true);
    try {
      const { data } = await getApplicants(job._id);
      setApplicants(data);
      const statuses = {};
      data.forEach(a => { statuses[a._id] = a.status; });
      setAppStatuses(statuses);
    } catch {}
    finally { setLoadingApplicants(false); }
  };

  const handleStatusUpdate = (appId, newStatus) => setAppStatuses(prev => ({ ...prev, [appId]: newStatus }));

  return (
    <div className="card" style={{ padding: "20px 24px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{job.title}</h3>
            <span className={`badge ${JOB_STATUS_COLOR[job.status]}`} style={{ textTransform: "capitalize", fontSize: 11 }}>
              {job.status}
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {job.location && <span style={{ fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{job.location}</span>}
            {job.remote && <span style={{ fontSize: 13, color: "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}><Wifi size={12} />Remote</span>}
            <span style={{ fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Users size={12} />{job.totalApplications || 0} applicant{job.totalApplications !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} />Posted {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button className="btn btn-outline btn-sm" onClick={loadApplicants} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={13} />
            {expanded ? "Hide" : "View Applicants"}
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(job._id, job.title)} title="Delete job">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 20, borderTop: "1px solid var(--border-light)", paddingTop: 20 }}>
          {loadingApplicants ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink-muted)", fontSize: 14 }}>
              <div className="loading-spinner" style={{ margin: "0 auto 10px" }} />Loading applicants...
            </div>
          ) : applicants.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <div className="empty-state-icon" style={{ width: 52, height: 52 }}><Users size={22} /></div>
              <h3 style={{ fontSize: 15 }}>No applications yet</h3>
              <p style={{ fontSize: 13 }}>Share your listing to attract inclusive candidates.</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 12 }}>
                {applicants.length} Application{applicants.length !== 1 ? "s" : ""}
              </div>
              {applicants.map(app => (
                <ApplicantCard key={app._id} app={app} onStatusUpdate={handleStatusUpdate} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getEmployerJobs();
        setJobs(data);
      } catch { showToast("Could not load jobs.", "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteJob(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      showToast("Job deleted successfully.");
    } catch { showToast("Could not delete job.", "error"); }
  };

  const stats = {
    total: jobs.length,
    approved: jobs.filter(j => j.status === "approved").length,
    pending: jobs.filter(j => j.status === "pending").length,
    totalApps: jobs.reduce((sum, j) => sum + (j.totalApplications || 0), 0),
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /><p>Loading your listings...</p></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>My Job Listings</h1>
          <p>Manage your inclusive job postings and review applicants.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Total Listings", value: stats.total, color: "var(--teal)" },
              { label: "Active Jobs", value: stats.approved, color: "var(--green)" },
              { label: "Pending Review", value: stats.pending, color: "var(--gold)" },
              { label: "Total Applicants", value: stats.totalApps, color: "var(--violet)" },
            ].map((s, i) => (
              <div key={i} className="card card-flat" style={{ padding: "16px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>All Listings</h2>
            <Link to="/employer/post-job" className="btn btn-teal btn-sm">+ Post New Job</Link>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Briefcase size={32} /></div>
              <h3>No jobs posted yet</h3>
              <p>Start attracting inclusive talent by posting your first job listing.</p>
              <Link to="/employer/post-job" className="btn btn-teal">Post Your First Job</Link>
            </div>
          ) : (
            jobs.map(job => <JobRow key={job._id} job={job} onDelete={handleDelete} />)
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
