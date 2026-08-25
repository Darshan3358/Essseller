const mongoose = require('mongoose');
const Order = require('../backend/models/Order');
const Seller = require('../backend/models/Seller');
require('dotenv').config({ path: '../backend/.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const seller = await Seller.findOne({ email: 'darshanthanki77@gmail.com' }); // based on the screenshot, darshanthanki77@gmail.com
    console.log("Seller:", seller._id, seller.id);
    
    const count = await Order.countDocuments();
    console.log("Total orders in DB:", count);
    
    const sellerOrders = await Order.countDocuments({ seller_id: { $in: [seller._id, seller.id, String(seller._id), String(seller.id)] } });
    console.log("Seller orders:", sellerOrders);
    
    const sample = await Order.findOne();
    if (sample) {
       console.log("Sample order:", sample);
    }
    
    process.exit(0);
}
check();
