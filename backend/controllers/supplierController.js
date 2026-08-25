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

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        supplier.name = req.body.name || supplier.name;
        supplier.rating = req.body.rating ?? supplier.rating;
        supplier.location = req.body.location || supplier.location;
        supplier.contact = req.body.contact || supplier.contact;
        supplier.email = req.body.email || supplier.email;
        supplier.deliveryTimeEstimate = req.body.deliveryTimeEstimate || supplier.deliveryTimeEstimate;
        supplier.commissionRate = req.body.commissionRate ?? supplier.commissionRate;
        supplier.status = req.body.status || supplier.status;

        const updatedSupplier = await supplier.save();
        res.json({
            success: true,
            message: 'Supplier updated successfully',
            data: updatedSupplier
        });
    } else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        await supplier.deleteOne();
        res.json({
            success: true,
            message: 'Supplier removed successfully'
        });
    } else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});

module.exports = {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
