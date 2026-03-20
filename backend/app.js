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
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

/**
 * DB Connection Warm-up for Serverless (Vercel)
 * Uses mongoose.connection.readyState to detect dropped connections and reconnect.
 */
const connectDB = require('./config/db');
const mongoose = require('mongoose');
let codeRotated = false;

app.use(async (req, res, next) => {
    // Only ensure DB is connected for API routes
    if ((req.url && typeof req.url === 'string' && req.url.startsWith('/api')) || (req.url && typeof req.url === 'string' && req.url === '/')) {
        // readyState 1 = connected; check each request to handle dropped connections
        if (mongoose.connection.readyState !== 1) {
            try {
                console.log('Serverless: Connecting to DB...');
                await connectDB();

                // One-time initialization logic per serverless instance
                if (!codeRotated) {
                    codeRotated = true;
                    // Rotation disabled as per request
                }
            } catch (err) {
                console.error('CRITICAL: DB Connection Failed:', err.message);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database connection failed. Please ensure MONGO_URI is set in Vercel environment variables.' 
                });
            }
        }
    }
    next();
});

// Trust proxy for Vercel
app.set('trust proxy', 1);

// CORS - manual middleware, must be first before helmet and everything else
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Whitelist production domains + local dev + any vercel preview URL
    const isVercel = origin && origin.endsWith('.vercel.app');
    const isLocal = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));

    if (!origin || isVercel || isLocal) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Other middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
