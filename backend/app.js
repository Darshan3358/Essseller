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

const app = express();

/**
 * DB Connection Warm-up for Serverless (Vercel)
 */
const connectDB = require('./config/db');
let isConnected = false;

app.use(async (req, res, next) => {
    // Skip for static files if any, but focus on /api
    if (req.url.startsWith('/api') || req.url === '/') {
        if (!isConnected) {
            try {
                console.log('Serverless Warm-up: Connecting to DB...');
                await connectDB();
                isConnected = true;
                
                // One-time initialization logic
                try {
                    const { rotateCode } = require('./controllers/settingsController');
                    await rotateCode();
                } catch (rotErr) {
                    console.error('Initial rotateCode failed:', rotErr.message);
                }
            } catch (err) {
                console.error('CRITICAL: DB Connection Failed:', err.message);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database Connection Error. Please check MONGO_URI.' 
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

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling
app.use(errorHandler);

module.exports = app;
