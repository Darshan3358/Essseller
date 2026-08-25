const mongoose = require('mongoose');
const Seller = require('./models/Seller');
const Order = require('./models/Order');
const Product = require('./models/Product');
require('dotenv').config({ path: './.env' });

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const sellerCount = await Seller.countDocuments({});
        const sellerWithRole = await Seller.countDocuments({ role: 'seller' });
        console.log(`Total Sellers: ${sellerCount}`);
        console.log(`Sellers with role 'seller': ${sellerWithRole}`);

        const sampleSeller = await Seller.findOne();
        console.log('Sample Seller:', sampleSeller ? { role: sampleSeller.role, name: sampleSeller.name } : 'None');

        const productCount = await Product.countDocuments({});
        console.log(`Total Products: ${productCount}`);

        const orderCount = await Order.countDocuments({});
        console.log(`Total Orders: ${orderCount}`);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

test();
