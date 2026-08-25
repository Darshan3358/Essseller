const express = require('express');
const router = express.Router();
const { getPackages, getPackagePlans, purchasePackage } = require('../controllers/packageController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPackages);
router.route('/plans').get(getPackagePlans);
router.route('/purchase').post(protect, purchasePackage);

module.exports = router;
