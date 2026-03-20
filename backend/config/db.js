const mongoose = require('mongoose');

// Cache the connection promise so serverless warm invocations reuse it
let cachedConnection = null;

const connectDB = async () => {
    // If already connected, reuse the existing connection
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    if (!process.env.MONGO_URI) {
        // Throw instead of process.exit — process.exit kills the entire
        // serverless function invocation on Vercel, causing FUNCTION_INVOCATION_FAILED
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            connectTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        cachedConnection = conn;

        // Migration: drop old 'id_1' index from sellerproducts if it exists
        try {
            const col = conn.connection.collection('sellerproducts');
            const indexes = await col.indexes();
            if (indexes.some(idx => idx.name === 'id_1')) {
                await col.dropIndex('id_1');
                console.log('✅ Migrated: Dropped sellerproducts.id_1 index');
            }
        } catch (migErr) {
            if (migErr.code !== 27) {
                console.warn('Index migration warning:', migErr.message);
            }
        }

        return conn;
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
        // Throw the error so the caller (app.js middleware) can handle it gracefully
        // and return a 500 JSON response — do NOT call process.exit() in serverless!
        throw error;
    }
};

module.exports = connectDB;
