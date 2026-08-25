const Recharge = require('../models/Recharge');
const Seller = require('../models/Seller');
const asyncHandler = require('express-async-handler');

// @desc    Get all recharge requests
// @route   GET /api/recharges
// @access  Private/Admin
const getRecharges = asyncHandler(async (req, res) => {
    try {
        const recharges = await Recharge.find({})
            .populate('seller', 'name shop_name')
            .sort({ created_at: -1 });

        res.json({ success: true, count: recharges.length, recharges });
    } catch (error) {
        res.status(500);
        throw new Error('Server Error: ' + error.message);
    }
});

// @desc    Update recharge status (Approve/Reject)
// @route   PUT /api/recharges/:id/status
// @access  Private/Admin
const updateRechargeStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const recharge = await Recharge.findById(req.params.id);
    if (recharge) {
        recharge.status = Number(status);
        if (reason) recharge.reason = reason;
        const updatedRecharge = await recharge.save();
        res.json({ success: true, recharge: updatedRecharge });
    } else {
        res.status(404);
        throw new Error('Recharge request not found');
    }
});

// @desc    Create a recharge request (initialise — no proof yet)
// @route   POST /api/recharges
// @access  Private
const createRecharge = asyncHandler(async (req, res) => {
    const { amount, mode, payment_method } = req.body;

    if (!amount) {
        res.status(400);
        throw new Error('Please provide an amount');
    }

    const lastRec = await Recharge.findOne().sort({ id: -1 });
    const newId = lastRec && lastRec.id ? lastRec.id + 1 : 1;

    const recharge = await Recharge.create({
        id: newId,
        seller_id: req.user._id,
        amount: String(amount),
        mode: mode || 'online',
        payment_method: payment_method || 'crypto',
        status: 0,
        created_at: new Date().toISOString()
    });

    res.status(201).json({ success: true, recharge });
});

// @desc    Seller confirms payment sent (saves proof + verifies trans_password)
// @route   PUT /api/recharges/:id/complete
// @access  Private
const completeRecharge = asyncHandler(async (req, res) => {
    const {
        trans_password,
        sender_wallet,
        txn_hash,
        bank_reference,
        network,
        payment_method
    } = req.body;

    const recharge = await Recharge.findById(req.params.id);

    if (!recharge) {
        res.status(404);
        throw new Error('Recharge request not found');
    }

    if (recharge.status === 1) {
        res.status(400);
        throw new Error('Recharge already approved');
    }

    // Verify transaction password
    const seller = await Seller.findById(recharge.seller_id);
    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    if (seller.trans_password && trans_password) {
        const valid = await seller.matchTransPassword(trans_password);
        if (!valid) {
            res.status(400);
            throw new Error('Invalid transaction password');
        }
    } else if (!trans_password) {
        res.status(400);
        throw new Error('Transaction password is required');
    }

    // Save proof-of-payment details
    if (sender_wallet) recharge.sender_wallet = sender_wallet;
    if (txn_hash) recharge.txn_hash = txn_hash;
    if (bank_reference) recharge.bank_reference = bank_reference;
    if (network) recharge.network = network;
    if (payment_method) recharge.payment_method = payment_method;

    // Handle Screenshot Upload
    if (req.file) {
        recharge.receipt = req.file.path;
    }

    await recharge.save();

    const { getAvailableBalance } = require('../utils/wallet');
    const newBalance = await getAvailableBalance(recharge.seller_id);

    res.json({
        success: true,
        message: 'Payment proof submitted successfully. Admin will verify and credit your wallet within 1-24 hours.',
        wallet_balance: newBalance
    });
});

// @desc    Get logged in user recharge history
// @route   GET /api/recharges/myrecharges
// @access  Private
const getMyRecharges = asyncHandler(async (req, res) => {
    const recharges = await Recharge.find({ seller_id: req.user._id }).sort({ created_at: -1 });
    res.json({ success: true, recharges });
});

module.exports = { getRecharges, updateRechargeStatus, createRecharge, completeRecharge, getMyRecharges };
