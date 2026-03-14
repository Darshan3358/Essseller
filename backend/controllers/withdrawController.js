const Withdraw = require('../models/Withdraw');
const Seller = require('../models/Seller');
const asyncHandler = require('express-async-handler');
const { getAvailableBalance } = require('../utils/wallet');

// @desc    Get all withdrawal requests (seller sees their own)
// @route   GET /api/withdrawals
// @access  Private
const getWithdrawals = asyncHandler(async (req, res) => {
    try {
        const sellerId = req.user._id;
        const withdrawals = await Withdraw.find({ seller_id: sellerId }).sort({ createdAt: -1 });
        res.json({ success: true, count: withdrawals.length, withdrawals });
    } catch (error) {
        res.status(500);
        throw new Error('Server Error: ' + error.message);
    }
});

// @desc    Create a withdrawal request -> goes to admin as PENDING
// @route   POST /api/withdrawals
// @access  Private
const createWithdrawal = asyncHandler(async (req, res) => {
    const { amount, trans_password, method, bank_details, notes } = req.body;
    const sellerId = req.user._id;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        res.status(400);
        throw new Error('Please enter a valid withdrawal amount');
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // 1. Verify Transaction Password
    if (!seller.trans_password) {
        res.status(400);
        throw new Error('Please set a transaction password in your settings before withdrawing');
    }

    const isValidPassword = await seller.matchTransPassword(trans_password);
    if (!isValidPassword) {
        res.status(400);
        throw new Error('Invalid transaction password');
    }

    // 2. Check minimum withdrawal amount
    const MIN_WITHDRAWAL = 100;
    if (Number(amount) < MIN_WITHDRAWAL) {
        res.status(400);
        throw new Error(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`);
    }

    // 3. Check for already pending withdrawal
    const pendingExists = await Withdraw.findOne({ seller_id: sellerId, status: 0 });
    if (pendingExists) {
        res.status(400);
        throw new Error('You already have a pending withdrawal request. Please wait for admin to process it.');
    }

    // 4. Check Available Balance
    const availableBalance = await getAvailableBalance(seller._id);
    if (Number(amount) > availableBalance) {
        res.status(400);
        throw new Error(`Insufficient balance. Available: ₹${availableBalance.toFixed(2)}`);
    }

    // 5. Determine op_type: 1=Bank, 2=USDT
    const op_type = method === 'usdt' ? 2 : 1;

    // 6. Use saved bank details from seller profile if not provided
    const bankDetails = bank_details || seller.bank_details || {};

    // 7. Create Withdrawal Record (status=0 means PENDING - needs admin approval)
    const withdrawal = await Withdraw.create({
        seller_id: seller._id,
        amount: Number(amount),
        op_type,
        status: 0, // PENDING - goes to admin for approval
        message: `Withdrawal request of ₹${amount} submitted. Awaiting admin approval.`,
        bank_details: {
            bank_name: bankDetails.bank_name || '',
            account_number: bankDetails.account_number || '',
            account_name: bankDetails.account_name || seller.name || '',
            ifsc_code: bankDetails.ifsc_code || '',
            upi_id: bankDetails.upi_id || '',
        },
        notes: notes || '',
    });

    if (withdrawal) {
        res.status(201).json({
            success: true,
            message: '✅ Withdrawal request submitted successfully! Admin will review and process it within 24-48 hours.',
            withdrawal
        });
    } else {
        res.status(400);
        throw new Error('Failed to create withdrawal request');
    }
});

// @desc    Get wallet details (balance, history)
// @route   GET /api/withdrawals/wallet-details/info
// @access  Private
const getWalletDetails = asyncHandler(async (req, res) => {
    const sellerId = req.user._id;
    const seller = await Seller.findById(sellerId);

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // 1. Recharge Money (Status: 1 = approved)
    const rechargeResult = await require('../models/Recharge').aggregate([
        { $match: { seller_id: seller._id, status: 1 } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
    ]);
    const rechargeMoney = rechargeResult.length > 0 ? rechargeResult[0].total : 0;

    // 2. Package Money (Pending + Approved)
    const packageResult = await require('../models/Package').aggregate([
        { $match: { seller_id: seller._id, status: { $in: [0, 1] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const packageMoney = packageResult.length > 0 ? packageResult[0].total : 0;

    // 3. Storehouse Total Payment (Expense)
    const storehouseExpenseResult = await require('../models/StorehousePayment').aggregate([
        { $match: { seller_id: seller._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const storehouseTotalPayment = storehouseExpenseResult.length > 0 ? storehouseExpenseResult[0].total : 0;

    // 4. Storehouse Wallet Payment (Income - Delivered Orders)
    const storehouseIncomeResult = await require('../models/StorehousePayment').aggregate([
        { $match: { seller_id: seller._id } },
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

    // 5. Withdraw Wallet Money (Pending=0 + Approved=1, NOT Rejected=2)
    const withdrawResult = await Withdraw.aggregate([
        { $match: { seller_id: seller._id, status: { $in: [0, 1] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const withdrawWalletMoney = withdrawResult.length > 0 ? withdrawResult[0].total : 0;

    // --- Calculate Wallet Balance ---
    const totalIncome = rechargeMoney + storehouseWalletPayment;
    const totalExpenses = storehouseTotalPayment + packageMoney + withdrawWalletMoney;
    const walletBalance = Math.max(0, totalIncome - totalExpenses);

    // UI Stats
    const pendingWithdrawResult = await Withdraw.aggregate([
        { $match: { seller_id: seller._id, status: 0 } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingWithdraw = pendingWithdrawResult.length > 0 ? pendingWithdrawResult[0].total : 0;

    const lastWithdrawDoc = await Withdraw.findOne({ seller_id: seller._id, status: 1 }).sort({ createdAt: -1 });
    const lastWithdraw = lastWithdrawDoc ? lastWithdrawDoc.amount : 0;

    // Fetch recent withdrawal history
    const withdrawalList = await Withdraw.find({ seller_id: seller._id }).sort({ createdAt: -1 }).limit(20);
    const rechargeList = await require('../models/Recharge').find({ seller_id: seller._id }).sort({ created_at: -1, createdAt: -1 }).limit(10);

    // Today's Stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysOrdersCount = await require('../models/Order').countDocuments({
        seller_id: seller._id,
        createdAt: { $gte: startOfDay }
    });

    res.json({
        success: true,
        data: {
            balance: walletBalance,
            rechargeMoney,
            packageMoney,
            storehouseTotalPayment,
            storehouseWalletPayment,
            withdrawWalletMoney,
            pendingWithdraw,
            lastWithdraw,
            todaysOrdersCount,
            bank_details: seller.bank_details || {},
            transactions: {
                withdrawals: withdrawalList,
                recharge: rechargeList,
            }
        }
    });
});

// @desc    Update withdrawal status (seller can cancel pending)
// @route   PUT /api/withdrawals/:id
// @access  Private
const updateWithdrawalStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const withdrawal = await Withdraw.findById(req.params.id);

    if (!withdrawal) {
        res.status(404);
        throw new Error('Withdrawal request not found');
    }

    // Only the owner can cancel their own pending request
    if (withdrawal.seller_id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this withdrawal');
    }

    // Seller can only cancel pending requests (status 0 -> 2 = cancelled)
    if (withdrawal.status !== 0) {
        res.status(400);
        throw new Error('Only pending withdrawal requests can be cancelled');
    }

    withdrawal.status = 2; // Mark as cancelled/rejected
    withdrawal.reason = reason || 'Cancelled by seller';
    const updatedWithdrawal = await withdrawal.save();

    res.json({ success: true, withdrawal: updatedWithdrawal });
});

module.exports = {
    getWithdrawals,
    createWithdrawal,
    updateWithdrawalStatus,
    getWalletDetails
};
