const asyncHandler = require('express-async-handler');
const RegCode = require('../models/RegCode');
const SiteSetting = require('../models/SiteSetting');

// @desc    List all invite codes (with used/unused status)
// @route   GET /api/settings/invite-codes
// @access  Private/Admin
const listInviteCodes = asyncHandler(async (req, res) => {
    const codes = await RegCode.find({}).sort({ createdAt: -1 });
    res.json({ success: true, codes });
});

// @desc    Get current (first unused) invite code — kept for legacy frontend
// @route   GET /api/settings/invite-code
// @access  Public
const getInvitationCode = asyncHandler(async (req, res) => {
    // Return the first unused code (or any code for display)
    let regCode = await RegCode.findOne({ isUsed: false }).sort({ createdAt: 1 });
    if (!regCode) regCode = await RegCode.findOne().sort({ createdAt: -1 });
    if (!regCode) {
        regCode = await RegCode.create({ code: 'LKC1523' });
    }
    res.json({ success: true, code: regCode.code, updatedAt: regCode.updatedAt, isUsed: regCode.isUsed });
});

// @desc    Create a new invitation code
// @route   POST /api/settings/invite-codes
// @access  Private/Admin
const createInviteCode = asyncHandler(async (req, res) => {
    let { code, label } = req.body;
    if (!code || !code.trim()) {
        // Auto-generate
        const prefixes = ['LKC', 'ESS', 'REF', 'ACT', 'VIP'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        code = prefix + Math.floor(1000 + Math.random() * 9000);
    }
    code = code.trim().toUpperCase();

    // Check duplicate
    const existing = await RegCode.findOne({ code });
    if (existing) {
        res.status(400);
        throw new Error('A code with that value already exists');
    }

    const newCode = await RegCode.create({ code, label: label || '' });
    res.status(201).json({ success: true, message: 'Code created', data: newCode });
});

// @desc    Update/set a single invite code (legacy — updates or creates the first record)
// @route   PUT /api/settings/invite-code
// @access  Private/Admin
const updateInvitationCode = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) { res.status(400); throw new Error('Code is required'); }
    const upperCode = code.trim().toUpperCase();

    // Upsert: update existing unused code or create new
    let regCode = await RegCode.findOne({ isUsed: false }).sort({ createdAt: 1 });
    if (regCode) {
        regCode.code = upperCode;
        await regCode.save();
    } else {
        regCode = await RegCode.create({ code: upperCode });
    }
    res.json({ success: true, code: regCode.code, message: 'Invitation code updated successfully' });
});

// @desc    Delete a specific invite code
// @route   DELETE /api/settings/invite-codes/:id
// @access  Private/Admin
const deleteInviteCode = asyncHandler(async (req, res) => {
    const code = await RegCode.findById(req.params.id);
    if (!code) { res.status(404); throw new Error('Code not found'); }
    await code.deleteOne();
    res.json({ success: true, message: 'Code deleted' });
});

// Internal function to rotate code (kept for server init compat)
const rotateCode = async () => {
    const newCode = 'LKC' + Math.floor(1000 + Math.random() * 9000);
    // Only add if no unused codes exist already
    const unusedCount = await RegCode.countDocuments({ isUsed: false });
    if (unusedCount === 0) {
        await RegCode.create({ code: newCode });
        console.log(`[System] New Invitation Code Created: ${newCode}`);
    }
    return newCode;
};


// @desc    Get admin crypto payment details (public - for sellers to see where to send)
// @route   GET /api/settings/crypto
// @access  Public
const getCryptoSettings = asyncHandler(async (req, res) => {
    const setting = await SiteSetting.findOne({ key: 'crypto_payment' });
    res.json({
        success: true,
        crypto: setting ? setting.value : {
            usdt_trc20: '',
            usdt_erc20: '',
            btc: '',
            bnb: '',
            network_note: 'Please verify the network before sending',
            min_deposit: 10,
        }
    });
});

// @desc    Update admin crypto payment details
// @route   PUT /api/settings/crypto
// @access  Private/Admin
const updateCryptoSettings = asyncHandler(async (req, res) => {
    const { usdt_trc20, usdt_erc20, btc, bnb, network_note, min_deposit } = req.body;

    const value = { usdt_trc20, usdt_erc20, btc, bnb, network_note, min_deposit };

    await SiteSetting.findOneAndUpdate(
        { key: 'crypto_payment' },
        { key: 'crypto_payment', value },
        { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Crypto payment settings updated', crypto: value });
});

// @desc    Get admin bank payment details (public - for sellers to see where to send)
// @route   GET /api/settings/bank
// @access  Public
const getBankSettings = asyncHandler(async (req, res) => {
    const setting = await SiteSetting.findOne({ key: 'bank_payment' });
    res.json({
        success: true,
        bank: setting ? setting.value : {
            bank_name: '',
            account_name: '',
            account_number: '',
            ifsc_code: '',
            branch: '',
            swift_code: '',
            note: 'Please include your registered email as payment reference',
        }
    });
});

// @desc    Update admin bank payment details
// @route   PUT /api/settings/bank
// @access  Private/Admin
const updateBankSettings = asyncHandler(async (req, res) => {
    const { bank_name, account_name, account_number, ifsc_code, branch, swift_code, note } = req.body;
    const value = { bank_name, account_name, account_number, ifsc_code, branch, swift_code, note };
    await SiteSetting.findOneAndUpdate(
        { key: 'bank_payment' },
        { key: 'bank_payment', value },
        { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Bank settings updated', bank: value });
});

// @desc    Get security settings
// @route   GET /api/settings/security
// @access  Public
const getSecuritySettings = asyncHandler(async (req, res) => {
    const setting = await SiteSetting.findOne({ key: 'security_settings' });
    res.json({
        success: true,
        security: setting ? setting.value : {
            mask_sign: '*',
        }
    });
});

// @desc    Update security settings
// @route   PUT /api/settings/security
// @access  Private/Admin
const updateSecuritySettings = asyncHandler(async (req, res) => {
    const { mask_sign } = req.body;
    const value = { mask_sign: mask_sign || '*' };
    await SiteSetting.findOneAndUpdate(
        { key: 'security_settings' },
        { key: 'security_settings', value },
        { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Security settings updated', security: value });
});

// @desc    Get carousel settings
// @route   GET /api/settings/carousel
// @access  Public
const getCarouselSettings = asyncHandler(async (req, res) => {
    const setting = await SiteSetting.findOne({ key: 'carousel_settings' });
    res.json({
        success: true,
        carousel: setting ? setting.value : {
            slidesPerView: 4,
        }
    });
});

// @desc    Update carousel settings
// @route   PUT /api/settings/carousel
// @access  Private/Admin
const updateCarouselSettings = asyncHandler(async (req, res) => {
    const { slidesPerView } = req.body;
    const value = { slidesPerView: Number(slidesPerView) || 4 };
    await SiteSetting.findOneAndUpdate(
        { key: 'carousel_settings' },
        { key: 'carousel_settings', value },
        { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Carousel settings updated', carousel: value });
});

// @desc    Get dashboard plan display settings
// @route   GET /api/settings/plan-display
// @access  Public
const getPlanDisplaySettings = asyncHandler(async (req, res) => {
    const setting = await SiteSetting.findOne({ key: 'plan_display' });
    res.json({
        success: true,
        data: setting ? setting.value : {
            plan_title: 'Enterprise Pro',
            used_text: '10.5K',
            remaining_text: '5.2K',
            views_text: '15.7K',
            features: [
                { text: '10k Limit', icon: '⚡' },
                { text: '20% Profit', icon: '📈' },
                { text: '24/7 Support', icon: '️' },
                { text: 'API Access', icon: '📡' }
            ]
        }
    });
});

// @desc    Update dashboard plan display settings
// @route   PUT /api/settings/plan-display
// @access  Private/Admin
const updatePlanDisplaySettings = asyncHandler(async (req, res) => {
    const { plan_title, features, used_text, remaining_text, views_text } = req.body;
    const value = { plan_title, features, used_text, remaining_text, views_text };
    await SiteSetting.findOneAndUpdate(
        { key: 'plan_display' },
        { key: 'plan_display', value },
        { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Plan display settings updated', data: value });
});

module.exports = {
    getInvitationCode,
    updateInvitationCode,
    listInviteCodes,
    createInviteCode,
    deleteInviteCode,
    rotateCode,
    getCryptoSettings,
    updateCryptoSettings,
    getBankSettings,
    updateBankSettings,
    getSecuritySettings,
    updateSecuritySettings,
    getCarouselSettings,
    updateCarouselSettings,
    getPlanDisplaySettings,
    updatePlanDisplaySettings
};
