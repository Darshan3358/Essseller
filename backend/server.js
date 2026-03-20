const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// One-time initialization logic for local development
const init = async () => {
    try {
        await connectDB();
        // await rotateCode();
         console.log('Server initialized successfully');
    } catch (error) {
        console.error(`Initialization error: ${error.message}`);
    }
};

if (process.env.NODE_ENV !== 'production') {
    // Local development - run as normal server
    init().then(() => {
        const PORT = process.env.PORT || 5000;
        // Rotation removed as per request to use only manual Generate Random button

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    });
}

// Export for Vercel serverless (Middleware in app.js handles DB connection on cold starts)
module.exports = app;
