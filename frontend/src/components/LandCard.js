import React from 'react';
import { formatCrore, formatAcres, cdpStatusColor } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

export default function LandCard({ listing }) {
  const navigate = useNavigate();
  const {
    id, title, district, village, total_area_acres,
    asking_price_total, asking_price_per_acre, land_use_category,
    cdp_zone, aggregation_progress_percent, primary_image,
    water_source, electricity_available, landmarks, under_acquisition_scheme,
    aggregator_name, aggregator_company, listing_status
  } = listing;

  const useTypeColors = {
    industrial: '#dbeafe', commercial: '#ede9fe', residential: '#dcfce7',
    institutional: '#fef3c7', agricultural: '#d1fae5', mixed: '#fce7f3'
  };

  return (
    <div className="land-card" onClick={() => navigate(`/listing/${id}`)}>
      <div style={{ position: 'relative' }}>
        {primary_image ? (
          <img src={primary_image} alt={title} className="land-card-img" />
        ) : (
          <div className="land-card-img-placeholder">🌾</div>
        )}
        <div className="land-card-badges">
          {land_use_category && (
            <span className="badge" style={{ background: useTypeColors[land_use_category] || '#f3f4f6', color: '#374151', textTransform: 'capitalize' }}>
              {land_use_category}
            </span>
          )}
          {under_acquisition_scheme && <span className="badge badge-danger">⚠ Acquisition Risk</span>}
          {cdp_zone && <span className={`badge ${cdpStatusColor(cdp_zone)}`}>{cdp_zone}</span>}
        </div>
      </div>

      <div className="land-card-body">
        <div className="land-card-title">{title}</div>
        <div className="land-card-location">
          📍 {village ? `${village}, ` : ''}{district}
        </div>

        {landmarks?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
            {landmarks.slice(0, 3).map((lm, i) => (
              <span key={i} style={{ fontSize: '0.7rem', background: '#f0f4f8', padding: '0.2rem 0.5rem', borderRadius: 99, color: '#4b5563' }}>
                📏 {lm.name} {lm.km}km
              </span>
            ))}
          </div>
        )}

        <div className="land-card-stats">
          <div className="land-card-stat">
            <div className="land-card-stat-label">Area</div>
            <div className="land-card-stat-value">{formatAcres(total_area_acres)}</div>
          </div>
          <div className="land-card-stat">
            <div className="land-card-stat-label">Water</div>
            <div className="land-card-stat-value" style={{ fontSize: '0.8rem' }}>{water_source || '—'}</div>
          </div>
        </div>

        {aggregation_progress_percent < 100 && (
          <div className="aggregation-bar-wrap">
            <div className="aggregation-bar-label">
              <span>Aggregation Progress</span>
              <span style={{ fontWeight: 700, color: '#0D2E5E' }}>{aggregation_progress_percent}%</span>
            </div>
            <div className="aggregation-bar">
              <div className="aggregation-bar-fill" style={{ width: `${aggregation_progress_percent}%` }} />
            </div>
          </div>
        )}

        <div className="land-card-footer">
          <div>
            <div className="land-card-price">{formatCrore(asking_price_total)}</div>
            {asking_price_per_acre && (
              <div className="land-card-price-sub">{formatCrore(asking_price_per_acre)}/acre</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Listed by</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0D2E5E' }}>{aggregator_company || aggregator_name || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
