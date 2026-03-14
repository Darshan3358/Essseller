const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    type: { type: String, required: true },
    amount: { type: Number },
    profit: { type: String, required: true },
    product_limit: { type: Number, required: true },
    status: { type: Number, default: 0 }, // 0=Pending, 1=Approved, 2=Rejected
    reason: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Package', packageSchema);
