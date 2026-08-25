const mongoose = require('mongoose');

const addFeaturedToProduct = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ecom_demo');
        const Product = require('./backend/models/Product');

        await Product.updateMany({}, { $set: { isFeatured: false } });
        const products = await Product.find().limit(5);
        for (const p of products) {
            p.isFeatured = true;
            await p.save();
        }
        console.log("Updated products for slider.");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}
addFeaturedToProduct();
