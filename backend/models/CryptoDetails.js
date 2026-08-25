const mongoose = require('mongoose');

const cryptoDetailsSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    c_if: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('CryptoDetails', cryptoDetailsSchema);
