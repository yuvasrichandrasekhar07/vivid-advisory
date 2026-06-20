const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/tickets - admin/field executive view
router.get('/', auth, requireRole('admin'), async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  try {
    const conditions = [];
    const params = [];
    let pi = 1;
    if (status) { conditions.push(`t.ticket_status=$${pi++}`); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const result = await pool.query(
      `SELECT t.*, l.title as land_title, l.district, l.survey_numbers,
              u.full_name as raised_by_name,
              a.full_name as assigned_to_name
       FROM verification_tickets t
       JOIN land_listings l ON l.id=t.land_id
       LEFT JOIN users u ON u.id=t.raised_by
       LEFT JOIN users a ON a.id=t.assigned_to
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${pi++} OFFSET $${pi++}`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tickets/mine - field executive sees their assigned tickets
router.get('/mine', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, l.title as land_title, l.district
       FROM verification_tickets t
       JOIN land_listings l ON l.id=t.land_id
       WHERE t.assigned_to=$1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tickets - raise a ticket (auto or manual)
router.post('/', auth, async (req, res) => {
  const { land_id, ticket_type, description, govt_data_snapshot, aggregator_data_snapshot, proof_requested } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO verification_tickets (land_id, raised_by, ticket_type, description, govt_data_snapshot, aggregator_data_snapshot, proof_requested)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [land_id, req.user.id, ticket_type, description,
       govt_data_snapshot ? JSON.stringify(govt_data_snapshot) : null,
       aggregator_data_snapshot ? JSON.stringify(aggregator_data_snapshot) : null,
       proof_requested]
    );

    // Suspend listing until resolved
    await pool.query(
      `UPDATE land_listings SET listing_status='suspended', updated_at=NOW() WHERE id=$1 AND listing_status='listed'`,
      [land_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tickets/:id/assign
router.put('/:id/assign', auth, requireRole('admin'), async (req, res) => {
  const { field_executive_id } = req.body;
  try {
    await pool.query(
      `UPDATE verification_tickets SET assigned_to=$1, ticket_status='assigned', updated_at=NOW() WHERE id=$2`,
      [field_executive_id, req.params.id]
    );
    res.json({ message: 'Assigned' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tickets/:id/resolve
router.put('/:id/resolve', auth, async (req, res) => {
  const { resolution_notes, proof_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE verification_tickets
       SET ticket_status='resolved', resolution_notes=$1, proof_url=$2, resolved_at=NOW(), updated_at=NOW()
       WHERE id=$3 AND (assigned_to=$4 OR $5='admin')
       RETURNING land_id`,
      [resolution_notes, proof_url, req.params.id, req.user.id, req.user.role]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Ticket not found or not assigned to you' });

    // Re-list the land
    await pool.query(
      `UPDATE land_listings SET listing_status='listed', updated_at=NOW() WHERE id=$1`,
      [result.rows[0].land_id]
    );
    res.json({ message: 'Ticket resolved, listing restored' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
