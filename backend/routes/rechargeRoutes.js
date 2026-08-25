const express = require('express');
const router = express.Router();
const { getRecharges, updateRechargeStatus, createRecharge, completeRecharge, getMyRecharges } = require('../controllers/rechargeController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, admin, getRecharges)
    .post(protect, createRecharge);

router.route('/myrecharges').get(protect, getMyRecharges);
router.route('/:id/status').put(protect, admin, updateRechargeStatus);
router.route('/:id/complete').put(protect, upload.single('screenshot'), completeRecharge);

module.exports = router;
