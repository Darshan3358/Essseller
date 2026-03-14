const GuaranteeMoney = require('../models/GuaranteeMoney');
const Seller = require('../models/Seller');
const asyncHandler = require('express-async-handler');

// @desc    Get all guarantee money records
// @route   GET /api/guarantee
// @access  Private/Admin
const getGuaranteeMoney = asyncHandler(async (req, res) => {
    try {
        console.log('--- Fetching Guarantee Money Data ---');
        const guarantees = await GuaranteeMoney.find({})
            .populate('seller', 'name shop_name')
            .sort({ created_at: -1 });

        console.log(`--- Found ${guarantees.length} records ---`);
        if (guarantees.length > 0) {
            console.log('Sample Record:', JSON.stringify(guarantees[0], null, 2));
        }

        res.json({
            success: true,
            count: guarantees.length,
            guarantees
        });
    } catch (error) {
        console.error('ERROR in getGuaranteeMoney:', error);
        res.status(500);
        throw new Error('Server Error: ' + error.message);
    }
});

// @desc    Update guarantee money status
// @route   PUT /api/guarantee/:id/status
// @access  Private/Admin
const updateGuaranteeStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;

    const guarantee = await GuaranteeMoney.findById(req.params.id);

    if (guarantee) {
        guarantee.status = status;
        if (reason !== undefined) guarantee.reason = reason;

        const updatedGuarantee = await guarantee.save();
        res.json({
            success: true,
            guarantee: updatedGuarantee
        });
    } else {
        res.status(404);
        throw new Error('Record not found');
    }
});

module.exports = {
    getGuaranteeMoney,
    updateGuaranteeStatus
};
