const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    mode: {
        type: String, // e.g., 'upi', 'bank'
        required: true,
    },
    utr_number: {
        type: String,
        required: false,
    },
    receipt: {
        type: String, // Image path
        required: false,
    },
    status: {
        type: Number, // 0 = pending, 1 = success, etc.
        default: 0,
    },
    remark: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
