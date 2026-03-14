const mongoose = require('mongoose');

const productImageSchema = mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;
