import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, Users, CheckCircle2, XCircle, Award, Briefcase } from 'lucide-react';

export default function IndustryDashboard({ token, user }) {
  const [applicants, setApplicants] = useState([]);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Post Internship Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote');
  const [stipend, setStipend] = useState('₹25,000/month');
  const [type, setType] = useState('Internship');
  const [duration, setDuration] = useState('3 Months');
  const [selectedReqSkills, setSelectedReqSkills] = useState({
    "Python & FastAPI": 4,
    "Machine Learning & AI": 3
  });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchApplicants();
    fetchSkillsCatalog();
  }, [token]);

  const fetchApplicants = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/internships/applications/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setApplicants(data);
    } catch (err) {
      console.error('Failed to load applicants', err);
    }
  };

  const fetchSkillsCatalog = async () => {
    try {
      const res = await fetch('/api/skills/catalog');
      const data = await res.json();
      if (res.ok) setSkillsCatalog(data);
    } catch (err) {
      console.error('Failed to load skills catalog', err);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/internships/applications/${appId}/status?status_value=${newStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchApplicants();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handlePostInternship = async (e) => {
    e.preventDefault();
    setPosting(true);

    try {
      const res = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          required_skills: selectedReqSkills,
          location,
          stipend,
          type,
          duration
        })
      });
      if (res.ok) {
        alert('Internship opportunity published successfully!');
        setShowPostModal(false);
        setTitle('');
        setDescription('');
      } else {
        alert('Failed to post internship');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setPosting(false);
    }
  };

  const toggleSkillRequirement = (skillName, val) => {
    setSelectedReqSkills(prev => ({
      ...prev,
      [skillName]: parseInt(val)
    }));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Company Header */}
        <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{user?.institution_or_company || 'Dabur Ayush Research & Tech'}</span>
              <span className="badge badge-emerald">Verified Industry Partner</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.92rem' }}>
              Recruiter: {user?.full_name} • {user?.department_or_field || 'R&D Talent Acquisition'}
            </p>
          </div>

          <button className="gradient-btn" onClick={() => setShowPostModal(true)}>
            <PlusCircle size={18} /> Post New Opportunity
          </button>
        </div>

        {/* Applicant Pool with AI Match Ranking */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="var(--accent-emerald)" /> AI Rank-Matched Candidates ({applicants.length})
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Sorted by objective AI Skill Vector Match (%)
            </span>
          </div>

          {applicants.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No student applications received yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applicants.map(app => {
                const matchColor = app.match_score >= 85 ? 'var(--accent-emerald)' : app.match_score >= 70 ? 'var(--accent-cyan)' : 'var(--accent-amber)';

                return (
                  <div key={app.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{app.student_name}</span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{app.student_email}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Applied for: <strong>{app.internship_title}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.9)', padding: '8px 16px', borderRadius: '12px', border: `1px solid ${matchColor}` }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: matchColor }}>{app.match_score}%</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Skill Match</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className={`btn-secondary ${app.status === 'shortlisted' ? 'badge-cyan' : ''}`}
                          onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          Shortlist
                        </button>
                        <button 
                          className={`btn-secondary ${app.status === 'hired' ? 'badge-emerald' : ''}`}
                          onClick={() => handleUpdateStatus(app.id, 'hired')}
                          style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#34d399' }}
                        >
                          Hire Candidate
                        </button>
                        <button 
                          className={`btn-secondary ${app.status === 'rejected' ? 'badge-rose' : ''}`}
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#f43f5e' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* POST INTERNSHIP MODAL */}
        {showPostModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.4rem' }}>Post New Internship / Project</h3>
                <button className="btn-secondary" style={{ padding: '4px 10px' }} onClick={() => setShowPostModal(false)}>✕</button>
              </div>

              <form onSubmit={handlePostInternship}>
                <div className="form-group">
                  <label className="form-label">Position Title</label>
                  <input type="text" className="form-input" placeholder="e.g. AI & Herbal Data Analyst Intern" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea className="form-textarea" rows="3" placeholder="Outline key duties, R&D objectives..." value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stipend / Salary</label>
                    <input type="text" className="form-input" value={stipend} onChange={(e) => setStipend(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Select Required Skills & Minimum Level (1-5)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {skillsCatalog.map(sk => {
                      const reqL = selectedReqSkills[sk.name] || 0;
                      return (
                        <div key={sk.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.88rem' }}>{sk.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Min L{reqL}</span>
                            <input 
                              type="range" 
                              min="0" 
                              max="5" 
                              value={reqL} 
                              onChange={(e) => toggleSkillRequirement(sk.name, e.target.value)} 
                              style={{ width: '100px' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={posting}>
                  {posting ? 'Publishing...' : 'Publish Position to Student Network'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
