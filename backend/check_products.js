const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const products = await Product.find({});
        console.log(`Found ${products.length} products`);
        products.forEach(p => {
            console.log(`Product: ${p.name}, Image: ${p.image}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProducts();
