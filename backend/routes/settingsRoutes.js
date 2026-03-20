const express = require('express');
const router = express.Router();
console.log('[Info] settingsRoutes.js loading...');

const {
    getInvitationCode, updateInvitationCode,
    listInviteCodes, createInviteCode, deleteInviteCode,
    getCryptoSettings, updateCryptoSettings,
    getBankSettings, updateBankSettings,
    getSecuritySettings, updateSecuritySettings,
    getCarouselSettings, updateCarouselSettings,
    getPlanDisplaySettings, updatePlanDisplaySettings
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Single-use invite codes (multi-code system)
router.get('/invite-codes', protect, admin, listInviteCodes);          // Admin: list all codes
router.post('/invite-codes', protect, admin, createInviteCode);         // Admin: create a new code
router.delete('/invite-codes/:id', protect, admin, deleteInviteCode);   // Admin: delete a code

// Legacy single-code endpoints (still used by some frontend)
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
