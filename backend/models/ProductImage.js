const mongoose = require('mongoose');

const productImageSchema = mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
    },
    filename: {
        type: String,
        required: true,
        unique: true
    },
    imageData: {
        type: String, // Base64
        required: true,
    },
    contentType: {
        type: String,
        required: true,
        default: 'image/jpeg'
    }
}, {
    timestamps: true,
});

const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;
