import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #C9A227, #e8bb3f)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: '#0D2E5E' }}>V</div>
          <span className="navbar-logo-text">Vivid <span>Advisory</span></span>
        </Link>

        {/* Nav links */}
        <ul className="navbar-links">
          <li><NavLink to="/search">🗺 Browse Land</NavLink></li>
          <li><NavLink to="/news">📰 News</NavLink></li>
          <li><NavLink to="/rate-cards">💼 Services</NavLink></li>
          <li><NavLink to="/dos-and-donts">📋 Guidelines</NavLink></li>
          <li><NavLink to="/about">ℹ About</NavLink></li>
        </ul>

        {/* CTA */}
        <div className="navbar-cta">
          {user ? (
            <>
              <Link to="/list-land" className="btn btn-gold btn-sm">+ List Land</Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '0.4rem 0.875rem', color: 'white', cursor: 'pointer' }}
                >
                  <span style={{ width: 28, height: 28, background: '#C9A227', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#0D2E5E' }}>
                    {user.full_name?.[0]?.toUpperCase() || '?'}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user.full_name?.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.7rem' }}>▾</span>
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: 'white', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', minWidth: 200, overflow: 'hidden', zIndex: 100 }}>
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1A1A' }}>{user.full_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{user.email}</div>
                      {user.role && <span className={`badge badge-navy`} style={{ marginTop: '0.35rem', fontSize: '0.65rem' }}>{ROLES[user.role]?.icon} {ROLES[user.role]?.label}</span>}
                    </div>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.625rem 1rem', fontSize: '0.85rem', color: '#1A1A1A', transition: 'background 0.15s' }}>📊 Dashboard</Link>
                    <Link to="/post-requirement" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.625rem 1rem', fontSize: '0.85rem', color: '#1A1A1A' }}>📝 Post Requirement</Link>
                    <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.625rem 1rem', fontSize: '0.85rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #e5e7eb' }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-white btn-sm">Login</Link>
              <Link to="/register" className="btn btn-gold btn-sm">Register Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
