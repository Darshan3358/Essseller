const mongoose = require('mongoose');

const rechargeSchema = mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    amount: {
        type: String, // String in DB based on image "54.00000"
        required: true,
    },
    mode: {
        type: String,
        required: true,
    },
    receipt: {
        type: String,
        required: false,
    },
    status: {
        type: Number,
        default: 0,
    },
    reason: {
        type: String,
        default: null,
    },
    payment_method: {
        type: String,
        default: 'crypto', // 'crypto' or 'bank'
    },
    sender_wallet: {
        type: String,
        default: '',
    },
    txn_hash: {
        type: String,
        default: '',
    },
    bank_reference: {
        type: String,
        default: '',
    },
    network: {
        type: String,
        default: '',
    },
    created_at: {
        type: String,
        required: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'recharges'
});

rechargeSchema.virtual('seller', {
    ref: 'Seller',
    localField: 'seller_id',
    foreignField: 'id',
    justOne: true
});

const Recharge = mongoose.model('Recharge', rechargeSchema);

module.exports = Recharge;
