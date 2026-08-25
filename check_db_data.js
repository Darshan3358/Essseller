const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const Product = require('./backend/models/Product');
        const products = await Product.find().limit(5);

        console.log('Sample Products:');
        products.forEach(p => {
            console.log(`- _id: ${p._id}, id: ${p.id}, name: ${p.name}, image: ${p.image}`);
        });

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections:');
        collections.forEach(c => console.log(`- ${c.name}`));

        // Check if imageproject collection exists
        const imageProjectCount = await mongoose.connection.db.collection('imageproject').countDocuments();
        console.log(`\nimageproject count: ${imageProjectCount}`);

        if (imageProjectCount > 0) {
            const sampleImages = await mongoose.connection.db.collection('imageproject').find().limit(5).toArray();
            console.log('\nSample imageproject records:');
            sampleImages.forEach(img => {
                console.log(JSON.stringify(img));
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

checkDB();
