const express = require('express');
const router = express.Router();
console.log('[Info] settingsRoutes.js loading...');

const {
    getInvitationCode, updateInvitationCode,
    getCryptoSettings, updateCryptoSettings,
    getBankSettings, updateBankSettings,
    getSecuritySettings, updateSecuritySettings,
    getCarouselSettings, updateCarouselSettings,
    getPlanDisplaySettings, updatePlanDisplaySettings
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Invite code
router.get('/invite-code', getInvitationCode);
router.put('/invite-code', protect, admin, updateInvitationCode);

// Crypto wallet settings
router.get('/crypto', getCryptoSettings);               // Public: sellers see admin crypto address
router.put('/crypto', protect, admin, updateCryptoSettings);  // Admin only

// Bank transfer settings
router.get('/bank', getBankSettings);                   // Public: sellers see admin bank details
router.put('/bank', protect, admin, updateBankSettings); // Admin only

// Security settings
router.get('/security', getSecuritySettings);             // Public
router.put('/security', protect, admin, updateSecuritySettings); // Admin only

router.get('/carousel', (req, res, next) => {
    console.log('[Info] GET /api/settings/carousel hit');
    next();
}, getCarouselSettings);           // Public: for dashboard display

router.put('/carousel', protect, admin, updateCarouselSettings); // Admin only

// Plan display settings
router.get('/plan-display', getPlanDisplaySettings);             // Public
router.put('/plan-display', protect, admin, updatePlanDisplaySettings); // Admin only

module.exports = router;
