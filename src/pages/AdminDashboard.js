import React, { useState, useEffect } from "react";
import { getAdminStats } from "../api/api";
import { Link } from "react-router-dom";
import {
  Users, Briefcase, FileText, Building2, ShieldCheck,
  Clock, CheckCircle, TrendingUp, AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAdminStats();
        setData(data);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /><p>Loading dashboard...</p></div>;

  const { stats, recentJobs, recentUsers } = data || {};

  const STAT_CARDS = [
    { label: "Total Users", value: stats?.totalUsers, icon: <Users size={22} />, color: "var(--teal)", bg: "var(--teal-light)" },
    { label: "Candidates", value: stats?.totalCandidates, icon: <FileText size={22} />, color: "var(--gold)", bg: "var(--gold-light)" },
    { label: "Employers", value: stats?.totalEmployers, icon: <Building2 size={22} />, color: "var(--violet)", bg: "var(--violet-light)" },
    { label: "Active Jobs", value: stats?.approvedJobs, icon: <CheckCircle size={22} />, color: "var(--green)", bg: "var(--green-light)" },
    { label: "Pending Review", value: stats?.pendingJobs, icon: <Clock size={22} />, color: "var(--orange)", bg: "var(--orange-light)" },
    { label: "Total Applications", value: stats?.totalApplications, icon: <TrendingUp size={22} />, color: "var(--blue)", bg: "var(--blue-light)" },
  ];

  const ROLE_BADGE = { candidate: "badge-teal", employer: "badge-gold", admin: "badge-violet" };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <ShieldCheck size={22} color="var(--gold)" />
            <h1>Admin Dashboard</h1>
          </div>
          <p>Overview of AbilityBridge platform activity and management.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container">

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16, marginBottom: 32 }}>
            {STAT_CARDS.map((s, i) => (
              <div key={i} className="stat-card animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value ?? "—"}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert for pending jobs */}
          {stats?.pendingJobs > 0 && (
            <div style={{ background: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--gold-dark)" }}>
                <AlertTriangle size={18} />
                <strong>{stats.pendingJobs} job{stats.pendingJobs !== 1 ? "s" : ""} awaiting review</strong> — review and approve them to keep the platform active.
              </div>
              <Link to="/admin/jobs?status=pending" className="btn btn-sm" style={{ background: "var(--gold)", color: "var(--ink)", border: "none" }}>
                Review Now
              </Link>
            </div>
          )}

          <div className="grid-2" style={{ gap: 24 }}>

            {/* Pending Jobs */}
            <div className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Pending Jobs</h3>
                <Link to="/admin/jobs" className="btn btn-outline btn-sm">View All</Link>
              </div>
              {(recentJobs || []).length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-muted)", textAlign: "center", padding: "20px 0" }}>No pending jobs. All clear! ✅</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(recentJobs || []).slice(0, 5).map(job => (
                    <div key={job._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{job.employer?.companyName || job.employer?.name}</div>
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: 10, flexShrink: 0 }}>
                        <Clock size={9} />Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Users */}
            <div className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Recent Users</h3>
                <Link to="/admin/users" className="btn btn-outline btn-sm">View All</Link>
              </div>
              {(recentUsers || []).length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-muted)", textAlign: "center", padding: "20px 0" }}>No users yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(recentUsers || []).map(u => (
                    <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, var(--teal-light), var(--gold-light))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--teal-dark)", flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{u.role === "employer" ? u.companyName : u.disabilityType || u.email}</div>
                      </div>
                      <span className={`badge ${ROLE_BADGE[u.role]}`} style={{ fontSize: 10, flexShrink: 0, textTransform: "capitalize" }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/admin/jobs?status=pending" className="btn btn-teal">
                <Clock size={15} />Review Pending Jobs
              </Link>
              <Link to="/admin/users?role=employer" className="btn btn-outline">
                <Building2 size={15} />Manage Employers
              </Link>
              <Link to="/admin/users?role=candidate" className="btn btn-outline">
                <Users size={15} />Manage Candidates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
