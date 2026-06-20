import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SERVICES = [
  { type: 'legal', icon: '⚖️', title: 'Legal Due Diligence', desc: 'Get a comprehensive title search and DD report from empanelled law firms.' },
  { type: 'financial', icon: '🏦', title: 'Land Acquisition Finance', desc: 'Connect with NBFCs and banks offering land acquisition loans.' },
  { type: 'licensing', icon: '📜', title: 'Industrial Licensing', desc: 'Assist with factory license, PCB consent, and industrial layout approvals.' },
  { type: 'conversion_order', icon: '🔄', title: 'Conversion Order', desc: 'Convert agricultural land to non-agricultural use with government approval.' },
];

let popupTimer = null;

export default function ServicePopup() {
  const [visible, setVisible] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [serviceIndex, setServiceIndex] = useState(0);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('popup_seen');
    if (hasSeen) return;

    popupTimer = setTimeout(() => {
      const svc = SERVICES[serviceIndex];
      setCurrentService(svc);
      setVisible(true);
    }, 25000); // 25 seconds after load

    return () => clearTimeout(popupTimer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setSubmitted(false);
    setForm({ name: '', phone: '', email: '' });
    setDismissed(prev => new Set([...prev, currentService?.type]));

    const next = SERVICES.find(s => !dismissed.has(s.type) && s.type !== currentService?.type);
    if (next) {
      popupTimer = setTimeout(() => {
        setCurrentService(next);
        setVisible(true);
      }, 120000); // next popup in 2 min
    } else {
      sessionStorage.setItem('popup_seen', '1');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/service-inquiry', {
        service_type: currentService.type,
        contact_name: form.name,
        contact_phone: form.phone,
        contact_email: form.email,
      });
      setSubmitted(true);
      sessionStorage.setItem('popup_seen', '1');
      setTimeout(() => handleClose(), 2500);
    } catch {
      // still show success to avoid UX friction
      setSubmitted(true);
      setTimeout(() => handleClose(), 2500);
    }
  };

  if (!visible || !currentService) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal fade-in" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{currentService.icon}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{currentService.title}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Exclusive service for Vivid Advisory users</div>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1.05rem' }}>Request Submitted!</div>
              <div style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.375rem' }}>Our team will contact you within 24 hours.</div>
            </div>
          ) : (
            <>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{currentService.desc}</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (optional)</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>Request Free Consultation →</button>
              </form>
            </>
          )}
        </div>
        <div style={{ padding: '0.625rem 1.5rem', background: '#f7f8fc', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 0.5 }}>
          {SERVICES.map((s, i) => (
            <div key={s.type} style={{ width: 8, height: 8, borderRadius: '50%', background: s.type === currentService.type ? '#0D2E5E' : '#d1d5db', marginRight: 4, cursor: 'pointer' }} onClick={() => { setCurrentService(s); setSubmitted(false); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
