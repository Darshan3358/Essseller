const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Seller',
        required: false, // Optional for admin products or if seller deleted
    },
    id: {
        type: String, // Matching the existing data format
        required: false,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    selling_price: {
        type: Number,
        required: true,
        default: 0,
    },
    profit: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },
    gallery: [String],
    status: {
        type: Number, // 0 = inactive, 1 = active (inferred)
        default: 1,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    inStorehouseCarousel: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
