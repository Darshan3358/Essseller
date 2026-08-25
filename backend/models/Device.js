const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    fingerprint: { type: String, unique: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Device', deviceSchema);
