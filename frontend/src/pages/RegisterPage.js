import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ROLES } from '../utils/constants';

const CHATBOT_STEPS = [
  { key: 'role', question: '👋 Welcome! What best describes you?', type: 'choice', choices: Object.entries(ROLES).map(([v, r]) => ({ value: v, label: `${r.icon} ${r.label}` })) },
  { key: 'full_name', question: 'Great! What is your full name?', type: 'text', placeholder: 'Your full name' },
  { key: 'company_name', question: 'What is your company / organization name? (optional)', type: 'text', placeholder: 'Company name or skip' },
  { key: 'phone', question: 'Your mobile number?', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
  { key: 'email', question: 'Your email address?', type: 'email', placeholder: 'you@example.com' },
  { key: 'password', question: 'Choose a secure password (minimum 8 characters)', type: 'password', placeholder: '••••••••' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Welcome to Vivid Advisory! I\'ll help you create your account in just a few steps.' }
  ]);

  const current = CHATBOT_STEPS[step];

  const addMessage = (from, text) => setMessages(prev => [...prev, { from, text }]);

  const handleChoice = (value, label) => {
    setData(prev => ({ ...prev, [current.key]: value }));
    addMessage('user', label);
    const next = CHATBOT_STEPS[step + 1];
    if (next) {
      setTimeout(() => addMessage('bot', next.question), 400);
      setStep(step + 1);
    }
    setInputVal('');
  };

  const handleNext = async () => {
    if (!inputVal.trim() && current.key !== 'company_name') return;
    const val = inputVal.trim();
    const updated = { ...data, [current.key]: val };
    setData(updated);
    addMessage('user', current.type === 'password' ? '••••••••' : val || '(skipped)');
    setInputVal('');

    if (step < CHATBOT_STEPS.length - 1) {
      const next = CHATBOT_STEPS[step + 1];
      setTimeout(() => addMessage('bot', next.question), 400);
      setStep(step + 1);
    } else {
      // Last step — submit
      setLoading(true);
      addMessage('bot', '⏳ Creating your account...');
      try {
        const res = await api.post('/auth/register', {
          email: updated.email,
          password: updated.password,
          role: updated.role,
          full_name: updated.full_name,
          company_name: updated.company_name,
          phone: updated.phone,
        });
        login(res.data.token, res.data.user);
        addMessage('bot', `✅ Account created! Welcome, ${updated.full_name?.split(' ')[0]}! Redirecting to your dashboard...`);
        toast.success('Welcome to Vivid Advisory!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        const msg = err.response?.data?.error || 'Registration failed. Please try again.';
        addMessage('bot', `❌ ${msg}`);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D2E5E 0%, #1a4580 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: '#C9A227', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: '#0D2E5E' }}>V</div>
            <span style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', fontWeight: 800 }}>Vivid <span style={{ color: '#C9A227' }}>Advisory</span></span>
          </Link>
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Create Your Account</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>A 60-second setup, guided by our assistant</p>
        </div>

        {/* Chat panel */}
        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          {/* Progress bar */}
          <div style={{ height: 4, background: '#e5e7eb' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #0D2E5E, #C9A227)', width: `${((step) / CHATBOT_STEPS.length) * 100}%`, transition: 'width 0.4s' }} />
          </div>

          {/* Messages */}
          <div style={{ padding: '1.25rem', maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '82%', padding: '0.625rem 0.875rem', borderRadius: m.from === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.from === 'user' ? '#0D2E5E' : '#f3f4f6', color: m.from === 'user' ? 'white' : '#1A1A1A', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '1rem 1.25rem', background: '#fafafa' }}>
            {current?.type === 'choice' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {current.choices.map(c => (
                  <button key={c.value} onClick={() => handleChoice(c.value, c.label)}
                    style={{ padding: '0.75rem 1rem', background: 'white', border: '2px solid #e5e7eb', borderRadius: 10, textAlign: 'left', fontWeight: 600, fontSize: '0.9rem', color: '#0D2E5E', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.target.style.borderColor = '#0D2E5E'; e.target.style.background = '#f0f4f8'; }}
                    onMouseLeave={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = 'white'; }}
                  >{c.label}</button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type={current?.type || 'text'}
                  placeholder={current?.placeholder}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleNext()}
                  style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.9rem', outline: 'none' }}
                />
                <button onClick={handleNext} disabled={loading}
                  style={{ padding: '0.7rem 1.25rem', background: '#0D2E5E', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '...' : step === CHATBOT_STEPS.length - 1 ? '✓' : '→'}
                </button>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#C9A227', fontWeight: 700 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
