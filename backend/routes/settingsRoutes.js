const express = require('express');
const router = express.Router();
const {
    getInvitationCode, updateInvitationCode,
    getCryptoSettings, updateCryptoSettings,
    getBankSettings, updateBankSettings,
    getSecuritySettings, updateSecuritySettings,
    getCarouselSettings, updateCarouselSettings
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Invite code
router.get('/invite-code', getInvitationCode);
router.put('/invite-code', updateInvitationCode);

// Crypto wallet settings
router.get('/crypto', getCryptoSettings);               // Public: sellers see admin crypto address
router.put('/crypto', protect, admin, updateCryptoSettings);  // Admin only

// Bank transfer settings
router.get('/bank', getBankSettings);                   // Public: sellers see admin bank details
router.put('/bank', protect, admin, updateBankSettings); // Admin only

// Security settings
router.get('/security', getSecuritySettings);             // Public
router.put('/security', protect, admin, updateSecuritySettings); // Admin only

// Carousel settings
router.get('/carousel', getCarouselSettings);             // Public
router.put('/carousel', protect, admin, updateCarouselSettings); // Admin only

module.exports = router;
