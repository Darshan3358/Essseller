const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const StorehousePayment = require('../models/StorehousePayment');
const Withdraw = require('../models/Withdraw');
const Seller = require('../models/Seller');
const Recharge = require('../models/Recharge');
const SiteSetting = require('../models/SiteSetting');
const createNotification = require('../utils/notifications');
const Supplier = require('../models/Supplier');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        customer_name,
        customer_phone
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // Calculate cost_amount (Storehouse Price)
        let totalCostAmount = 0;
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                totalCostAmount += (product.price * item.qty);
            }
        }

        const order_code = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

        const order = new Order({
            order_code,
            seller_id: req.body.seller_id || req.user._id,
            customer_name: customer_name || req.user.name,
            customer_address: shippingAddress,
            customer_email: req.body.customer_email || req.user.email, // Added fallback
            customer_phone: customer_phone,
            order_total: totalPrice,
            cost_amount: totalCostAmount, // Saved cost amount
            payment_method: paymentMethod,
            status: 'pending',
            payment_status: 'unpaid'
        });

        // Set supplier if available
        const bestSupplier = await Supplier.findOne({ status: 'active' }).sort({ rating: -1 });
        if (bestSupplier) {
            order.supplier_name = bestSupplier.name;
        }

        const createdOrder = await order.save();

        // Create notification for seller
        await createNotification({
            seller_id: createdOrder.seller_id,
            title: 'New Order Received',
            message: `You have a new order: ${createdOrder.order_code}. Check your order center for details.`,
            type: 'order',
            link: '/orders'
        });

        // specific logic for order items creation linked to order
        // In a real app, we might loop through orderItems and create OrderItem documents
        // For simplicity, we assume Order model might embed items or we handle them here
        // Based on the schema provided earlier, OrderItem is a separate model.

        if (orderItems && orderItems.length > 0) {
            for (const item of orderItems) {
                await OrderItem.create({
                    order_id: createdOrder._id,
                    product_id: item.product,
                    quantity: item.qty,
                    price: item.price
                });
            }
        }

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const orderIdStr = req.params.id;
    console.log(`[Order] Requesting details for ID: ${orderIdStr}`);

    const orderId = mongoose.isValidObjectId(orderIdStr)
        ? new mongoose.Types.ObjectId(orderIdStr)
        : orderIdStr;

    const order = await Order.findById(orderId).populate(
        'seller_id',
        'name email'
    );

    if (order) {
        console.log(`[Order] Found order code: ${order.order_code}`);

        // Fetch security settings for masking
        const securitySetting = await SiteSetting.findOne({ key: 'security_settings' });
        const maskSign = (securitySetting && securitySetting.value) ? securitySetting.value.mask_sign : '*';

        // Fetch associated order items with product details
        // Try multiple matching formats for order_id for robustness with legacy data
        const orderItems = await OrderItem.find({
            $or: [
                { order_id: orderId },
                { order_id: orderId.toString() }
            ]
        }).populate('product_id', 'name image price selling_price');

        console.log(`[Order] Found ${orderItems.length} items for order ${orderId.toString()}`);

        res.json({
            ...order.toObject(),
            mask_sign: maskSign, // Inform frontend about the masking character
            orderItems: orderItems.map(item => ({
                _id: item._id,
                product: item.product_id, // Populated product details
                quantity: item.quantity,
                price: item.price
            }))
        });
        console.log(`[Order] Response sent for: ${orderIdStr}`);
    } else {
        console.warn(`[Order] NOT FOUND: ${orderIdStr}`);
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin/Seller
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.payment_status = 'Paid';
        // order.paidAt = Date.now();
        // order.paymentResult = ...

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});


// @desc    Pay to Storehouse (Deduct Balance & Update Status)
// @route   PUT /api/orders/:id/pay-storehouse
// @access  Private/Seller
const payStorehouse = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const seller = await Seller.findById(req.user._id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }


    if (order.pick_up_status === 'Picked Up') {
        res.status(400);
        throw new Error('Order already picked up');
    }

    // Verify Transaction Password
    const { trans_password } = req.body;
    if (!seller.trans_password || !(await seller.matchTransPassword(trans_password))) {
        res.status(401);
        throw new Error('Invalid transaction password');
    }

    const costAmount = order.cost_amount || 0;

    // --- CHECK BALANCE ---
    if ((seller.wallet_balance || 0) < costAmount) {
        res.status(400);
        throw new Error('Insufficient wallet balance to pay storehouse price');
    }

    // --- EXECUTE PAYMENT ---
    // 1. Create Payment Record
    await StorehousePayment.create({
        order_code: order.order_code,
        amount: costAmount,
        status: 'Completed',
        seller_id: seller._id
    });

    // 2. Deduct from wallet
    seller.wallet_balance = (seller.wallet_balance || 0) - costAmount;
    await seller.save();

    // 3. Update Order
    order.pick_up_status = 'Picked Up';
    order.payment_status = 'Paid'; // Seller has paid the storehouse price
    const updatedOrder = await order.save();

    res.json(updatedOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const APIFeatures = require('../utils/apiFeatures');

    // Global Filter: Fetch orders for the logged-in seller (Handle ObjectId and Numeric ID)
    let filter = {
        $or: [
            { seller_id: req.user._id },           // As ObjectId
            { seller_id: req.user.id },            // As Number (if stored as number)
            { seller_id: String(req.user.id) }     // As String (if stored as string)
        ]
    };

    // Keyword search integration
    if (req.query.keyword) {
        const keyword = req.query.keyword;
        const searchRegex = { $regex: keyword, $options: 'i' };

        filter.$or = [
            { customer_name: searchRegex },
            { order_code: searchRegex },
            { customer_email: searchRegex },
            { customer_phone: searchRegex }
        ];
    }

    // Status filter
    if (req.query.status && req.query.status !== 'all') {
        filter.status = req.query.status;
    }

    const totalCount = await Order.countDocuments(filter);
    const limit = req.query.limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / limit);

    const features = new APIFeatures(Order.find(filter), req.query)
        .sort()
        .paginate();

    const orders = await features.query;

    // Attach "No. of Products" count to each order
    const ordersWithCounts = await Promise.all(orders.map(async (order) => {
        const productCount = await OrderItem.countDocuments({ order_id: order._id });
        return {
            ...order.toObject(),
            total_products: productCount
        };
    }));

    // Calculate Global Stats (reflects ALL orders for this seller)
    const allOrders = await Order.find({
        $or: [
            { seller_id: req.user._id },
            { seller_id: req.user.id },
            { seller_id: String(req.user.id) }
        ]
    });
    const stats = {
        totalTurnover: allOrders.reduce((acc, o) => acc + (parseFloat(o.order_total) || 0), 0),
        counts: {
            all: allOrders.length,
            pending: allOrders.filter(o => o.status === 'pending').length,
            delivered: allOrders.filter(o => (o.status || '').toLowerCase() === 'delivered').length,
            cancelled: allOrders.filter(o => o.status === 'cancelled').length
        }
    };

    res.json({
        success: true,
        orders: ordersWithCounts,
        totalCount,
        totalPages,
        page: req.query.page * 1 || 1,
        stats
    });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const APIFeatures = require('../utils/apiFeatures');

    let query = Order.find({}).populate('seller_id', 'id name');

    // Custom Search Logic for Orders (since APIFeatures defaults to 'name')
    if (req.query.keyword) {
        const keyword = req.query.keyword;
        const searchRegex = { $regex: keyword, $options: 'i' };
        query = query.find({
            $or: [
                { customer_name: searchRegex },
                { order_code: searchRegex },
                { customer_email: searchRegex }
            ]
        });
    }

    // Create a copy of query params to pass to APIFeatures, excluding keyword to avoid double filtering
    const queryObj = { ...req.query };
    if (queryObj.keyword) delete queryObj.keyword;

    const features = new APIFeatures(query, queryObj)
        .filter()
        .sort()
        .paginate();

    const orders = await features.query;

    // Get total count for pagination (approximate or filtered)
    // To get accurate filtered count, we'd need to run a separate count query with the same filters
    // For now, simpler approach or separate count query:
    let countQuery = Order.find({});
    if (req.query.keyword) {
        const keyword = req.query.keyword;
        const searchRegex = { $regex: keyword, $options: 'i' };
        countQuery = countQuery.find({
            $or: [
                { customer_name: searchRegex },
                { order_code: searchRegex },
                { customer_email: searchRegex }
            ]
        });
    }
    const total = await countQuery.countDocuments();

    res.json({
        orders,
        page: Number(req.query.page) || 1,
        pages: Math.ceil(total / (Number(req.query.limit) || 100)),
        total
    });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Credit seller wallet if status hits 'delivered' (and wasn't already)
        if (req.body.status === 'delivered' && order.status !== 'delivered') {
            const sellerId = order.seller_id;
            const seller = await Seller.findOne({
                $or: [
                    ...(mongoose.isValidObjectId(sellerId) ? [{ _id: new mongoose.Types.ObjectId(String(sellerId)) }] : []),
                    { id: sellerId },
                    { id: Number(sellerId) },
                ]
            });

            if (seller) {
                seller.wallet_balance = (seller.wallet_balance || 0) + (parseFloat(order.order_total) || 0);
                await seller.save();
                order.deliveredAt = Date.now();
            }
        }

        order.status = req.body.status || order.status;
        order.pick_up_status = req.body.pick_up_status || order.pick_up_status;
        if (req.body.payment_status) {
            order.payment_status = req.body.payment_status;
            // Auto-set pick status when paid
            if (req.body.payment_status.toLowerCase() === 'paid') {
                order.pick_up_status = 'Picked-Up';
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    payStorehouse,
    getMyOrders,
    getOrders,
    updateOrder,
    deleteOrder,
};
