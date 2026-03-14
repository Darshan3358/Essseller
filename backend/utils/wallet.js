const mongoose = require('mongoose');
const Withdraw = require('../models/Withdraw');
const Recharge = require('../models/Recharge');
const Package = require('../models/Package');
const StorehousePayment = require('../models/StorehousePayment');

const getAvailableBalance = async (sellerIdRaw) => {
    try {
        const sellerId = typeof sellerIdRaw === 'string'
            ? new mongoose.Types.ObjectId(sellerIdRaw)
            : sellerIdRaw;

        // 1. Recharge Money (Status: 1)
        const rechargeResult = await Recharge.aggregate([
            { $match: { seller_id: sellerId, status: 1 } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]);
        const rechargeMoney = rechargeResult.length > 0 ? rechargeResult[0].total : 0;

        // 2. Package Money (Active only: status 1) — packages are auto-activated, no pending state
        const packageResult = await Package.aggregate([
            { $match: { seller_id: sellerId, status: 1 } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const packageMoney = packageResult.length > 0 ? packageResult[0].total : 0;

        // 3. Storehouse Total Payment (Expense - All payments made)
        const storehouseExpenseResult = await StorehousePayment.aggregate([
            { $match: { seller_id: sellerId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const storehouseTotalPayment = storehouseExpenseResult.length > 0 ? storehouseExpenseResult[0].total : 0;

        // 4. Storehouse Wallet Payment (Income - Delivered Orders linked to StorehousePayment)
        const storehouseIncomeResult = await StorehousePayment.aggregate([
            { $match: { seller_id: sellerId } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_code',
                    foreignField: 'order_code',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $match: { 'order.status': 'delivered' } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$order.order_total' } } } }
        ]);
        const storehouseWalletPayment = storehouseIncomeResult.length > 0 ? storehouseIncomeResult[0].total : 0;

        // 5. Withdraw Wallet Money (Status: 0 or 1)
        const withdrawResult = await Withdraw.aggregate([
            { $match: { seller_id: sellerId, status: { $in: [0, 1] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const withdrawWalletMoney = withdrawResult.length > 0 ? withdrawResult[0].total : 0;

        // Income
        const totalIncome = rechargeMoney + storehouseWalletPayment;

        // Expenses
        const totalExpenses = storehouseTotalPayment + packageMoney + withdrawWalletMoney;

        return totalIncome - totalExpenses;
    } catch (error) {
        console.error("Error calculating available balance:", error);
        return 0;
    }
};

module.exports = {
    getAvailableBalance
};
