const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// POST /api/requirements - buyer posts requirement
router.post('/', auth, requireRole('buyer', 'consultant', 'developer'), async (req, res) => {
  const {
    land_use_type, description, preferred_districts, max_distance_from_city_km,
    area_min_acres, area_max_acres, budget_min, budget_max,
    shape_preference, road_frontage_required_meters, road_type_required,
    power_required_kva, water_required_kld, drainage_required,
    pollution_zone_required, requires_separate_electric_bus, requires_storage,
    storage_area_sqft, engagement_type, preferred_developer_partner
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO buyer_requirements (
        buyer_id, land_use_type, description, preferred_districts, max_distance_from_city_km,
        area_min_acres, area_max_acres, budget_min, budget_max, shape_preference,
        road_frontage_required_meters, road_type_required, power_required_kva,
        water_required_kld, drainage_required, pollution_zone_required,
        requires_separate_electric_bus, requires_storage, storage_area_sqft,
        engagement_type, preferred_developer_partner
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING *`,
      [
        req.user.id, land_use_type, description, preferred_districts, max_distance_from_city_km,
        area_min_acres, area_max_acres, budget_min, budget_max, shape_preference,
        road_frontage_required_meters, road_type_required, power_required_kva,
        water_required_kld, drainage_required, pollution_zone_required,
        requires_separate_electric_bus, requires_storage, storage_area_sqft,
        engagement_type, preferred_developer_partner
      ]
    );
    const req_record = result.rows[0];

    // Run matchmaking
    const matches = await runMatchmaking(req_record);
    res.status(201).json({ requirement: req_record, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requirements/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM land_listings l
         WHERE l.listing_status='listed'
           AND l.land_use_category=r.land_use_type
           AND (r.area_min_acres IS NULL OR l.total_area_acres >= r.area_min_acres)
           AND (r.area_max_acres IS NULL OR l.total_area_acres <= r.area_max_acres)
        ) as match_count
       FROM buyer_requirements r
       WHERE buyer_id=$1 AND is_active=true
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requirements/:id/matches
router.get('/:id/matches', auth, async (req, res) => {
  try {
    const reqResult = await pool.query(
      'SELECT * FROM buyer_requirements WHERE id=$1 AND buyer_id=$2',
      [req.params.id, req.user.id]
    );
    if (!reqResult.rows.length) return res.status(404).json({ error: 'Requirement not found' });

    const r = reqResult.rows[0];
    const matches = await runMatchmaking(r);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

async function runMatchmaking(requirement) {
  const conditions = [`l.listing_status = 'listed'`];
  const params = [];
  let pi = 1;

  if (requirement.land_use_type) {
    conditions.push(`l.land_use_category = $${pi++}`);
    params.push(requirement.land_use_type);
  }
  if (requirement.area_min_acres) {
    conditions.push(`l.total_area_acres >= $${pi++}`);
    params.push(requirement.area_min_acres);
  }
  if (requirement.area_max_acres) {
    conditions.push(`l.total_area_acres <= $${pi++}`);
    params.push(requirement.area_max_acres);
  }
  if (requirement.budget_max) {
    conditions.push(`l.asking_price_total <= $${pi++}`);
    params.push(requirement.budget_max);
  }
  if (requirement.preferred_districts?.length) {
    conditions.push(`l.district = ANY($${pi++})`);
    params.push(requirement.preferred_districts);
  }

  const result = await pool.query(
    `SELECT l.id, l.title, l.district, l.village, l.total_area_acres,
            l.asking_price_total, l.asking_price_per_acre, l.land_use_category,
            l.cdp_zone, l.latitude, l.longitude,
            (SELECT media_url FROM land_media WHERE land_id=l.id AND is_primary=true LIMIT 1) as primary_image
     FROM land_listings l
     WHERE ${conditions.join(' AND ')}
     LIMIT 20`,
    params
  );
  return result.rows;
}

module.exports = router;
