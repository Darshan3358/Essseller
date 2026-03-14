const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SpreadPackage = require('./models/SpreadPackage');

dotenv.config();

const spreadPackages = [
    {
        id: 1,
        name: 'Starter Spread',
        price: 0,
        duration: 'Month',
        features: ['Social Media Basic', '1,000 Impressions', 'Email Newsletter', '24/7 Support'],
        color: 'from-blue-500 to-indigo-600',
        popular: false
    },
    {
        id: 2,
        name: 'Growth Catalyst',
        price: 249,
        duration: 'Month',
        features: ['Advanced Targeting', '10,000 Impressions', 'Premium Placements', 'Dedicated Manager'],
        color: 'from-primary-600 to-purple-700',
        popular: true
    },
    {
        id: 3,
        name: 'Enterprise Reach',
        price: 599,
        duration: 'Month',
        features: ['Global Network Access', 'Unlimited Impressions', 'Custom Strategy', 'API Integration'],
        color: 'from-orange-500 to-red-600',
        popular: false
    }
];

const seedSpreadPackages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await SpreadPackage.deleteMany();
        await SpreadPackage.insertMany(spreadPackages);

        console.log('Spread Packages Seeded!');
        process.exit();
    } catch (error) {
        console.error('Error seeding spread packages:', error);
        process.exit(1);
    }
};

seedSpreadPackages();
