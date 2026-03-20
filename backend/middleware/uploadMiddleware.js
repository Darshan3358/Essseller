const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cloudinary support
let storage;
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    // Configuration is usually picked up from CLOUDINARY_URL automatically,
    // but we can also set it explicitly if needed.
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'esseller_uploads',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            public_id: (req, file) => `${file.fieldname}-${Date.now()}`
        },
    });
} else {
    // Ensure uploads directory exists for local fallback
    // Use /tmp in production (Vercel read-only FS), local uploads dir in dev
    const IS_SERVERLESS = process.env.NODE_ENV === 'production';
    const uploadDir = IS_SERVERLESS
        ? path.join('/tmp', 'uploads')
        : path.join(__dirname, '../uploads');
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    } catch (err) {
        console.warn('Could not create local uploads dir:', err.message);
    }

    storage = multer.memoryStorage();
}

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        if (!process.env.CLOUDINARY_URL) {
            checkFileType(file, cb);
        } else {
            cb(null, true);
        }
    },
});

module.exports = upload;
