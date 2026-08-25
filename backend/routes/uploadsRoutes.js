const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const anyUpload = require('../middleware/anyUploadMiddleware');
const { getMyUploads, uploadFile, deleteFile } = require('../controllers/uploadsController');

// GET  /api/uploads        - List all uploads
// POST /api/uploads        - Upload a new file
// DELETE /api/uploads/:filename - Delete a file

router.get('/', protect, getMyUploads);
router.post('/', protect, anyUpload.single('file'), uploadFile);
router.delete('/:filename', protect, deleteFile);

module.exports = router;
