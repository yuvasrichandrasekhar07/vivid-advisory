const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, phone, password, role, full_name, company_name } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'email, password, role are required' });
  }
  const validRoles = ['aggregator', 'investor', 'developer', 'buyer', 'consultant'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, phone, password_hash, role, full_name, company_name)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, role, full_name, kyc_status, profile_complete`,
      [email, phone, hash, role, full_name, company_name]
    );
    const user = result.rows[0];
    // Create empty profile row
    await pool.query('INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const result = await pool.query(
      'SELECT id, email, role, password_hash, full_name, company_name, kyc_status, profile_complete FROM users WHERE email=$1 AND is_active=true',
      [email]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.phone, u.role, u.full_name, u.company_name, u.kyc_status, u.profile_complete,
              p.city, p.state, p.bio, p.investment_range_min, p.investment_range_max,
              p.required_area_min_acres, p.required_area_max_acres, p.budget_min, p.budget_max
       FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id
       WHERE u.id=$1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', require('../middleware/auth').auth, async (req, res) => {
  const { full_name, phone, company_name, ...profileFields } = req.body;
  try {
    await pool.query(
      `UPDATE users SET full_name=$1, phone=$2, company_name=$3, profile_complete=true, updated_at=NOW() WHERE id=$4`,
      [full_name, phone, company_name, req.user.id]
    );
    const profileCols = Object.keys(profileFields);
    if (profileCols.length) {
      const sets = profileCols.map((k, i) => `${k}=$${i + 2}`).join(', ');
      const vals = profileCols.map(k => profileFields[k]);
      await pool.query(`UPDATE user_profiles SET ${sets} WHERE user_id=$1`, [req.user.id, ...vals]);
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
