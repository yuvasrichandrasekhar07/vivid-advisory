import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCrore, formatAcres, cdpStatusColor } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({ name: user?.full_name || '', phone: user?.phone || '', email: user?.email || '', message: '' });
  const [inquirySent, setInquirySent] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => { setListing(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      await api.post('/service-inquiry', {
        service_type: 'land_inquiry', land_id: id,
        contact_name: inquiryForm.name, contact_phone: inquiryForm.phone,
        contact_email: inquiryForm.email, notes: inquiryForm.message,
        user_id: user?.id,
      });
      setInquirySent(true);
      toast.success('Inquiry sent! The aggregator will contact you shortly.');
    } catch {
      toast.error('Failed to send inquiry. Please try again.');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;
  if (!listing) return <div style={{ padding: '4rem', textAlign: 'center' }}><h3>Listing not found</h3><Link to="/search" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Search</Link></div>;

  const media = listing.media || [];
  const landmarks = listing.landmarks || [];
  const litigations = listing.litigations || [];
  const taxRecords = listing.tax_records || [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#0D2E5E' }}>Home</Link> ›
        <Link to="/search" style={{ color: '#0D2E5E' }}>Search</Link> ›
        <span>{listing.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          {/* Image Gallery */}
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(13,46,94,0.08)', marginBottom: '1.5rem' }}>
            {media.length > 0 ? (
              <>
                <img src={media[activeImg]?.media_url} alt="" style={{ width: '100%', height: 380, objectFit: 'cover' }} />
                {media.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '0.875rem', overflowX: 'auto' }}>
                    {media.map((m, i) => (
                      <img key={i} src={m.media_url} alt="" onClick={() => setActiveImg(i)}
                        style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: `2px solid ${activeImg === i ? '#0D2E5E' : 'transparent'}`, flexShrink: 0 }} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ height: 280, background: 'linear-gradient(135deg, #dce4ef, #edf2f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🌾</div>
            )}
          </div>

          {/* Tabs */}
          <div className="tabs">
            {['overview', 'verification', 'litigation', 'tax', 'documents'].map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
              <h3 style={{ color: '#0D2E5E', marginBottom: '1.25rem' }}>Land Details</h3>
              <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                {[
                  { label: 'Total Area', value: formatAcres(listing.total_area_acres) },
                  { label: 'District', value: listing.district },
                  { label: 'Village', value: listing.village || '—' },
                  { label: 'Taluk', value: listing.taluk || '—' },
                  { label: 'Land Use', value: listing.land_use_category || '—' },
                  { label: 'Ownership Type', value: listing.ownership_type || '—' },
                  { label: 'Owners', value: listing.number_of_owners || '—' },
                  { label: 'How Acquired', value: listing.ownership_acquired_via || '—' },
                  { label: 'Soil Type', value: listing.soil_type || '—' },
                  { label: 'Terrain', value: listing.terrain || '—' },
                  { label: 'Water Source', value: listing.water_source || '—' },
                  { label: 'Electricity', value: listing.electricity_available ? 'Available' : 'Not Confirmed' },
                  { label: 'Water Logging', value: listing.water_logging ? '⚠ Yes' : 'No' },
                  { label: 'Road Frontage', value: listing.road_frontage_meters ? `${listing.road_frontage_meters}m` : '—' },
                  { label: 'Current Use', value: listing.current_land_use || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f7f8fc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9rem' }}>{value}</div>
                  </div>
                ))}
              </div>

              {listing.description && (
                <div>
                  <h4 style={{ color: '#0D2E5E', marginBottom: '0.75rem' }}>Description</h4>
                  <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.7 }}>{listing.description}</p>
                </div>
              )}

              {landmarks.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ color: '#0D2E5E', marginBottom: '0.875rem' }}>📍 Nearby Landmarks</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {landmarks.map((lm, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.875rem', background: '#f0f4f8', borderRadius: 8 }}>
                        <span style={{ fontSize: '1rem' }}>
                          {lm.landmark_type === 'airport' ? '✈️' : lm.landmark_type === 'highway' ? '🛣️' : lm.landmark_type === 'railway' ? '🚂' : lm.landmark_type === 'port' ? '🚢' : '📍'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0D2E5E' }}>{lm.landmark_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>{lm.landmark_type}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#C9A227', fontSize: '0.88rem' }}>{lm.distance_km} km {lm.direction || ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Placeholder */}
              <div style={{ marginTop: '1.5rem', background: '#e8f0fe', borderRadius: 12, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: '#1d4ed8' }}>
                <div style={{ fontSize: '2.5rem' }}>🗺️</div>
                <div style={{ fontWeight: 700 }}>Interactive Map View</div>
                {listing.latitude && listing.longitude
                  ? <div style={{ fontSize: '0.82rem' }}>📍 {listing.latitude.toFixed(6)}, {listing.longitude.toFixed(6)}</div>
                  : <div style={{ fontSize: '0.82rem', opacity: 0.7 }}>Coordinates not yet recorded</div>
                }
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
              <h3 style={{ color: '#0D2E5E', marginBottom: '1.25rem' }}>Government Verification Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'CDP Zone', value: listing.cdp_zone || 'Not Checked', status: listing.cdp_zone ? 'done' : 'pending' },
                  { label: 'CDP Color Code', value: listing.cdp_color_code || '—', status: listing.cdp_color_code ? 'done' : 'pending' },
                  { label: 'CDP Status', value: listing.cdp_status || '—', status: listing.cdp_status ? 'done' : 'pending' },
                  { label: 'Govt Acquisition Scheme', value: listing.under_acquisition_scheme == null ? 'Not Checked' : listing.under_acquisition_scheme ? '⚠ Under Acquisition Scheme' : '✓ No Active Acquisition', status: listing.under_acquisition_scheme === false ? 'clear' : listing.under_acquisition_scheme ? 'risk' : 'pending' },
                  { label: 'Survey Numbers', value: listing.survey_numbers?.join(', ') || '—', status: 'done' },
                  { label: 'Legal Firm', value: listing.legal_firm_name || '—', status: listing.legal_firm_name ? 'done' : 'pending' },
                ].map(({ label, value, status }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: status === 'risk' ? '#fef2f2' : '#f7f8fc', borderRadius: 10, border: `1px solid ${status === 'risk' ? '#fecaca' : '#e5e7eb'}` }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>{label}</span>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{value}</span>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 99, fontWeight: 700, background: status === 'done' || status === 'clear' ? '#dcfce7' : status === 'risk' ? '#fee2e2' : '#fef3c7', color: status === 'done' || status === 'clear' ? '#15803d' : status === 'risk' ? '#b91c1c' : '#a16207' }}>
                        {status === 'done' || status === 'clear' ? '✓' : status === 'risk' ? '⚠' : '⏳'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {listing.govt_check_done_at && (
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.875rem' }}>
                  Last verified: {new Date(listing.govt_check_done_at).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          )}

          {activeTab === 'litigation' && (
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
              <h3 style={{ color: '#0D2E5E', marginBottom: '1.25rem' }}>⚖️ Litigation & Legal Cases</h3>
              {litigations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f0fdf4', borderRadius: 12 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>No Active Litigation Found</div>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.375rem' }}>No pending cases, disputes, or encumbrances detected.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {litigations.map((lt, i) => (
                    <div key={i} style={{ padding: '1rem', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.88rem' }}>Case #{lt.case_number}</span>
                        <span className={`badge ${lt.is_pending ? 'badge-danger' : 'badge-success'}`}>{lt.is_pending ? 'Pending' : 'Resolved'}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{lt.court_name} • {lt.case_type}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tax' && (
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
              <h3 style={{ color: '#0D2E5E', marginBottom: '1.25rem' }}>🏛️ Government Tax Records</h3>
              {taxRecords.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Tax records not yet verified. Request verification from the aggregator.</p>
              ) : taxRecords.map((tr, i) => (
                <div key={i} style={{ padding: '1rem', background: '#f7f8fc', borderRadius: 10, marginBottom: '0.75rem' }}>
                  <div className="grid-3" style={{ gap: '0.75rem' }}>
                    {[
                      ['Survey #', tr.survey_number], ['Khata #', tr.khata_number],
                      ['Assessment Year', tr.assessment_year], ['Tax Amount', formatCrore(tr.tax_amount)],
                      ['Paid Up To', tr.paid_upto ? new Date(tr.paid_upto).toLocaleDateString('en-IN') : '—'],
                      ['Arrears', tr.arrears ? formatCrore(tr.arrears) : 'None'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(13,46,94,0.07)' }}>
              <h3 style={{ color: '#0D2E5E', marginBottom: '1.25rem' }}>📂 Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Title Deed', url: listing.title_deed_url },
                  { label: 'Encumbrance Certificate', url: listing.encumbrance_certificate_url },
                  { label: 'Mutation Extract', url: listing.mutation_extract_url },
                  { label: 'Survey Sketch', url: listing.survey_sketch_url },
                  { label: 'Due Diligence Report', url: listing.due_diligence_report_url },
                  { label: 'Market Value Report', url: listing.market_value_report_url },
                ].map(({ label, url }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f7f8fc', borderRadius: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>📄 {label}</span>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">View</a>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Not Uploaded</span>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
                ⚠ Documents are visible only to verified registered users and are watermarked for security.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Price & Inquiry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '90px' }}>
          {/* Price card */}
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 16px rgba(13,46,94,0.10)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asking Price</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#C9A227' }}>{formatCrore(listing.asking_price_total)}</div>
              {listing.asking_price_per_acre && <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{formatCrore(listing.asking_price_per_acre)} per acre</div>}
              {listing.price_negotiable && <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>Negotiable</span>}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                ['Area', formatAcres(listing.total_area_acres)],
                ['District', listing.district],
                ['Status', listing.listing_status?.replace('_', ' ')],
                ['Aggregator', listing.aggregator_company || listing.aggregator_name],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                  <span style={{ color: '#9ca3af', fontWeight: 600 }}>{l}</span>
                  <span style={{ fontWeight: 700, color: '#0D2E5E', textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry form */}
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 16px rgba(13,46,94,0.10)' }}>
            <h4 style={{ color: '#0D2E5E', marginBottom: '1rem' }}>📩 Send Inquiry</h4>
            {inquirySent ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontWeight: 700, color: '#15803d' }}>Inquiry Sent!</div>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.375rem' }}>The aggregator will contact you within 24-48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleInquiry}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" required value={inquiryForm.name} onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" required value={inquiryForm.phone} onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Message (optional)</label>
                  <textarea className="form-textarea" rows={3} value={inquiryForm.message} onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })} placeholder="Tell us about your requirement..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Inquiry →</button>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.75rem' }}>Your info is shared only with verified aggregators.</p>
              </form>
            )}
          </div>

          {/* Success fee notice */}
          <div style={{ background: '#fef3c7', borderRadius: 12, padding: '1rem', fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
            <strong>💡 Note:</strong> A 2% success fee on the agreed transaction value is charged by Vivid Advisory upon deal completion.
          </div>
        </div>
      </div>
    </div>
  );
}
