const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier } = require('../controllers/supplierController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSuppliers)
    .post(protect, admin, createSupplier);

module.exports = router;
