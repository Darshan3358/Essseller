const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Recharge = require('./models/Recharge');
const Withdraw = require('./models/Withdraw');
require('dotenv').config({ path: './.env' });

async function createIndexes() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('Creating Order indexes...');
        await Order.collection.createIndex({ seller_id: 1, status: 1 });
        await Order.collection.createIndex({ seller_id: 1, createdAt: -1 });
        await Order.collection.createIndex({ createdAt: -1 });
        console.log('Order indexes created.');

        console.log('Creating Product indexes...');
        await Product.collection.createIndex({ seller_id: 1, isDeleted: 1 });
        await Product.collection.createIndex({ isFeatured: 1, isDeleted: 1 });
        await Product.collection.createIndex({ inStorehouseCarousel: 1, isDeleted: 1 });
        console.log('Product indexes created.');

        console.log('Creating Recharge & Withdraw indexes...');
        await Recharge.collection.createIndex({ status: 1 });
        await Recharge.collection.createIndex({ createdAt: -1 });
        await Withdraw.collection.createIndex({ status: 1 });
        await Withdraw.collection.createIndex({ createdAt: -1 });
        console.log('Recharge & Withdraw indexes created.');

        console.log('Creating Seller indexes...');
        const Seller = require('./models/Seller');
        await Seller.collection.createIndex({ role: 1 });
        await Seller.collection.createIndex({ createdAt: -1 });
        console.log('Seller indexes created.');

    } catch (err) {
        console.error('Error creating indexes:', err);
    } finally {
        process.exit(0);
    }
}

createIndexes();
