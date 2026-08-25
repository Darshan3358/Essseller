const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Seller = require('../backend/models/Seller');
require('dotenv').config({ path: '../backend/.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const seller = await Seller.findOne({ email: 'darshanthanki77@gmail.com' });
    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    const res = await fetch('http://localhost:5001/api/sellers/stats?days=365', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Response success:", data.success);
    if (data.stats && data.stats.chartData) {
        console.log("chartData length:", data.stats.chartData.length);
        console.log("first 2 chartData:", data.stats.chartData.slice(0, 2));
    }
    process.exit(0);
}
check();
