const mongoose = require('mongoose');

const regCodeSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

const RegCode = mongoose.model('RegCode', regCodeSchema);

module.exports = RegCode;
