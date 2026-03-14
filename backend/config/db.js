const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

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
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
