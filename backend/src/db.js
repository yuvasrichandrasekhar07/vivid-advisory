/**
 * Mock database — drop-in replacement for the pg Pool.
 * Implements pool.query(sql, params) with in-memory JSON storage.
 * Data persists to mock-db.json in the backend root across restarts.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../../mock-db.json');

// ── seed data ──────────────────────────────────────────────────────────────
const SEED = {
  users: [],
  user_profiles: [],
  land_listings: [
    {
      id: 'seed-listing-1',
      aggregator_id: 'seed-user-1',
      title: '42-Acre Industrial Land — NH-48 Frontage, Tumakuru',
      description: 'Prime industrial land with direct NH-48 frontage. CDP zone: Industrial. Bhoomi verified.',
      listing_status: 'listed',
      land_use_category: 'industrial',
      state: 'Karnataka',
      district: 'Tumakuru',
      taluk: 'Tumakuru',
      hobli: 'Kyathasandra',
      village: 'Kyathasandra',
      survey_numbers: ['45/1', '45/2', '46'],
      latitude: 13.3379,
      longitude: 77.1173,
      address: 'Near Kyathasandra, NH-48, Tumakuru District',
      total_area_acres: 42.5,
      road_frontage_meters: 180,
      ownership_type: 'freehold',
      number_of_owners: 3,
      ownership_acquired_via: 'purchase',
      asking_price_total: 89250000,
      asking_price_per_acre: 2100000,
      price_negotiable: true,
      water_logging: false,
      electricity_available: true,
      water_source: 'borewell',
      soil_type: 'Red laterite',
      terrain: 'flat',
      current_land_use: 'barren',
      cdp_zone: 'Industrial Zone',
      cdp_color_code: 'purple',
      cdp_status: 'Approved for industrial use',
      under_acquisition_scheme: false,
      aggregation_progress_percent: 90,
      total_landowners_approached: 5,
      landowners_agreed: 4,
      drive_folder_id: null,
      title_deed_url: null,
      encumbrance_certificate_url: null,
      mutation_extract_url: null,
      survey_sketch_url: null,
      due_diligence_report_url: null,
      market_value_report_url: null,
      legal_firm_name: 'Srinivas & Associates, Bengaluru',
      verified_by: null,
      field_executive_id: null,
      listed_at: new Date('2025-11-10').toISOString(),
      created_at: new Date('2025-11-01').toISOString(),
      updated_at: new Date('2025-11-10').toISOString(),
    },
    {
      id: 'seed-listing-2',
      aggregator_id: 'seed-user-1',
      title: '28-Acre Mixed-Use Land — Mysuru Ring Road',
      description: 'Well-connected parcel adjacent to Mysuru Ring Road, suitable for residential or commercial development.',
      listing_status: 'listed',
      land_use_category: 'mixed',
      state: 'Karnataka',
      district: 'Mysuru',
      taluk: 'Mysuru',
      hobli: 'Kasaba',
      village: 'Hootagalli',
      survey_numbers: ['112/3', '113'],
      latitude: 12.3261,
      longitude: 76.5709,
      address: 'Hootagalli, Mysuru Ring Road',
      total_area_acres: 28.0,
      road_frontage_meters: 90,
      ownership_type: 'joint',
      number_of_owners: 6,
      ownership_acquired_via: 'inheritance',
      asking_price_total: 70000000,
      asking_price_per_acre: 2500000,
      price_negotiable: true,
      water_logging: false,
      electricity_available: true,
      water_source: 'municipal',
      soil_type: 'Black cotton',
      terrain: 'flat',
      current_land_use: 'farming',
      cdp_zone: 'Residential Zone',
      cdp_color_code: 'yellow',
      cdp_status: 'Residential / Mixed Use',
      under_acquisition_scheme: false,
      aggregation_progress_percent: 100,
      total_landowners_approached: 6,
      landowners_agreed: 6,
      drive_folder_id: null,
      title_deed_url: null,
      encumbrance_certificate_url: null,
      mutation_extract_url: null,
      survey_sketch_url: null,
      due_diligence_report_url: null,
      market_value_report_url: null,
      legal_firm_name: 'Hegde Legal, Mysuru',
      verified_by: null,
      field_executive_id: null,
      listed_at: new Date('2025-12-01').toISOString(),
      created_at: new Date('2025-11-20').toISOString(),
      updated_at: new Date('2025-12-01').toISOString(),
    },
    {
      id: 'seed-listing-3',
      aggregator_id: 'seed-user-1',
      title: '65-Acre Agricultural Land — Dharwad, Conversion Ready',
      description: 'Large agricultural tract near Dharwad with pending conversion order. Ideal for pharma or food processing park.',
      listing_status: 'listed',
      land_use_category: 'agricultural',
      state: 'Karnataka',
      district: 'Dharwad',
      taluk: 'Dharwad',
      hobli: 'Dharwad',
      village: 'Neeralagi',
      survey_numbers: ['22/1', '22/2', '23/A'],
      latitude: 15.4589,
      longitude: 75.0078,
      address: 'Neeralagi Village, Dharwad Taluk',
      total_area_acres: 65.0,
      road_frontage_meters: 220,
      ownership_type: 'freehold',
      number_of_owners: 2,
      ownership_acquired_via: 'purchase',
      asking_price_total: 97500000,
      asking_price_per_acre: 1500000,
      price_negotiable: false,
      water_logging: false,
      electricity_available: false,
      water_source: 'canal',
      soil_type: 'Black cotton',
      terrain: 'undulating',
      current_land_use: 'farming',
      cdp_zone: 'Agricultural Zone',
      cdp_color_code: 'green',
      cdp_status: 'Agricultural — conversion applied',
      under_acquisition_scheme: false,
      aggregation_progress_percent: 100,
      total_landowners_approached: 2,
      landowners_agreed: 2,
      drive_folder_id: null,
      title_deed_url: null,
      encumbrance_certificate_url: null,
      mutation_extract_url: null,
      survey_sketch_url: null,
      due_diligence_report_url: null,
      market_value_report_url: null,
      legal_firm_name: 'Patil & Co, Dharwad',
      verified_by: null,
      field_executive_id: null,
      listed_at: new Date('2026-01-05').toISOString(),
      created_at: new Date('2025-12-15').toISOString(),
      updated_at: new Date('2026-01-05').toISOString(),
    },
  ],
  land_media: [
    { id: uuidv4(), land_id: 'seed-listing-1', media_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', media_type: 'image', caption: 'Aerial view', is_primary: true, display_order: 1, created_at: new Date().toISOString() },
    { id: uuidv4(), land_id: 'seed-listing-2', media_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', media_type: 'image', caption: 'Land overview', is_primary: true, display_order: 1, created_at: new Date().toISOString() },
    { id: uuidv4(), land_id: 'seed-listing-3', media_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800', media_type: 'image', caption: 'Field view', is_primary: true, display_order: 1, created_at: new Date().toISOString() },
  ],
  land_landmarks: [
    { id: uuidv4(), land_id: 'seed-listing-1', landmark_name: 'NH-48 Highway', landmark_type: 'highway', distance_km: 0.1, direction: 'E', created_at: new Date().toISOString() },
    { id: uuidv4(), land_id: 'seed-listing-1', landmark_name: 'Tumakuru Railway Station', landmark_type: 'railway', distance_km: 8.5, direction: 'N', created_at: new Date().toISOString() },
    { id: uuidv4(), land_id: 'seed-listing-2', landmark_name: 'Mysuru Ring Road', landmark_type: 'highway', distance_km: 0.5, direction: 'S', created_at: new Date().toISOString() },
    { id: uuidv4(), land_id: 'seed-listing-3', landmark_name: 'Dharwad Railway Station', landmark_type: 'railway', distance_km: 12.0, direction: 'E', created_at: new Date().toISOString() },
  ],
  land_litigations: [],
  land_tax_records: [],
  verification_tickets: [],
  buyer_requirements: [],
  transactions: [],
  notifications: [],
  service_inquiries: [],
  service_providers: [],
  news_articles: [
    { id: uuidv4(), title: 'Karnataka Govt Notifies New Industrial Zone Near Tumakuru', summary: 'State government has notified a new industrial zone spanning 500 acres near Tumakuru on NH-48, attracting EV and semiconductor firms.', url: 'https://www.deccanherald.com/', source_name: 'Deccan Herald', image_url: null, published_at: new Date('2026-05-15').toISOString(), tags: ['Tumakuru', 'industrial'], is_verified: true, created_at: new Date().toISOString() },
    { id: uuidv4(), title: 'Mysuru CDP Revision 2031 — Key Highlights for Land Buyers', summary: 'The revised Comprehensive Development Plan for Mysuru city area has been published, with several agricultural parcels rezoned for residential use.', url: 'https://timesofindia.indiatimes.com/', source_name: 'Times of India', image_url: null, published_at: new Date('2026-05-10').toISOString(), tags: ['Mysuru', 'CDP', 'residential'], is_verified: true, created_at: new Date().toISOString() },
    { id: uuidv4(), title: 'Bhoomi Portal Integrates With e-Courts for Faster Litigation Checks', summary: 'Karnataka revenue department has integrated Bhoomi with the e-Courts database, enabling instant litigation status checks for survey numbers.', url: 'https://www.thehindu.com/', source_name: 'The Hindu', image_url: null, published_at: new Date('2026-04-28').toISOString(), tags: ['Bhoomi', 'e-Courts', 'legal'], is_verified: true, created_at: new Date().toISOString() },
  ],
  faqs: [
    { id: uuidv4(), category: 'navigation', question: 'How do I list my land on Vivid Advisory?', answer: 'Register as an Aggregator, complete your KYC, then click "List Land" in your dashboard. Fill in all survey details and upload required documents.', display_order: 1, is_active: true, created_at: new Date().toISOString() },
    { id: uuidv4(), category: 'navigation', question: 'How does the survey number verification work?', answer: 'We cross-check your survey number against Karnataka government land records portals including Bhoomi and CDP data to validate ownership, zone, and encumbrances.', display_order: 2, is_active: true, created_at: new Date().toISOString() },
    { id: uuidv4(), category: 'navigation', question: 'What is the success fee?', answer: 'Vivid Advisory charges a 2% success fee on the total agreed transaction value, payable on deal completion.', display_order: 3, is_active: true, created_at: new Date().toISOString() },
    { id: uuidv4(), category: 'legal', question: 'What documents does an aggregator need to upload?', answer: 'Title deed, Encumbrance Certificate (EC), RTC/Pahani extract, Survey sketch, Mutation extract, and a Due Diligence report from an empanelled legal firm.', display_order: 4, is_active: true, created_at: new Date().toISOString() },
    { id: uuidv4(), category: 'roles', question: 'Who is a Consultant (IPC)?', answer: 'An IPC (Industrial Property Consultant) helps buyers find the right land and facilitates deals between buyers, aggregators, and developers. They are registered on Vivid Advisory and work for a commission.', display_order: 5, is_active: true, created_at: new Date().toISOString() },
  ],
  rate_cards: [
    { id: uuidv4(), service_name: 'Land Due Diligence Report', service_category: 'legal', description: 'Comprehensive legal due diligence by empanelled law firm', base_price: 25000, price_unit: 'flat', is_active: true, display_order: 1, created_at: new Date().toISOString() },
    { id: uuidv4(), service_name: 'Title Search (7 years)', service_category: 'legal', description: 'Title search and clear title certificate', base_price: 15000, price_unit: 'flat', is_active: true, display_order: 2, created_at: new Date().toISOString() },
    { id: uuidv4(), service_name: 'Survey & Boundary Demarcation', service_category: 'survey', description: 'Licensed surveyor field visit and report', base_price: 8000, price_unit: 'per acre', is_active: true, display_order: 3, created_at: new Date().toISOString() },
    { id: uuidv4(), service_name: 'Conversion Order (Agricultural to Non-Agricultural)', service_category: 'conversion', description: 'Govt conversion order facilitation', base_price: 50000, price_unit: 'flat', is_active: true, display_order: 4, created_at: new Date().toISOString() },
    { id: uuidv4(), service_name: 'CDP Zone Certificate', service_category: 'legal', description: 'Certificate of permitted land use per CDP', base_price: 5000, price_unit: 'flat', is_active: true, display_order: 5, created_at: new Date().toISOString() },
    { id: uuidv4(), service_name: 'Industrial Layout Approval', service_category: 'licensing', description: 'Assistance with industrial layout approval from BDA/LPA', base_price: 75000, price_unit: 'flat', is_active: true, display_order: 6, created_at: new Date().toISOString() },
  ],
};

// Add seed aggregator user (password: Demo@1234)
const seedHash = bcrypt.hashSync('Demo@1234', 12);
SEED.users.push({
  id: 'seed-user-1',
  email: 'aggregator@vivid.demo',
  phone: '9900000001',
  password_hash: seedHash,
  role: 'aggregator',
  full_name: 'Demo Aggregator',
  company_name: 'Karnataka Land Solutions Pvt Ltd',
  kyc_status: 'verified',
  profile_complete: true,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
SEED.user_profiles.push({ user_id: 'seed-user-1', state: 'Karnataka', city: 'Bengaluru' });

// ── persistence ────────────────────────────────────────────────────────────
function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(SEED));
}

function save(db) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch (_) {}
}

const db = load();

// ── tiny SQL interpreter ───────────────────────────────────────────────────
// Supports the exact queries used by all route files.

function rows(arr) { return { rows: arr }; }

function matchesWhere(row, conditions, params) {
  for (const cond of conditions) {
    const c = cond.trim();

    // col = $n  or  col=$n
    let m = c.match(/^(\w+)\s*=\s*\$(\d+)$/i);
    if (m) { if (String(row[m[1]]) !== String(params[+m[2] - 1])) return false; continue; }

    // col >= $n
    m = c.match(/^(\w+)\s*>=\s*\$(\d+)$/i);
    if (m) { if (Number(row[m[1]]) < Number(params[+m[2] - 1])) return false; continue; }

    // col <= $n
    m = c.match(/^(\w+)\s*<=\s*\$(\d+)$/i);
    if (m) { if (Number(row[m[1]]) > Number(params[+m[2] - 1])) return false; continue; }

    // col = 'literal'
    m = c.match(/^(\w+)\s*=\s*'([^']*)'$/i);
    if (m) { if (String(row[m[1]]) !== m[2]) return false; continue; }

    // l.col = $n  (aliased)
    m = c.match(/^\w+\.(\w+)\s*=\s*\$(\d+)$/i);
    if (m) { if (String(row[m[1]]) !== String(params[+m[2] - 1])) return false; continue; }

    // l.col = 'literal'
    m = c.match(/^\w+\.(\w+)\s*=\s*'([^']*)'$/i);
    if (m) { if (String(row[m[1]]) !== m[2]) return false; continue; }

    // l.col >= $n
    m = c.match(/^\w+\.(\w+)\s*>=\s*\$(\d+)$/i);
    if (m) { if (Number(row[m[1]]) < Number(params[+m[2] - 1])) return false; continue; }

    // l.col <= $n
    m = c.match(/^\w+\.(\w+)\s*<=\s*\$(\d+)$/i);
    if (m) { if (Number(row[m[1]]) > Number(params[+m[2] - 1])) return false; continue; }

    // col = ANY($n)
    m = c.match(/^(?:\w+\.)?(\w+)\s*=\s*ANY\(\$(\d+)\)$/i);
    if (m) {
      const arr = params[+m[2] - 1];
      if (!Array.isArray(arr) || !arr.includes(row[m[1]])) return false;
      continue;
    }

    // $n = ANY(col)   — used in news tags
    m = c.match(/^\$(\d+)\s*=\s*ANY\((\w+)\)$/i);
    if (m) {
      const val = params[+m[1] - 1];
      const arr = row[m[2]];
      if (!Array.isArray(arr) || !arr.includes(val)) return false;
      continue;
    }

    // col IS NULL / IS NOT NULL
    m = c.match(/^(?:\w+\.)?(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
    if (m) {
      const isNull = row[m[1]] == null;
      if (m[2] && isNull) return false;
      if (!m[2] && !isNull) return false;
      continue;
    }

    // (assigned_to=$n OR $m='admin')
    m = c.match(/\(assigned_to=\$(\d+)\s+OR\s+\$(\d+)='admin'\)/i);
    if (m) {
      if (row.assigned_to !== params[+m[1]-1] && params[+m[2]-1] !== 'admin') return false;
      continue;
    }
  }
  return true;
}

function parseWhere(sql, params) {
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER BY|LIMIT|OFFSET|RETURNING|$)/is);
  if (!whereMatch) return () => true;
  const raw = whereMatch[1].trim();
  const conditions = raw.split(/\s+AND\s+/i);
  return (row) => matchesWhere(row, conditions, params || []);
}

function getTable(sql) {
  let m = sql.match(/FROM\s+(\w+)/i) || sql.match(/INTO\s+(\w+)/i) || sql.match(/UPDATE\s+(\w+)/i);
  return m ? m[1] : null;
}

// ── main query function ────────────────────────────────────────────────────
async function query(sql, params = []) {
  const s = sql.replace(/\s+/g, ' ').trim();
  const upper = s.toUpperCase();

  // ── SELECT ────────────────────────────────────────────────────────────────
  if (upper.startsWith('SELECT')) {
    // COUNT(*)
    if (upper.includes('COUNT(*)')) {
      const tbl = getTable(s);
      const filter = parseWhere(s, params);
      const count = (db[tbl] || []).filter(filter).length;
      return rows([{ count: String(count) }]);
    }

    // users JOIN user_profiles (GET /me)
    if (s.includes('user_profiles') && s.includes('users u')) {
      const filter = parseWhere(s, params);
      const result = (db.users || []).filter(filter).map(u => {
        const p = (db.user_profiles || []).find(p => p.user_id === u.id) || {};
        return { ...u, ...p };
      });
      return rows(result);
    }

    // verification_tickets JOIN land_listings JOIN users
    if (s.includes('verification_tickets') && s.includes('land_listings')) {
      const filter = parseWhere(s, params);
      const tickets = (db.verification_tickets || []).filter(filter);
      const enriched = tickets.map(t => {
        const land = (db.land_listings || []).find(l => l.id === t.land_id) || {};
        const raiser = (db.users || []).find(u => u.id === t.raised_by) || {};
        const assignee = (db.users || []).find(u => u.id === t.assigned_to) || {};
        return { ...t, land_title: land.title, district: land.district, survey_numbers: land.survey_numbers, raised_by_name: raiser.full_name, assigned_to_name: assignee.full_name };
      });
      const limitM = s.match(/LIMIT\s+\$(\d+)/i);
      const offsetM = s.match(/OFFSET\s+\$(\d+)/i);
      let out = enriched;
      if (offsetM) out = out.slice(Number(params[+offsetM[1]-1]));
      if (limitM) out = out.slice(0, Number(params[+limitM[1]-1]));
      return rows(out);
    }

    // land_media JOIN land_listings (delete image)
    if (s.includes('land_media m') && s.includes('land_listings l')) {
      const idM = s.match(/m\.id=\$(\d+)/i);
      if (idM) {
        const mid = params[+idM[1]-1];
        const media = (db.land_media || []).find(m => m.id === mid);
        if (!media) return rows([]);
        const land = (db.land_listings || []).find(l => l.id === media.land_id) || {};
        return rows([{ ...media, aggregator_id: land.aggregator_id }]);
      }
    }

    // buyer_requirements with match_count subquery
    if (s.includes('buyer_requirements') && s.includes('match_count')) {
      const filter = parseWhere(s, params);
      const reqs = (db.buyer_requirements || []).filter(filter);
      return rows(reqs.map(r => ({
        ...r,
        match_count: String((db.land_listings || []).filter(l =>
          l.listing_status === 'listed' &&
          l.land_use_category === r.land_use_type &&
          (r.area_min_acres == null || l.total_area_acres >= r.area_min_acres) &&
          (r.area_max_acres == null || l.total_area_acres <= r.area_max_acres)
        ).length)
      })));
    }

    // land_listings with aggregator join + media + landmarks (single listing)
    if (s.includes('land_listings l') && s.includes('land_media m') && s.includes('WHERE l.id=')) {
      const idM = s.match(/WHERE l\.id=\$(\d+)/i);
      if (idM) {
        const lid = params[+idM[1]-1];
        const listing = (db.land_listings || []).find(l => l.id === lid);
        if (!listing) return rows([]);
        const agg = (db.users || []).find(u => u.id === listing.aggregator_id) || {};
        const media = (db.land_media || []).filter(m => m.land_id === lid);
        const landmarks = (db.land_landmarks || []).filter(lm => lm.land_id === lid);
        const litigations = (db.land_litigations || []).filter(lt => lt.land_id === lid);
        const tax_records = (db.land_tax_records || []).filter(tr => tr.land_id === lid);
        return rows([{
          ...listing,
          aggregator_name: agg.full_name,
          company_name: agg.company_name,
          aggregator_phone: agg.phone,
          media: media.length ? media : null,
          landmarks: landmarks.length ? landmarks : null,
          litigations: litigations.length ? litigations : null,
          tax_records: tax_records.length ? tax_records : null,
        }]);
      }
    }

    // land_listings search (listings route GET /)
    if (s.includes('land_listings l') && s.includes('users u')) {
      const filter = parseWhere(s, params);
      let listings = (db.land_listings || []).filter(filter);

      // sort
      if (s.includes('asking_price_per_acre ASC')) listings.sort((a, b) => (a.asking_price_per_acre || 0) - (b.asking_price_per_acre || 0));
      else if (s.includes('total_area_acres DESC')) listings.sort((a, b) => b.total_area_acres - a.total_area_acres);
      else listings.sort((a, b) => new Date(b.listed_at || 0) - new Date(a.listed_at || 0));

      // limit / offset
      const limitM = s.match(/LIMIT\s+\$(\d+)/i);
      const offsetM = s.match(/OFFSET\s+\$(\d+)/i);
      if (offsetM) listings = listings.slice(Number(params[+offsetM[1]-1]));
      if (limitM) listings = listings.slice(0, Number(params[+limitM[1]-1]));

      return rows(listings.map(l => {
        const agg = (db.users || []).find(u => u.id === l.aggregator_id) || {};
        const primary = (db.land_media || []).find(m => m.land_id === l.id && m.is_primary);
        const landmarks = (db.land_landmarks || []).filter(lm => lm.land_id === l.id).slice(0, 5)
          .map(lm => ({ name: lm.landmark_name, type: lm.landmark_type, km: lm.distance_km }));
        return {
          id: l.id, title: l.title, district: l.district, village: l.village,
          total_area_acres: l.total_area_acres, asking_price_total: l.asking_price_total,
          asking_price_per_acre: l.asking_price_per_acre, land_use_category: l.land_use_category,
          cdp_zone: l.cdp_zone, aggregation_progress_percent: l.aggregation_progress_percent,
          listed_at: l.listed_at, latitude: l.latitude, longitude: l.longitude,
          water_source: l.water_source, electricity_available: l.electricity_available,
          aggregator_name: agg.full_name, aggregator_company: agg.company_name,
          primary_image: primary ? primary.media_url : null,
          landmarks: landmarks.length ? landmarks : null,
        };
      }));
    }

    // matchmaking query (requirements routes)
    if (s.includes('land_listings l') && s.includes('primary_image')) {
      const filter = parseWhere(s, params);
      let listings = (db.land_listings || []).filter(filter);
      const limitM = s.match(/LIMIT\s+(\d+)/i);
      if (limitM) listings = listings.slice(0, Number(limitM[1]));
      return rows(listings.map(l => {
        const primary = (db.land_media || []).find(m => m.land_id === l.id && m.is_primary);
        return {
          id: l.id, title: l.title, district: l.district, village: l.village,
          total_area_acres: l.total_area_acres, asking_price_total: l.asking_price_total,
          asking_price_per_acre: l.asking_price_per_acre, land_use_category: l.land_use_category,
          cdp_zone: l.cdp_zone, latitude: l.latitude, longitude: l.longitude,
          primary_image: primary ? primary.media_url : null,
        };
      }));
    }

    // drive_folder_id lookup
    if (s.includes('drive_folder_id') && s.includes('land_listings')) {
      const filter = parseWhere(s, params);
      return rows((db.land_listings || []).filter(filter));
    }

    // generic single-table SELECT
    const tbl = getTable(s);
    if (tbl && db[tbl]) {
      const filter = parseWhere(s, params);
      let result = db[tbl].filter(filter);
      const limitM = s.match(/LIMIT\s+(\d+)/i);
      if (limitM) result = result.slice(0, Number(limitM[1]));
      return rows(result);
    }

    return rows([]);
  }

  // ── INSERT ────────────────────────────────────────────────────────────────
  if (upper.startsWith('INSERT INTO')) {
    const tblM = s.match(/INSERT INTO\s+(\w+)/i);
    const tbl = tblM ? tblM[1] : null;
    if (!tbl || !db[tbl]) return rows([]);

    const colsM = s.match(/\(([^)]+)\)\s+VALUES/i);
    if (!colsM) return rows([]);
    const cols = colsM[1].split(',').map(c => c.trim().replace(/\w+\./, ''));

    const record = { id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    cols.forEach((col, i) => { record[col] = params[i] !== undefined ? params[i] : null; });

    // defaults
    if (tbl === 'users') {
      record.kyc_status = record.kyc_status || 'pending';
      record.profile_complete = record.profile_complete || false;
      record.is_active = true;
    }
    if (tbl === 'land_listings') {
      record.listing_status = record.listing_status || 'draft';
      record.aggregation_progress_percent = record.aggregation_progress_percent || 0;
    }
    if (tbl === 'land_media') record.is_primary = record.is_primary || false;
    if (tbl === 'buyer_requirements') record.is_active = true;
    if (tbl === 'verification_tickets') record.ticket_status = record.ticket_status || 'open';
    if (tbl === 'notifications') record.is_read = false;

    // ON CONFLICT DO NOTHING — user_profiles
    if (upper.includes('ON CONFLICT DO NOTHING')) {
      const existing = db[tbl].find(r => r.user_id === record.user_id);
      if (existing) return rows([]);
    }

    db[tbl].push(record);
    save(db);
    return rows([record]);
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────
  if (upper.startsWith('UPDATE')) {
    const tblM = s.match(/UPDATE\s+(\w+)/i);
    const tbl = tblM ? tblM[1] : null;
    if (!tbl || !db[tbl]) return rows([]);

    const filter = parseWhere(s, params);

    // parse SET columns
    const setM = s.match(/SET\s+(.+?)\s+WHERE/is);
    const setPairs = {};
    if (setM) {
      setM[1].split(',').forEach(pair => {
        const pm = pair.trim().match(/(\w+)\s*=\s*\$(\d+)/);
        if (pm) setPairs[pm[1]] = params[+pm[2]-1];
        const pm2 = pair.trim().match(/(\w+)\s*=\s*'([^']*)'/);
        if (pm2) setPairs[pm2[1]] = pm2[2];
        const pmNull = pair.trim().match(/(\w+)\s*=\s*NULL/i);
        if (pmNull) setPairs[pmNull[1]] = null;
        const pmTrue = pair.trim().match(/(\w+)\s*=\s*true/i);
        if (pmTrue) setPairs[pmTrue[1]] = true;
        const pmFalse = pair.trim().match(/(\w+)\s*=\s*false/i);
        if (pmFalse) setPairs[pmFalse[1]] = false;
      });
    }
    setPairs.updated_at = new Date().toISOString();

    const updated = [];
    db[tbl] = db[tbl].map(row => {
      if (filter(row)) {
        const newRow = { ...row, ...setPairs };
        updated.push(newRow);
        return newRow;
      }
      return row;
    });
    save(db);

    // handle RETURNING
    if (upper.includes('RETURNING')) return rows(updated);
    return rows([]);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (upper.startsWith('DELETE FROM')) {
    const tblM = s.match(/DELETE FROM\s+(\w+)/i);
    const tbl = tblM ? tblM[1] : null;
    if (!tbl || !db[tbl]) return rows([]);

    const filter = parseWhere(s, params);
    const removed = db[tbl].filter(filter);
    db[tbl] = db[tbl].filter(r => !filter(r));
    save(db);
    return rows(removed);
  }

  // ── DDL / Extensions — ignore silently ───────────────────────────────────
  return rows([]);
}

// ── pool-compatible interface ──────────────────────────────────────────────
const pool = {
  query,
  // Allow routes that destructure { rows } from a direct query call
  on: () => {},
};

module.exports = pool;
