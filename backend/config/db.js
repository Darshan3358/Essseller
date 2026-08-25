const mongoose = require('mongoose');

// Cache the connection promise so simultaneous cold start invocations share it
let connectionPromise = null;

const connectDB = async () => {
    // 1. Check if we already have an active connection
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // 2. Check if a connection attempt is already in progress
    if (connectionPromise) {
        console.log('[DB] Re-using existing connection attempt...');
        return connectionPromise;
    }

    if (!process.env.MONGO_URI) {
        console.error('CRITICAL: MONGO_URI is not defined');
        throw new Error('MONGO_URI is missing');
    }

    try {
        console.log('[DB] Initializing new connection...');
        
        // Start the connection and store the promise
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });

        const conn = await connectionPromise;
        console.log(`[DB] Successfully connected to ${conn.connection.host}`);
        
        return conn;
    } catch (error) {
        // Reset the promise so we can try again on the next request
        connectionPromise = null;
        console.error(`[DB] ERROR: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
