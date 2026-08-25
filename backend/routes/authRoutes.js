const express = require('express');
const router = express.Router();
const {
    authUser,
    registerSeller,
    getUserProfile,
    updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.fields([{ name: 'cert_front', maxCount: 1 }, { name: 'cert_back', maxCount: 1 }]), registerSeller);
router.post('/login', authUser);
router.post('/verify-otp', require('../controllers/authController').verifyOtp);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
