const asyncHandler = require('express-async-handler');
const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private/Admin
const getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    res.json({
        success: true,
        count: suppliers.length,
        data: suppliers
    });
});

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = asyncHandler(async (req, res) => {
    const { name, rating, location, contact, email, deliveryTimeEstimate, commissionRate, status } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Supplier name is required');
    }

    const supplier = await Supplier.create({
        name,
        rating: rating || 0,
        location: location || 'Global',
        contact: contact || '',
        email: email || '',
        deliveryTimeEstimate: deliveryTimeEstimate || '3-10 days',
        commissionRate: commissionRate || 0.05,
        status: status || 'active'
    });

    res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier
    });
});

module.exports = {
    getSuppliers,
    createSupplier
};
