const express = require('express');
const router = express.Router();
const { getSpreadPackages, purchaseSpreadPackage } = require('../controllers/spreadPackageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSpreadPackages);
router.post('/purchase', protect, purchaseSpreadPackage);

module.exports = router;
