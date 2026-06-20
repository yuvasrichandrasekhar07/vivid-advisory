import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KARNATAKA_DISTRICTS, KARNATAKA_HIGHLIGHTS, LAND_USE_TYPES } from '../utils/constants';
import api from '../utils/api';
import LandCard from '../components/LandCard';

const STATS = [
  { number: '1,200+', label: 'Acres Listed' },
  { number: '48', label: 'Verified Listings' },
  { number: '30', label: 'Districts Covered' },
  { number: '₹0', label: 'Upfront Fee' },
];

const HOW_IT_WORKS = [
  { icon: '📋', role: 'Aggregator', steps: ['Register & complete KYC', 'Consolidate land parcels from farmers', 'Upload survey & legal documents', 'List on marketplace after verification'] },
  { icon: '🔍', role: 'Buyer / Tenant', steps: ['Post your land requirement', 'Browse matched listings', 'Conduct due diligence', 'Close the deal with legal support'] },
  { icon: '💰', role: 'Investor', steps: ['Browse investment opportunities', 'Review feasibility reports', 'Invest full or partial ownership', 'Track portfolio in dashboard'] },
  { icon: '🏗️', role: 'Developer', steps: ['Acquire listed land parcels', 'Develop industrial / commercial parks', 'List developed parks for lease', 'Connect with end users'] },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [search, setSearch] = useState({ district: '', land_use_category: '', min_area: '', max_area: '' });
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    api.get('/listings?limit=6').then(res => setFeaturedListings(res.data.listings || [])).catch(() => {});
    api.get('/news').then(res => setLatestNews((res.data || []).slice(0, 3))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.district) params.set('district', search.district);
    if (search.land_use_category) params.set('land_use_category', search.land_use_category);
    if (search.min_area) params.set('min_area', search.min_area);
    if (search.max_area) params.set('max_area', search.max_area);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">⚡ Karnataka's Premier Land Marketplace</div>
          <h1>
            Organising Karnataka's<br />
            <em>Land Market</em>
          </h1>
          <p className="hero-sub">
            A trusted platform connecting land aggregators, investors, developers, buyers and consultants for industrial, commercial, residential and institutional land transactions.
          </p>
          <div className="hero-actions">
            <Link to="/search" className="btn btn-gold btn-xl">Browse Land Parcels →</Link>
            <Link to="/register" className="btn btn-outline-white btn-xl">List Your Land</Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hero-search">
            <div className="hero-search-field">
              <label>District</label>
              <select value={search.district} onChange={e => setSearch({ ...search, district: e.target.value })}>
                <option value="">All Districts</option>
                {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="hero-search-field">
              <label>Land Use</label>
              <select value={search.land_use_category} onChange={e => setSearch({ ...search, land_use_category: e.target.value })}>
                <option value="">Any Type</option>
                {LAND_USE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="hero-search-field">
              <label>Min Area (Acres)</label>
              <input type="number" placeholder="e.g. 5" value={search.min_area} onChange={e => setSearch({ ...search, min_area: e.target.value })} />
            </div>
            <div className="hero-search-field">
              <label>Max Area (Acres)</label>
              <input type="number" placeholder="e.g. 100" value={search.max_area} onChange={e => setSearch({ ...search, max_area: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-gold" style={{ height: 42, whiteSpace: 'nowrap' }}>🔍 Search Land</button>
          </form>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 0' }}>
        <div className="container">
          <div className="grid-4">
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <p className="section-title">Marketplace</p>
              <h2 className="section-heading">Featured Land Parcels</h2>
              <p className="section-sub">Verified, due-diligence-cleared parcels across Karnataka</p>
            </div>
            <Link to="/search" className="btn btn-outline">View All Listings →</Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid-auto">
              {featuredListings.map(l => <LandCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#6b7280' }}>Listings Coming Soon</div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Be the first aggregator to list on Vivid Advisory.</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Register as Aggregator →</Link>
            </div>
          )}
        </div>
      </section>

      {/* POPULAR DISTRICTS */}
      <section style={{ background: 'white', padding: '3rem 0' }}>
        <div className="container">
          <p className="section-title">Explore by Location</p>
          <h2 className="section-heading" style={{ marginBottom: '1.5rem' }}>Popular Districts in Karnataka</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {KARNATAKA_HIGHLIGHTS.map(d => (
              <Link key={d} to={`/search?district=${encodeURIComponent(d)}`}
                style={{ padding: '0.6rem 1.25rem', background: '#f0f4f8', borderRadius: 99, fontWeight: 600, fontSize: '0.88rem', color: '#0D2E5E', transition: 'all 0.2s', border: '1.5px solid #e5e7eb' }}
                onMouseEnter={e => { e.target.style.background = '#0D2E5E'; e.target.style.color = 'white'; }}
                onMouseLeave={e => { e.target.style.background = '#f0f4f8'; e.target.style.color = '#0D2E5E'; }}
              >
                📍 {d}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '4rem 0', background: '#f0f4f8' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p className="section-title">Platform Guide</p>
            <h2 className="section-heading">How Vivid Advisory Works</h2>
          </div>
          <div className="grid-4">
            {HOW_IT_WORKS.map(({ icon, role, steps }) => (
              <div key={role} style={{ background: 'white', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.625rem' }}>{icon}</div>
                <h4 style={{ color: '#0D2E5E', marginBottom: '1rem' }}>{role}</h4>
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {steps.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.83rem', color: '#4b5563', lineHeight: 1.5 }}>{s}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFICATION FEATURES */}
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <p className="section-title">Trust & Transparency</p>
              <h2 className="section-heading">Rigorous Verification at Every Step</h2>
              <p className="section-sub" style={{ marginBottom: '2rem' }}>Every listing on Vivid Advisory goes through a multi-layer verification process before going live.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: '🏛️', title: 'Bhoomi & CDP Check', desc: 'Survey numbers verified against Karnataka Bhoomi portal and latest CDP zone classification.' },
                  { icon: '⚖️', title: 'Litigation Screening', desc: 'e-Courts database checked for pending cases, ownership disputes, and encumbrances.' },
                  { icon: '📊', title: 'Market Value Report', desc: 'Current market value assessed by empanelled valuers. Compare against guideline value.' },
                  { icon: '🔍', title: 'Field Verification', desc: 'Dedicated field executives verify on-ground for any data discrepancies.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, background: '#dbeafe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0D2E5E' }}>{title}</div>
                      <div style={{ fontSize: '0.83rem', color: '#6b7280', marginTop: '0.2rem' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #0D2E5E 0%, #1a4580 100%)', borderRadius: 24, padding: '2.5rem', color: 'white' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Verification Status Dashboard</h3>
              {[
                { label: 'Survey Number Verified', status: 'verified' },
                { label: 'CDP Zone Classification', status: 'verified' },
                { label: 'Govt Acquisition Check', status: 'verified' },
                { label: 'Litigation Screening', status: 'verified' },
                { label: 'Due Diligence Report', status: 'pending' },
                { label: 'Field Verification', status: 'in-progress' },
              ].map(({ label, status }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>{label}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 99, background: status === 'verified' ? 'rgba(22,163,74,0.3)' : status === 'pending' ? 'rgba(201,162,39,0.3)' : 'rgba(37,99,235,0.3)', color: status === 'verified' ? '#4ade80' : status === 'pending' ? '#fcd34d' : '#93c5fd' }}>
                    {status === 'verified' ? '✓ Verified' : status === 'pending' ? '⏳ Pending' : '⚙ In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      {latestNews.length > 0 && (
        <section style={{ padding: '4rem 0', background: '#f7f8fc' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <p className="section-title">Karnataka Land News</p>
                <h2 className="section-heading">Latest Updates</h2>
              </div>
              <Link to="/news" className="btn btn-outline">All News →</Link>
            </div>
            <div className="grid-3">
              {latestNews.map(n => (
                <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="news-card" style={{ textDecoration: 'none' }}>
                  {n.image_url && <img src={n.image_url} alt={n.title} />}
                  <div className="news-card-body">
                    <div className="news-card-source">{n.source_name}</div>
                    <div className="news-card-title">{n.title}</div>
                    <div className="news-card-date">{n.published_at ? new Date(n.published_at).toLocaleDateString('en-IN') : ''}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #0D2E5E 0%, #C9A227 100%)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '0.75rem', fontSize: 'clamp(1.5rem,3vw,2.25rem)' }}>Ready to Transform How Land is Transacted?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', fontSize: '1rem' }}>Join aggregators, investors, developers, and corporate buyers on Karnataka's most trusted land marketplace.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-gold btn-xl">Get Started Free →</Link>
            <Link to="/about" className="btn btn-outline-white btn-xl">Learn More</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#091d3d', color: 'rgba(255,255,255,0.7)', padding: '3rem 1.5rem 1.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontWeight: 800, fontSize: '1.3rem', color: 'white', marginBottom: '0.75rem' }}>Vivid <span style={{ color: '#C9A227' }}>Advisory</span></div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 280 }}>Karnataka's premier land aggregation and transaction marketplace. Connecting landowners, investors, developers, and buyers.</p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.875rem', fontSize: '0.88rem' }}>Platform</div>
              {['Browse Land', 'Post Requirement', 'List Land', 'News'].map(l => (
                <div key={l} style={{ marginBottom: '0.5rem' }}><a href="#" style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)', transition: 'color 0.2s' }}>{l}</a></div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.875rem', fontSize: '0.88rem' }}>Services</div>
              {['Legal Due Diligence', 'Survey & Demarcation', 'Conversion Order', 'Industrial Licensing', 'Facility Management'].map(l => (
                <div key={l} style={{ marginBottom: '0.5rem' }}><a href="#" style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)' }}>{l}</a></div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.875rem', fontSize: '0.88rem' }}>Company</div>
              {['About Us', 'Rate Cards', "Do's & Don'ts", 'Contact'].map(l => (
                <div key={l} style={{ marginBottom: '0.5rem' }}><a href="#" style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)' }}>{l}</a></div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span>© {new Date().getFullYear()} Vivid Advisory. All rights reserved.</span>
            <span>2% success fee on completed transactions • Karnataka, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
