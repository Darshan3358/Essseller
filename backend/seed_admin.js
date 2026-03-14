const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seller = require('./models/Seller');

dotenv.config();

const ADMIN_EMAIL = 'admin@essmartseller.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'Super Admin';
const ADMIN_SHOP = 'ESSmartseller HQ';

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const existing = await Seller.findOne({ email: ADMIN_EMAIL });

        if (existing) {
            console.log('Admin found. Updating to ensure admin role and password...');
            existing.password = ADMIN_PASSWORD;
            existing.role = 'admin';
            existing.name = ADMIN_NAME;
            existing.shop_name = ADMIN_SHOP;
            existing.verified = 1;
            existing.freeze = 0;
            await existing.save();
            console.log('Admin updated successfully!\n');
        } else {
            // Find max id to avoid duplicates
            const last = await Seller.findOne().sort({ id: -1 });
            const newId = last && last.id ? last.id + 1 : 9999;

            await Seller.create({
                id: newId,
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                shop_name: ADMIN_SHOP,
                role: 'admin',
                verified: 1,
                freeze: 0
            });
            console.log('Admin created successfully!\n');
        }

        console.log('==============================');
        console.log('  ADMIN LOGIN CREDENTIALS     ');
        console.log('==============================');
        console.log(`  Email   : ${ADMIN_EMAIL}`);
        console.log(`  Password: ${ADMIN_PASSWORD}`);
        console.log('==============================');
        console.log('\nAdmin Panel URL: http://localhost:3000/admin\n');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err.message);
        process.exit(1);
    }
};

seedAdmin();
