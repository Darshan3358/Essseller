const express = require('express');
const router = express.Router();
const { getSellers, getSellerById, getDashboardStats, updateSeller, createSeller, getShopSettings, updateShopSettings, updateTransactionPassword, updatePassword } = require('../controllers/sellerController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/stats', protect, getDashboardStats);

router.route('/shop-settings')
    .get(protect, getShopSettings)
    .put(protect, upload.fields([{ name: 'shop_logo', maxCount: 1 }]), updateShopSettings);
router.route('/transaction-password').put(protect, updateTransactionPassword);
router.route('/password').put(protect, updatePassword);

router.route('/')
    .get(getSellers)
    .post(upload.fields([
        { name: 'cert_front', maxCount: 1 },
        { name: 'cert_back', maxCount: 1 }
    ]), createSeller);

router.get('/:id', getSellerById);
router.put('/:id', updateSeller); // Add auth middleware if needed later

module.exports = router;
