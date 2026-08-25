const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ecom_demo'); // Adjust if needed

const addFeaturedToProduct = async () => {
    try {
        const Product = require('./backend/models/Product');
        // Just update some existing products to be featured so they show up
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
        mongoose.connection.close();
    }
}
addFeaturedToProduct();
