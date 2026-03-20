const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Seller = require('../models/Seller');
const Package = require('../models/Package');
const Recharge = require('../models/Recharge');
const Withdraw = require('../models/Withdraw');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const SellerProduct = require('../models/SellerProduct');
const SpreadPackage = require('../models/SpreadPackage');
const SupportTicket = require('../models/SupportTicket');
const PackagePlan = require('../models/PackagePlan');
const bcrypt = require('bcryptjs');

// ===================== SUPPORT MANAGEMENT ====================

// @desc    Get all support tickets
// @route   GET /api/admin/support
// @access  Private/Admin
const getAllSupportTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({}).populate('seller_id', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
});

// @desc    Update support ticket status or add remark
// @route   PUT /api/admin/support/:id
// @access  Private/Admin
const updateSupportTicketStatus = asyncHandler(async (req, res) => {
    const { status, remark } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    if (status) ticket.status = status;
    if (remark) ticket.remark = remark;

    const updatedTicket = await ticket.save();
    res.json({ success: true, data: updatedTicket });
});

// ===================== PACKAGE PLAN MANAGEMENT ====================

// @desc    Get all package plans (for editing)
// @route   GET /api/admin/package-plans
// @access  Private/Admin
const getAllPackagePlans = asyncHandler(async (req, res) => {
    const plans = await PackagePlan.find({}).sort({ order_index: 1 });
    res.json({ success: true, data: plans });
});

// @desc    Create a new package plan
// @route   POST /api/admin/package-plans
// @access  Private/Admin
const createPackagePlan = asyncHandler(async (req, res) => {
    const plan = await PackagePlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
});

// @desc    Update a package plan
// @route   PUT /api/admin/package-plans/:id
// @access  Private/Admin
const updatePackagePlan = asyncHandler(async (req, res) => {
    const plan = await PackagePlan.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }
    res.json({ success: true, data: plan });
});

// @desc    Delete a package plan
// @route   DELETE /api/admin/package-plans/:id
// @access  Private/Admin
const deletePackagePlan = asyncHandler(async (req, res) => {
    const plan = await PackagePlan.findByIdAndDelete(req.params.id);
    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }
    res.json({ success: true, message: 'Plan removed' });
});

// ===================== DASHBOARD STATS ====================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const range = req.query.range || '7days';
    
    const totalUsers = await Seller.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
    const totalOrders = await Order.countDocuments({});
    const totalRecharges = await Recharge.countDocuments({});
    const totalWithdrawals = await Withdraw.countDocuments({});
    const totalPackages = await Package.countDocuments({});

    const pendingRecharges = await Recharge.countDocuments({ status: 0 });
    const pendingWithdrawals = await Withdraw.countDocuments({ status: 0 });

    // Revenue summary (Total approved recharges)
    const rechargeRevenue = await Recharge.aggregate([
        { $match: { status: 1 } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
    ]);
    const totalRevenue = rechargeRevenue.length > 0 ? rechargeRevenue[0].total : 0;

    // Orders this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });

    // New sellers this month
    const newSellers = await Seller.countDocuments({ role: 'seller', createdAt: { $gte: startOfMonth } });

    // Chart data based on range
    let days = 7;
    if (range === '30days') days = 30;
    else if (range === '6months') days = 180;
    else if (range === '12months') days = 365;

    const chartData = [];
    // If range is long, we might want to aggregate by month/week, 
    // but for now let's do daily or a subset to avoid too many points if needed.
    // For 180/365 days, we'll aggregate by 5-day blocks or months? 
    // Let's stick to daily for 30, and maybe weekly for 180/365.
    
    const interval = days > 30 ? (days === 180 ? 7 : 30) : 1; 
    const loops = Math.ceil(days / interval);

    for (let i = loops - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * interval));
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + interval);

        const dayStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: date, $lt: nextDate }
                }
            },
            {
                $group: {
                    _id: null,
                    sales: { $sum: { $toDouble: '$order_total' } },
                    cost: { $sum: { $toDouble: '$cost_amount' } },
                    count: { $sum: 1 }
                }
            }
        ]);

        const dayData = dayStats[0] || { sales: 0, cost: 0, count: 0 };
        
        let label = '';
        if (days <= 7) {
            label = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (days <= 30) {
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            label = date.toLocaleDateString('en-US', { month: 'short', year: days > 180 ? '2-digit' : undefined });
        }
        
        chartData.push({
            date: label,
            fullDate: date.toISOString().split('T')[0],
            sales: Math.round(dayData.sales),
            profit: Math.round(dayData.sales - dayData.cost),
            orders: dayData.count,
            aov: dayData.count > 0 ? Math.round(dayData.sales / dayData.count) : 0
        });
    }

    res.json({
        success: true,
        stats: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRecharges,
            totalWithdrawals,
            totalPackages,
            pendingRecharges,
            pendingWithdrawals,
            totalRevenue,
            ordersThisMonth,
            newSellers,
            chartData
        }
    });
});

// ===================== USER MANAGEMENT ====================

// @desc    Get all sellers/users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword || '';
    const status = req.query.status;

    let filter = { role: 'seller' };
    if (status !== undefined && status !== 'all') {
        filter.freeze = Number(status);
    }
    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
            { shop_name: { $regex: keyword, $options: 'i' } }
        ];
    }

    const total = await Seller.countDocuments(filter);
    const users = await Seller.find(filter)
        .select('-otp -otpExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        users,
        total,
        page,
        pages: Math.ceil(total / limit)
    });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await Seller.findById(req.params.id).select('-otp -otpExpires');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({ success: true, user });
});

// @desc    Update user (freeze/unfreeze, verify, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await Seller.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (req.body.name !== undefined && req.body.name.trim() !== '') user.name = req.body.name.trim();
    if (req.body.email !== undefined && req.body.email.trim() !== '') user.email = req.body.email.trim();
    if (req.body.shop_name !== undefined && req.body.shop_name.trim() !== '') user.shop_name = req.body.shop_name.trim();
    if (req.body.freeze !== undefined) user.freeze = Number(req.body.freeze);
    if (req.body.verified !== undefined) user.verified = Number(req.body.verified);
    if (req.body.password && req.body.password.trim() !== '') user.password = req.body.password.trim();
    if (req.body.trans_password && req.body.trans_password.trim() !== '') user.trans_password = req.body.trans_password.trim();
    if (req.body.wallet_balance !== undefined && req.body.wallet_balance !== '') user.wallet_balance = Number(req.body.wallet_balance);
    if (req.body.guarantee_balance !== undefined && req.body.guarantee_balance !== '') user.guarantee_balance = Number(req.body.guarantee_balance);

    if (req.body.store_health !== undefined) {
        user.store_health = Number(req.body.store_health);
        user.store_health_updated_at = Date.now();
    }
    if (req.body.store_performance !== undefined) user.store_performance = req.body.store_performance;
    if (req.body.store_status !== undefined) user.store_status = req.body.store_status;
    if (req.body.views !== undefined && req.body.views !== '') user.views = Number(req.body.views);
    if (req.body.used_views !== undefined && req.body.used_views !== '') user.used_views = Number(req.body.used_views);

    const updated = await user.save();
    res.json({
        success: true,
        user: {
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            shop_name: updated.shop_name,
            freeze: updated.freeze,
            verified: updated.verified,
            role: updated.role,
            wallet_balance: updated.wallet_balance,
            guarantee_balance: updated.guarantee_balance,
            store_health: updated.store_health,
            store_performance: updated.store_performance,
            store_status: updated.store_status,
            store_health_updated_at: updated.store_health_updated_at,
            views: updated.views,
            used_views: updated.used_views
        }
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await Seller.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin account');
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
});

// ===================== PACKAGE MANAGEMENT ====================

// @desc    Get all packages (admin)
// @route   GET /api/admin/packages
// @access  Private/Admin
const getAllPackages = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Package.countDocuments({});
    const packages = await Package.aggregate([
        {
            $lookup: {
                from: 'sellers',
                localField: 'seller_id',
                foreignField: '_id',
                as: 'seller_obj'
            }
        },
        {
            $lookup: {
                from: 'sellers',
                localField: 'seller_id',
                foreignField: 'id',
                as: 'seller_num'
            }
        },
        {
            $addFields: {
                seller_data: {
                    $cond: {
                        if: { $gt: [{ $size: '$seller_obj' }, 0] },
                        then: { $arrayElemAt: ['$seller_obj', 0] },
                        else: { $arrayElemAt: ['$seller_num', 0] }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1, id: 1, type: 1, amount: 1, profit: 1, product_limit: 1, created_at: 1,
                status: 1, reason: 1,
                seller: { name: '$seller_data.name', email: '$seller_data.email', shop_name: '$seller_data.shop_name' }
            }
        },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    res.json({ success: true, packages, total, page, pages: Math.ceil(total / limit) });
});

// @desc    Update package status
// @route   PUT /api/admin/packages/:id
// @access  Private/Admin
const updatePackageStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
        res.status(404);
        throw new Error('Package not found');
    }

    const oldStatus = pkg.status;
    pkg.status = Number(status);
    if (reason) pkg.reason = reason;
    await pkg.save();

    // If approved (status 1) and was not previously approved
    if (pkg.status === 1 && oldStatus !== 1) {
        // Update seller's views to match the package's product_limit
        await Seller.findByIdAndUpdate(pkg.seller_id, {
            $set: { views: pkg.product_limit }
        });
    }

    res.json({ success: true, package: pkg });
});

// ===================== RECHARGE MANAGEMENT ====================

// @desc    Get all recharges (admin)
// @route   GET /api/admin/recharges
// @access  Private/Admin
const getAllRecharges = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // 0=pending, 1=approved, 2=rejected

    let filter = {};
    if (status !== undefined && status !== 'all') filter.status = Number(status);

    const total = await Recharge.countDocuments(filter);
    const recharges = await Recharge.find(filter)
        .populate({ path: 'seller_id', select: 'name email shop_name', model: 'Seller' })
        .sort({ createdAt: -1, created_at: -1 })
        .skip(skip)
        .limit(limit);

    res.json({ success: true, recharges, total, page, pages: Math.ceil(total / limit) });
});

// @desc    Update recharge status
// @route   PUT /api/admin/recharges/:id
// @access  Private/Admin
const updateRechargeStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const recharge = await Recharge.findById(req.params.id);

    if (!recharge) {
        res.status(404);
        throw new Error('Recharge not found');
    }

    // Always store status as Number (not string) so wallet balance query matches correctly
    recharge.status = Number(status);
    if (reason) recharge.reason = reason;
    await recharge.save();

    res.json({ success: true, recharge });
});

// ===================== WITHDRAWAL MANAGEMENT ====================

// @desc    Get all withdrawals (admin)
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
const getAllWithdrawals = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let matchFilter = {};
    if (status !== undefined && status !== 'all') matchFilter.status = Number(status);

    const total = await Withdraw.countDocuments(matchFilter);
    const withdrawals = await Withdraw.aggregate([
        { $match: matchFilter },
        {
            $lookup: {
                from: 'sellers',
                localField: 'seller_id',
                foreignField: '_id',
                as: 'seller_data'
            }
        },
        {
            $unwind: { path: '$seller_data', preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                _id: 1, amount: 1, op_type: 1, status: 1, reason: 1, message: 1, createdAt: 1,
                bank_details: 1, notes: 1,
                seller: { name: '$seller_data.name', email: '$seller_data.email', shop_name: '$seller_data.shop_name' }
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    res.json({ success: true, withdrawals, total, page, pages: Math.ceil(total / limit) });
});

// @desc    Update withdrawal status (Approve / Reject)
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
const updateWithdrawalStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const newStatus = Number(status);

    if (![1, 2].includes(newStatus)) {
        res.status(400);
        throw new Error('Invalid status. Use 1 (approve) or 2 (reject)');
    }

    const withdrawal = await Withdraw.findById(req.params.id);

    if (!withdrawal) {
        res.status(404);
        throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 0) {
        res.status(400);
        throw new Error('Only pending withdrawal requests can be approved or rejected');
    }

    // Set the new status (1=Approved, 2=Rejected)
    withdrawal.status = newStatus;
    if (reason) withdrawal.reason = reason;

    // If rejected, add reason as message too
    if (newStatus === 2) {
        withdrawal.message = reason ? `Rejected: ${reason}` : 'Rejected by admin';
    } else {
        withdrawal.message = 'Approved by admin. Amount will be transferred within 1-2 business days.';
    }

    await withdrawal.save();

    res.json({
        success: true,
        message: newStatus === 1 ? '✅ Withdrawal approved successfully' : '❌ Withdrawal rejected',
        withdrawal
    });
});

// ===================== ORDER MANAGEMENT ====================

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword || '';
    const status = req.query.status;

    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (keyword) {
        filter.$or = [
            { customer_name: { $regex: keyword, $options: 'i' } },
            { order_code: { $regex: keyword, $options: 'i' } },
            { customer_phone: { $regex: keyword, $options: 'i' } }
        ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.aggregate([
        { $match: filter },
        {
            $lookup: {
                from: 'sellers',
                localField: 'seller_id',
                foreignField: '_id',
                as: 'seller_data'
            }
        },
        {
            $unwind: { path: '$seller_data', preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                _id: 1, order_code: 1, customer_name: 1, customer_phone: 1,
                customer_address: 1, order_total: 1, cost_amount: 1,
                status: 1, pick_up_status: 1, payment_status: 1, createdAt: 1,
                seller: { name: '$seller_data.name', email: '$seller_data.email', shop_name: '$seller_data.shop_name' }
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) });
});

// @desc    Create a new order (admin)
// @route   POST /api/admin/orders
// @access  Private/Admin
const createOrder = asyncHandler(async (req, res) => {
    const {
        seller_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        payment_method,
        products: orderProducts // [{ product_id, qty }]
    } = req.body;

    if (!seller_id || !customer_name || !customer_address || !orderProducts || !orderProducts.length) {
        res.status(400);
        throw new Error('seller_id, customer_name, customer_address, and products are required');
    }

    // Verify seller exists
    const seller = await Seller.findById(seller_id);
    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // Fetch product details and calculate totals
    let order_total = 0;
    let cost_amount = 0;
    const productDetails = [];

    for (const item of orderProducts) {
        if (!item.product_id || !item.qty || item.qty < 1) continue;
        const product = await Product.findOne({
            $or: [
                { _id: mongoose.isValidObjectId(item.product_id) ? item.product_id : null },
                { id: item.product_id }
            ]
        });
        if (product) {
            const qty = Number(item.qty) || 1;
            order_total += (parseFloat(product.selling_price) || 0) * qty;
            cost_amount += (parseFloat(product.price) || 0) * qty;
            productDetails.push({ product_id: product._id, name: product.name, qty, price: product.selling_price });
        }
    }

    if (productDetails.length === 0) {
        res.status(400);
        throw new Error('No valid products selected');
    }

    // Generate unique order code
    const order_code = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const newOrder = await Order.create({
        order_code,
        seller_id: seller._id,
        customer_name,
        customer_email: customer_email || '',
        customer_phone: customer_phone || '',
        customer_address,
        payment_method: payment_method || 'Cash on Delivery',
        order_total: order_total.toFixed(2),
        cost_amount,
        status: 'pending',
        pick_up_status: 'Unpicked-Up',
        payment_status: 'unpaid'
    });

    // Create one OrderItem per product — all linked to the SAME order
    for (const item of productDetails) {
        await OrderItem.create({
            order_id: newOrder._id,
            product_id: item.product_id,
            quantity: item.qty,
            price: item.price
        });
    }

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: newOrder
    });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (req.body.status) order.status = req.body.status;
    if (req.body.payment_status) order.payment_status = req.body.payment_status;
    if (req.body.pick_up_status) order.pick_up_status = req.body.pick_up_status;

    await order.save();
    res.json({ success: true, order });
});

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted' });
});

// ===================== PRODUCT MANAGEMENT ====================

// @desc    Get products added to a specific seller's store (admin use)
// @route   GET /api/admin/seller-store-products/:sellerId
// @access  Private/Admin
const getSellerStoreProducts = asyncHandler(async (req, res) => {
    const sellerId = req.params.sellerId;

    // Find the seller first to verify they exist
    const seller = await Seller.findById(sellerId);
    if (!seller) {
        return res.json({ success: true, products: [], total: 0, sellerInfo: null });
    }

    // Build all possible selector variations for seller_id
    const selectorVariants = [
        { seller_id: sellerId },
        { seller_id: String(sellerId) },
        { seller_id: seller.id }, // Numeric ID
        { seller_id: String(seller.id) }, // Numeric ID as string
    ];
    if (mongoose.isValidObjectId(sellerId)) {
        selectorVariants.push({ seller_id: new mongoose.Types.ObjectId(sellerId) });
    }

    // Get all SellerProduct links for this seller
    const links = await SellerProduct.find({ $or: selectorVariants });

    console.log(`[Admin] Seller ${sellerId} has ${links.length} SellerProduct links`);

    if (!links.length) {
        return res.json({
            success: true,
            products: [],
            total: 0,
            sellerInfo: { name: seller.name, shop_name: seller.shop_name, email: seller.email }
        });
    }

    // Collect all product_id values in every possible form
    const productIds = links.map(l => l.product_id);
    const validObjectIds = productIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));

    const products = await Product.find({
        isDeleted: { $ne: true },
        $or: [
            { _id: { $in: validObjectIds } },
            { id: { $in: productIds } }
        ]
    }).sort({ createdAt: -1 });

    console.log(`[Admin] Found ${products.length} products for seller ${sellerId}`);

    res.json({
        success: true,
        products,
        total: products.length,
        sellerInfo: { name: seller.name, shop_name: seller.shop_name, email: seller.email }
    });
});

// @desc    Get all products (admin - storehouse, optionally filtered by seller)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword || '';
    const category = req.query.category || '';
    const sellerId = req.query.seller_id || '';

    // If seller_id is provided, find what that seller has added
    if (sellerId) {
        const sellerLinks = await SellerProduct.find({
            $or: [
                { seller_id: sellerId },
                { seller_id: String(sellerId) },
                ...(mongoose.isValidObjectId(sellerId) ? [{ seller_id: new mongoose.Types.ObjectId(sellerId) }] : [])
            ]
        });

        const productIds = sellerLinks.map(sp => sp.product_id);

        let sellerFilter = {
            isDeleted: { $ne: true },
            $or: [
                { _id: { $in: productIds.filter(id => mongoose.isValidObjectId(id)) } },
                { id: { $in: productIds } }
            ]
        };
        if (keyword) {
            sellerFilter.$and = [{ $or: sellerFilter.$or }, {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { category: { $regex: keyword, $options: 'i' } }
                ]
            }];
            delete sellerFilter.$or;
        }
        if (category) sellerFilter.category = { $regex: category, $options: 'i' };

        const total = await Product.countDocuments(sellerFilter);
        const products = await Product.find(sellerFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const categories = await Product.distinct('category', { isDeleted: { $ne: true } });

        // Get seller info
        const sellerInfo = await Seller.findById(sellerId).select('name shop_name email');

        return res.json({ success: true, products, total, page, pages: Math.ceil(total / limit), categories, sellerInfo });
    }

    let filter = { isDeleted: { $ne: true } };
    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { category: { $regex: keyword, $options: 'i' } },
            { brand: { $regex: keyword, $options: 'i' } }
        ];
    }
    if (category) filter.category = { $regex: category, $options: 'i' };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get categories list
    const categories = await Product.distinct('category', { isDeleted: { $ne: true } });

    res.json({ success: true, products, total, page, pages: Math.ceil(total / limit), categories });
});

// @desc    Create product (admin adds to storehouse)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, selling_price, profit, category, brand } = req.body;

    if (!name || !description || !price || !selling_price || !category) {
        res.status(400);
        throw new Error('Please fill all required fields');
    }

    let image = '';
    if (req.files && req.files.image) {
        image = `/uploads/${req.files.image[0].filename}`;
    } else if (req.body.image) {
        image = req.body.image;
    }

    if (!image) {
        res.status(400);
        throw new Error('Product image is required');
    }

    const product = await Product.create({
        name,
        description,
        price: Number(price),
        selling_price: Number(selling_price),
        profit: Number(profit) || (Number(selling_price) - Number(price)),
        category,
        brand: brand || '',
        image,
        seller_id: req.user._id,
        status: 1
    });

    res.status(201).json({ success: true, product });
});

// @desc    Update product (admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
        res.status(404);
        throw new Error('Product not found');
    }

    const updates = { ...req.body };
    if (req.files && req.files.image) {
        updates.image = `/uploads/${req.files.image[0].filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, product: updated });
});

// @desc    Delete product (admin - soft delete)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.isDeleted = true;
    await product.save();

    res.json({ success: true, message: 'Product removed from storehouse' });
});

// @desc    Permanently delete product
// @route   DELETE /api/admin/products/:id/permanent
// @access  Private/Admin
const permanentDeleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product permanently deleted' });
});

// ===================== SPREAD PACKAGE MANAGEMENT ====================

// @desc    Get all spread packages (admin)
// @route   GET /api/admin/spread-packages
// @access  Private/Admin
const getAllAdminSpreadPackages = asyncHandler(async (req, res) => {
    const packages = await SpreadPackage.find({}).sort({ id: 1 });
    res.json({ success: true, packages });
});

// @desc    Create spread package
// @route   POST /api/admin/spread-packages
// @access  Private/Admin
const createSpreadPackage = asyncHandler(async (req, res) => {
    const { id, name, price, duration, features, color, popular, active } = req.body;

    if (!id || !name || price === undefined) {
        res.status(400);
        throw new Error('Please provide id, name and price');
    }

    const exists = await SpreadPackage.findOne({ id });
    if (exists) {
        res.status(400);
        throw new Error('Package ID already exists');
    }

    const pkg = await SpreadPackage.create({
        id, name, price, duration, features, color, popular, active
    });

    res.status(201).json({ success: true, package: pkg });
});

// @desc    Update spread package
// @route   PUT /api/admin/spread-packages/:id
// @access  Private/Admin
const updateSpreadPackage = asyncHandler(async (req, res) => {
    const pkg = await SpreadPackage.findById(req.params.id);
    if (!pkg) {
        res.status(404);
        throw new Error('Package not found');
    }

    const updated = await SpreadPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, package: updated });
});

// @desc    Delete spread package
// @route   DELETE /api/admin/spread-packages/:id
// @access  Private/Admin
const deleteSpreadPackage = asyncHandler(async (req, res) => {
    const pkg = await SpreadPackage.findById(req.params.id);
    if (!pkg) {
        res.status(404);
        throw new Error('Package not found');
    }

    await pkg.deleteOne();
    res.json({ success: true, message: 'Spread package deleted' });
});

module.exports = {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllPackages,
    updatePackageStatus,
    getAllRecharges,
    updateRechargeStatus,
    getAllWithdrawals,
    updateWithdrawalStatus,
    getAllOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getSellerStoreProducts,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    permanentDeleteProduct,
    getAllAdminSpreadPackages,
    createSpreadPackage,
    updateSpreadPackage,
    deleteSpreadPackage,
    getAllSupportTickets,
    updateSupportTicketStatus,
    getAllPackagePlans,
    createPackagePlan,
    updatePackagePlan,
    deletePackagePlan
};
