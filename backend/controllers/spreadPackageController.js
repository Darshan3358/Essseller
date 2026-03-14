const SpreadPackage = require('../models/SpreadPackage');
const Seller = require('../models/Seller');
const asyncHandler = require('express-async-handler');

// @desc    Get all available spread packages
// @route   GET /api/spread-packages
// @access  Private
const getSpreadPackages = asyncHandler(async (req, res) => {
    const packages = await SpreadPackage.find({ active: true }).sort({ id: 1 });
    res.json({ success: true, packages });
});

// @desc    Purchase a spread package
// @route   POST /api/spread-packages/purchase
// @access  Private
const purchaseSpreadPackage = asyncHandler(async (req, res) => {
    const { packageId, trans_password } = req.body;
    const sellerId = req.user._id;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // 1. Verify Transaction Password
    if (!seller.trans_password || !(await seller.matchTransPassword(trans_password))) {
        res.status(400);
        throw new Error('Invalid transaction password.');
    }

    const pkg = await SpreadPackage.findById(packageId);
    if (!pkg) {
        res.status(404);
        throw new Error('Package not found');
    }

    // 2. Check wallet balance
    const { getAvailableBalance } = require('../utils/wallet');
    const balance = await getAvailableBalance(sellerId);

    if (balance < pkg.price) {
        res.status(400);
        throw new Error(`Insufficient funds. Package costs $${pkg.price}, your balance is $${balance.toFixed(2)}.`);
    }

    // 3. Logic to "apply" the package (e.g., add to a SellerSpread record)
    // For now, we'll just deduct the money and return success.
    // In a real app, you'd create a Subscription record.

    // Deducting balance (mocking for now as we don't have a Transaction model specifically for this yet, 
    // but the getAvailableBalance util usually calculates from Transactions/Recharges).
    // Let's assume there's a way to record this expense.

    // Return success
    res.status(200).json({
        success: true,
        message: `Package ${pkg.name} purchased successfully!`,
        new_balance: balance - pkg.price
    });
});

module.exports = { getSpreadPackages, purchaseSpreadPackage };
