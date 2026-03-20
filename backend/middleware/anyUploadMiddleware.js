const multer = require('multer');
const path = require('path');
const fs = require('fs');

// On Vercel, the filesystem is read-only outside /tmp.
// Use /tmp for uploads in serverless, or the local uploads dir in development.
const IS_SERVERLESS = process.env.NODE_ENV === 'production';
const UPLOADS_DIR = IS_SERVERLESS
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '../uploads');

// Ensure uploads directory exists — wrap in try/catch so module load
// doesn't crash on Vercel's read-only filesystem (causes FUNCTION_INVOCATION_FAILED)
try {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
} catch (err) {
    console.warn('Could not create uploads directory:', err.message);
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Ensure dir exists at request time too (for /tmp which may be cleared)
        try {
            if (!fs.existsSync(UPLOADS_DIR)) {
                fs.mkdirSync(UPLOADS_DIR, { recursive: true });
            }
        } catch (e) { /* ignore */ }
        cb(null, UPLOADS_DIR);
    },
    filename(req, file, cb) {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});

// Allow all file types for general uploads
const anyFileUpload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

module.exports = anyFileUpload;
