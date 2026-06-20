import React, { useState } from 'react';

const DOS = [
  { category: 'For All Users', items: ['Verify your identity and complete KYC before transacting', 'Request and read the full due diligence report before making any payment', 'Check the government verification status on each listing', 'Consult an empanelled legal firm before signing any agreement', 'Only transact through the Vivid Advisory platform to ensure protection and fee transparency', 'Report any suspicious listings or data discrepancies using the "Raise Ticket" feature', 'Verify that the land is free from any government acquisition scheme'] },
  { category: 'For Aggregators', items: ['Obtain written consent from each landowner before listing their land', 'Upload authentic, unedited government-issued documents only', 'Declare all co-owners and litigation history accurately', 'Provide GPS coordinates and landmark details', 'Maintain transparent aggregation progress updates', 'Disclose water logging, restrictions, or easements on the land'] },
  { category: 'For Buyers & Tenants', items: ['Submit an Authorization Letter if acting on behalf of an MNC or organization', 'Clearly specify land use, shape, and utilities requirements when posting a requirement', 'Conduct a physical site visit before finalizing any transaction', 'Engage an IPC Consultant for large industrial acquisitions (₹50 Cr+)', 'Verify pollution zone classification for manufacturing plants'] },
  { category: 'For Investors', items: ['Review the feasibility report before committing to co-investment', 'Clarify the exit strategy and resale terms upfront', 'Ensure the legal structure for partial ownership is documented by a legal firm'] },
];

const DONTS = [
  { category: 'For All Users', items: ['Never pay any money directly to an aggregator or individual outside the platform escrow', 'Do not rely solely on the platform data — always conduct independent physical verification', 'Do not list or purchase disputed land with pending court cases without full legal disclosure', 'Never share your login credentials with third parties', 'Do not proceed with transactions on listings marked "Suspended" or "Under Ticket"'] },
  { category: 'For Aggregators', items: ["Don't list land without landowner consent in writing", "Don't upload forged, photocopied, or altered documents — this will result in account suspension", "Don't misrepresent land use category, area, or pricing", "Don't list land under active government acquisition scheme without disclosure", "Don't suppress litigation history — full disclosure is mandatory"] },
  { category: 'For Buyers', items: ["Don't make advance payments before due diligence is complete", "Don't bypass the consultant for large-scale transactions", "Don't assume CDP zone permits your intended use — always verify with planning authority", "Don't finalize a deal without checking for pending tax arrears on the land"] },
  { category: 'Legal Compliance', items: ['Do not use the platform for speculative land banking without intent to develop or use', 'Do not violate Karnataka Land Reforms Act provisions on agricultural land ownership by non-agriculturalists', 'Do not purchase land above the ceiling limit applicable under state laws without prior permission'] },
];

const FAQ_ITEMS = [
  { q: 'What is a Comprehensive Development Plan (CDP)?', a: 'A CDP (or Master Plan) is a long-term urban planning document that defines permitted land use zones — residential, commercial, industrial, green zones, etc. — for a given area. Vivid Advisory checks the CDP automatically for each survey number to confirm permitted use.' },
  { q: 'What does "Bhoomi" mean?', a: 'Bhoomi is the Karnataka government\'s online land records portal that contains RTC (Record of Rights, Tenancy and Crops), mutation records, and ownership details. All survey numbers on Vivid Advisory are cross-verified against Bhoomi.' },
  { q: 'Can foreigners purchase agricultural land in Karnataka?', a: 'No. Under the Karnataka Land Reforms Act, non-agriculturalists and foreign nationals generally cannot purchase agricultural land in Karnataka. Certain exemptions apply. Always consult a legal firm before proceeding.' },
  { q: 'What is an Encumbrance Certificate (EC)?', a: 'An EC is a certificate from the Sub-Registrar\'s office that shows all registered transactions (sale, mortgage, lease) on a property. A clear EC with no pending charges is essential for a clean title.' },
  { q: 'What is a Conversion Order?', a: 'To use agricultural land for non-agricultural purposes (industrial, residential, commercial), you need a Conversion Order from the Deputy Commissioner. Vivid Advisory\'s service partners can assist with this process.' },
];

export default function DosAndDontsPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('dos');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="section-title">Guidelines</p>
        <h2 className="section-heading">Do's, Don'ts & Important Guidelines</h2>
        <p className="section-sub">Essential guidelines for all users of the Vivid Advisory platform.</p>
      </div>

      <div className="tabs" style={{ marginBottom: '2rem' }}>
        <button className={`tab-btn ${activeTab === 'dos' ? 'active' : ''}`} onClick={() => setActiveTab('dos')}>✅ Do's</button>
        <button className={`tab-btn ${activeTab === 'donts' ? 'active' : ''}`} onClick={() => setActiveTab('donts')}>❌ Don'ts</button>
        <button className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>❓ FAQ</button>
      </div>

      {activeTab === 'dos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {DOS.map(section => (
            <div key={section.category} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)', border: '1px solid #e5e7eb' }}>
              <h4 style={{ color: '#0D2E5E', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✅ {section.category}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'donts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {DONTS.map(section => (
            <div key={section.category} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)', border: '1px solid #fee2e2' }}>
              <h4 style={{ color: '#b91c1c', marginBottom: '1rem' }}>❌ {section.category}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
                    <span style={{ color: '#dc2626', fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(13,46,94,0.06)', border: '1px solid #e5e7eb' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontWeight: 700, color: '#0D2E5E', fontSize: '0.92rem', paddingRight: '1rem' }}>{faq.q}</span>
                <span style={{ color: '#9ca3af', fontSize: '1.1rem', flexShrink: 0 }}>{openFaq === i ? '▲' : '▼'}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.7, borderTop: '1px solid #f3f4f6' }}>
                  <br />{faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, #0D2E5E, #1a4580)', borderRadius: 16, padding: '1.75rem', color: 'white', textAlign: 'center' }}>
        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Need Legal or Compliance Guidance?</h3>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Our empanelled legal partners can help with due diligence, conversion orders, and compliance reviews.</p>
        <button className="btn btn-gold" onClick={() => { /* trigger service popup */ }}>Request Legal Consultation →</button>
      </div>
    </div>
  );
}
