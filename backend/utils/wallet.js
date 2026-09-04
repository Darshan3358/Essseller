const mongoose = require('mongoose');
const Withdraw = require('../models/Withdraw');
const Recharge = require('../models/Recharge');
const Package = require('../models/Package');
const StorehousePayment = require('../models/StorehousePayment');

const getAvailableBalance = async (sellerIdRaw) => {
    try {
        const strId = String(sellerIdRaw);
        const objId = mongoose.isValidObjectId(sellerIdRaw) ? new mongoose.Types.ObjectId(strId) : null;
        const sellerIdFilter = objId ? [objId, strId] : [strId];

        // 1. Recharge Money (Status: 1, excluding guarantee recharges)
        const rechargeResult = await Recharge.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter }, status: 1, wallet_type: { $ne: 'guarantee' } } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]);
        const rechargeMoney = rechargeResult.length > 0 ? rechargeResult[0].total : 0;

        // 2. Package Money (Active only: status 1)
        const packageResult = await Package.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter }, status: 1 } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]);
        const packageMoney = packageResult.length > 0 ? packageResult[0].total : 0;

        // 3. Storehouse Total Payment (Expense - All payments made)
        const storehouseExpenseResult = await StorehousePayment.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter } } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]);
        const storehouseTotalPayment = storehouseExpenseResult.length > 0 ? storehouseExpenseResult[0].total : 0;

        // 4. Storehouse Wallet Payment (Income - Delivered Orders linked to StorehousePayment)
        const storehouseIncomeResult = await StorehousePayment.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter } } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_code',
                    foreignField: 'order_code',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $match: { 'order.status': { $regex: 'delivered|completed', $options: 'i' } } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$order.order_total' } } } }
        ]);
        const storehouseWalletPayment = storehouseIncomeResult.length > 0 ? storehouseIncomeResult[0].total : 0;

        // 5. Withdraw Wallet Money (Status: 0 or 1, main wallet withdrawals only)
        const withdrawResult = await Withdraw.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter }, wallet_type: { $ne: 'guarantee' }, status: { $in: [0, 1] } } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
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

const getGuaranteeBalance = async (sellerIdRaw) => {
    try {
        const strId = String(sellerIdRaw);
        const objId = mongoose.isValidObjectId(sellerIdRaw) ? new mongoose.Types.ObjectId(strId) : null;
        const sellerIdFilter = objId ? [objId, strId] : [strId];

        const Seller = require('../models/Seller');
        const seller = await Seller.findById(objId || strId);

        // 1. Approved Guarantee Recharges
        const guaranteeRechargeResult = await Recharge.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter }, status: 1, wallet_type: 'guarantee' } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]);
        const guaranteeRechargeTotal = guaranteeRechargeResult.length > 0 ? guaranteeRechargeResult[0].total : 0;

        // 2. Direct GuaranteeMoney table records
        const GuaranteeMoney = require('../models/GuaranteeMoney');
        const guaranteeMoneyResult = await GuaranteeMoney.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter }, status: 1 } },
            { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ["$amount", 0] } } } } }
        ]);
        const directGuaranteeTotal = guaranteeMoneyResult.length > 0 ? (guaranteeMoneyResult[0].total || 0) : 0;

        // 3. Guarantee Withdrawals (Status: 0 pending, 1 approved)
        const withdrawResult = await Withdraw.aggregate([
            { $match: { seller_id: { $in: sellerIdFilter }, wallet_type: 'guarantee', status: { $in: [0, 1] } } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]);
        const guaranteeWithdrawTotal = withdrawResult.length > 0 ? withdrawResult[0].total : 0;

        const sellerStoredBalance = Number(seller?.guarantee_balance || 0);

        return Math.max(0, Math.max(sellerStoredBalance, guaranteeRechargeTotal, directGuaranteeTotal) - guaranteeWithdrawTotal);
    } catch (error) {
        console.error("Error calculating guarantee balance:", error);
        return 0;
    }
};

module.exports = {
    getAvailableBalance,
    getGuaranteeBalance
};
