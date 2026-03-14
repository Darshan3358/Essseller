const express = require('express');
const router = express.Router();
const { getWithdrawals, createWithdrawal, updateWithdrawalStatus, getWalletDetails } = require('../controllers/withdrawController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWithdrawals).post(protect, createWithdrawal);
router.route('/wallet-details/info').get(protect, getWalletDetails);
router.route('/:id').put(protect, updateWithdrawalStatus);

module.exports = router;
