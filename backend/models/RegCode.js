const mongoose = require('mongoose');

const regCodeSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    // Single-use: once a seller registers with this code, mark it used
    isUsed: {
        type: Boolean,
        default: false,
    },
    usedBy: {
        type: String,       // email or name of the seller who used it
        default: null,
    },
    usedAt: {
        type: Date,
        default: null,
    },
    // Optional label/note for the admin to identify the code
    label: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

const RegCode = mongoose.model('RegCode', regCodeSchema);

module.exports = RegCode;
