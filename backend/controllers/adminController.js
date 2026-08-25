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
const createNotification = require('../utils/notifications');
const Supplier = require('../models/Supplier');
const GuaranteeMoney = require('../models/GuaranteeMoney');
const ShopProfile = require('../models/ShopProfile');
const { normalizeProduct } = require('./productController');

// ===================== SELLER STATISTICS FOR ADMIN ====================

// @desc    Get detailed stats for a specific seller (for reports page)
// @route   GET /api/admin/seller-stats/:sellerId
// @access  Private/Admin
const getSellerStatsForAdmin = asyncHandler(async (req, res) => {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);


    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    const sellerIdFilter = [
        seller._id,
        seller.id,
        String(seller._id),
        String(seller.id)
    ].filter(v => v !== undefined && v !== null);

    // 1. Total Products
    const totalProducts = await SellerProduct.countDocuments({
        seller_id: { $in: sellerIdFilter }
    });

    // 2. Total Orders
    const totalOrders = await Order.countDocuments({
        seller_id: { $in: sellerIdFilter }
    });

    // 3. Total Sales
    const salesResult = await Order.aggregate([
        {
            $match: {
                seller_id: { $in: sellerIdFilter },
                status: { $regex: 'pending|processing|delivered|shipped|completed', $options: 'i' }
            }
        },
        {
            $project: {
                order_total_val: {
                    $cond: {
                        if: { $and: [{ $ne: ["$order_total", ""] }, { $ne: ["$order_total", null] }] },
                        then: { $convert: { input: "$order_total", to: "double", onError: 0, onNull: 0 } },
                        else: 0
                    }
                }
            }
        },
        { $group: { _id: null, total: { $sum: "$order_total_val" } } }
    ]);
    const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;

    // 4. Category-wise Counts
    const myProductLinks = await SellerProduct.find({ seller_id: { $in: sellerIdFilter } });
    const productIds = myProductLinks.map(l => l.product_id);

    const categoryCounts = await Product.aggregate([
        {
            $match: {
                $or: [
                    { _id: { $in: productIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id)) } },
                    { id: { $in: productIds } }
                ]
            }
        },
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Time-based stats
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    const getSalesForPeriod = async (start, end) => {
        const query = {
            seller_id: { $in: sellerIdFilter },
            status: { $regex: 'pending|processing|shipped|completed|delivered', $options: 'i' },
            createdAt: { $gte: start }
        };
        if (end) query.createdAt.$lt = end;

        const res = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    sales: { $sum: { $convert: { input: "$order_total", to: "double", onError: 0, onNull: 0 } } },
                    cost: { $sum: { $convert: { input: "$cost_amount", to: "double", onError: 0, onNull: 0 } } }
                }
            }
        ]);
        return res.length > 0 ? res[0] : { sales: 0, cost: 0 };
    };

    const todayData = await getSalesForPeriod(startOfToday);
    const thisMonthData = await getSalesForPeriod(startOfMonth);
    const lastMonthData = await getSalesForPeriod(startOfLastMonth, startOfMonth);

    // Dynamic Chart Data with Grouping
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    const rawStatsResult = await Order.aggregate([
        {
            $match: {
                seller_id: { $in: sellerIdFilter },
                status: { $regex: 'pending|processing|shipped|completed|delivered', $options: 'i' },
                status: { $nin: ['cancelled', 'Cancelled'] },
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: { $convert: { input: "$order_total", to: "double", onError: 0, onNull: 0 } } },
                profit: { $sum: { $subtract: [{ $convert: { input: "$order_total", to: "double", onError: 0, onNull: 0 } }, { $convert: { input: "$cost_amount", to: "double", onError: 0, onNull: 0 } }] } },
                orders: { $sum: 1 }
            }
        }
    ]);

    const statsMap = {};
    rawStatsResult.forEach(item => { statsMap[item._id] = item; });

    // Interval logic: Daily for 30d, Weekly for 6m, Monthly for 1y
    const interval = days > 30 ? (days === 180 || days === 90 ? 7 : 30) : 1;
    const loops = Math.ceil(days / interval);
    const chartData = [];

    for (let i = loops - 1; i >= 0; i--) {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        date.setUTCDate(date.getUTCDate() - (i * interval));

        let daySales = 0, dayProfit = 0, dayOrders = 0;
        for (let j = 0; j < interval; j++) {
            const d = new Date(date);
            d.setUTCDate(d.getUTCDate() + j);
            const dateStr = d.toISOString().split('T')[0];
            const item = statsMap[dateStr];
            if (item) {
                daySales += item.sales;
                dayProfit += item.profit;
                dayOrders += item.orders;
            }
        }

        let label = '';
        if (days <= 7) {
            label = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        } else if (days <= 30) {
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        } else {
            label = date.toLocaleDateString('en-US', { month: 'short', year: days > 180 ? '2-digit' : undefined, timeZone: 'UTC' });
        }

        chartData.push({
            date: label,
            sales: Math.round(daySales),
            profit: Math.max(0, Math.round(dayProfit)),
            orders: dayOrders,
            aov: dayOrders > 0 ? Math.round(daySales / dayOrders) : 0
        });
    }

    // All all-time profit
    const allOrders = await Order.find({ seller_id: { $in: sellerIdFilter } }).sort({ createdAt: -1 }).limit(100);

    res.json({
        success: true,
        stats: {
            totalSales,
            totalOrders,
            todaySales: todayData.sales,
            thisMonthSales: thisMonthData.sales,
            lastMonthSales: lastMonthData.sales,
            chartData,
            categoryCounts,
            netProfit: Math.max(0, totalSales - (await Order.aggregate([
                { $match: { seller_id: { $in: sellerIdFilter }, status: { $regex: 'pending|processing|delivered|shipped|completed', $options: 'i' } } },
                { $group: { _id: null, total: { $sum: { $convert: { input: "$cost_amount", to: "double", onError: 0, onNull: 0 } } } } }
            ])).reduce((acc, curr) => acc + curr.total, 0)),
            avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders) : 0,
        },
        orders: allOrders
    });
});

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
const statsCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

const getDashboardStats = asyncHandler(async (req, res) => {
    const range = req.query.range || '7days';
    const cacheKey = `admin_stats_${range}`;
    const mongoUri = process.env.MONGO_URI || 'not set';
    console.log(`[AdminStats] MONGO_URI Host: ${mongoUri.split('@')[1]?.split('/')[0] || 'localhost'}`);

    // 1. Cache Check (Strict 5 min cache)
    const cached = statsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
        return res.json({ success: true, stats: cached.data });
    }

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const days = (range === '30days' || range === '1M') ? 30 :
        (range === '6months' || range === '6M') ? 180 :
            (range === '12months' || range === '1Y') ? 365 : 7;
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    // 2. Parallel Execution with optimized methods
    const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRecharges,
        totalWithdrawals,
        totalPackages,
        pendingRecharges,
        pendingWithdrawals,
        rechargeRevenue,
        ordersThisMonth,
        newSellers,
        rawStatsResult
    ] = await Promise.all([
        Seller.countDocuments({ role: 'seller' }),
        Product.countDocuments({ isDeleted: { $ne: true } }),
        Order.estimatedDocumentCount(),
        Recharge.estimatedDocumentCount(),
        Withdraw.estimatedDocumentCount(),
        Package.estimatedDocumentCount(),
        Recharge.countDocuments({ status: 0 }),
        Withdraw.countDocuments({ status: 0 }),
        Recharge.aggregate([
            { $match: { status: 1 } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(res => res[0]?.total || 0),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Seller.countDocuments({ role: 'seller', createdAt: { $gte: startOfMonth } }),
        Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: startDate }, 
                    status: { $ne: 'cancelled' } 
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$order_total" },
                    profit: { $sum: { $subtract: ["$order_total", "$cost_amount"] } },
                    orders: { $sum: 1 }
                }
            }
        ])
    ]);

    const totalRevenue = rechargeRevenue;
    const statsMap = {};
    rawStatsResult.forEach(item => { statsMap[item._id] = item; });
    const chartData = [];

    const interval = days > 30 ? (days === 180 ? 7 : 30) : 1;
    const loops = Math.ceil(days / interval);

    for (let i = loops - 1; i >= 0; i--) {
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        date.setUTCDate(date.getUTCDate() - (i * interval));

        let daySales = 0, dayProfit = 0, dayOrders = 0;
        for (let j = 0; j < interval; j++) {
            const d = new Date(date);
            d.setUTCDate(d.getUTCDate() + j);
            const dateStr = d.toISOString().split('T')[0];
            const item = statsMap[dateStr];
            if (item) {
                daySales += item.sales;
                dayProfit += item.profit;
                dayOrders += item.orders;
            }
        }

        let label = '';
        if (days <= 7) {
            label = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        } else if (days <= 30) {
            label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        } else {
            label = date.toLocaleDateString('en-US', { month: 'short', year: days > 180 ? '2-digit' : undefined, timeZone: 'UTC' });
        }

        chartData.push({
            date: label,
            sales: Math.round(daySales),
            profit: Math.max(0, Math.round(dayProfit)),
            orders: dayOrders,
            aov: dayOrders > 0 ? Math.round(daySales / dayOrders) : 0
        });
    }

    const stats = {
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
        chartData,
        total_products: totalProducts,
        productCount: totalProducts
    };

    statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });

    res.json({
        success: true,
        stats,
        raw_counts: {
            sellers: totalUsers,
            products: totalProducts,
            orders: totalOrders
        }
    });
});

// ===================== USER MANAGEMENT ====================

// @desc    Get all sellers/users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
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

    if (req.body.name !== undefined && req.body.name.trim() !== '') user.set('name', req.body.name.trim());
    if (req.body.email !== undefined && req.body.email.trim() !== '') user.set('email', req.body.email.trim());
    if (req.body.shop_name !== undefined && req.body.shop_name.trim() !== '') user.set('shop_name', req.body.shop_name.trim());

    if (req.body.freeze !== undefined) {
        const oldFreeze = user.freeze;
        user.set('freeze', Number(req.body.freeze));

        if (oldFreeze !== user.freeze) {
            await createNotification({
                seller_id: user._id,
                title: user.freeze === 1 ? 'Account Suspended' : 'Account Re-activated',
                message: user.freeze === 1
                    ? 'Your account has been frozen by the administration. Please contact support for more details.'
                    : 'Your account has been un-frozen. You can now resume your sales activities.',
                type: 'system'
            });
        }
    }

    if (req.body.verified !== undefined) user.set('verified', Number(req.body.verified));
    if (req.body.verification_status !== undefined) {
        user.set('verification_status', req.body.verification_status);
        if (req.body.verification_status === 'verified') {
            user.set('verified', 1);
            user.set('verified_at', new Date());
            user.set('verified_by', req.user?.name || 'Admin');
        } else if (req.body.verification_status === 'rejected') {
            user.set('verified', 2);
            user.set('rejection_reason', req.body.rejection_reason || 'Documents rejected by Admin');
            user.set('verified_at', new Date());
            user.set('verified_by', req.user?.name || 'Admin');
        } else if (req.body.verification_status === 'pending') {
            user.set('verified', 0);
        }
    }
    if (req.body.rejection_reason !== undefined) user.set('rejection_reason', req.body.rejection_reason);

    if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password.trim();
        user.plain_password = req.body.password.trim();
    }

    if (req.body.trans_password && req.body.trans_password.trim() !== '') {
        user.trans_password = req.body.trans_password.trim();
        user.plain_trans_password = req.body.trans_password.trim();
    }

    if (req.body.wallet_balance !== undefined && req.body.wallet_balance !== '') user.set('wallet_balance', Number(req.body.wallet_balance));
    if (req.body.guarantee_balance !== undefined && req.body.guarantee_balance !== '') user.set('guarantee_balance', Number(req.body.guarantee_balance));

    if (req.body.store_health !== undefined) {
        user.set('store_health', Number(req.body.store_health));
        user.set('store_health_updated_at', Date.now());
    }
    if (req.body.store_performance !== undefined) user.set('store_performance', req.body.store_performance);
    if (req.body.store_status !== undefined) user.set('store_status', req.body.store_status);
    if (req.body.views !== undefined && req.body.views !== '') user.set('views', Number(req.body.views));

    if (req.body.store_diagnostics) {
        if (req.body.store_diagnostics.fulfillment !== undefined) user.set('store_diagnostics.fulfillment', req.body.store_diagnostics.fulfillment);
        if (req.body.store_diagnostics.rating !== undefined) user.set('store_diagnostics.rating', req.body.store_diagnostics.rating);
        if (req.body.store_diagnostics.responseTime !== undefined) user.set('store_diagnostics.responseTime', req.body.store_diagnostics.responseTime);
        if (req.body.store_diagnostics.qualityScore !== undefined) user.set('store_diagnostics.qualityScore', req.body.store_diagnostics.qualityScore);
    }

    const updated = await user.save();
    res.json({
        success: true,
        user: updated
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

        await createNotification({
            seller_id: pkg.seller_id,
            title: 'Package Approved',
            message: `Your ${pkg.type} package request has been approved! Your product limit is now ${pkg.product_limit}.`,
            type: 'package',
            link: '/dashboard'
        });
    } else if (pkg.status === 2 && oldStatus !== 2) {
        await createNotification({
            seller_id: pkg.seller_id,
            title: 'Package Rejected',
            message: `Your package request was rejected. Reason: ${reason || 'N/A'}.`,
            type: 'package'
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

    // If approved, update seller's stored wallet_balance
    if (recharge.status === 1) {
        await Seller.findByIdAndUpdate(recharge.seller_id, {
            $inc: { wallet_balance: Number(recharge.amount) }
        });
    }

    // Notify user
    await createNotification({
        seller_id: recharge.seller_id,
        title: status == 1 ? 'Recharge Approved' : 'Recharge Rejected',
        message: status == 1
            ? `Your recharge of $${recharge.amount} has been approved.`
            : `Your recharge of $${recharge.amount} was rejected. Reason: ${reason || 'N/A'}.`,
        type: 'wallet'
    });

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
                bank_details: 1, crypto_details: 1, notes: 1,
                seller: {
                    name: '$seller_data.name',
                    email: '$seller_data.email',
                    shop_name: '$seller_data.shop_name',
                    bank_details: '$seller_data.bank_details',
                    crypto_details: '$seller_data.crypto_details'
                }
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

    // If REJECTED, refund to seller's wallet_balance
    if (newStatus === 2) {
        await Seller.findByIdAndUpdate(withdrawal.seller_id, {
            $inc: { wallet_balance: Number(withdrawal.amount) }
        });
    }

    // Notify user
    await createNotification({
        seller_id: withdrawal.seller_id,
        title: newStatus === 1 ? 'Withdrawal Approved' : 'Withdrawal Rejected',
        message: newStatus === 1
            ? `Your withdrawal of $${withdrawal.amount} has been approved.`
            : `Your withdrawal of $${withdrawal.amount} was rejected. Reason: ${reason || 'N/A'}.`,
        type: 'wallet'
    });

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
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
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
        }
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
        products: orderProducts, // [{ product_id, qty }]
        supplier_name
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
        payment_status: 'unpaid',
        supplier_name: supplier_name || undefined
    });

    // Set supplier if available
    if (!newOrder.supplier_name) {
        const bestSupplier = await Supplier.findOne({ status: 'active' }).sort({ rating: -1 });
        if (bestSupplier) {
            newOrder.supplier_name = bestSupplier.name;
            await newOrder.save();
        }
    }

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

    // Notify seller
    await createNotification({
        seller_id: seller._id,
        title: 'You have received a new order',
        message: `A new order has been received: ${order_code}. Check your order center.`,
        type: 'order',
        link: '/orders'
    });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Credit seller wallet if status hits 'delivered' for the first time
    const newStatus = req.body.status?.toLowerCase();
    const oldStatus = order.status?.toLowerCase();

    if (newStatus === 'delivered' && oldStatus !== 'delivered') {
        const sellerId = order.seller_id;

        // Build query variants safely to avoid "Cast to Number failed for NaN"
        const queryVariants = [];
        if (mongoose.isValidObjectId(sellerId)) {
            queryVariants.push({ _id: new mongoose.Types.ObjectId(String(sellerId)) });
        }

        // Only add numeric id variant if sellerId is a valid number or numeric string
        const numericId = Number(sellerId);
        if (!isNaN(numericId)) {
            queryVariants.push({ id: numericId });
        } else if (typeof sellerId === 'string' && sellerId.length > 0) {
            // If it's a string, still try if it happens to be the ID field (though usually numeric)
            queryVariants.push({ id: sellerId });
        }

        const seller = await Seller.findOne({ $or: queryVariants.length > 0 ? queryVariants : [{ _id: null }] });

        if (seller) {
            const amount = parseFloat(order.order_total) || 0;
            seller.wallet_balance = (seller.wallet_balance || 0) + amount;
            await seller.save();
            order.deliveredAt = Date.now();
        }
    }

    if (req.body.status) order.status = req.body.status;
    if (req.body.pick_up_status) order.pick_up_status = req.body.pick_up_status;
    if (req.body.supplier_name) order.supplier_name = req.body.supplier_name;

    if (req.body.payment_status) {
        order.payment_status = req.body.payment_status;
    }

    // Auto-set pick status to Picked when payment is marked as paid
    if (order.payment_status?.toLowerCase() === 'paid') {
        order.pick_up_status = 'Picked-Up';
    }

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
        products: products.map(p => normalizeProduct(p)),
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

        // Get categories list with counts for this specific seller's visibility/filter
        const categoryResult = await Product.aggregate([
            { $match: sellerFilter },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        const categories = categoryResult
            .filter(c => c._id)
            .map(c => ({ name: String(c._id), count: Number(c.count) }));

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

    // Get categories list with counts
    const categoryResult = await Product.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);
    const categories = categoryResult
        .filter(c => c._id)
        .map(c => ({ name: String(c._id), count: Number(c.count) }));

    res.json({ success: true, products: products.map(p => normalizeProduct(p)), total, page, pages: Math.ceil(total / limit), categories });
});

// @desc    Create product (admin adds to storehouse)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, selling_price, profit, category, brand } = req.body;
    const ProductImage = require('../models/ProductImage');

    if (!name || !description || !price || !selling_price || !category) {
        res.status(400);
        throw new Error('Please fill all required fields');
    }

    let image = '';
    if (req.files && req.files.image) {
        const file = req.files.image[0];
        const filename = `image-${Date.now()}-${file.originalname}`;

        let buffer;
        if (file.buffer) {
            buffer = file.buffer;
        } else if (file.path && !file.path.startsWith('http')) {
            const fs = require('fs');
            buffer = fs.readFileSync(file.path);
        }

        if (file.path && file.path.startsWith('http')) {
            image = file.path;
        } else if (buffer) {
            await ProductImage.create({
                filename,
                imageData: buffer.toString('base64'),
                contentType: file.mimetype
            });
            image = `/api/products/image/${filename}`;
        }
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
        const ProductImage = require('../models/ProductImage');
        const file = req.files.image[0];
        const filename = `image-${Date.now()}-${file.originalname}`;

        let buffer;
        if (file.buffer) {
            buffer = file.buffer;
        } else if (file.path && !file.path.startsWith('http')) {
            const fs = require('fs');
            buffer = fs.readFileSync(file.path);
        }

        if (file.path && file.path.startsWith('http')) {
            updates.image = file.path;
        } else if (buffer) {
            await ProductImage.create({
                filename,
                imageData: buffer.toString('base64'),
                contentType: file.mimetype
            });
            updates.image = `/api/products/image/${filename}`;
        }
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

// @desc    Get all spread package purchases
// @route   GET /api/admin/spread-packages/purchases
// @access  Private/Admin
const getSpreadPackagePurchases = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { type: { $regex: '^Spread:', $options: 'i' } };

    const total = await Package.countDocuments(query);
    const revenueResult = await Package.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const packages = await Package.aggregate([
        { $match: query },
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
                _id: 1, id: 1, type: 1, amount: 1, profit: 1, product_limit: 1, created_at: 1, createdAt: 1,
                status: 1, reason: 1,
                seller: {
                    name: '$seller_data.name',
                    email: '$seller_data.email',
                    shop_name: '$seller_data.shop_name'
                }
            }
        },
        { $sort: { created_at: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    res.json({ success: true, packages, total, totalRevenue, page, pages: Math.ceil(total / limit) });
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
    getSellerStatsForAdmin,
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
    deletePackagePlan,
    getSpreadPackagePurchases
};
