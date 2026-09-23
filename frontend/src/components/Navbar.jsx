import React from 'react';
import { Compass, User, LogOut, Briefcase, GraduationCap, Building2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #059669)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)' }}>
            <Compass size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }} className="gradient-text">SkillBridge</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>SIH26044</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Academia-Industry Collaboration Portal</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className={`btn-secondary ${activeTab === 'landing' ? 'badge-cyan' : ''}`}
            onClick={() => setActiveTab('landing')}
            style={{ fontSize: '0.88rem' }}
          >
            <Compass size={16} /> Home
          </button>

          {user && user.role === 'student' && (
            <button 
              className={`btn-secondary ${activeTab === 'student' ? 'badge-cyan' : ''}`}
              onClick={() => setActiveTab('student')}
              style={{ fontSize: '0.88rem' }}
            >
              <GraduationCap size={16} /> Student Dashboard
            </button>
          )}

          {user && (user.role === 'industry' || user.role === 'admin') && (
            <button 
              className={`btn-secondary ${activeTab === 'industry' ? 'badge-cyan' : ''}`}
              onClick={() => setActiveTab('industry')}
              style={{ fontSize: '0.88rem' }}
            >
              <Building2 size={16} /> Industry Portal
            </button>
          )}

          {user && (user.role === 'academia' || user.role === 'admin') && (
            <button 
              className={`btn-secondary ${activeTab === 'academia' ? 'badge-cyan' : ''}`}
              onClick={() => setActiveTab('academia')}
              style={{ fontSize: '0.88rem' }}
            >
              <Briefcase size={16} /> Academia & Curriculum
            </button>
          )}

          {user && user.role === 'admin' && (
            <button 
              className={`btn-secondary ${activeTab === 'admin' ? 'badge-cyan' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ fontSize: '0.88rem' }}
            >
              <ShieldCheck size={16} /> Admin Analytics
            </button>
          )}
        </nav>

        {/* Right User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.full_name}</p>
                <span className={`badge ${
                  user.role === 'student' ? 'badge-cyan' :
                  user.role === 'industry' ? 'badge-emerald' :
                  user.role === 'academia' ? 'badge-amber' : 'badge-rose'
                }`} style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </div>
              <button 
                onClick={onLogout}
                className="btn-secondary"
                title="Logout"
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setActiveTab('login')} className="btn-secondary">
                <User size={16} /> Sign In
              </button>
              <button onClick={() => setActiveTab('register')} className="gradient-btn">
                <Sparkles size={16} /> Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
