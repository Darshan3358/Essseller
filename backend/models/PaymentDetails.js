const mongoose = require('mongoose');

const paymentDetailsSchema = new mongoose.Schema({
    id: { type: Number, required: false }, // Keeping optional for migration
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: false }, // Link to seller
    bank_name: { type: String },
    account_name: { type: String },
    account_number: { type: String }, // Renaming acc_no to account_number for clarity or keeping alias
    acc_no: { type: String }, // Keep for backward compat if needed
    routing_number: { type: String },
    IFSC_code: { type: String },
    usdt_link: { type: String },
    usdt_address: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('PaymentDetails', paymentDetailsSchema);
