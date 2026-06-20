import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.full_name?.split(' ')[0] || 'there'}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D2E5E 0%, #1a4580 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: '#C9A227', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: '#0D2E5E' }}>V</div>
            <span style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Vivid <span style={{ color: '#C9A227' }}>Advisory</span></span>
          </Link>
          <h2 style={{ color: 'white', marginBottom: '0.375rem' }}>Welcome Back</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Login to your Vivid Advisory account</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
          New to Vivid Advisory? <Link to="/register" style={{ color: '#C9A227', fontWeight: 700 }}>Create free account</Link>
        </p>
      </div>
    </div>
  );
}
