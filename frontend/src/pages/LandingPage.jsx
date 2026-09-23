import React from 'react';
import { Compass, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Target, Zap, BarChart3, Users, Briefcase } from 'lucide-react';

export default function LandingPage({ onSelectRoleDemo, setActiveTab }) {
  return (
    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Hero Banner */}
        <div className="glass-panel" style={{ padding: '60px 40px', borderRadius: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '48px' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          
          <span className="badge badge-cyan" style={{ marginBottom: '20px' }}>
            <Sparkles size={14} /> Ministry of Ayush & Education SIH26044
          </span>
          
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' }}>
            Bridging Academia & Industry Through <br />
            <span className="gradient-text">AI Skill Mapping & Placement Engine</span>
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
            Empowering students with radar-based skill gap analytics, connecting industry with AI-matched talent, and providing academic institutions real-time curriculum alignment recommendations.
          </p>

          {/* Quick Demo Launchpad Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button className="gradient-btn" onClick={() => onSelectRoleDemo('student')}>
              <Users size={18} /> Launch Student Portal Demo
            </button>
            <button className="btn-secondary" onClick={() => onSelectRoleDemo('industry')}>
              <Briefcase size={18} /> Launch Industry Portal Demo
            </button>
            <button className="btn-secondary" onClick={() => onSelectRoleDemo('academia')}>
              <BarChart3 size={18} /> Launch Academia Portal Demo
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ⚡ One-click instant login with preloaded demo data (50+ Skills, Radar Charts, Applications)
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid-4" style={{ marginBottom: '48px' }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>84.2%</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Average AI Skill Match Score</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>142+</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Students Assessed & Mapped</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>38</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Active Industry Internships</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>18</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Curriculum Gap Advisories</p>
          </div>
        </div>

        {/* Stakeholder Pillars */}
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '32px' }}>
          Designed for End-to-End <span className="gradient-text">Collaboration</span>
        </h2>

        <div className="grid-3" style={{ marginBottom: '60px' }}>
          {/* Pillar 1 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '20px' }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Interactive Skill Assessment & Radar</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Students evaluate technical, soft, and domain skills on a 1-5 scale. Automated Radar charts immediately show individual gaps against current industry standards.
            </p>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#38bdf8" /> Multi-dimensional Radar Charting</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#38bdf8" /> Personalized course recommendations</li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '20px' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>AI Vector Internship Matching</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Replaces keyword filtering with weighted skill vector matching. Companies receive applicant pools pre-ranked by objective match percentage.
            </p>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#34d399" /> Instant AI % Skill Match Score</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#34d399" /> Direct applicant status management</li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(129, 140, 248, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '20px' }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Academic Curriculum Alignment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Aggregates student deficit metrics per academic department, giving deans and professors actionable recommendations to update syllabus modules.
            </p>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#818cf8" /> Department skill gap metrics</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#818cf8" /> Actionable syllabus advisories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
