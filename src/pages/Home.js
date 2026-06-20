import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Accessibility, Briefcase, Building2, ShieldCheck, Clock, Wifi,
  ChevronRight, Eye, Ear, Hand, Brain, Heart, Star, ArrowRight, Users
} from "lucide-react";

const STATS = [
  { value: "12,000+", label: "Inclusive Jobs Posted", color: "var(--teal)" },
  { value: "8,500+", label: "Candidates Hired", color: "var(--gold)" },
  { value: "2,100+", label: "Partner Employers", color: "var(--violet)" },
  { value: "98%", label: "Satisfaction Rate", color: "var(--green)" },
];

const FEATURES = [
  { icon: <Wifi size={22} />, title: "Remote-First Jobs", desc: "Thousands of remote-friendly positions especially suited for professionals who work best from home.", color: "var(--teal-light)", accent: "var(--teal)" },
  { icon: <Accessibility size={22} />, title: "Wheelchair Accessible", desc: "Verified accessible workplaces with ramps, elevators, and accessible restrooms.", color: "var(--gold-light)", accent: "var(--gold)" },
  { icon: <Clock size={22} />, title: "Flexible Schedules", desc: "Part-time, flexi-hours and compressed workweeks for better work-life balance.", color: "var(--violet-light)", accent: "var(--violet)" },
  { icon: <Eye size={22} />, title: "Screen Reader Ready", desc: "Employers who have optimized workplaces for visually impaired professionals.", color: "var(--blue-light)", accent: "var(--blue)" },
  { icon: <Ear size={22} />, title: "Sign Language Support", desc: "Companies with dedicated sign language interpreters and deaf-friendly environments.", color: "var(--green-light)", accent: "var(--green)" },
  { icon: <Brain size={22} />, title: "Mental Health Support", desc: "Employers with wellness programs, counseling and mental health days.", color: "var(--rose-light)", accent: "var(--rose)" },
];

const DISABILITY_TYPES = [
  { icon: <Eye size={18} />, label: "Visual Impairment" },
  { icon: <Ear size={18} />, label: "Hearing Impairment" },
  { icon: <Accessibility size={18} />, label: "Physical / Mobility" },
  { icon: <Brain size={18} />, label: "Cognitive / Intellectual" },
  { icon: <Hand size={18} />, label: "Autism Spectrum" },
  { icon: <Heart size={18} />, label: "Chronic Illness" },
  { icon: <Star size={18} />, label: "Mental Health" },
  { icon: <Users size={18} />, label: "Multiple Disabilities" },
];

const STEPS = [
  {
    step: "01", icon: <Accessibility size={26} />, title: "Create Your Profile",
    desc: "Register as a candidate, list your skills, specify your disability type and accommodation needs.",
    color: "var(--teal-light)", iconColor: "var(--teal)"
  },
  {
    step: "02", icon: <Briefcase size={26} />, title: "Discover Inclusive Jobs",
    desc: "Browse accessible listings filtered by remote work, flexible hours, and specific accommodations.",
    color: "var(--gold-light)", iconColor: "var(--gold)"
  },
  {
    step: "03", icon: <Building2 size={26} />, title: "Apply with Confidence",
    desc: "Submit your application with a cover letter and track its status in real time.",
    color: "var(--violet-light)", iconColor: "var(--violet)"
  },
  {
    step: "04", icon: <ShieldCheck size={26} />, title: "Get Hired & Thrive",
    desc: "Connect with inclusive employers who celebrate diversity and provide the support you need.",
    color: "var(--green-light)", iconColor: "var(--green)"
  },
];

export default function Home() {
  const { user } = useAuth();
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); } }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    sectionRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => { if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el); };

  return (
    <div className="page-wrapper">

      {/* ── HERO ── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-bg-gradient" />
        <div className="hero-grid" />
        <div className="hero-orbs">
          <div className="hero-orb" />
          <div className="hero-orb" />
          <div className="hero-orb" />
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow animate-in">
              <Accessibility size={14} />
              India's #1 Inclusive Employment Platform
            </div>

            <h1 className="hero-title animate-in animate-in-delay-1" id="hero-heading">
              Where <em>Every Ability</em><br />Finds Its Career
            </h1>

            <p className="hero-subtitle animate-in animate-in-delay-2">
              AbilityBridge connects talented professionals with disabilities to employers who genuinely
              value diversity. Thousands of accessible, remote, and flexible jobs — built for you.
            </p>

            <div className="hero-actions animate-in animate-in-delay-3">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-xl">
                    Start Your Journey <ChevronRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "2px solid rgba(255,255,255,0.15)" }}>
                    Sign In
                  </Link>
                </>
              ) : user.role === "candidate" ? (
                <Link to="/jobs" className="btn btn-primary btn-xl">
                  Browse Jobs <ArrowRight size={18} />
                </Link>
              ) : user.role === "employer" ? (
                <Link to="/employer/post-job" className="btn btn-primary btn-xl">
                  Post a Job <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/admin/dashboard" className="btn btn-primary btn-xl">
                  Admin Dashboard <ArrowRight size={18} />
                </Link>
              )}
            </div>

            <div className="hero-features animate-in animate-in-delay-4">
              {[
                { icon: <Accessibility size={14} />, text: "Wheelchair Accessible" },
                { icon: <Wifi size={14} />, text: "Remote-First" },
                { icon: <Clock size={14} />, text: "Flexible Hours" },
                { icon: <ShieldCheck size={14} />, text: "Verified Employers" },
              ].map((f, i) => (
                <div className="hero-feature" key={i}>
                  <span className="hero-feature-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "var(--ink)", padding: "48px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "20px 16px", borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISABILITY TYPES SERVED ── */}
      <section style={{ padding: "80px 0", background: "var(--surface)" }}>
        <div className="container">
          <div className="section-header" ref={addRef}>
            <span className="section-label">Who We Serve</span>
            <h2 className="section-title">Built for <em>Every Type</em> of Ability</h2>
            <p className="section-subtitle">AbilityBridge is designed to serve professionals across the full spectrum of disabilities.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
            {DISABILITY_TYPES.map((d, i) => (
              <div key={i} ref={addRef} style={{
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                padding: "20px 16px", textAlign: "center",
                transition: "all 0.25s var(--ease)", cursor: "default",
                animationDelay: `${i * 0.06}s`
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--teal-light)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--teal)" }}>
                  {d.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", lineHeight: 1.3 }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACCESSIBILITY FEATURES ── */}
      <section style={{ padding: "80px 0", background: "var(--surface-alt)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Accessibility Features</span>
            <h2 className="section-title">Jobs With Real <em>Accommodations</em></h2>
            <p className="section-subtitle">Every job listing shows exactly what accessibility features and accommodations an employer provides.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" ref={addRef}
                style={{ display: "flex", gap: 18, padding: "22px 20px", animationDelay: `${i * 0.08}s` }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "var(--radius)",
                  background: f.color, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: f.accent
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 0", background: "var(--surface)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Your Path to <em>Meaningful Work</em></h2>
            <p className="section-subtitle">Four simple steps to connect you with the inclusive employer of your dreams.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {STEPS.map((step, i) => (
              <div key={i} className="card" ref={addRef} style={{ textAlign: "center", padding: "32px 24px", position: "relative", overflow: "hidden", animationDelay: `${i * 0.1}s` }}>
                <div style={{
                  position: "absolute", top: 12, right: 16,
                  fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 800,
                  color: "var(--border)", lineHeight: 1, opacity: 0.5, pointerEvents: "none"
                }}>
                  {step.step}
                </div>
                <div style={{
                  width: 64, height: 64, background: step.color, borderRadius: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", color: step.iconColor
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: "var(--ink-muted)", fontSize: 13, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section style={{
          background: "linear-gradient(135deg, var(--teal-dark) 0%, var(--ink) 60%)",
          padding: "80px 0", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(212,134,10,0.15), transparent 70%)", pointerEvents: "none" }} />
          <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="badge badge-teal" style={{ background: "rgba(11,138,143,0.3)", color: "var(--teal-light)", border: "1px solid rgba(11,138,143,0.4)", padding: "6px 16px", fontSize: 12 }}>
                Join 12,000+ People Today
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 52px)", color: "white", marginBottom: 16, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
              Your Disability is Not<br /><em style={{ color: "var(--gold)", fontStyle: "italic" }}>Your Limitation.</em>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 40, fontSize: 16, maxWidth: 480, margin: "0 auto 40px" }}>
              Join AbilityBridge and discover employers who see your potential, not your disability.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className="btn btn-primary btn-xl">
                Find Jobs Now <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=employer" className="btn btn-xl"
                style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "2px solid rgba(255,255,255,0.2)" }}>
                Post a Job
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, var(--gold), var(--teal))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Accessibility size={14} color="white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
              Ability<strong style={{ color: "var(--gold)" }}>Bridge</strong>
            </span>
          </div>
          <p>© 2025 <strong>AbilityBridge</strong> — Building an inclusive workforce, one opportunity at a time.</p>
          <p style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            Designed with ❤️ for the differently-abled community of India
          </p>
        </div>
      </footer>

      <style>{`
        section .section-header,
        section .card,
        section > .container > div > div {
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
      `}</style>
    </div>
  );
}
