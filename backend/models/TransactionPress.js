const mongoose = require('mongoose');

const transactionPressSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    payment_method: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'COD'],
        required: true
    },
    transaction_status: {
        type: String,
        enum: ['Success', 'Failed', 'Pending'],
        default: 'Pending'
    },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('TransactionPress', transactionPressSchema);
