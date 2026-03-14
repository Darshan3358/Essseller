const mongoose = require('mongoose');

const sellerProductSchema = new mongoose.Schema({
    seller_id: { type: mongoose.Schema.Types.Mixed, ref: 'Seller' },
    product_id: { type: mongoose.Schema.Types.Mixed, ref: 'Product' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Compound index to prevent duplicate seller+product combinations
sellerProductSchema.index({ seller_id: 1, product_id: 1 }, { unique: true });

const SellerProduct = mongoose.model('SellerProduct', sellerProductSchema);

// Drop old 'id_1' index if it still exists in the database
// This is needed because the schema was previously migrated from having an 'id' field
const dropOldIndex = async () => {
    try {
        const collection = mongoose.connection.collection('sellerproducts');
        const indexes = await collection.indexes();
        const hasOldIndex = indexes.some(idx => idx.name === 'id_1');
        if (hasOldIndex) {
            await collection.dropIndex('id_1');
            console.log('✅ Dropped old sellerproducts.id_1 index');
        }
    } catch (err) {
        // Ignore if index doesn't exist
        if (err.code !== 27) {
            console.warn('SellerProduct index migration warning:', err.message);
        }
    }
};

// Run migration when DB is connected
if (mongoose.connection.readyState === 1) {
    dropOldIndex();
} else {
    mongoose.connection.once('connected', dropOldIndex);
}

module.exports = SellerProduct;
