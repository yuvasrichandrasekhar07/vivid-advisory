const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/listings - public search
router.get('/', async (req, res) => {
  const {
    district, land_use_category, min_area, max_area,
    min_price, max_price, status = 'listed',
    page = 1, limit = 20, sort = 'listed_at'
  } = req.query;

  try {
    const conditions = [`l.listing_status = $1`];
    const params = [status];
    let pi = 2;

    if (district) { conditions.push(`l.district = $${pi++}`); params.push(district); }
    if (land_use_category) { conditions.push(`l.land_use_category = $${pi++}`); params.push(land_use_category); }
    if (min_area) { conditions.push(`l.total_area_acres >= $${pi++}`); params.push(Number(min_area)); }
    if (max_area) { conditions.push(`l.total_area_acres <= $${pi++}`); params.push(Number(max_area)); }
    if (min_price) { conditions.push(`l.asking_price_total >= $${pi++}`); params.push(Number(min_price)); }
    if (max_price) { conditions.push(`l.asking_price_total <= $${pi++}`); params.push(Number(max_price)); }

    const offset = (Number(page) - 1) * Number(limit);
    const sortMap = { listed_at: 'l.listed_at DESC', price_asc: 'l.asking_price_per_acre ASC', area: 'l.total_area_acres DESC' };
    const orderBy = sortMap[sort] || 'l.listed_at DESC';

    const query = `
      SELECT l.id, l.title, l.district, l.village, l.total_area_acres,
             l.asking_price_total, l.asking_price_per_acre, l.land_use_category,
             l.cdp_zone, l.aggregation_progress_percent, l.listed_at,
             l.latitude, l.longitude, l.water_source, l.electricity_available,
             u.full_name as aggregator_name, u.company_name as aggregator_company,
             (SELECT media_url FROM land_media WHERE land_id=l.id AND is_primary=true LIMIT 1) as primary_image,
             (SELECT json_agg(json_build_object('name', landmark_name, 'type', landmark_type, 'km', distance_km))
              FROM land_landmarks WHERE land_id=l.id LIMIT 5) as landmarks
      FROM land_listings l
      JOIN users u ON u.id = l.aggregator_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${pi++} OFFSET $${pi++}
    `;
    params.push(Number(limit), offset);

    const countQuery = `
      SELECT COUNT(*) FROM land_listings l WHERE ${conditions.join(' AND ')}
    `;

    const [listings, countRes] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, pi - 3))
    ]);

    res.json({
      listings: listings.rows,
      total: parseInt(countRes.rows[0].count),
      page: Number(page),
      pages: Math.ceil(parseInt(countRes.rows[0].count) / Number(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/listings/:id - single listing
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.full_name as aggregator_name, u.company_name, u.phone as aggregator_phone,
              (SELECT json_agg(m.*) FROM land_media m WHERE m.land_id=l.id) as media,
              (SELECT json_agg(lm.*) FROM land_landmarks lm WHERE lm.land_id=l.id) as landmarks,
              (SELECT json_agg(lt.*) FROM land_litigations lt WHERE lt.land_id=l.id) as litigations,
              (SELECT json_agg(tr.*) FROM land_tax_records tr WHERE tr.land_id=l.id) as tax_records
       FROM land_listings l
       JOIN users u ON u.id=l.aggregator_id
       WHERE l.id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Listing not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/listings - create listing (aggregators only)
router.post('/', auth, requireRole('aggregator', 'admin'), async (req, res) => {
  const {
    title, description, land_use_category, district, taluk, hobli, village,
    survey_numbers, latitude, longitude, address, total_area_acres,
    road_frontage_meters, ownership_type, number_of_owners, ownership_acquired_via,
    asking_price_total, asking_price_per_acre, price_negotiable,
    water_logging, electricity_available, water_source, soil_type, terrain,
    current_land_use, legal_firm_name, landmarks
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO land_listings (
        aggregator_id, title, description, land_use_category, district, taluk, hobli, village,
        survey_numbers, latitude, longitude, address, total_area_acres, road_frontage_meters,
        ownership_type, number_of_owners, ownership_acquired_via, asking_price_total,
        asking_price_per_acre, price_negotiable, water_logging, electricity_available,
        water_source, soil_type, terrain, current_land_use, legal_firm_name,
        listing_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,'draft')
      RETURNING *`,
      [req.user.id, title, description, land_use_category, district, taluk, hobli, village,
       survey_numbers, latitude, longitude, address, total_area_acres, road_frontage_meters,
       ownership_type, number_of_owners, ownership_acquired_via, asking_price_total,
       asking_price_per_acre, price_negotiable, water_logging, electricity_available,
       water_source, soil_type, terrain, current_land_use, legal_firm_name]
    );
    const listing = result.rows[0];

    // Insert landmarks if provided
    if (landmarks?.length) {
      for (const lm of landmarks) {
        await pool.query(
          `INSERT INTO land_landmarks (land_id, landmark_name, landmark_type, distance_km, direction)
           VALUES ($1,$2,$3,$4,$5)`,
          [listing.id, lm.name, lm.type, lm.distance_km, lm.direction]
        );
      }
    }

    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/listings/:id/submit - submit for verification
router.put('/:id/submit', auth, requireRole('aggregator'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE land_listings SET listing_status='pending_verification', updated_at=NOW()
       WHERE id=$1 AND aggregator_id=$2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Listing not found or not yours' });

    // Trigger govt verification (async)
    triggerGovtVerification(req.params.id);

    res.json({ message: 'Submitted for verification' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/listings/:id/approve - admin approves listing
router.put('/:id/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    await pool.query(
      `UPDATE land_listings SET listing_status='listed', verified_by=$1, verified_at=NOW(), listed_at=NOW() WHERE id=$2`,
      [req.user.id, req.params.id]
    );
    // Notify matching buyers
    triggerMatchNotifications(req.params.id);
    res.json({ message: 'Listing approved and live' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Stubbed async functions (replace with real scraping service)
async function triggerGovtVerification(landId) {
  // TODO: call services/govtVerification.js
  console.log(`[Govt Check] Triggered for land ${landId}`);
}

async function triggerMatchNotifications(landId) {
  // TODO: call services/matchmaking.js
  console.log(`[Matchmaking] Triggered for land ${landId}`);
}

module.exports = router;
