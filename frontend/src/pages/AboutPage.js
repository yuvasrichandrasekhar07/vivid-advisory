import React from 'react';
import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Aggregators', icon: '🌾', desc: 'Land consolidators who work with farmers and landowners to aggregate contiguous parcels for end-use.' },
  { name: 'Investors', icon: '💰', desc: 'Individuals and institutions funding land acquisition, development, or partial ownership deals.' },
  { name: 'Developers', icon: '🏗️', desc: 'Entities that acquire land, develop industrial parks or townships, and list them for end-users.' },
  { name: 'Buyers & Tenants', icon: '🏭', desc: 'MNCs, SMEs, and institutions seeking land for manufacturing, warehousing, commercial, or residential use.' },
  { name: 'IPC Consultants', icon: '🤝', desc: 'Industrial Property Consultants who connect buyers with suitable land and facilitate transactions.' },
  { name: 'Legal & Survey Firms', icon: '⚖️', desc: 'Empanelled service providers for due diligence, title search, survey, and regulatory compliance.' },
];

const PROCESS = [
  { step: '01', title: 'Land Identification', desc: 'Aggregator identifies and approaches multiple landowners, compiles survey data, and verifies clear title.' },
  { step: '02', title: 'Government Verification', desc: 'Survey numbers cross-checked against Bhoomi, CDP, and govt acquisition databases. Litigation status screened.' },
  { step: '03', title: 'Due Diligence', desc: 'Empanelled legal firm prepares DD report. Market value assessed by certified valuers.' },
  { step: '04', title: 'Listing on Marketplace', desc: 'Verified listing published with all documents, landmarks, and govt status. Buyers notified of matches.' },
  { step: '05', title: 'Matchmaking', desc: 'Buyer requirements auto-matched against listings. Consultants can facilitate introductions.' },
  { step: '06', title: 'Transaction Completion', desc: 'Deal finalized with legal support. 2% success fee collected by Vivid Advisory on completion.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0D2E5E 0%, #1a4580 100%)', color: 'white', padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C9A227', fontWeight: 700, marginBottom: '1rem' }}>About Vivid Advisory</div>
          <h1 style={{ color: 'white', marginBottom: '1.25rem' }}>Organising Karnataka's Land Market</h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Vivid Advisory is Karnataka's first comprehensive land aggregation and transaction marketplace. We bring together landowners, aggregators, investors, developers, buyers, and service providers on a single platform — with trust, transparency, and technology at the core.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section style={{ padding: '4rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <p className="section-title">Our Mission</p>
              <h2 className="section-heading">Why Vivid Advisory Exists</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
                Industrial and commercial growth in Karnataka is constrained by one fundamental problem: fragmented land ownership. Large parcels of land needed for factories, warehouses, hospitals, and townships remain inaccessible because ownership is distributed across hundreds of small farmers.
              </p>
              <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '0.95rem' }}>
                Vivid Advisory solves this by creating a marketplace where land aggregators can consolidate and list verified parcels, investors can fund acquisitions, developers can build and lease, and end users can find exactly what they need — all with full government data, legal clarity, and market price transparency.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { n: '2%', label: 'Success fee — only on deal completion' },
                { n: '30', label: 'Districts across Karnataka covered' },
                { n: '5', label: 'User roles on one platform' },
                { n: '0', label: 'Upfront cost for listing or searching' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f0f4f8', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                  <div className="stat-number" style={{ fontSize: '2rem' }}>{s.n}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section style={{ padding: '4rem 1.5rem', background: '#f7f8fc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p className="section-title">Ecosystem</p>
            <h2 className="section-heading">Who We Serve</h2>
          </div>
          <div className="grid-3">
            {TEAM.map(t => (
              <div key={t.name} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.625rem' }}>{t.icon}</div>
                <h4 style={{ color: '#0D2E5E', marginBottom: '0.5rem' }}>{t.name}</h4>
                <p style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: '4rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p className="section-title">How It Works</p>
            <h2 className="section-heading">Our End-to-End Process</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {PROCESS.map(p => (
              <div key={p.step} style={{ position: 'relative', padding: '1.5rem', background: '#f7f8fc', borderRadius: 16, border: '1px solid #e5e7eb' }}>
                <div style={{ width: 40, height: 40, background: '#0D2E5E', color: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', marginBottom: '0.875rem' }}>{p.step}</div>
                <h4 style={{ color: '#0D2E5E', marginBottom: '0.5rem', fontSize: '1rem' }}>{p.title}</h4>
                <p style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0D2E5E, #C9A227)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', color: 'white' }}>
          <h2 style={{ color: 'white', marginBottom: '0.875rem' }}>Ready to Get Started?</h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Whether you're an aggregator, investor, developer, buyer, or consultant — your journey starts here.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-gold btn-xl">Create Free Account →</Link>
            <Link to="/search" className="btn btn-outline-white btn-xl">Browse Listings</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
