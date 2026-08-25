const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PackagePlan = require('../models/PackagePlan');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to seed packages...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedPackages = async () => {
    await connectDB();

    const PACKAGES = [
        {
            sku: 'silver', name: 'Starter Merchant', price_label: '$50', amount: 50,
            description: 'Perfect for new sellers starting their journey.',
            features: ['5000 Products Limit', 'Basic Analytics', 'Community Support', 'Standard Shipping Rates'],
            color: 'from-blue-500 to-cyan-500', popular: false,
            activeBg: 'bg-blue-500', product_limit: 5000, order_index: 0
        },
        {
            sku: 'platinum', name: 'Professional Seller', price_label: '$150', amount: 150,
            description: 'Scale your business with advanced tools.',
            features: ['10,000 Products Limit', 'Advanced AI Insights', 'Priority 24/7 Support', 'Discounted Shipping', 'Custom Branding'],
            color: 'from-primary-600 to-purple-700', popular: true,
            activeBg: 'bg-primary-600', product_limit: 10000, order_index: 1
        },
        {
            sku: 'diamond', name: 'Enterprise Pro', price_label: '$450', amount: 450,
            description: 'Complete solution for large scale operations.',
            features: ['18,000 Products Limit', 'Multiple Storefronts', 'Dedicated Account Manager', 'API Access', 'Global Logistics Network', 'Whiteglove Onboarding'],
            color: 'from-slate-800 to-slate-900', popular: false,
            activeBg: 'bg-slate-800', product_limit: 18000, order_index: 2
        }
    ];

    try {
        await PackagePlan.deleteMany();
        await PackagePlan.insertMany(PACKAGES);
        console.log('✅ Package plans seeded successfully');
        process.exit();
    } catch (error) {
        console.error(`Error seeding: ${error.message}`);
        process.exit(1);
    }
};

seedPackages();
