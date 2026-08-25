const mongoose = require('mongoose');
const Order = require('./models/Order');
const Seller = require('./models/Seller');
require('dotenv').config({ path: './.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const seller = await Seller.findOne({ email: 'darshanthanki77@gmail.com' });
    
    const sellerIdFilter = [
        seller._id,
        seller.id,
        String(seller._id),
        String(seller.id)
    ].filter(v => v !== undefined && v !== null);

    const now = new Date();
    const days = 365;
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    const rawStatsResult = await Order.aggregate([
        {
            $match: {
                seller_id: { $in: sellerIdFilter },
                status: { $regex: 'pending|processing|shipped|completed|delivered', $options: 'i' },
                status: { $nin: ['cancelled', 'Cancelled'] },
                $or: [
                    { createdAt: { $gte: startDate } },
                    { created_at: { $gte: startDate.toISOString().split('T')[0] } }
                ]
            }
        },
        {
            $project: {
                date: { 
                    $ifNull: [
                        "$createdAt", 
                        { 
                            $dateFromString: { 
                                dateString: "$created_at",
                                onError: new Date(0) // Fallback for invalid strings
                            } 
                        } 
                    ] 
                },
                order_total: 1,
                cost_amount: 1
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                sales: { $sum: { $toDouble: { $ifNull: ["$order_total", 0] } } },
                profit: { $sum: { $subtract: [{ $toDouble: { $ifNull: ["$order_total", 0] } }, { $toDouble: { $ifNull: ["$cost_amount", 0] } }] } },
                orders: { $sum: 1 }
            }
        }
    ]);

    const statsMap = {};
    rawStatsResult.forEach(item => { statsMap[item._id] = item; });
    
    const chartData = [];
    const interval = days > 30 ? (days === 180 ? 7 : 30) : 1;
    const loops = Math.ceil(days / interval);

    for (let i = loops - 1; i >= 0; i--) {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        date.setUTCDate(date.getUTCDate() - (i * interval));

        let daySales = 0, dayProfit = 0, dayOrders = 0;
        
        for (let j = 0; j < interval; j++) {
            const d = new Date(date);
            d.setUTCDate(d.getUTCDate() + j);
            const dateStr = d.toISOString().split('T')[0];
            const item = statsMap[dateStr];
            if (item) {
                daySales += item.sales;
                dayProfit += item.profit;
                dayOrders += item.orders;
            }
        }

        let label = '';
        if (days <= 7) {
            label = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        } else if (days <= 30) {
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        } else {
            label = date.toLocaleDateString('en-US', { month: 'short', year: days > 180 ? '2-digit' : undefined, timeZone: 'UTC' });
        }
        
        chartData.push({
            date: label,
            sales: Math.round(daySales),
            profit: Math.max(0, Math.round(dayProfit)),
            orders: dayOrders,
            aov: dayOrders > 0 ? Math.round(daySales / dayOrders) : 0
        });
    }

    console.log("chartData:", chartData);
    process.exit(0);
}
check();
