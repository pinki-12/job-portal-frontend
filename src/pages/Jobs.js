import React, { useState, useEffect, useCallback } from "react";
import { getJobs, applyJob } from "../api/api";
import {
  Search, MapPin, Wifi, Accessibility, Clock, Briefcase,
  CheckCircle, SlidersHorizontal, X, Eye, Ear, Brain,
  Heart, ChevronLeft, ChevronRight, Building2, BadgeCheck,
  AlertCircle, FileText
} from "lucide-react";

const ACCESS_BADGES = [
  { key: "remote", label: "Remote", icon: <Wifi size={11} />, cls: "" },
  { key: "wheelchairAccessible", label: "Wheelchair", icon: <Accessibility size={11} />, cls: "" },
  { key: "flexibleHours", label: "Flexible Hours", icon: <Clock size={11} />, cls: "gold" },
  { key: "screenReaderFriendly", label: "Screen Reader", icon: <Eye size={11} />, cls: "violet" },
  { key: "signLanguageSupport", label: "Sign Language", icon: <Ear size={11} />, cls: "blue" },
  { key: "mentalHealthSupport", label: "Mental Health", icon: <Heart size={11} />, cls: "green" },
];

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];
const EXP_LEVELS = ["no-experience", "entry", "mid", "senior", "lead"];

function ApplyModal({ job, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    setLoading(true); setError("");
    try {
      await applyJob({ jobId: job._id, coverLetter });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not apply. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>Apply for Position</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--teal-light)", borderRadius: "var(--radius-sm)", padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{job.title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
              {job.employer?.companyName || job.employer?.name} {job.location && `• ${job.location}`}
            </div>
          </div>
          {error && (
            <div style={{ background: "var(--rose-light)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--rose)", display: "flex", gap: 8 }}>
              <AlertCircle size={15} />{error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Cover Letter <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>(optional but recommended)</span></label>
            <textarea className="form-textarea" rows={5} placeholder={`Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} position...`}
              value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ minHeight: 140 }} />
            <span className="form-hint">{coverLetter.length}/2000 characters</span>
          </div>
          <div style={{ background: "var(--gold-light)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginTop: 12, fontSize: 12, color: "var(--gold-dark)", display: "flex", gap: 8 }}>
            <FileText size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            Your profile resume will be automatically attached to this application.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-teal" onClick={handleApply} disabled={loading}>
            {loading ? <><span className="loading-spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />Submitting...</> : <>Submit Application</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, applied, onApply }) {
  const companyInitial = (job.employer?.companyName || job.employer?.name || "?")[0].toUpperCase();
  const salary = job.salary?.min ? `₹${(job.salary.min / 1000).toFixed(0)}k–${(job.salary.max / 1000).toFixed(0)}k/${job.salary.period === "monthly" ? "mo" : "yr"}` : null;

  const accessList = ACCESS_BADGES.filter(b => job[b.key]);

  return (
    <div className="job-card fade-in">
      <div className="job-card-header">
        <div className="job-card-company">
          {job.employer?.companyLogo ? (<img src={job.employer.companyLogo} alt={job.employer.companyName} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "var(--radius-sm)" }} />) : (<div className="company-logo">{companyInitial}</div>)}
          <div>
            <div className="company-name" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {job.employer?.companyName || job.employer?.name}
              {job.employer?.isVerifiedEmployer && (
                <span className="company-verified"><BadgeCheck size={13} />Verified</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>
              {job.jobType && <span style={{ textTransform: "capitalize" }}>{job.jobType.replace("-", " ")}</span>}
              {job.experienceLevel && <span style={{ marginLeft: 6, textTransform: "capitalize" }}>• {job.experienceLevel}</span>}
            </div>
          </div>
        </div>
        {salary && <span className="badge badge-gold" style={{ flexShrink: 0 }}>{salary}</span>}
      </div>

      <div>
        <h3 className="job-card-title">{job.title}</h3>
        <div className="job-card-meta">
          {job.location && <span className="job-meta-item"><MapPin size={12} />{job.location}</span>}
          {job.remote && <span className="job-meta-item"><Wifi size={12} />Remote</span>}
          <span className="job-meta-item"><Briefcase size={12} />{job.totalApplications || 0} applied</span>
          {job.applicationDeadline && (
            <span className="job-meta-item"><Clock size={12} />
              Deadline: {new Date(job.applicationDeadline).toLocaleDateString("en-IN")}
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {job.description}
      </p>

      {job.requiredSkills?.length > 0 && (
        <div className="job-card-skills">
          {job.requiredSkills.slice(0, 4).map((s, i) => <span key={i} className="tag">{s}</span>)}
          {job.requiredSkills.length > 4 && <span className="tag">+{job.requiredSkills.length - 4} more</span>}
        </div>
      )}

      {accessList.length > 0 && (
        <div className="job-card-access">
          {accessList.map(b => (
            <span key={b.key} className={`access-badge ${b.cls}`}>{b.icon}{b.label}</span>
          ))}
        </div>
      )}

      <div className="job-card-footer">
        <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
          {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        {applied ? (
          <span className="badge badge-green" style={{ padding: "6px 12px" }}>
            <CheckCircle size={13} />Applied
          </span>
        ) : (
          <button className="btn btn-teal btn-sm" onClick={() => onApply(job)}>
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [applied, setApplied] = useState({});
  const [toast, setToast] = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    remote: false, wheelchairAccessible: false, flexibleHours: false,
    screenReaderFriendly: false, signLanguageSupport: false, mentalHealthSupport: false,
    jobType: "", experienceLevel: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, keyword, location, limit: 9, ...filters };
      // Remove empty filters
      Object.keys(params).forEach(k => (params[k] === false || params[k] === "") && delete params[k]);
      const { data } = await getJobs(params);
      setJobs(data.jobs || data);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      showToast("Could not load jobs.", "error");
    } finally { setLoading(false); }
  }, [page, keyword, location, filters]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 350);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  const toggleFilter = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const FilterSidebar = () => (
    <aside className="filter-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Filters</h3>
        {activeFilterCount > 0 && (
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: "4px 8px" }}
            onClick={() => setFilters({ remote: false, wheelchairAccessible: false, flexibleHours: false, screenReaderFriendly: false, signLanguageSupport: false, mentalHealthSupport: false, jobType: "", experienceLevel: "" })}>
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Accessibility</div>
        {ACCESS_BADGES.map(b => (
          <label key={b.key} className={`filter-toggle ${filters[b.key] ? "active" : ""}`}>
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>{b.icon}{b.label}</span>
            <input type="checkbox" checked={filters[b.key]} onChange={() => toggleFilter(b.key)} style={{ accentColor: "var(--teal)" }} />
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Job Type</div>
        {JOB_TYPES.map(t => (
          <label key={t} className={`filter-toggle ${filters.jobType === t ? "active" : ""}`}>
            <span style={{ textTransform: "capitalize" }}>{t.replace("-", " ")}</span>
            <input type="radio" name="jobType" checked={filters.jobType === t} onChange={() => setFilters(p => ({ ...p, jobType: p.jobType === t ? "" : t }))} style={{ accentColor: "var(--teal)" }} />
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Experience Level</div>
        {EXP_LEVELS.map(l => (
          <label key={l} className={`filter-toggle ${filters.experienceLevel === l ? "active" : ""}`}>
            <span style={{ textTransform: "capitalize" }}>{l.replace("-", " ")}</span>
            <input type="radio" name="expLevel" checked={filters.experienceLevel === l} onChange={() => setFilters(p => ({ ...p, experienceLevel: p.experienceLevel === l ? "" : l }))} style={{ accentColor: "var(--teal)" }} />
          </label>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>Browse Inclusive Jobs</h1>
          <p>Find roles with real accessibility accommodations — built for your abilities.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container">
          {/* Search Bar */}
          <div className="search-bar">
            <div className="input-icon-wrap" style={{ flex: 2, minWidth: 180 }}>
              <Search size={16} className="icon-left" />
              <input className="form-input" type="text" placeholder="Job title, skill, or keyword..."
                value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }}
                style={{ background: "transparent", border: "none", boxShadow: "none" }}
              />
            </div>
            <div className="search-divider" />
            <div className="input-icon-wrap" style={{ flex: 1, minWidth: 140 }}>
              <MapPin size={16} className="icon-left" />
              <input className="form-input" type="text" placeholder="City or state..."
                value={location} onChange={e => { setLocation(e.target.value); setPage(1); }}
                style={{ background: "transparent", border: "none", boxShadow: "none" }}
              />
            </div>
            <button className={`btn ${activeFilterCount > 0 ? "btn-teal" : "btn-outline"} btn-sm`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <SlidersHorizontal size={14} />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>

          <div className="jobs-layout" style={{ gap: 28 }}>
            {/* Sidebar - desktop */}
            <div style={{ display: showFilters ? "block" : "none" }} className="jobs-filter-aside">
              <FilterSidebar />
            </div>

            {/* Jobs grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Result count */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
                  {loading ? "Loading jobs..." : `${total} inclusive job${total !== 1 ? "s" : ""} found`}
                </p>
              </div>

              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ background: "var(--card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", padding: 24 }}>
                      <div className="skeleton" style={{ height: 44, width: 44, borderRadius: "var(--radius-sm)", marginBottom: 12 }} />
                      <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 12 }} />
                      <div className="skeleton" style={{ height: 40, marginBottom: 12 }} />
                      <div style={{ display: "flex", gap: 6 }}>
                        {[1, 2, 3].map(j => <div key={j} className="skeleton" style={{ height: 24, width: 60, borderRadius: 20 }} />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Briefcase size={32} /></div>
                  <h3>No jobs found</h3>
                  <p>Try adjusting your search terms or clearing some filters to see more opportunities.</p>
                  <button className="btn btn-teal" onClick={() => { setKeyword(""); setLocation(""); setFilters({ remote: false, wheelchairAccessible: false, flexibleHours: false, screenReaderFriendly: false, signLanguageSupport: false, mentalHealthSupport: false, jobType: "", experienceLevel: "" }); }}>
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                  {jobs.map(job => (
                    <JobCard key={job._id} job={job} applied={!!applied[job._id]}
                      onApply={job => setApplyModal(job)} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 40 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft size={16} />Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p > totalPages) return null;
                    return (
                      <button key={p} className={`btn btn-sm ${p === page ? "btn-teal" : "btn-outline"}`}
                        onClick={() => setPage(p)} style={{ minWidth: 36 }}>{p}</button>
                    );
                  })}
                  <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next<ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <ApplyModal
          job={applyModal}
          onClose={() => setApplyModal(null)}
          onSuccess={() => {
            setApplied(prev => ({ ...prev, [applyModal._id]: true }));
            showToast("Application submitted successfully! 🎉");
          }}
        />
      )}

      {/* Toast */}
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
