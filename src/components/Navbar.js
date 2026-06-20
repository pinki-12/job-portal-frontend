import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu, X, Accessibility, Briefcase, LayoutDashboard,
  User, FileText, LogOut, Plus, Users, ShieldCheck
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navStyle = {
    background: scrolled ? "rgba(10,15,30,0.98)" : "var(--ink)",
    transition: "background 0.3s ease",
    backdropFilter: scrolled ? "blur(12px)" : "none",
  };

  const CandidateLinks = () => (
    <>
      <li>
        <Link to="/jobs" className={isActive("/jobs") ? "active" : ""}>
          <Briefcase size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Browse Jobs
        </Link>
      </li>
      <li>
        <Link to="/my-applications" className={isActive("/my-applications") ? "active" : ""}>
          <FileText size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />My Applications
        </Link>
      </li>
      <li>
        <Link to="/profile" className={isActive("/profile") ? "active" : ""}>
          <User size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Profile
        </Link>
      </li>
    </>
  );

  const EmployerLinks = () => (
    <>
      <li>
        <Link to="/employer/jobs" className={isActive("/employer/jobs") ? "active" : ""}>
          <Briefcase size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />My Listings
        </Link>
      </li>
      <li>
        <Link to="/employer/post-job" className={isActive("/employer/post-job") ? "active" : ""}>
          <Plus size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Post a Job
        </Link>
      </li>
    </>
  );

  const AdminLinks = () => (
    <>
      <li>
        <Link to="/admin/dashboard" className={isActive("/admin/dashboard") ? "active" : ""}>
          <LayoutDashboard size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Dashboard
        </Link>
      </li>
      <li>
        <Link to="/admin/jobs" className={isActive("/admin/jobs") ? "active" : ""}>
          <Briefcase size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Manage Jobs
        </Link>
      </li>
      <li>
        <Link to="/admin/users" className={isActive("/admin/users") ? "active" : ""}>
          <Users size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Users
        </Link>
      </li>
    </>
  );

  return (
    <nav className="navbar" style={navStyle} role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="AbilityBridge Home">
          <div className="navbar-logo-mark">
            <Accessibility size={20} color="white" strokeWidth={2} />
          </div>
          <span className="navbar-logo-text">Talent Without<em> Limits</em></span>
        </Link>

        <ul className={`navbar-links${menuOpen ? " open" : ""}`} role="list">
          {!user ? (
            <>
              <li><Link to="/login" className={isActive("/login") ? "active" : ""}>Sign In</Link></li>
              <li>
                <Link to="/register">
                  <button className="btn btn-primary btn-sm">Get Started</button>
                </Link>
              </li>
            </>
          ) : (
            <>
              {user.role === "candidate" && <CandidateLinks />}
              {user.role === "employer" && <EmployerLinks />}
              {user.role === "admin" && <AdminLinks />}

              <li><div className="navbar-divider" /></li>

              <li>
                <span className="navbar-role-badge">
                  {user.role === "admin" && <ShieldCheck size={10} style={{ marginRight: 3 }} />}
                  {user.role}
                </span>
              </li>

              <li style={{ maxWidth: 110, overflow: "hidden" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, padding: "7px 6px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name?.split(" ")[0]}
                </span>
              </li>

              <li>
                <button onClick={handleLogout} aria-label="Sign out" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <LogOut size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Sign Out
                </button>
              </li>
            </>
          )}
        </ul>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
