const express = require('express');
const router = express.Router();
const { getGuaranteeMoney, updateGuaranteeStatus } = require('../controllers/guaranteeController');

router.route('/').get(getGuaranteeMoney);
router.route('/:id/status').put(updateGuaranteeStatus);

module.exports = router;
