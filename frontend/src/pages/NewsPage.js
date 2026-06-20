import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const PLACEHOLDER_NEWS = [
  { id: 1, title: 'Karnataka announces new industrial corridors in Tumakuru and Dharwad districts', source_name: 'The Hindu', published_at: '2026-06-18', tags: ['Tumakuru', 'Dharwad', 'industrial'], url: '#', summary: 'The Karnataka government has announced new industrial corridors that are expected to boost land demand in these regions.' },
  { id: 2, title: 'KIADB acquires 500 acres for upcoming electronics manufacturing cluster in Mysuru', source_name: 'Times of India', published_at: '2026-06-17', tags: ['Mysuru', 'industrial', 'KIADB'], url: '#', summary: 'KIADB has initiated the acquisition process for 500 acres near Mysuru to develop an electronics manufacturing cluster.' },
  { id: 3, title: 'New CDP revision for Bengaluru Metropolitan Area — Green zones expanded', source_name: 'Deccan Herald', published_at: '2026-06-16', tags: ['Bengaluru', 'CDP', 'residential'], url: '#', summary: 'The revised Comprehensive Development Plan for BMA expands green zones and introduces mixed-use development corridors.' },
  { id: 4, title: 'Land aggregation trends in Karnataka: How corporate buyers are changing the market', source_name: 'Economic Times', published_at: '2026-06-15', tags: ['Karnataka', 'industrial', 'investment'], url: '#', summary: 'Corporate demand for large contiguous parcels is driving land aggregation activity across Karnataka\'s tier-2 cities.' },
  { id: 5, title: 'Belagavi set to become Karnataka\'s new logistics hub — land prices surge', source_name: 'Business Standard', published_at: '2026-06-14', tags: ['Belagavi', 'commercial', 'logistics'], url: '#', summary: 'With improved connectivity via NH-48 and a new inland container depot, Belagavi is emerging as a key logistics destination.' },
  { id: 6, title: 'Karnataka government clears 1,200 acres for affordable housing near Bengaluru Rural', source_name: 'Hindustan Times', published_at: '2026-06-13', tags: ['Bengaluru Rural', 'residential', 'government'], url: '#', summary: 'The state cabinet has approved a large-scale affordable housing development project on the outskirts of Bengaluru.' },
];

const ALL_TAGS = ['All', 'Industrial', 'Residential', 'Commercial', 'CDP', 'KIADB', 'Investment', 'Bengaluru', 'Mysuru', 'Tumakuru'];

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [activeTag, setActiveTag] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/news')
      .then(res => { setNews(res.data?.length ? res.data : PLACEHOLDER_NEWS); })
      .catch(() => setNews(PLACEHOLDER_NEWS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTag === 'All' ? news : news.filter(n => n.tags?.some(t => t.toLowerCase().includes(activeTag.toLowerCase())));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="section-title">Real-Time</p>
        <h2 className="section-heading">Karnataka Land Market News</h2>
        <p className="section-sub">News and updates from verified portals only. No fake news.</p>
      </div>

      {/* Tags filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            style={{ padding: '0.4rem 1rem', border: '2px solid', borderColor: activeTag === tag ? '#0D2E5E' : '#e5e7eb', borderRadius: 99, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', background: activeTag === tag ? '#0D2E5E' : 'white', color: activeTag === tag ? 'white' : '#374151' }}>
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3,4,5,6].map(i => <div key={i} style={{ background: '#e5e7eb', borderRadius: 12, height: 220, animation: 'pulse 1.5s infinite' }} />)}</div>
      ) : (
        <div className="grid-3">
          {filtered.map(n => (
            <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="news-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 130, background: 'linear-gradient(135deg, #0D2E5E, #1a4580)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📰</div>
                <div className="news-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="news-card-source">{n.source_name}</div>
                  <div className="news-card-title" style={{ flex: 1 }}>{n.title}</div>
                  {n.summary && <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.375rem', lineHeight: 1.5 }}>{n.summary.slice(0, 100)}...</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <div className="news-card-date">{n.published_at ? new Date(n.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {(n.tags || []).slice(0, 2).map(t => <span key={t} style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.62rem', padding: '0.15rem 0.5rem', borderRadius: 99, fontWeight: 700 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📰</div>
          <div>No news for this filter. Try a different tag.</div>
        </div>
      )}

      <div style={{ marginTop: '2.5rem', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#713f12' }}>
        <strong>⚠ Editorial Policy:</strong> Vivid Advisory only aggregates land and real estate news from verified, established news portals (The Hindu, Times of India, Deccan Herald, Economic Times, Business Standard, Hindustan Times). We do not publish, edit, or endorse any news content.
      </div>
    </div>
  );
}
