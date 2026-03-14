const mongoose = require('mongoose');

const guaranteeMoneySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    receipt: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 0,
        comment: '0 = pending; 1 = approved'
    },
    reason: {
        type: String,
        default: null
    },
    created_at: {
        type: String,
        required: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'guaranteemoneys'
});

guaranteeMoneySchema.virtual('seller', {
    ref: 'Seller',
    localField: 'seller_id',
    foreignField: 'id',
    justOne: true
});

module.exports = mongoose.model('GuaranteeMoney', guaranteeMoneySchema);
