const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const migrateImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const Product = require('./backend/models/Product');
        const db = mongoose.connection.db;

        // Get all legacy image records from 'productimages' collection
        const legacyImages = await db.collection('productimages').find({}).toArray();
        console.log(`Found ${legacyImages.length} legacy image records.`);

        // Group by product_id
        const productMap = {};
        legacyImages.forEach(img => {
            if (img.image_url && img.image_url.trim()) {
                if (!productMap[img.product_id]) {
                    productMap[img.product_id] = [];
                }
                productMap[img.product_id].push(img.image_url);
            }
        });

        console.log(`Processing ${Object.keys(productMap).length} products...`);

        let updatedCount = 0;
        for (const [productId, images] of Object.entries(productMap)) {
            if (images.length === 0) continue;

            const res = await Product.updateOne(
                { id: productId },
                { 
                    $set: { 
                        image: images[0],
                        gallery: images
                    }
                }
            );
            
            if (res.modifiedCount > 0) {
                updatedCount++;
                if (updatedCount % 100 === 0) {
                    console.log(`Updated ${updatedCount} products...`);
                }
            }
        }

        console.log(`Successfully updated ${updatedCount} products with images.`);

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

migrateImages();
