const mongoose = require('mongoose');

const packagePlanSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price_label: { type: String, required: true }, // e.g., "$50"
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    color: { type: String, default: 'from-blue-500 to-cyan-500' },
    popular: { type: Boolean, default: false },
    activeBg: { type: String, default: 'bg-blue-500' },
    product_limit: { type: Number, required: true },
    order_index: { type: Number, default: 0 } // To control display order
}, { timestamps: true });

module.exports = mongoose.model('PackagePlan', packagePlanSchema);
