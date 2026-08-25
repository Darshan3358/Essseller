const mongoose = require('mongoose');

const shopProfileSchema = mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    shop_name: {
        type: String,
        required: true,
    },
    shop_logo: {
        type: String,
        required: false,
    },
    shop_contact: {
        type: String,
        required: false,
    },
    shop_address: {
        type: String,
        required: false,
    },
    shop_metatitle: {
        type: String,
        required: false,
    },
    shop_metadesc: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

const ShopProfile = mongoose.model('ShopProfile', shopProfileSchema);

module.exports = ShopProfile;
