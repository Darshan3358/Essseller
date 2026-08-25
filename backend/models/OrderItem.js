const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        default: 0.0,
    },
}, {
    timestamps: true,
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
