const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const addIndexes = async () => {
  await connectDB();

  try {
    console.log('Adding indexes...');

    // Order Indexes
    const Order = require('./models/Order');
    await Order.collection.createIndex({ seller_id: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ createdAt: 1 });
    await Order.collection.createIndex({ created_at: 1 });
    await Order.collection.createIndex({ seller_id: 1, status: 1, createdAt: 1 });
    console.log('Order indexes added.');

    // SellerProduct Indexes
    const SellerProduct = require('./models/SellerProduct');
    await SellerProduct.collection.createIndex({ seller_id: 1 });
    await SellerProduct.collection.createIndex({ product_id: 1 });
    await SellerProduct.collection.createIndex({ seller_id: 1, product_id: 1 }, { unique: true });
    console.log('SellerProduct indexes added.');

    // Product Indexes
    const Product = require('./models/Product');
    await Product.collection.createIndex({ isDeleted: 1 });
    await Product.collection.createIndex({ isFeatured: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ createdAt: 1 });
    await Product.collection.createIndex({ isDeleted: 1, isFeatured: 1 });
    console.log('Product indexes added.');

    // GuaranteeMoney Indexes
    const GuaranteeMoney = require('./models/GuaranteeMoney');
    await GuaranteeMoney.collection.createIndex({ seller_id: 1 });
    await GuaranteeMoney.collection.createIndex({ status: 1 });
    console.log('GuaranteeMoney indexes added.');

    // Package Indexes
    const Package = require('./models/Package');
    await Package.collection.createIndex({ seller_id: 1 });
    await Package.collection.createIndex({ status: 1 });
    console.log('Package indexes added.');

    console.log('All indexes added successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

addIndexes();
