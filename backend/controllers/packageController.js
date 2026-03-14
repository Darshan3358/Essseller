const Package = require('../models/Package');
const PackagePlan = require('../models/PackagePlan');
const Seller = require('../models/Seller');
const asyncHandler = require('express-async-handler');

// @desc    Get seller's packages
// @route   GET /api/packages
// @access  Private
const getPackages = asyncHandler(async (req, res) => {
    const packages = await Package.find({ seller_id: req.user._id }).sort({ created_at: -1 });
    res.json({ success: true, packages });
});

// @desc    Get all available package plans
// @route   GET /api/packages/plans
// @access  Public
const getPackagePlans = asyncHandler(async (req, res) => {
    const plans = await PackagePlan.find({}).sort({ order_index: 1 });
    res.json({ success: true, data: plans });
});

// @desc    Purchase & instantly activate a package (each type can only be bought ONCE)
// @route   POST /api/packages/purchase
// @access  Private
const purchasePackage = asyncHandler(async (req, res) => {
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

    // 2. Package Mapping - Fetch from Plan Model
    const pkgPlan = await PackagePlan.findOne({ sku: packageId });
    if (!pkgPlan) {
        res.status(404);
        throw new Error('Invalid package selected');
    }
    const pkg = { name: pkgPlan.name, amount: pkgPlan.amount, limit: pkgPlan.product_limit };

    // 3. Block if seller has already purchased THIS SPECIFIC package (any status)
    //    Each package type can only be bought ONE TIME per seller — ever.
    const alreadyPurchased = await Package.findOne({
        seller_id: sellerId,
        type: pkg.name   // match by package name/type
    });
    if (alreadyPurchased) {
        res.status(400);
        throw new Error(`You have already purchased the ${pkg.name} package. Each package can only be bought once.`);
    }

    // 4. Check wallet balance
    const { getAvailableBalance } = require('../utils/wallet');
    const balance = await getAvailableBalance(sellerId);

    if (balance < pkg.amount) {
        res.status(400);
        throw new Error(`Insufficient funds. Package costs $${pkg.amount}, your balance is $${balance.toFixed(2)}.`);
    }

    // 5. Create package as INSTANTLY ACTIVE (status: 1) — no admin approval needed
    const lastRec = await Package.findOne().sort({ id: -1 });
    const newId = lastRec && lastRec.id ? lastRec.id + 1 : 1;

    const newPackage = await Package.create({
        id: newId,
        seller_id: sellerId,
        type: pkg.name,
        amount: pkg.amount,
        profit: '0',
        product_limit: pkg.limit,
        status: 1  // ✅ Directly ACTIVE — instant, no admin approval
    });

    const newBalance = balance - pkg.amount;

    res.status(200).json({
        success: true,
        message: `🎉 ${pkg.name} activated! You can now list up to ${pkg.limit === 1000000 ? 'unlimited' : pkg.limit} products.`,
        package: newPackage,
        wallet_balance: newBalance
    });
});

module.exports = { getPackages, getPackagePlans, purchasePackage };
