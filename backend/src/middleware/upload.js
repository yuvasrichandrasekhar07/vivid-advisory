const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const storage = multer.memoryStorage();

const limits = { fileSize: 20 * 1024 * 1024 }; // 20 MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

const uploadSingle = multer({ storage, limits, fileFilter }).single('file');
const uploadMultiple = multer({ storage, limits, fileFilter }).array('files', 5);

module.exports = { uploadSingle, uploadMultiple };
