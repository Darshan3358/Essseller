const mongoose = require('mongoose');

const storehousePaymentSchema = mongoose.Schema({
    order_code: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
}, {
    timestamps: true,
});

const StorehousePayment = mongoose.model('StorehousePayment', storehousePaymentSchema);

module.exports = StorehousePayment;
