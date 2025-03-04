const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'temp'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit to 10MB
});

// Upload a file
// POST /api/files/upload
router.post('/upload', auth, upload.single('file'), fileController.uploadFile);

// Download a file using download link (public route)
// GET /api/files/download/:downloadLink
router.get('/download/:downloadLink', fileController.downloadFile);

// Get user's files
// GET /api/files
router.get('/', auth, fileController.getUserFiles);

// Delete a file
// DELETE /api/files/:id
router.delete('/:id', auth, fileController.deleteFile);

module.exports = router;