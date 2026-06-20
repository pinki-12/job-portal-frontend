import React, { useState, useEffect, useCallback } from "react";
import { getAdminUsers, toggleUserStatus, verifyEmployer } from "../api/api";
import { useSearchParams } from "react-router-dom";
import {
  Users, Building2, User, ShieldCheck, CheckCircle, AlertCircle,
  ToggleLeft, ToggleRight, BadgeCheck, Search, RefreshCw
} from "lucide-react";

const ROLE_TABS = [
  { value: "", label: "All Users", icon: <Users size={14} /> },
  { value: "candidate", label: "Candidates", icon: <User size={14} /> },
  { value: "employer", label: "Employers", icon: <Building2 size={14} /> },
];

const ROLE_BADGE = {
  candidate: "badge-teal", employer: "badge-gold", admin: "badge-violet"
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get("role") || "";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ role: roleFilter || undefined });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { showToast("Could not load users.", "error"); }
    finally { setLoading(false); }
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? "Deactivate" : "Activate"} account for "${name}"?`)) return;
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      const { data } = await toggleUserStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      showToast(`Account ${data.user.isActive ? "activated" : "deactivated"}.`);
    } catch { showToast("Could not update.", "error"); }
    finally { setProcessing(p => ({ ...p, [id]: false })); }
  };

  const handleVerify = async (id, name) => {
    if (!window.confirm(`Verify employer "${name}" as a trusted inclusive employer?`)) return;
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      await verifyEmployer(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerifiedEmployer: true } : u));
      showToast(`${name} verified as trusted employer! ✅`);
    } catch { showToast("Could not verify.", "error"); }
    finally { setProcessing(p => ({ ...p, [id]: false })); }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.companyName?.toLowerCase().includes(q);
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>Manage Users</h1>
          <p>Oversee all candidates and employers on the platform.</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container">

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "2px solid var(--border)", paddingBottom: 0 }}>
            {ROLE_TABS.map(t => (
              <button key={t.value} onClick={() => setSearchParams(t.value ? { role: t.value } : {})}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                  color: roleFilter === t.value ? "var(--teal)" : "var(--ink-muted)",
                  borderBottom: `3px solid ${roleFilter === t.value ? "var(--teal)" : "transparent"}`,
                  marginBottom: -2, transition: "all 0.2s",
                }}>
                {t.icon}{t.label}
              </button>
            ))}
            <button onClick={fetchUsers} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", alignSelf: "center" }}>
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Search */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div className="input-icon-wrap" style={{ flex: 1, maxWidth: 360 }}>
              <Search size={15} className="icon-left" />
              <input className="form-input" placeholder="Search by name, email, or company..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{filtered.length} of {total} users</span>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: "var(--card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", padding: 20 }}>
                  <div className="skeleton" style={{ height: 16, width: "30%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: "50%" }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={28} /></div>
              <h3>No users found</h3>
              <p>Try a different search or filter.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(u => (
                <div key={u._id} className="card" style={{ padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 0 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                        background: u.isActive
                          ? "linear-gradient(135deg, var(--teal-light), var(--gold-light))"
                          : "var(--surface-alt)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 16, color: u.isActive ? "var(--teal-dark)" : "var(--ink-muted)",
                        fontFamily: "var(--font-display)",
                        border: u.isActive ? "2px solid var(--teal-light)" : "2px solid var(--border)",
                      }}>
                        {u.name?.[0]?.toUpperCase() || "?"}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: u.isActive ? "var(--ink)" : "var(--ink-muted)" }}>{u.name}</span>
                          <span className={`badge ${ROLE_BADGE[u.role]}`} style={{ fontSize: 10, textTransform: "capitalize" }}>{u.role}</span>
                          {!u.isActive && <span className="badge badge-rose" style={{ fontSize: 10 }}>Deactivated</span>}
                          {u.isVerifiedEmployer && (
                            <span className="badge badge-teal" style={{ fontSize: 10 }}>
                              <BadgeCheck size={9} />Verified Employer
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{u.email}</span>
                          {u.role === "employer" && u.companyName && (
                            <span style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                              <Building2 size={11} />{u.companyName}
                            </span>
                          )}
                          {u.role === "candidate" && u.disabilityType && (
                            <span className="badge badge-teal" style={{ fontSize: 10 }}>{u.disabilityType}</span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                            Joined {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {u.role === "employer" && !u.isVerifiedEmployer && (
                        <button className="btn btn-success btn-sm" onClick={() => handleVerify(u._id, u.name)} disabled={processing[u._id]} title="Verify as inclusive employer">
                          <ShieldCheck size={13} />Verify
                        </button>
                      )}
                      <button
                        className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggle(u._id, u.name, u.isActive)}
                        disabled={processing[u._id]}
                        title={u.isActive ? "Deactivate account" : "Activate account"}
                      >
                        {u.isActive
                          ? <><ToggleRight size={14} />Deactivate</>
                          : <><ToggleLeft size={14} />Activate</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
