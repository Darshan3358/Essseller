const mongoose = require('mongoose');

const withdrawSchema = mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    op_type: {
        type: Number, // 1 = Bank Transfer, 2 = USDT
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    status: {
        type: Number, // 0 = pending, 1 = approved, 2 = rejected
        default: 0,
    },
    reason: {
        type: String,
        required: false,
    },
    bank_details: {
        bank_name: { type: String, default: '' },
        account_number: { type: String, default: '' },
        account_name: { type: String, default: '' },
        ifsc_code: { type: String, default: '' },
        upi_id: { type: String, default: '' },
    },
    notes: {
        type: String,
        default: '',
    }
}, {
    timestamps: true,
});

const Withdraw = mongoose.model('Withdraw', withdrawSchema);

module.exports = Withdraw;
