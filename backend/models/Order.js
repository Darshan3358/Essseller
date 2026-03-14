const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    order_code: {
        type: String,
        required: true,
        unique: true,
    },
    seller_id: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Seller',
        required: true,
    },
    customer_name: {
        type: String,
        required: true,
    },
    customer_address: {
        type: String,
        required: true,
    },
    customer_email: {
        type: String,
        required: false,
    },
    customer_phone: {
        type: String,
        required: false,
    },
    payment_method: {
        type: String,
        required: false,
    },
    order_total: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: "0.00",
    },
    cost_amount: {
        type: Number,
        default: 0.0,
    },
    status: {
        type: String, // e.g., 'pending', 'completed', 'cancelled'
        default: 'pending',
    },
    pick_up_status: {
        type: String,
        default: 'Unpicked-Up',
    },
    payment_status: {
        type: String,
        default: 'unpaid',
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
