import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatCrore } from '../utils/constants';

const FALLBACK_RATES = [
  { service_name: 'Land Due Diligence Report', service_category: 'legal', description: 'Comprehensive legal due diligence by empanelled law firm', base_price: 25000, price_unit: 'flat' },
  { service_name: 'Title Search (7 years)', service_category: 'legal', description: 'Title search and clear title certificate', base_price: 15000, price_unit: 'flat' },
  { service_name: 'Survey & Boundary Demarcation', service_category: 'survey', description: 'Licensed surveyor field visit and demarcation report', base_price: 8000, price_unit: 'per acre' },
  { service_name: 'Conversion Order (Agri → Non-Agri)', service_category: 'conversion', description: 'Govt conversion order facilitation', base_price: 50000, price_unit: 'flat' },
  { service_name: 'CDP Zone Certificate', service_category: 'legal', description: 'Certificate of permitted land use per CDP', base_price: 5000, price_unit: 'flat' },
  { service_name: 'Facility Management Setup', service_category: 'facility', description: 'Initial facility management consultation and setup', base_price: 20000, price_unit: 'flat' },
  { service_name: 'Industrial Layout Approval', service_category: 'licensing', description: 'Assistance with industrial layout approval from BDA/LPA', base_price: 75000, price_unit: 'flat' },
  { service_name: 'Architect Feasibility Report', service_category: 'design', description: 'Feasibility study by empanelled architect', base_price: 35000, price_unit: 'flat' },
  { service_name: 'PCB Consent Application', service_category: 'licensing', description: 'Pollution Control Board consent to establish and operate', base_price: 30000, price_unit: 'flat' },
  { service_name: 'RERA Registration (Developer)', service_category: 'licensing', description: 'RERA project registration assistance', base_price: 50000, price_unit: 'flat' },
  { service_name: 'Interior Design Consultation', service_category: 'design', description: 'Interior design for commercial / institutional builds', base_price: 15000, price_unit: 'flat' },
  { service_name: 'Transaction Success Fee (Platform)', service_category: 'platform', description: 'Vivid Advisory platform fee on deal completion', base_price: 2, price_unit: 'percentage' },
];

const CATEGORY_ICONS = {
  legal: '⚖️', survey: '📐', conversion: '🔄', facility: '🏢', licensing: '📜', design: '🎨', platform: '💡'
};

const CATEGORY_LABELS = {
  legal: 'Legal Services', survey: 'Survey & Demarcation', conversion: 'Conversion Order', facility: 'Facility Management', licensing: 'Licensing & Approvals', design: 'Design & Architecture', platform: 'Platform Fees'
};

export default function RateCardsPage() {
  const [rates, setRates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showInquiry, setShowInquiry] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/rate-cards').then(res => setRates(res.data?.length ? res.data : FALLBACK_RATES)).catch(() => setRates(FALLBACK_RATES));
  }, []);

  const categories = ['all', ...new Set(rates.map(r => r.service_category))];
  const filtered = activeCategory === 'all' ? rates : rates.filter(r => r.service_category === activeCategory);

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      await api.post('/service-inquiry', { service_type: showInquiry, contact_name: inquiryForm.name, contact_phone: inquiryForm.phone, contact_email: inquiryForm.email });
    } catch {}
    setSubmitted(true);
    setTimeout(() => { setShowInquiry(null); setSubmitted(false); setInquiryForm({ name: '', phone: '', email: '' }); }, 2500);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="section-title">Pricing</p>
        <h2 className="section-heading">Service Rate Cards</h2>
        <p className="section-sub">Transparent pricing for all services available on Vivid Advisory. Click "Enquire" for a custom quote.</p>
      </div>

      {/* Category filter */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        {categories.map(cat => (
          <button key={cat} className={`tab-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat === 'all' ? 'All Services' : `${CATEGORY_ICONS[cat] || '🔧'} ${CATEGORY_LABELS[cat] || cat}`}
          </button>
        ))}
      </div>

      <div className="grid-3">
        {filtered.map((r, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)', display: 'flex', flexDirection: 'column', border: r.service_category === 'platform' ? '2px solid #C9A227' : '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.75rem' }}>{CATEGORY_ICONS[r.service_category] || '🔧'}</span>
              <span className={`badge ${r.service_category === 'platform' ? 'badge-gold' : 'badge-navy'}`} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{r.service_category}</span>
            </div>
            <h4 style={{ color: '#0D2E5E', marginBottom: '0.375rem', lineHeight: 1.3 }}>{r.service_name}</h4>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', flex: 1, marginBottom: '1rem', lineHeight: 1.5 }}>{r.description}</p>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Starting from</div>
                <div style={{ fontWeight: 800, color: r.service_category === 'platform' ? '#C9A227' : '#0D2E5E', fontSize: '1.1rem' }}>
                  {r.price_unit === 'percentage' ? `${r.base_price}%` : `₹${r.base_price?.toLocaleString('en-IN')}`}
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#9ca3af', marginLeft: '0.3rem' }}>{r.price_unit === 'flat' ? '' : r.price_unit}</span>
                </div>
              </div>
              <button onClick={() => setShowInquiry(r.service_name)} className="btn btn-outline btn-sm">Enquire</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '1.25rem', fontSize: '0.85rem', color: '#1e40af' }}>
        <strong>ℹ Price Note:</strong> All prices are indicative starting rates. Final pricing depends on land area, location, complexity, and scope of work. Request a detailed quotation via the Enquire button.
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInquiry(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div style={{ fontWeight: 700 }}>Enquire: {showInquiry}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>We'll contact you with a detailed quote</div>
              </div>
              <button onClick={() => setShowInquiry(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.625rem' }}>✅</div>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>Inquiry Sent!</div>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.375rem' }}>Our team will contact you with a custom quote within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleInquiry}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" required value={inquiryForm.name} onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })} placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" required value={inquiryForm.phone} onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={inquiryForm.email} onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Enquiry</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
