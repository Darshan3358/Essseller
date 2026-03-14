const mongoose = require('mongoose');

const spreadPackageSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, default: 'Month' },
    features: [{ type: String }],
    color: { type: String },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SpreadPackage', spreadPackageSchema);
