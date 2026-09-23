import React, { useState, useEffect } from 'react';
import SkillRadarChart from '../components/SkillRadarChart';
import { Target, Award, Sparkles, CheckCircle2, AlertTriangle, BookOpen, Briefcase, Send } from 'lucide-react';

export default function StudentDashboard({ token, user }) {
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [userSkillsMap, setUserSkillsMap] = useState({});
  const [radarData, setRadarData] = useState({ categories: [], student_scores: [], benchmark_scores: [] });
  const [gapAnalysis, setGapAnalysis] = useState({ overall_match_score: 85, gaps: [], recommended_courses: [] });
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('assessment');

  useEffect(() => {
    fetchSkillsCatalog();
    fetchMySkills();
    fetchRadarData();
    fetchGapAnalysis();
    fetchInternships();
    fetchMyApplications();
  }, [token]);

  const fetchSkillsCatalog = async () => {
    try {
      const res = await fetch('/api/skills/catalog');
      const data = await res.json();
      if (res.ok) setSkillsCatalog(data);
    } catch (err) {
      console.error('Failed to load skills catalog', err);
    }
  };

  const fetchMySkills = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/skills/my-skills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const map = {};
        data.forEach(item => {
          map[item.skill_id] = item.proficiency_level;
        });
        setUserSkillsMap(map);
      }
    } catch (err) {
      console.error('Failed to load user skills', err);
    }
  };

  const fetchRadarData = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/skills/radar', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRadarData(data);
    } catch (err) {
      console.error('Failed to load radar data', err);
    }
  };

  const fetchGapAnalysis = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/skills/gap-analysis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setGapAnalysis(data);
    } catch (err) {
      console.error('Failed to load gap analysis', err);
    }
  };

  const fetchInternships = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/internships', { headers });
      const data = await res.json();
      if (res.ok) setInternships(data);
    } catch (err) {
      console.error('Failed to load internships', err);
    }
  };

  const fetchMyApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/internships/applications/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMyApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
    }
  };

  const handleSliderChange = (skillId, val) => {
    setUserSkillsMap(prev => ({
      ...prev,
      [skillId]: parseInt(val)
    }));
  };

  const saveAssessment = async () => {
    if (!token) return;
    setSavingSkills(true);
    const assessments = Object.keys(userSkillsMap).map(sId => ({
      skill_id: parseInt(sId),
      proficiency_level: userSkillsMap[sId]
    }));

    try {
      const res = await fetch('/api/skills/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assessments })
      });
      if (res.ok) {
        await fetchRadarData();
        await fetchGapAnalysis();
        await fetchInternships();
        alert('Skill proficiency updated successfully!');
      }
    } catch (err) {
      alert('Error updating skills');
    } finally {
      setSavingSkills(false);
    }
  };

  const applyInternship = async (internshipId) => {
    if (!token) return alert('Please login to apply');
    setApplyingId(internshipId);

    try {
      const res = await fetch('/api/internships/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ internship_id: internshipId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Application submitted successfully!');
        fetchMyApplications();
      } else {
        alert(data.detail || 'Application failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setApplyingId(null);
    }
  };

  const appliedIds = myApplications.map(a => a.internship_id);

  return (
    <div className="animate-fade-in" style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Header Profile Summary */}
        <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>Welcome, {user?.full_name || 'Student'}</span>
              <span className="badge badge-cyan">Student Candidate</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.92rem' }}>
              {user?.institution_or_company || 'IIT Delhi'} • {user?.department_or_field || 'Computer Science & Bio-Tech'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {gapAnalysis.overall_match_score}%
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Industry Match Score</p>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '24px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {myApplications.length}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Applications Sent</p>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <button 
            className={`btn-secondary ${activeSubTab === 'assessment' ? 'badge-cyan' : ''}`}
            onClick={() => setActiveSubTab('assessment')}
          >
            <Target size={16} /> Skill Assessment & Radar Chart
          </button>

          <button 
            className={`btn-secondary ${activeSubTab === 'internships' ? 'badge-cyan' : ''}`}
            onClick={() => setActiveSubTab('internships')}
          >
            <Briefcase size={16} /> AI Matched Internships ({internships.length})
          </button>

          <button 
            className={`btn-secondary ${activeSubTab === 'applications' ? 'badge-cyan' : ''}`}
            onClick={() => setActiveSubTab('applications')}
          >
            <Send size={16} /> Application Tracker ({myApplications.length})
          </button>
        </div>

        {/* TAB 1: SKILL ASSESSMENT & RADAR CHART */}
        {activeSubTab === 'assessment' && (
          <div className="grid-2">
            {/* Left: Interactive Questionnaire */}
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color="var(--accent-cyan)" /> Skill Proficiency Assessment
                </h3>
                <button className="gradient-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={saveAssessment} disabled={savingSkills}>
                  {savingSkills ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '520px', overflowY: 'auto', paddingRight: '8px' }}>
                {skillsCatalog.map(skill => {
                  const currentVal = userSkillsMap[skill.id] || 1;
                  return (
                    <div key={skill.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{skill.name}</span>
                          <span className="badge badge-cyan" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>{skill.category}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Level {currentVal}/5</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{skill.description}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Novice</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={currentVal} 
                          onChange={(e) => handleSliderChange(skill.id, e.target.value)} 
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expert</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Radar Chart & Gap Analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--accent-emerald)" /> Multi-Dimensional Skill Radar
                </h3>
                <SkillRadarChart 
                  categories={radarData.categories}
                  studentScores={radarData.student_scores}
                  benchmarkScores={radarData.benchmark_scores}
                />
              </div>

              {/* Skill Gap Analysis Box */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="var(--accent-amber)" /> Skill Gap Breakdown
                </h3>

                {gapAnalysis.gaps.length === 0 ? (
                  <div style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} /> Outstanding! Your skill levels fully meet top industry benchmarks.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {gapAnalysis.gaps.map((g, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(251, 191, 36, 0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{g.skill_name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current: L{g.current_level} → Target: L{g.required_level}</span>
                        </div>
                        <span className="badge badge-amber">{g.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} color="var(--accent-cyan)" /> Recommended Learning Pathway
                  </h4>
                  {gapAnalysis.recommended_courses.map((c, i) => (
                    <p key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>• {c}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI MATCHED INTERNSHIPS FEED */}
        {activeSubTab === 'internships' && (
          <div className="grid-2">
            {internships.map(item => {
              const isApplied = appliedIds.includes(item.id);
              const matchColor = item.match_score >= 85 ? 'var(--accent-emerald)' : item.match_score >= 70 ? 'var(--accent-cyan)' : 'var(--accent-amber)';

              return (
                <div key={item.id} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{item.type}</span>
                        <h3 style={{ fontSize: '1.2rem', marginTop: '6px' }}>{item.title}</h3>
                        <p style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>{item.company_name}</p>
                      </div>

                      {item.match_score !== null && (
                        <div style={{ textAlign: 'right', background: 'rgba(15, 23, 42, 0.8)', padding: '8px 14px', borderRadius: '12px', border: `1px solid ${matchColor}` }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: matchColor }}>{item.match_score}%</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>AI Skill Match</span>
                        </div>
                      )}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                      {item.description}
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Required Skills & Target Proficiency:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {Object.entries(item.required_skills).map(([sName, minL]) => (
                          <span key={sName} className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', fontSize: '0.72rem' }}>
                            {sName} (L{minL})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                      <span>📍 {item.location}</span>
                      <span>💰 {item.stipend}</span>
                      <span>⏱️ {item.duration}</span>
                    </div>
                  </div>

                  <button 
                    className={isApplied ? "btn-secondary" : "gradient-btn"}
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => applyInternship(item.id)}
                    disabled={isApplied || applyingId === item.id}
                  >
                    {isApplied ? '✓ Application Submitted' : applyingId === item.id ? 'Applying...' : 'Apply Now with Skill Profile'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: APPLICATION TRACKER */}
        {activeSubTab === 'applications' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Application Status Tracker</h3>

            {myApplications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't submitted any internship applications yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Role / Position</th>
                      <th style={{ padding: '12px' }}>Company</th>
                      <th style={{ padding: '12px' }}>AI Match Score</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{app.internship_title}</td>
                        <td style={{ padding: '12px', color: 'var(--accent-cyan)' }}>{app.company_name}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{app.match_score}%</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${
                            app.status === 'hired' ? 'badge-emerald' :
                            app.status === 'shortlisted' ? 'badge-cyan' :
                            app.status === 'rejected' ? 'badge-rose' : 'badge-amber'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                          {new Date(app.applied_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
