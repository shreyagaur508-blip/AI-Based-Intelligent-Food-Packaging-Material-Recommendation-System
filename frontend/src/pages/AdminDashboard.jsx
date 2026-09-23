import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Building2, Briefcase, Award, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAdminSummary();
  }, [token]);

  const fetchAdminSummary = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/analytics/admin-summary', { headers });
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (err) {
      console.error('Failed to load admin summary', err);
    }
  };

  const metrics = data?.metrics || {
    total_students: 142,
    total_industry: 18,
    total_academia: 12,
    total_internships: 38,
    total_applications: 156,
    placements_completed: 42,
    average_match_score: "84.2%"
  };

  return (
    <div className="animate-fade-in" style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Admin Header */}
        <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>National Skill Mapping Administration</span>
              <span className="badge badge-rose">SIH Governance</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.92rem' }}>
              Ministry of Ayush & Education Collaboration Oversight Portal
            </p>
          </div>

          <span className="badge badge-emerald" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <Activity size={14} /> Ecosystem Health: Optimal
          </span>
        </div>

        {/* System Overview Metrics */}
        <div className="grid-4" style={{ marginBottom: '36px' }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <Users size={24} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
            <div className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>{metrics.total_students}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Assessed Students</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <Building2 size={24} color="var(--accent-emerald)" style={{ marginBottom: '8px' }} />
            <div className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>{metrics.total_industry}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Industry Partners</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <Briefcase size={24} color="var(--accent-indigo)" style={{ marginBottom: '8px' }} />
            <div className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>{metrics.total_internships}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Open Positions</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <Award size={24} color="var(--accent-amber)" style={{ marginBottom: '8px' }} />
            <div className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>{metrics.placements_completed}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Placements Completed</p>
          </div>
        </div>

        {/* National Demanded Skills Table */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} color="var(--accent-cyan)" /> High-Demand Skill Shortage Monitor
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Skill Name</th>
                  <th style={{ padding: '12px' }}>Active Job Postings</th>
                  <th style={{ padding: '12px' }}>National Shortage Severity</th>
                  <th style={{ padding: '12px' }}>Recommended Priority</th>
                </tr>
              </thead>
              <tbody>
                {data?.top_demanded_skills?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.skill}</td>
                    <td style={{ padding: '12px', color: 'var(--accent-cyan)' }}>{item.job_postings} listings</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        item.skill_gap_severity === 'High' ? 'badge-rose' :
                        item.skill_gap_severity === 'Medium' ? 'badge-amber' : 'badge-emerald'
                      }`}>
                        {item.skill_gap_severity} Gap
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      {item.skill_gap_severity === 'High' ? '⚡ High Priority Academic Intervention' : 'Normal Monitoring'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
