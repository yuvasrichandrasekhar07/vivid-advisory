import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KARNATAKA_DISTRICTS, LAND_USE_TYPES } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CHATBOT_Q = [
  { key: 'land_use_type', question: '🏭 What type of land are you looking for?', type: 'choice', choices: LAND_USE_TYPES.map(t => ({ value: t.value, label: t.label })) },
  { key: 'preferred_districts', question: '📍 Which districts in Karnataka do you prefer? (you can pick multiple)', type: 'multi_choice', choices: ['Bengaluru Urban', 'Mysuru', 'Tumakuru', 'Dharwad', 'Belagavi', 'Hassan', 'Shivamogga', 'Raichur', 'Vijayapura', 'Kalaburagi'].map(d => ({ value: d, label: d })) },
  { key: 'area', question: '📏 What is your required land area?', type: 'area' },
  { key: 'budget', question: '💰 What is your budget range?', type: 'budget' },
  { key: 'engagement_type', question: '🤝 How do you want to engage?', type: 'choice', choices: [{ value: 'buy', label: 'Purchase Outright' }, { value: 'lease', label: 'Long-term Lease' }, { value: 'build_to_suit', label: 'Build-to-Suit' }, { value: 'joint_venture', label: 'Joint Venture' }] },
  { key: 'special', question: '⚙️ Any special requirements?', type: 'multi_choice', choices: [{ value: 'drainage', label: 'Drainage Required' }, { value: 'power', label: 'High Power Requirement' }, { value: 'storage', label: 'Storage/Warehouse' }, { value: 'developer', label: 'Need Developer Partner' }, { value: 'none', label: 'None of the above' }] },
  { key: 'description', question: '📝 Briefly describe your requirement (optional — you can skip)', type: 'text', placeholder: 'E.g. Setting up a 500-worker apparel factory near highway...' },
];

export default function PostRequirementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ preferred_districts: [], special: [] });
  const [messages, setMessages] = useState([
    { from: 'bot', text: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'll help you post your land requirement. Based on your answers, we'll match you with the best available land parcels.` }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [multiSelected, setMultiSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [done, setDone] = useState(false);

  const current = CHATBOT_Q[step];

  const addMsg = (from, text) => setMessages(prev => [...prev, { from, text }]);

  const advance = (updatedData) => {
    const nextStep = step + 1;
    if (nextStep < CHATBOT_Q.length) {
      setTimeout(() => addMsg('bot', CHATBOT_Q[nextStep].question), 400);
      setStep(nextStep);
      setMultiSelected([]);
    } else {
      submitRequirement(updatedData);
    }
  };

  const handleChoice = (value, label) => {
    const updated = { ...data, [current.key]: value };
    setData(updated);
    addMsg('user', label);
    advance(updated);
  };

  const handleMultiConfirm = () => {
    if (!multiSelected.length) return;
    const updated = { ...data, [current.key]: multiSelected };
    setData(updated);
    addMsg('user', multiSelected.join(', '));
    advance(updated);
  };

  const handleAreaNext = () => {
    const updated = { ...data, area_min_acres: Number(minArea) || null, area_max_acres: Number(maxArea) || null };
    setData(updated);
    addMsg('user', `${minArea || '?'} – ${maxArea || '?'} Acres`);
    advance(updated);
  };

  const handleBudgetNext = () => {
    const updated = { ...data, budget_min: Number(minBudget) * 10000000 || null, budget_max: Number(maxBudget) * 10000000 || null };
    setData(updated);
    addMsg('user', `₹${minBudget || '?'} Cr – ₹${maxBudget || '?'} Cr`);
    advance(updated);
  };

  const handleTextNext = () => {
    const updated = { ...data, description: inputVal };
    setData(updated);
    addMsg('user', inputVal || '(Skipped)');
    setInputVal('');
    submitRequirement(updated);
  };

  const submitRequirement = async (finalData) => {
    setLoading(true);
    addMsg('bot', '⏳ Finding matching land parcels for you...');
    try {
      const res = await api.post('/requirements', {
        land_use_type: finalData.land_use_type,
        description: finalData.description,
        preferred_districts: finalData.preferred_districts,
        area_min_acres: finalData.area_min_acres,
        area_max_acres: finalData.area_max_acres,
        budget_min: finalData.budget_min,
        budget_max: finalData.budget_max,
        engagement_type: finalData.engagement_type,
        drainage_required: finalData.special?.includes('drainage'),
        requires_storage: finalData.special?.includes('storage'),
        preferred_developer_partner: finalData.special?.includes('developer'),
      });
      const matchCount = res.data.matches?.length || 0;
      addMsg('bot', `✅ Requirement posted! ${matchCount > 0 ? `🎉 We found ${matchCount} matching listings for you!` : 'No exact matches now, but you\'ll be notified as soon as matching land is listed.'}`);
      setMatches(res.data.matches || []);
      setDone(true);
      toast.success('Requirement posted successfully!');
    } catch (err) {
      addMsg('bot', '❌ Failed to post requirement. Please try again.');
      toast.error('Failed to post requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h2 style={{ color: '#0D2E5E', marginBottom: '0.375rem' }}>🎯 Post Your Requirement</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Answer a few questions and get matched with verified land parcels.</p>

      <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(13,46,94,0.08)' }}>
        {/* Progress */}
        <div style={{ height: 4, background: '#e5e7eb' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #0D2E5E, #C9A227)', width: `${(step / CHATBOT_Q.length) * 100}%`, transition: 'width 0.4s' }} />
        </div>

        {/* Messages */}
        <div style={{ padding: '1.25rem', maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: '0.625rem 0.875rem', borderRadius: m.from === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.from === 'user' ? '#0D2E5E' : '#f3f4f6', color: m.from === 'user' ? 'white' : '#1A1A1A', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        {!done && current && (
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '1rem 1.25rem', background: '#fafafa' }}>
            {current.type === 'choice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {current.choices.map(c => (
                  <button key={c.value} onClick={() => handleChoice(c.value, c.label)}
                    style={{ padding: '0.7rem 1rem', background: 'white', border: '2px solid #e5e7eb', borderRadius: 10, textAlign: 'left', fontWeight: 600, fontSize: '0.88rem', color: '#0D2E5E', cursor: 'pointer' }}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {current.type === 'multi_choice' && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  {current.choices.map(c => (
                    <button key={c.value} onClick={() => setMultiSelected(prev => prev.includes(c.value) ? prev.filter(x => x !== c.value) : [...prev, c.value])}
                      style={{ padding: '0.45rem 0.875rem', border: '2px solid', borderColor: multiSelected.includes(c.value) ? '#0D2E5E' : '#e5e7eb', borderRadius: 99, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: multiSelected.includes(c.value) ? '#0D2E5E' : 'white', color: multiSelected.includes(c.value) ? 'white' : '#374151' }}>
                      {c.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleMultiConfirm} className="btn btn-primary btn-sm" disabled={!multiSelected.length}>Confirm Selection →</button>
              </>
            )}

            {current.type === 'area' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Min Acres</label>
                  <input type="number" className="form-input" value={minArea} onChange={e => setMinArea(e.target.value)} placeholder="e.g. 10" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Max Acres</label>
                  <input type="number" className="form-input" value={maxArea} onChange={e => setMaxArea(e.target.value)} placeholder="e.g. 100" />
                </div>
                <button onClick={handleAreaNext} className="btn btn-primary" disabled={!minArea && !maxArea}>→</button>
              </div>
            )}

            {current.type === 'budget' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Min (₹ Crore)</label>
                  <input type="number" className="form-input" value={minBudget} onChange={e => setMinBudget(e.target.value)} placeholder="e.g. 5" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Max (₹ Crore)</label>
                  <input type="number" className="form-input" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} placeholder="e.g. 50" />
                </div>
                <button onClick={handleBudgetNext} className="btn btn-primary" disabled={!minBudget && !maxBudget}>→</button>
              </div>
            )}

            {current.type === 'text' && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="form-input" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextNext()} placeholder={current.placeholder} />
                <button onClick={handleTextNext} className="btn btn-primary">→</button>
              </div>
            )}
          </div>
        )}

        {done && matches.length > 0 && (
          <div style={{ padding: '1.25rem', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 700, color: '#0D2E5E', marginBottom: '0.875rem' }}>🎯 {matches.length} Matching Land Parcels</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: 280, overflowY: 'auto' }}>
              {matches.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.875rem', background: '#f0f4f8', borderRadius: 10 }} onClick={() => navigate(`/listing/${m.id}`)} style={{ cursor: 'pointer', background: '#f0f4f8', borderRadius: 10, padding: '0.75rem 0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0D2E5E' }}>{m.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>📍 {m.district} • {m.total_area_acres} Acres</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#C9A227', fontSize: '0.9rem' }}>View →</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
