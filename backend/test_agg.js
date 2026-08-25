const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config({ path: './.env' });

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const totalOrders = await Order.countDocuments({});
        console.log(`Total Orders: ${totalOrders}`);

        const sample = await Order.findOne({ order_total: { $gt: 0 } }).lean();
        if (sample) {
            console.log('Sample Order Keys:', Object.keys(sample));
            console.log('Sample Order:', {
                id: sample.order_code,
                total: sample.order_total,
                seller_id: sample.seller_id,
                seller_id_type: typeof sample.seller_id,
                createdAt: sample.createdAt,
                created_at: sample.created_at
            });
        } else {
            console.log('No orders with total > 0 found!');
        }

        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - 365);

        const agg = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: { $nin: ['cancelled', 'Cancelled'] } } },
            {
                $group: {
                    _id: null,
                    sales: { $sum: "$order_total" },
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('Aggregation result (1 year):', agg);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

test();
