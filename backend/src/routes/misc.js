const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

// GET /api/news - latest land news for Karnataka
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM news_articles ORDER BY published_at DESC LIMIT 30`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/news/by-district/:district
router.get('/by-district/:district', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM news_articles WHERE $1 = ANY(tags) ORDER BY published_at DESC LIMIT 15`,
      [req.params.district]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/faqs
router.get('/faqs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM faqs WHERE is_active=true ORDER BY category, display_order`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rate-cards
router.get('/rate-cards', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM rate_cards WHERE is_active=true ORDER BY service_category, display_order`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/service-inquiry
router.post('/service-inquiry', async (req, res) => {
  const { service_type, land_id, contact_name, contact_phone, contact_email, notes, user_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO service_inquiries (user_id, service_type, land_id, contact_name, contact_phone, contact_email, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [user_id || null, service_type, land_id || null, contact_name, contact_phone, contact_email, notes]
    );
    res.status(201).json({ message: 'Inquiry submitted. We will contact you shortly.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
