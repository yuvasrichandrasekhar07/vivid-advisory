import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { KARNATAKA_DISTRICTS, LAND_USE_TYPES, formatCrore } from '../utils/constants';
import api from '../utils/api';
import LandCard from '../components/LandCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    district: searchParams.get('district') || '',
    land_use_category: searchParams.get('land_use_category') || '',
    min_area: searchParams.get('min_area') || '',
    max_area: searchParams.get('max_area') || '',
    min_price: '',
    max_price: '',
    sort: 'listed_at',
    page: 1,
  });

  const fetchListings = async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.listings || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    fetchListings(updated);
  };

  const handlePageChange = (p) => {
    const updated = { ...filters, page: p };
    setFilters(updated);
    fetchListings(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 70px)', gap: 0 }}>
      {/* SIDEBAR FILTERS */}
      <div style={{ background: 'white', borderRight: '1px solid #e5e7eb', padding: '1.5rem', position: 'sticky', top: 70, height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
        <h3 style={{ color: '#0D2E5E', marginBottom: '1.5rem', fontSize: '1.1rem' }}>🔍 Filter Listings</h3>

        <div className="form-group">
          <label className="form-label">District</label>
          <select className="form-select" value={filters.district} onChange={e => handleFilter('district', e.target.value)}>
            <option value="">All Districts</option>
            {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Land Use Type</label>
          <select className="form-select" value={filters.land_use_category} onChange={e => handleFilter('land_use_category', e.target.value)}>
            <option value="">All Types</option>
            {LAND_USE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Area Range (Acres)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input type="number" className="form-input" placeholder="Min" value={filters.min_area}
              onChange={e => handleFilter('min_area', e.target.value)} />
            <input type="number" className="form-input" placeholder="Max" value={filters.max_area}
              onChange={e => handleFilter('max_area', e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Budget (₹ Crore)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input type="number" className="form-input" placeholder="Min Cr" value={filters.min_price ? filters.min_price / 10000000 : ''}
              onChange={e => handleFilter('min_price', e.target.value ? Number(e.target.value) * 10000000 : '')} />
            <input type="number" className="form-input" placeholder="Max Cr" value={filters.max_price ? filters.max_price / 10000000 : ''}
              onChange={e => handleFilter('max_price', e.target.value ? Number(e.target.value) * 10000000 : '')} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Sort By</label>
          <select className="form-select" value={filters.sort} onChange={e => handleFilter('sort', e.target.value)}>
            <option value="listed_at">Latest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="area">Largest Area</option>
          </select>
        </div>

        <button onClick={() => { const reset = { district: '', land_use_category: '', min_area: '', max_area: '', min_price: '', max_price: '', sort: 'listed_at', page: 1 }; setFilters(reset); fetchListings(reset); }}
          className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>
          Clear All Filters
        </button>

        {/* Post Requirement CTA */}
        <div style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #0D2E5E, #1a4580)', borderRadius: 12, padding: '1.25rem', color: 'white' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>🎯 Can't Find What You Need?</div>
          <p style={{ fontSize: '0.78rem', opacity: 0.85, marginBottom: '1rem', lineHeight: 1.5 }}>Post your land requirement and get matched automatically.</p>
          <Link to="/post-requirement" className="btn btn-gold btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Post Requirement</Link>
        </div>
      </div>

      {/* RESULTS */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#0D2E5E', fontSize: '1.3rem' }}>Land Listings {filters.district && `in ${filters.district}`}</h2>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.25rem' }}>{loading ? 'Searching...' : `${total} listings found`}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, height: 320, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid-auto">
              {listings.map(l => <LandCard key={l.id} listing={l} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => handlePageChange(p)}
                    style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: filters.page === p ? '#0D2E5E' : '#e5e7eb', background: filters.page === p ? '#0D2E5E' : 'white', color: filters.page === p ? 'white' : '#374151', fontWeight: 600, cursor: 'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: 16, color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#6b7280' }}>No listings match your filters</div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Try broadening your search or post a requirement.</p>
            <Link to="/post-requirement" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Post Your Requirement</Link>
          </div>
        )}
      </div>
    </div>
  );
}
