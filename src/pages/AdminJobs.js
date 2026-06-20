import React, { useState, useEffect, useCallback } from "react";
import { getAdminJobs, approveJob, rejectJob, deleteAdminJob } from "../api/api";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle, XCircle, Trash2, Wifi, MapPin, Clock,
  AlertCircle, Eye, Accessibility, Users, RefreshCw
} from "lucide-react";

const STATUS_TABS = [
  { value: "", label: "All Jobs" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLOR = {
  pending: "badge-gold", approved: "badge-green",
  rejected: "badge-rose", closed: "badge-gray"
};

const ACCESS_ICONS = [
  { key: "remote", icon: <Wifi size={11} />, label: "Remote" },
  { key: "wheelchairAccessible", icon: <Accessibility size={11} />, label: "Wheelchair" },
];

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminJobs({ status: statusFilter || undefined });
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch { showToast("Could not load jobs.", "error"); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleApprove = async (id) => {
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      await approveJob(id);
      setJobs(prev => prev.map(j => j._id === id ? { ...j, status: "approved" } : j));
      showToast("Job approved and published! ✅");
    } catch { showToast("Could not approve.", "error"); }
    finally { setProcessing(p => ({ ...p, [id]: false })); }
  };

  const handleReject = async () => {
    const id = rejectModal;
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      await rejectJob(id, { reason: rejectReason });
      setJobs(prev => prev.map(j => j._id === id ? { ...j, status: "rejected" } : j));
      setRejectModal(null); setRejectReason("");
      showToast("Job rejected.");
    } catch { showToast("Could not reject.", "error"); }
    finally { setProcessing(p => ({ ...p, [id]: false })); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      await deleteAdminJob(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      setTotal(t => t - 1);
      showToast("Job deleted.");
    } catch { showToast("Could not delete.", "error"); }
    finally { setProcessing(p => ({ ...p, [id]: false })); }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>Manage Jobs</h1>
          <p>Review, approve or reject employer job listings before they go live.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container">

          {/* Status Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "2px solid var(--border)", paddingBottom: 0 }}>
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setSearchParams(t.value ? { status: t.value } : {})}
                style={{
                  padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                  color: statusFilter === t.value ? "var(--teal)" : "var(--ink-muted)",
                  borderBottom: `3px solid ${statusFilter === t.value ? "var(--teal)" : "transparent"}`,
                  marginBottom: -2, transition: "all 0.2s",
                }}>
                {t.label}
              </button>
            ))}
            <button onClick={fetchJobs} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", alignSelf: "center" }}>
              <RefreshCw size={13} />Refresh
            </button>
          </div>

          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>{total} job{total !== 1 ? "s" : ""} found</p>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "var(--card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", padding: 24 }}>
                  <div className="skeleton" style={{ height: 20, width: "40%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "80%" }} />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Eye size={28} /></div>
              <h3>No jobs found</h3>
              <p>No jobs match the selected filter.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {jobs.map(job => (
                <div key={job._id} className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{job.title}</h3>
                        <span className={`badge ${STATUS_COLOR[job.status]}`} style={{ textTransform: "capitalize", fontSize: 11 }}>{job.status}</span>
                        {job.isFeatured && <span className="badge badge-gold" style={{ fontSize: 10 }}>⭐ Featured</span>}
                      </div>

                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>
                          {job.employer?.companyName || job.employer?.name}
                        </span>
                        {job.location && <span style={{ fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{job.location}</span>}
                        <span style={{ fontSize: 13, color: "var(--ink-muted)", textTransform: "capitalize" }}>{job.jobType?.replace("-", " ")}</span>
                        <span style={{ fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Users size={12} />{job.totalApplications || 0} applied
                        </span>
                        <span style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} />{new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.description}
                      </p>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                        {ACCESS_ICONS.filter(a => job[a.key]).map(a => (
                          <span key={a.key} className="badge badge-teal" style={{ fontSize: 10 }}>{a.icon}{a.label}</span>
                        ))}
                        {job.requiredSkills?.slice(0, 3).map(s => <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                      {job.status === "pending" && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(job._id)} disabled={processing[job._id]}>
                            <CheckCircle size={13} />Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(job._id)} disabled={processing[job._id]}>
                            <XCircle size={13} />Reject
                          </button>
                        </>
                      )}
                      {job.status === "rejected" && (
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(job._id)} disabled={processing[job._id]}>
                          <CheckCircle size={13} />Re-approve
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id, job.title)} disabled={processing[job._id]}>
                        <Trash2 size={13} />Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setRejectModal(null)}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>Reject Job Listing</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setRejectModal(null)}><XCircle size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason for Rejection (optional)</label>
                <textarea className="form-textarea" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Explain why this job is being rejected..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

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
