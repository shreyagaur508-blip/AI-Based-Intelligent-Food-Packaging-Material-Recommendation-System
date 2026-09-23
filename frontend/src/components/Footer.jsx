import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ marginTop: '80px', borderTop: '1px solid var(--border-glass)', background: 'rgba(9, 13, 22, 0.9)', padding: '48px 0 24px 0' }}>
      <div className="container">
        <div className="grid-3" style={{ marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Compass size={20} className="gradient-text" />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>SkillBridge Portal</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Smart India Hackathon (SIH26044) project designed to map skills, bridge academic gap, and connect students with industry internships.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Key Stakeholders</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>🎓 <strong>Students:</strong> Skill mapping, gap analysis radar, AI matched internships</li>
              <li>🏢 <strong>Industry:</strong> Job postings, applicant match scores, micro-assessments</li>
              <li>🏛️ <strong>Academia:</strong> Placement analytics & curriculum recommendation alerts</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>SIH Metadata</h4>
            <div className="glass-panel" style={{ padding: '16px', fontSize: '0.85rem' }}>
              <p><strong>Problem Statement:</strong> SIH26044</p>
              <p style={{ marginTop: '4px' }}><strong>Organization:</strong> Ministry of Ayush / Education</p>
              <p style={{ marginTop: '4px' }}><strong>Tech Stack:</strong> FastAPI + SQLite + Vite React</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>© 2026 SkillBridge. Developed for Smart India Hackathon.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> in Antigravity
          </p>
        </div>
      </div>
    </footer>
  );
}
