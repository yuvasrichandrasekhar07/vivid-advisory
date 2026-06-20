const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const driveService = require('../services/googleDrive');

// Maps doc_type values to their DB column names on land_listings
const DOC_TYPE_MAP = {
  title_deed:                'title_deed_url',
  encumbrance_certificate:   'encumbrance_certificate_url',
  mutation_extract:          'mutation_extract_url',
  survey_sketch:             'survey_sketch_url',
  due_diligence_report:      'due_diligence_report_url',
  market_value_report:       'market_value_report_url',
};

// Wraps multer middleware in a promise so errors are catchable
function runMiddleware(mw, req, res) {
  return new Promise((resolve, reject) => {
    mw(req, res, (err) => (err ? reject(err) : resolve()));
  });
}

// Extracts Drive fileId from a webViewLink URL
function extractFileIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([^/]+)\//);
  return match ? match[1] : null;
}

// Ensures a Drive folder exists for a listing — creates and persists it on first call
async function ensureDriveFolder(landId, listingTitle) {
  const result = await pool.query(
    'SELECT drive_folder_id, title FROM land_listings WHERE id = $1',
    [landId]
  );
  if (!result.rows.length) {
    const err = new Error('Listing not found');
    err.status = 404;
    throw err;
  }
  const { drive_folder_id, title } = result.rows[0];
  if (drive_folder_id) return drive_folder_id;

  const folderId = await driveService.createListingFolder(landId, listingTitle || title);
  await pool.query(
    'UPDATE land_listings SET drive_folder_id = $1 WHERE id = $2',
    [folderId, landId]
  );
  return folderId;
}

// Converts multer errors to user-friendly 400 messages
function multerErrorResponse(err, res) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum 20MB per file.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Maximum 5 images allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  return null;
}

// ============================================================
// POST /api/upload/document
// Upload a single legal document (PDF) for a listing.
// ============================================================
router.post('/document', auth, requireRole('aggregator', 'admin'), async (req, res) => {
  try {
    await runMiddleware(uploadSingle, req, res);
  } catch (err) {
    return multerErrorResponse(err, res) || res.status(400).json({ error: err.message });
  }

  const { land_id, doc_type } = req.body;

  if (!land_id) return res.status(400).json({ error: 'land_id is required' });
  if (!doc_type || !DOC_TYPE_MAP[doc_type]) {
    return res.status(400).json({ error: `Invalid doc_type. Must be one of: ${Object.keys(DOC_TYPE_MAP).join(', ')}` });
  }
  if (!req.file) return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });

  try {
    const listingResult = await pool.query(
      'SELECT id, title, aggregator_id, drive_folder_id FROM land_listings WHERE id = $1',
      [land_id]
    );
    if (!listingResult.rows.length) return res.status(404).json({ error: 'Listing not found' });

    const listing = listingResult.rows[0];
    if (req.user.role !== 'admin' && listing.aggregator_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    const folderId = await ensureDriveFolder(land_id, listing.title);
    const { fileId, webViewLink } = await driveService.uploadFile(
      folderId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const col = DOC_TYPE_MAP[doc_type];
    await pool.query(
      `UPDATE land_listings SET ${col} = $1, updated_at = NOW() WHERE id = $2`,
      [webViewLink, land_id]
    );

    res.json({
      message: 'Document uploaded successfully',
      doc_type,
      url: webViewLink,
      fileId,
    });
  } catch (err) {
    console.error('[Upload Document]', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// ============================================================
// POST /api/upload/images
// Upload 1-5 land images for a listing.
// ============================================================
router.post('/images', auth, requireRole('aggregator', 'admin'), async (req, res) => {
  try {
    await runMiddleware(uploadMultiple, req, res);
  } catch (err) {
    return multerErrorResponse(err, res) || res.status(400).json({ error: err.message });
  }

  const { land_id, caption, is_primary } = req.body;

  if (!land_id) return res.status(400).json({ error: 'land_id is required' });
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded. Use field name "files".' });

  try {
    const listingResult = await pool.query(
      'SELECT id, title, aggregator_id, drive_folder_id FROM land_listings WHERE id = $1',
      [land_id]
    );
    if (!listingResult.rows.length) return res.status(404).json({ error: 'Listing not found' });

    const listing = listingResult.rows[0];
    if (req.user.role !== 'admin' && listing.aggregator_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    const folderId = await ensureDriveFolder(land_id, listing.title);

    // Upload all images to Drive in parallel
    const uploadResults = await Promise.all(
      req.files.map(f => driveService.uploadFile(folderId, f.buffer, f.originalname, f.mimetype))
    );

    const setPrimary = is_primary === 'true';

    // If any image is flagged as primary, clear existing primary first
    if (setPrimary) {
      await pool.query('UPDATE land_media SET is_primary = false WHERE land_id = $1', [land_id]);
    }

    // Get current max display_order to continue the sequence
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) as max_order FROM land_media WHERE land_id = $1',
      [land_id]
    );
    let nextOrder = parseInt(orderResult.rows[0].max_order) + 1;

    const inserted = [];
    for (let i = 0; i < uploadResults.length; i++) {
      const { webViewLink } = uploadResults[i];
      const isPrimaryThisFile = setPrimary && i === 0; // only first file gets primary flag
      const result = await pool.query(
        `INSERT INTO land_media (land_id, media_url, media_type, caption, is_primary, display_order)
         VALUES ($1, $2, 'image', $3, $4, $5) RETURNING *`,
        [land_id, webViewLink, caption || null, isPrimaryThisFile, nextOrder++]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${inserted.length} image(s) uploaded successfully`,
      uploaded: inserted,
    });
  } catch (err) {
    console.error('[Upload Images]', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// ============================================================
// DELETE /api/upload/document
// Remove a specific document type from Drive and null the URL column.
// ============================================================
router.delete('/document', auth, requireRole('aggregator', 'admin'), async (req, res) => {
  const { land_id, doc_type } = req.body;

  if (!land_id) return res.status(400).json({ error: 'land_id is required' });
  if (!doc_type || !DOC_TYPE_MAP[doc_type]) {
    return res.status(400).json({ error: `Invalid doc_type. Must be one of: ${Object.keys(DOC_TYPE_MAP).join(', ')}` });
  }

  const col = DOC_TYPE_MAP[doc_type];

  try {
    const result = await pool.query(
      `SELECT aggregator_id, ${col} as current_url FROM land_listings WHERE id = $1`,
      [land_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Listing not found' });

    const { aggregator_id, current_url } = result.rows[0];
    if (req.user.role !== 'admin' && aggregator_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your listing' });
    }
    if (!current_url) return res.status(400).json({ error: 'No document of this type is currently uploaded' });

    const fileId = extractFileIdFromUrl(current_url);
    if (fileId) {
      await driveService.deleteFile(fileId);
    } else {
      console.warn(`[Delete Document] Could not extract fileId from URL: ${current_url}`);
    }

    await pool.query(
      `UPDATE land_listings SET ${col} = NULL, updated_at = NOW() WHERE id = $1`,
      [land_id]
    );

    res.json({ message: 'Document removed successfully' });
  } catch (err) {
    console.error('[Delete Document]', err);
    res.status(500).json({ error: 'Server error during deletion' });
  }
});

// ============================================================
// DELETE /api/upload/image/:mediaId
// Remove a specific image from Drive and from land_media table.
// ============================================================
router.delete('/image/:mediaId', auth, requireRole('aggregator', 'admin'), async (req, res) => {
  const { mediaId } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, l.aggregator_id
       FROM land_media m
       JOIN land_listings l ON l.id = m.land_id
       WHERE m.id = $1`,
      [mediaId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Image not found' });

    const media = result.rows[0];
    if (req.user.role !== 'admin' && media.aggregator_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    const fileId = extractFileIdFromUrl(media.media_url);
    if (fileId) {
      await driveService.deleteFile(fileId);
    } else {
      console.warn(`[Delete Image] Could not extract fileId from URL: ${media.media_url}`);
    }

    await pool.query('DELETE FROM land_media WHERE id = $1', [mediaId]);

    // If the deleted image was primary, promote the next oldest image
    if (media.is_primary) {
      await pool.query(
        `UPDATE land_media SET is_primary = true
         WHERE id = (
           SELECT id FROM land_media
           WHERE land_id = $1
           ORDER BY display_order ASC, created_at ASC
           LIMIT 1
         )`,
        [media.land_id]
      );
    }

    res.json({ message: 'Image removed successfully' });
  } catch (err) {
    console.error('[Delete Image]', err);
    res.status(500).json({ error: 'Server error during deletion' });
  }
});

module.exports = router;
