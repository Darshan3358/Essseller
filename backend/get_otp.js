const mongoose = require('mongoose');
const Seller = require('./models/Seller');
require('dotenv').config({ path: './.env' });

async function getAdminOTP() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await Seller.findOne({ email: 'karsaglobal01@gmail.com' });
        if (admin) {
            console.log(`Admin OTP is: ${admin.otp || 'Not currently set or expired'}`);
            console.log(`OTP Expires at: ${admin.otpExpires ? new Date(admin.otpExpires).toLocaleString() : 'N/A'}`);
        } else {
            console.log('Admin user not found');
        }
    } catch (err) {
        console.error('Error fetching OTP:', err);
    } finally {
        process.exit(0);
    }
}

getAdminOTP();
