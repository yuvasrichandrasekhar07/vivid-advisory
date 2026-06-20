import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KARNATAKA_DISTRICTS, LAND_USE_TYPES } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = [
  { title: 'Basic Info', desc: 'Title, type and description' },
  { title: 'Location', desc: 'District, village, survey numbers' },
  { title: 'Land Details', desc: 'Area, ownership, characteristics' },
  { title: 'Pricing', desc: 'Asking price and terms' },
  { title: 'Landmarks', desc: 'Nearby landmarks and distances' },
  { title: 'Review', desc: 'Check and submit' },
];

export default function ListLandPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', land_use_category: '',
    district: '', taluk: '', hobli: '', village: '', address: '',
    survey_numbers_raw: '', latitude: '', longitude: '',
    total_area_acres: '', road_frontage_meters: '',
    ownership_type: '', number_of_owners: '', ownership_acquired_via: '',
    asking_price_total: '', asking_price_per_acre: '', price_negotiable: true,
    water_logging: false, electricity_available: '', water_source: '',
    soil_type: '', terrain: '', current_land_use: '', legal_firm_name: '',
    landmarks: [{ name: '', type: 'highway', distance_km: '', direction: '' }],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        survey_numbers: form.survey_numbers_raw.split(',').map(s => s.trim()).filter(Boolean),
        landmarks: form.landmarks.filter(l => l.name && l.distance_km),
        total_area_acres: Number(form.total_area_acres),
        asking_price_total: Number(form.asking_price_total),
        asking_price_per_acre: Number(form.asking_price_per_acre),
        number_of_owners: Number(form.number_of_owners) || 1,
      };
      const res = await api.post('/listings', payload);
      toast.success('Land listed successfully! Submitted for verification.');
      navigate(`/listing/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to list land. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addLandmark = () => setForm(f => ({ ...f, landmarks: [...f.landmarks, { name: '', type: 'highway', distance_km: '', direction: '' }] }));
  const updateLandmark = (i, k, v) => setForm(f => {
    const lms = [...f.landmarks]; lms[i] = { ...lms[i], [k]: v }; return { ...f, landmarks: lms };
  });
  const removeLandmark = (i) => setForm(f => ({ ...f, landmarks: f.landmarks.filter((_, idx) => idx !== i) }));

  const canNext = () => {
    if (step === 0) return form.title && form.land_use_category;
    if (step === 1) return form.district && form.survey_numbers_raw;
    if (step === 2) return form.total_area_acres;
    return true;
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h2 style={{ color: '#0D2E5E', marginBottom: '0.5rem' }}>🌾 List Your Land</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Complete all steps to list your land parcel for verification and listing on Vivid Advisory.</p>

      {/* Stepper */}
      <div className="stepper" style={{ marginBottom: '2.5rem' }}>
        {STEPS.map((s, i) => (
          <div key={i} className={`step ${i < step ? 'completed' : i === step ? 'active' : ''}`}>
            <div className="step-num">{i < step ? '✓' : i + 1}</div>
            <div className="step-label">{s.title}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 4px 20px rgba(13,46,94,0.08)' }}>
        <h3 style={{ color: '#0D2E5E', marginBottom: '0.375rem' }}>{STEPS[step].title}</h3>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.75rem' }}>{STEPS[step].desc}</p>

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <>
            <div className="form-group">
              <label className="form-label">Listing Title *</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. 45-Acre Industrial Land near KIADB, Tumakuru" />
            </div>
            <div className="form-group">
              <label className="form-label">Land Use Category *</label>
              <select className="form-select" value={form.land_use_category} onChange={e => set('land_use_category', e.target.value)}>
                <option value="">Select type...</option>
                {LAND_USE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the land parcel, its features, advantages, and current status..." />
            </div>
            <div className="form-group">
              <label className="form-label">Legal / Due Diligence Firm</label>
              <input className="form-input" value={form.legal_firm_name} onChange={e => set('legal_firm_name', e.target.value)} placeholder="Name of empanelled law firm handling DD" />
            </div>
          </>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">District *</label>
                <select className="form-select" value={form.district} onChange={e => set('district', e.target.value)}>
                  <option value="">Select district...</option>
                  {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taluk</label>
                <input className="form-input" value={form.taluk} onChange={e => set('taluk', e.target.value)} placeholder="Taluk name" />
              </div>
              <div className="form-group">
                <label className="form-label">Hobli</label>
                <input className="form-input" value={form.hobli} onChange={e => set('hobli', e.target.value)} placeholder="Hobli name" />
              </div>
              <div className="form-group">
                <label className="form-label">Village</label>
                <input className="form-input" value={form.village} onChange={e => set('village', e.target.value)} placeholder="Village name" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Survey Numbers * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(comma-separated)</span></label>
              <input className="form-input" value={form.survey_numbers_raw} onChange={e => set('survey_numbers_raw', e.target.value)} placeholder="e.g. 45/1, 45/2, 46, 47/A" />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.375rem' }}>These will be cross-checked against Karnataka Bhoomi and CDP portals.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Full Address / Directions</label>
              <textarea className="form-textarea" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Address or directions to reach the land..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Latitude (GPS)</label>
                <input className="form-input" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="e.g. 13.0827" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude (GPS)</label>
                <input className="form-input" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="e.g. 77.5877" />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Land Details */}
        {step === 2 && (
          <>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Total Area (Acres) *</label>
                <input type="number" className="form-input" value={form.total_area_acres} onChange={e => set('total_area_acres', e.target.value)} placeholder="e.g. 45.5" />
              </div>
              <div className="form-group">
                <label className="form-label">Road Frontage (Metres)</label>
                <input type="number" className="form-input" value={form.road_frontage_meters} onChange={e => set('road_frontage_meters', e.target.value)} placeholder="e.g. 60" />
              </div>
              <div className="form-group">
                <label className="form-label">Ownership Type</label>
                <select className="form-select" value={form.ownership_type} onChange={e => set('ownership_type', e.target.value)}>
                  <option value="">Select...</option>
                  {['freehold','leasehold','government','trust','company','joint'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Owners</label>
                <input type="number" className="form-input" value={form.number_of_owners} onChange={e => set('number_of_owners', e.target.value)} placeholder="1" />
              </div>
              <div className="form-group">
                <label className="form-label">How Land was Acquired</label>
                <input className="form-input" value={form.ownership_acquired_via} onChange={e => set('ownership_acquired_via', e.target.value)} placeholder="e.g. Inheritance, Purchase, Govt Grant" />
              </div>
              <div className="form-group">
                <label className="form-label">Soil Type</label>
                <input className="form-input" value={form.soil_type} onChange={e => set('soil_type', e.target.value)} placeholder="e.g. Red laterite, Black cotton" />
              </div>
              <div className="form-group">
                <label className="form-label">Terrain</label>
                <select className="form-select" value={form.terrain} onChange={e => set('terrain', e.target.value)}>
                  <option value="">Select...</option>
                  {['flat','undulating','sloped','mixed'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Land Use</label>
                <input className="form-input" value={form.current_land_use} onChange={e => set('current_land_use', e.target.value)} placeholder="e.g. Farming, Barren, Plantation" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Water Source</label>
                <select className="form-select" value={form.water_source} onChange={e => set('water_source', e.target.value)}>
                  <option value="">Select...</option>
                  {['borewell','canal','municipal','tank','river','none'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Electricity Available</label>
                <select className="form-select" value={form.electricity_available} onChange={e => set('electricity_available', e.target.value === 'true')}>
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.water_logging} onChange={e => set('water_logging', e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>⚠ This land is prone to water logging</span>
              </label>
            </div>
          </>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Total Asking Price (₹)</label>
                <input type="number" className="form-input" value={form.asking_price_total} onChange={e => set('asking_price_total', e.target.value)} placeholder="e.g. 50000000 (for 5 Cr)" />
              </div>
              <div className="form-group">
                <label className="form-label">Price Per Acre (₹)</label>
                <input type="number" className="form-input" value={form.asking_price_per_acre} onChange={e => set('asking_price_per_acre', e.target.value)} placeholder="Auto-calculated or enter manually" />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.price_negotiable} onChange={e => set('price_negotiable', e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Price is negotiable</span>
              </label>
            </div>
            <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, padding: '1rem', fontSize: '0.83rem', color: '#713f12' }}>
              <strong>💡 Reminder:</strong> Vivid Advisory charges a 2% success fee on the final agreed transaction value. This is collected only on deal completion. No upfront cost.
            </div>
          </>
        )}

        {/* Step 4: Landmarks */}
        {step === 4 && (
          <>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Add important landmarks within 50km to help buyers evaluate this land parcel.</p>
            {form.landmarks.map((lm, i) => (
              <div key={i} style={{ background: '#f7f8fc', borderRadius: 12, padding: '1rem', marginBottom: '0.875rem', position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.625rem', alignItems: 'flex-end' }}>
                  <div>
                    <label className="form-label">Landmark Name</label>
                    <input className="form-input" value={lm.name} onChange={e => updateLandmark(i, 'name', e.target.value)} placeholder="e.g. NH-4 Junction" />
                  </div>
                  <div>
                    <label className="form-label">Type</label>
                    <select className="form-select" value={lm.type} onChange={e => updateLandmark(i, 'type', e.target.value)}>
                      {['highway','airport','railway','port','hospital','school','market','industrial_area','city'].map(v => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Distance (km)</label>
                    <input type="number" className="form-input" value={lm.distance_km} onChange={e => updateLandmark(i, 'distance_km', e.target.value)} placeholder="15" />
                  </div>
                  <div>
                    <label className="form-label">Direction</label>
                    <select className="form-select" value={lm.direction} onChange={e => updateLandmark(i, 'direction', e.target.value)}>
                      {['N','NE','E','SE','S','SW','W','NW'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {form.landmarks.length > 1 && (
                    <button onClick={() => removeLandmark(i)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.25rem' }}>×</button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={addLandmark} className="btn btn-outline btn-sm">+ Add Another Landmark</button>
          </>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                ['Title', form.title], ['Land Use', form.land_use_category],
                ['District', form.district], ['Survey Numbers', form.survey_numbers_raw],
                ['Area', `${form.total_area_acres} Acres`], ['Asking Price', `₹${Number(form.asking_price_total).toLocaleString('en-IN')}`],
                ['Water Source', form.water_source], ['Terrain', form.terrain],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: '#f7f8fc', borderRadius: 8, fontSize: '0.88rem' }}>
                  <span style={{ color: '#6b7280', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#0D2E5E', textTransform: 'capitalize' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '1rem', fontSize: '0.83rem', color: '#1e40af', marginBottom: '1.5rem' }}>
              <strong>ℹ What happens next?</strong><br />
              Your listing will be submitted for automated government data verification (Bhoomi, CDP). A field executive will be assigned if any discrepancies are found. Once verified, it goes live on the marketplace.
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn btn-outline" style={{ opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" disabled={!canNext()}>Next →</button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-gold btn-lg" disabled={loading}>
              {loading ? 'Submitting...' : '🚀 Submit Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
