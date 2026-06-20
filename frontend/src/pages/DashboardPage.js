import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import api from '../utils/api';

// Sub-components
function DashboardHome({ user }) {
  const [stats, setStats] = useState({ listings: 0, requirements: 0, tickets: 0, notifications: 0 });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications').then(res => {
      setNotifications((res.data || []).slice(0, 5));
      setStats(s => ({ ...s, notifications: (res.data || []).filter(n => !n.is_read).length }));
    }).catch(() => {});
  }, []);

  const role = ROLES[user.role];
  const quickActions = {
    aggregator: [{ label: '+ List Land', to: '/list-land', primary: true }, { label: 'My Listings', to: '/dashboard/listings' }, { label: 'View Tickets', to: '/dashboard/tickets' }],
    investor: [{ label: 'Browse Opportunities', to: '/search', primary: true }, { label: 'My Investments', to: '/dashboard/investments' }],
    developer: [{ label: 'Browse Land', to: '/search', primary: true }, { label: '+ List Development', to: '/list-land' }],
    buyer: [{ label: 'Post Requirement', to: '/post-requirement', primary: true }, { label: 'My Requirements', to: '/dashboard/requirements' }, { label: 'Browse Land', to: '/search' }],
    consultant: [{ label: 'Browse Land', to: '/search', primary: true }, { label: 'My Clients', to: '/dashboard/clients' }],
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ color: '#0D2E5E' }}>Welcome back, {user.full_name?.split(' ')[0]} 👋</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
          <span className="badge badge-navy">{role?.icon} {role?.label}</span>
          {!user.profile_complete && <span className="badge badge-warning">⚠ Complete your profile</span>}
          {user.kyc_status === 'pending' && <span className="badge badge-warning">KYC Pending</span>}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {(quickActions[user.role] || []).map(a => (
          <Link key={a.to} to={a.to} className={`btn ${a.primary ? 'btn-primary' : 'btn-outline'}`}>{a.label}</Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'My Listings', val: '0', icon: '🗺️' },
          { label: 'Requirements', val: '0', icon: '📋' },
          { label: 'Tickets', val: '0', icon: '🔧' },
          { label: 'Unread Notifications', val: stats.notifications, icon: '🔔' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div className="stat-number" style={{ fontSize: '2rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
          <h4 style={{ color: '#0D2E5E', marginBottom: '1rem' }}>🔔 Recent Notifications</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem', background: n.is_read ? '#f7f8fc' : '#eff6ff', borderRadius: 10, border: n.is_read ? '1px solid #e5e7eb' : '1px solid #bfdbfe' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? '#d1d5db' : '#2563eb', marginTop: '0.4rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0D2E5E' }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile completion prompt */}
      {!user.profile_complete && (
        <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #0D2E5E, #1a4580)', borderRadius: 16, padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'white', marginBottom: '0.375rem' }}>Complete Your Profile</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Add your details to access all features and improve listing trust.</p>
          </div>
          <Link to="/dashboard/profile" className="btn btn-gold">Complete Now →</Link>
        </div>
      )}
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
      <h3 style={{ color: '#0D2E5E' }}>{title}</h3>
      <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '0.9rem' }}>This section is under development.</p>
    </div>
  );
}

const NAV_BY_ROLE = {
  aggregator: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/list-land', label: 'List Land', icon: '+ 🌾' },
    { to: '/dashboard/listings', label: 'My Listings', icon: '🗺️' },
    { to: '/dashboard/tickets', label: 'Verification Tickets', icon: '🔧' },
    { to: '/dashboard/profile', label: 'Profile & KYC', icon: '👤' },
  ],
  buyer: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/post-requirement', label: 'Post Requirement', icon: '📋' },
    { to: '/dashboard/requirements', label: 'My Requirements', icon: '🎯' },
    { to: '/search', label: 'Browse Land', icon: '🔍' },
    { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ],
  investor: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/search', label: 'Browse Opportunities', icon: '💰' },
    { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ],
  developer: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/search', label: 'Browse Land', icon: '🔍' },
    { to: '/list-land', label: 'List Development', icon: '🏗️' },
    { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ],
  consultant: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/search', label: 'Browse Land', icon: '🔍' },
    { to: '/post-requirement', label: "Client's Requirement", icon: '📋' },
    { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ],
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.buyer;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '0.375rem' }}>Logged in as</div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{user?.full_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{user?.email}</div>
          <span className="badge badge-gold" style={{ marginTop: '0.5rem', fontSize: '0.65rem' }}>
            {ROLES[user?.role]?.icon} {ROLES[user?.role]?.label}
          </span>
        </div>

        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Navigation</div>

        <ul className="sidebar-nav">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.exact}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Resources</div>
        <ul className="sidebar-nav">
          <li><NavLink to="/news"><span className="nav-icon">📰</span>News</NavLink></li>
          <li><NavLink to="/rate-cards"><span className="nav-icon">💼</span>Rate Cards</NavLink></li>
          <li><NavLink to="/dos-and-donts"><span className="nav-icon">📋</span>Guidelines</NavLink></li>
        </ul>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Routes>
          <Route index element={<DashboardHome user={user} />} />
          <Route path="listings" element={<Placeholder title="My Listings" />} />
          <Route path="requirements" element={<Placeholder title="My Requirements" />} />
          <Route path="tickets" element={<Placeholder title="Verification Tickets" />} />
          <Route path="profile" element={<Placeholder title="Profile & KYC" />} />
          <Route path="investments" element={<Placeholder title="My Investments" />} />
          <Route path="clients" element={<Placeholder title="Client Management" />} />
        </Routes>
      </main>
    </div>
  );
}
