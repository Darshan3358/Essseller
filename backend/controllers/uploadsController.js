const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Helper: get file type category
const getFileType = (ext) => {
    const images = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const videos = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const docs = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'];
    if (images.includes(ext)) return 'image';
    if (videos.includes(ext)) return 'video';
    if (docs.includes(ext)) return 'doc';
    return 'other';
};

// Helper: format bytes
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// @desc    Get all uploaded files for the logged-in seller (filtered by seller prefix)
// @route   GET /api/uploads
// @access  Private
const getMyUploads = asyncHandler(async (req, res) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
        return res.json({ success: true, files: [], totalSize: 0, stats: {} });
    }

    const allFiles = fs.readdirSync(UPLOADS_DIR);

    // Filter by seller id prefix if it exists (filename format: fieldname-timestamp.ext or image-timestamp.ext)
    // We return all files for admin, or only seller's own files if seller
    const sellerId = req.user?._id?.toString();

    const files = allFiles
        .filter(f => {
            const stat = fs.statSync(path.join(UPLOADS_DIR, f));
            return stat.isFile();
        })
        .map(filename => {
            const filePath = path.join(UPLOADS_DIR, filename);
            const stat = fs.statSync(filePath);
            const ext = path.extname(filename).toLowerCase();
            const type = getFileType(ext);
            return {
                name: filename,
                url: `/uploads/${filename}`,
                type,
                ext: ext.replace('.', ''),
                size: formatBytes(stat.size),
                sizeBytes: stat.size,
                createdAt: stat.birthtime || stat.mtime,
                mtime: stat.mtime,
            };
        })
        .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

    // Compute stats
    const totalSizeBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
    const stats = {
        total: files.length,
        images: files.filter(f => f.type === 'image').length,
        videos: files.filter(f => f.type === 'video').length,
        docs: files.filter(f => f.type === 'doc').length,
        other: files.filter(f => f.type === 'other').length,
        totalSize: formatBytes(totalSizeBytes),
        totalSizeBytes,
    };

    res.json({ success: true, files, stats });
});

// @desc    Upload a file
// @route   POST /api/uploads
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const type = getFileType(ext);
    const stat = fs.statSync(req.file.path);

    res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: {
            name: req.file.filename,
            url: `/uploads/${req.file.filename}`,
            type,
            ext: ext.replace('.', ''),
            size: formatBytes(stat.size),
            sizeBytes: stat.size,
            createdAt: stat.birthtime || stat.mtime,
        }
    });
});

// @desc    Delete an uploaded file
// @route   DELETE /api/uploads/:filename
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
    const filename = req.params.filename;

    // Security: prevent path traversal
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
        res.status(400);
        throw new Error('Invalid filename');
    }

    const filePath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        res.status(404);
        throw new Error('File not found');
    }

    fs.unlinkSync(filePath);

    res.json({ success: true, message: 'File deleted successfully' });
});

module.exports = { getMyUploads, uploadFile, deleteFile };
