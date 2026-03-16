const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize DB connection and rotateCode (runs once on cold start)
const init = async () => {
    try {
        await connectDB();
        const { rotateCode } = require('./controllers/settingsController');
        await rotateCode();
        console.log('Server initialized successfully');
    } catch (error) {
        console.error(`Initialization error: ${error.message}`);
    }
};

// Production (Vercel serverless) - Ensure DB is connected
let isConnected = false;
const connect = async () => {
    if (isConnected) return;
    await init();
    isConnected = true;
};

// Middleware to ensure DB is connected before any request
app.use(async (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        try {
            await connect();
            next();
        } catch (error) {
            console.error('DB Connection Middleware Error:', error);
            res.status(500).json({ success: false, message: 'Database Connection Error' });
        }
    } else {
        next();
    }
});

if (process.env.NODE_ENV !== 'production') {
    // Local development - run as normal server
    init().then(() => {
        const PORT = process.env.PORT || 5000;
        const { rotateCode } = require('./controllers/settingsController');

        // Rotate Invitation Code every 5 minutes (only in non-serverless)
        setInterval(() => {
            rotateCode();
        }, 300000);

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    });
}

// Export for Vercel serverless
module.exports = app;
