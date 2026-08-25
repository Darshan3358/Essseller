const CryptoDetails = require('../models/CryptoDetails');
const Device = require('../models/Device');
const GuaranteeMoney = require('../models/GuaranteeMoney');
const Package = require('../models/Package');
const PaymentDetails = require('../models/PaymentDetails');
const SellerProduct = require('../models/SellerProduct');
const TransactionPress = require('../models/TransactionPress');

const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

// Load models
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const ShopProfile = require('../models/ShopProfile');
const Payment = require('../models/Payment');
const Withdraw = require('../models/Withdraw');
const SupportTicket = require('../models/SupportTicket');
const ProductImage = require('../models/ProductImage');
const Supplier = require('../models/Supplier');
const RegCode = require('../models/RegCode');
const Recharge = require('../models/Recharge');
const StorehousePayment = require('../models/StorehousePayment');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        // Clear all data
        await Order.deleteMany();
        await OrderItem.deleteMany();
        await Product.deleteMany();
        await ProductImage.deleteMany();
        await Seller.deleteMany();
        await User.deleteMany();
        await Recharge.deleteMany();
        await Withdraw.deleteMany();
        await Payment.deleteMany();
        await StorehousePayment.deleteMany();
        await ShopProfile.deleteMany();
        await SupportTicket.deleteMany();
        await Supplier.deleteMany();
        await RegCode.deleteMany();

        console.log('Old Data Destroyed...'.red.inverse);

        // Create Sellers
        const createdUsers = await Seller.insertMany([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                shop_name: 'Admin Shop',
                role: 'admin',
                verified: 1
            },
            {
                name: 'John Doe',
                email: 'seller@example.com',
                password: 'password123',
                shop_name: 'Johns Electronics',
                role: 'seller',
                verified: 1
            }
        ]);

        const adminUser = createdUsers[0]._id;
        const sellerUser = createdUsers[1]._id;

        console.log('Sellers Imported...'.green.inverse);

        // Create Shop Profile
        await ShopProfile.create({
            seller_id: sellerUser,
            shop_name: 'Johns Electronics',
            shop_contact: '1234567890',
            shop_address: '123 Tech Street'
        });

        // Create Sub-User
        await User.create({
            seller_id: sellerUser,
            name: 'Staff Member 1',
            phone: '0987654321',
            photo: 'staff.jpg'
        });

        // Create Products
        const sampleProducts = await Product.insertMany([
            {
                seller_id: sellerUser,
                name: 'Airpods Wireless Bluetooth Headphones',
                image: '/images/airpods.jpg',
                description: 'Bluetooth technology...',
                brands: 'Apple',
                category: 'Electronics',
                price: 89.99,
                selling_price: 129.99,
                profit: 40.00,
                status: 1,
            },
            {
                seller_id: sellerUser,
                name: 'iPhone 11 Pro 256GB Memory',
                image: '/images/phone.jpg',
                description: 'Introducing the iPhone 11 Pro...',
                brands: 'Apple',
                category: 'Electronics',
                price: 599.99,
                selling_price: 999.99,
                profit: 400.00,
                status: 1,
            },
        ]);

        const product1 = sampleProducts[0]._id;

        // Create Orders & Order Items
        const order = await Order.create({
            order_code: 'ORD-12345',
            seller_id: sellerUser,
            customer_name: 'Jane Doe',
            customer_address: '456 Client Rd',
            total_amount: 129.99,
            status: 'Pending'
        });

        await OrderItem.create({
            order_id: order._id,
            product_id: product1,
            quantity: 1,
            price: 129.99
        });

        // Create Financial Data
        await Recharge.create({
            seller_id: sellerUser,
            amount: 500,
            mode: 'bank',
            status: 1
        });

        await Withdraw.create({
            seller_id: sellerUser,
            amount: 100,
            op_type: 1,
            status: 0
        });

        await Payment.create({
            seller_id: sellerUser,
            amount: 50,
            mode: 'upi',
            status: 1
        });

        await StorehousePayment.create({
            order_code: 'ORD-12345',
            amount: 20,
            seller_id: sellerUser,
            status: 'Completed'
        });

        // Create Others
        await SupportTicket.create({
            seller_id: sellerUser,
            subject: 'Help needed',
            description: 'I need help with my products'
        });

        await Supplier.create({
            supplier_name: 'Best Supplier Inc',
            rating: 5,
            delivery_timeline: '3-5 days'
        });

        await RegCode.create({
            code: 'REG-USER-001'
        });

        await ProductImage.create({
            product_id: product1,
            image: '/images/extra-view.jpg'
        });

        // Create calls for new models
        await CryptoDetails.create({ id: 1, c_if: 'BTC-001' });
        await Device.create({ id: 1, fingerprint: 'test-fingerprint' });
        await GuaranteeMoney.create({ id: 1, seller_id: sellerUser, amount: 1000, receipt: 'test.jpg' });
        await Package.create({ id: 1, seller_id: sellerUser, type: 'Gold', profit: '10', product_limit: 100 });
        await PaymentDetails.create({ id: 1, bank_name: 'Test Bank', acc_no: '1234567890', IFSC_code: 'TEST0001' });
        await SellerProduct.create({ id: 1, seller_id: sellerUser, product_id: product1 });
        await TransactionPress.create({ id: 1, order_id: order._id, payment_method: 'COD', transaction_status: 'Pending' });

        console.log('All Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await OrderItem.deleteMany();
        await Product.deleteMany();
        await ProductImage.deleteMany();
        await Seller.deleteMany();
        await User.deleteMany();
        await Recharge.deleteMany();
        await Withdraw.deleteMany();
        await Payment.deleteMany();
        await StorehousePayment.deleteMany();
        await ShopProfile.deleteMany();
        await SupportTicket.deleteMany();
        await Supplier.deleteMany();
        await RegCode.deleteMany();
        // DeleteMany calls for new models
        await CryptoDetails.deleteMany();
        await Device.deleteMany();
        await GuaranteeMoney.deleteMany();
        await Package.deleteMany();
        await PaymentDetails.deleteMany();
        await SellerProduct.deleteMany();
        await TransactionPress.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
