import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import IndustryDashboard from './pages/IndustryDashboard';
import AcademiaDashboard from './pages/AcademiaDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillbridge_token') || '');
  const [activeTab, setActiveTab] = useState('landing');

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to validate token session', err);
    }
  };

  const handleLoginSuccess = (tokenData) => {
    setToken(tokenData.access_token);
    localStorage.setItem('skillbridge_token', tokenData.access_token);
    setUser({
      id: tokenData.user_id,
      email: tokenData.email,
      full_name: tokenData.full_name,
      role: tokenData.role
    });

    // Auto navigate to role dashboard
    if (tokenData.role === 'student') setActiveTab('student');
    else if (tokenData.role === 'industry') setActiveTab('industry');
    else if (tokenData.role === 'academia') setActiveTab('academia');
    else if (tokenData.role === 'admin') setActiveTab('admin');
    else setActiveTab('landing');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('skillbridge_token');
    setActiveTab('landing');
  };

  const handleSelectRoleDemo = async (roleName) => {
    const demoCredentials = {
      student: { email: 'student@demo.com', password: 'password123' },
      industry: { email: 'industry@demo.com', password: 'password123' },
      academia: { email: 'academia@demo.com', password: 'password123' },
      admin: { email: 'admin@demo.com', password: 'password123' }
    };

    const targetCreds = demoCredentials[roleName];
    if (!targetCreds) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetCreds)
      });
      const data = await res.json();
      if (res.ok) {
        handleLoginSuccess(data);
      } else {
        alert('Demo login failed. Make sure backend is running.');
      }
    } catch (err) {
      alert('Unable to connect to backend server');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'landing' && (
          <LandingPage onSelectRoleDemo={handleSelectRoleDemo} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onSelectRoleDemo={handleSelectRoleDemo} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'register' && (
          <RegisterPage onLoginSuccess={handleLoginSuccess} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'student' && (
          <StudentDashboard token={token} user={user} />
        )}

        {activeTab === 'industry' && (
          <IndustryDashboard token={token} user={user} />
        )}

        {activeTab === 'academia' && (
          <AcademiaDashboard token={token} user={user} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard token={token} />
        )}
      </main>

      <Footer />
    </div>
  );
}
