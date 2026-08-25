const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        default: 'Global',
    },
    contact: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    deliveryTimeEstimate: {
        type: String,
        default: '3-10 days',
    },
    commissionRate: {
        type: Number,
        default: 0.05, // 5%
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    rating: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
