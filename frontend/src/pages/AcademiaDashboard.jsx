import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Sparkles, Building2, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';

export default function AcademiaDashboard({ token, user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAcademiaGaps();
  }, [token]);

  const fetchAcademiaGaps = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/analytics/academia-gaps', { headers });
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (err) {
      console.error('Failed to load academia gaps', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Academic Institution Banner */}
        <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{data?.institution || user?.institution_or_company || 'IIT Delhi'}</span>
              <span className="badge badge-amber">Academic Council Portal</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.92rem' }}>
              Dean: {user?.full_name || 'Prof. Sunita Rao'} • Department of Academic Partnerships & Curriculum Development
            </p>
          </div>

          <span className="badge badge-cyan" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <Sparkles size={14} /> AI Syllabus Synchronization Active
          </span>
        </div>

        {/* Actionable Curriculum Recommendations */}
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '36px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={22} color="var(--accent-amber)" /> Actionable Curriculum Alignment Advisories
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data?.recommendations?.map((rec, idx) => (
              <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-glass)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '12px', borderRadius: '12px', color: '#fbbf24' }}>
                  <AlertCircle size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>{rec.department} • Missing Skill: <span className="gradient-text">{rec.missing_skill_name}</span></h4>
                    <span className="badge badge-amber">{rec.gap_severity} Gap</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px', lineHeight: 1.5 }}>
                    <strong>Recommended Action:</strong> {rec.suggested_action}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>📈 Industry Demand Surge: {rec.industry_demand_count} active job postings</span>
                    <span>🏛️ Institution: {rec.institution_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Readiness Summary Grid */}
        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={22} color="var(--accent-cyan)" /> Department-Wide Student Placement Readiness
        </h3>

        <div className="grid-3">
          {data?.departments?.map((dept, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Enrolled: {dept.enrolled_students}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{dept.avg_skill_readiness}</span>
              </div>

              <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{dept.department}</h4>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Top Identified Skill Gaps:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {dept.top_gap_skills.map((s, i) => (
                    <span key={i} className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Market Demand Trend</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{dept.industry_demand_growth}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
