const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const packageRoutes = require('./routes/packageRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const rechargeRoutes = require('./routes/rechargeRoutes');
const guaranteeRoutes = require('./routes/guaranteeRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const adminRoutes = require('./routes/adminRoutes');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

/**
 * DB Connection Warm-up for Serverless (Vercel)
 * Uses mongoose.connection.readyState to detect dropped connections and reconnect.
 */
const connectDB = require('./config/db');
const mongoose = require('mongoose');
let codeRotated = false;

// 1. Basic Middlewares
app.use(cors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// 2. Request Logging & DB Warm-up
app.use((req, res, next) => {
    // Basic request logging for Vercel troubleshooting
    const path = (req.url || '').split('?')[0];
    console.log(`[REQ] ${req.method} ${path}`);

    // If already connected, move to next middleware
    if (mongoose.connection.readyState === 1) {
        return next();
    }

    // Otherwise, ensure connection before proceeding
    console.log('[DB] Connecting for request...');
    connectDB()
        .then(() => {
            console.log('[DB] Connection ready for request');
            next();
        })
        .catch(err => {
            console.error('[CRITICAL] DB Middleware Error:', err.message);
            res.status(500).json({ 
                success: false, 
                message: 'DB_READY_FAILED',
                detail: err.message
            });
        });
});

// Trust proxy for Vercel
app.set('trust proxy', 1);

// 3. Performance & Optimization
app.use(compression());

// 4. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Increased limit for dashboard which makes many calls
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
// 4. Rate Limiting - Disabled for dashboard stability
// app.use('/api/', limiter);

// 5. Body Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/product_images', express.static(path.join(__dirname, '..', 'product_images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/withdrawals', withdrawRoutes);
app.use('/api/recharges', rechargeRoutes);
app.use('/api/guarantee', guaranteeRoutes);
app.use('/api/suppliers', supplierRoutes);
console.log('[Info] Mounting settingsRoutes at /api/settings');
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/uploads', require('./routes/uploadsRoutes'));
app.use('/api/spread-packages', require('./routes/spreadPackageRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling
app.use(errorHandler);

module.exports = app;
