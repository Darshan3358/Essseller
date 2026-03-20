const mongoose = require('mongoose');
const Seller = require('../models/Seller');
const PaymentDetails = require('../models/PaymentDetails');
const Product = require('../models/Product');
const Order = require('../models/Order');
const GuaranteeMoney = require('../models/GuaranteeMoney');

const SellerProduct = require('../models/SellerProduct');
const ShopProfile = require('../models/ShopProfile');
const Package = require('../models/Package');
const PackagePlan = require('../models/PackagePlan');
const { getAvailableBalance } = require('../utils/wallet');

// @desc    Get seller dashboard statistics
// @route   GET /api/sellers/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const seller = await Seller.findById(sellerId);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // --- Consistent ID Matching Logic ---
        // Some collections store seller_id as ObjectId, some as Number (the 'id' field), some as String.
        // We catch all possibilities here.
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

        // 2. Total Orders (assigned to this seller)
        const totalOrders = await Order.countDocuments({
            seller_id: { $in: sellerIdFilter }
        });

        // 3. Total Sales (Confirmed/Completed orders volume)
        // More robust aggregation: filter out empty totals before converting
        const salesResult = await Order.aggregate([
            {
                $match: {
                    seller_id: { $in: sellerIdFilter },
                    status: { $regex: 'pending|processing|delivered|shipped', $options: 'i' }
                }
            },
            {
                $project: {
                    order_total_val: {
                        $cond: {
                            if: { $and: [{ $ne: ["$order_total", ""] }, { $ne: ["$order_total", null] }] },
                            then: { $toDouble: "$order_total" },
                            else: 0
                        }
                    }
                }
            },
            { $group: { _id: null, total: { $sum: "$order_total_val" } } }
        ]);
        const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;

        // 4. Guarantee Money (Sum of approved records)
        // Linking by seller.id which is the numeric ID used in GuaranteeMoney collection
        const guaranteeResult = await GuaranteeMoney.aggregate([
            { $match: { seller_id: { $in: [seller.id, String(seller.id)] }, status: 1 } },
            { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ["$amount", 0] } } } } }
        ]);
        const guaranteeMoney = guaranteeResult.length > 0 ? (guaranteeResult[0].total || 0) : 0;

        // 5. Package & Product Limits
        // Find ALL active packages and pick the one with the HIGHEST product_limit
        const activePackages = await Package.find({ seller_id: seller._id, status: 1 }).sort({ product_limit: -1 });
        const activePackage = activePackages[0] || null;
        
        // Find corresponding PackagePlan to get features
        let planFeatures = [];
        if (activePackage) {
            const plan = await PackagePlan.findOne({ name: activePackage.type });
            if (plan) {
                planFeatures = plan.features || [];
            }
        }

        const productLimit = activePackage ? activePackage.product_limit : 0;
        const remainingProducts = Math.max(0, productLimit - totalProducts);

        // 6. Category-wise Counts
        // First get all items to get their product detail categories
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

        const availableBalance = await getAvailableBalance(seller._id);

        const shopProfile = await ShopProfile.findOne({ seller_id: sellerId });

        // Calculate specific time-based stats
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

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
                        sales: { $sum: { $toDouble: "$order_total" } },
                        cost: { $sum: { $toDouble: "$cost_amount" } }
                    }
                }
            ]);
            return res.length > 0 ? res[0] : { sales: 0, cost: 0 };
        };

        const todayData = await getSalesForPeriod(startOfToday);
        const thisMonthData = await getSalesForPeriod(startOfMonth);
        const lastMonthData = await getSalesForPeriod(startOfLastMonth, startOfMonth);

        // Fetch all-time profit
        const allTimeProfitResult = await Order.aggregate([
            {
                $match: {
                    seller_id: { $in: sellerIdFilter },
                    status: { $regex: 'processing|shipped|completed|delivered', $options: 'i' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: { $toDouble: "$order_total" } },
                    totalCost: { $sum: { $toDouble: "$cost_amount" } }
                }
            }
        ]);
        const allTimeSales = allTimeProfitResult.length > 0 ? allTimeProfitResult[0].totalSales : 0;
        const allTimeCost = allTimeProfitResult.length > 0 ? allTimeProfitResult[0].totalCost : 0;
        const netProfit = Math.max(0, allTimeSales - allTimeCost);
        const netProfitMargin = allTimeSales > 0 ? ((netProfit / allTimeSales) * 100).toFixed(1) : 0;

        // 7. Dynamic Chart Data (Last X Days)
        const days = parseInt(req.query.days) || 7;
        const chartData = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        // Fetch all stats for the period in one go
        const rawStatsResult = await Order.aggregate([
            {
                $match: {
                    seller_id: { $in: sellerIdFilter },
                    status: { $regex: 'pending|processing|shipped|completed|delivered', $options: 'i' },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: { $toDouble: { $ifNull: ["$order_total", 0] } } },
                    profit: { $sum: { $subtract: [{ $toDouble: { $ifNull: ["$order_total", 0] } }, { $toDouble: { $ifNull: ["$cost_amount", 0] } }] } },
                    orders: { $sum: 1 }
                }
            }
        ]);

        const statsMap = {};
        rawStatsResult.forEach(item => { statsMap[item._id] = item; });

        // Decide grouping interval
        const interval = days > 30 ? (days === 180 ? 7 : 30) : 1;
        const loops = Math.ceil(days / interval);

        for (let i = loops - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (i * interval));
            date.setHours(0, 0, 0, 0);

            let daySales = 0, dayProfit = 0, dayOrders = 0;
            
            // Sum up stats for the interval block
            for (let j = 0; j < interval; j++) {
                const d = new Date(date);
                d.setDate(d.getDate() + j);
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
                label = date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (days <= 30) {
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short', year: days > 180 ? '2-digit' : undefined });
            }
            
            chartData.push({
                date: label,
                sales: Math.round(daySales),
                profit: Math.max(0, Math.round(dayProfit)),
                orders: dayOrders,
                aov: dayOrders > 0 ? Math.round(daySales / dayOrders) : 0
            });
        }

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalSales: allTimeSales,
                todaySales: todayData.sales,
                thisMonthSales: thisMonthData.sales,
                lastMonthSales: lastMonthData.sales,
                netProfit,
                netProfitMargin,
                guaranteeMoney: seller.guarantee_balance || guaranteeMoney,
                mainWallet: availableBalance,
                productLimit,
                remainingProducts,
                planName: activePackage ? activePackage.type : 'N/A',
                planFeatures, // New field for frontend
                views: seller.views || productLimit || 0,
                used_views: seller.used_views || totalProducts,
                remaining_views: Math.max(0, (seller.views || productLimit || 0) - (seller.used_views || totalProducts)),
                categoryCounts,
                chartData,
                shopLogo: shopProfile ? shopProfile.shop_logo : ''
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Public/Admin
exports.getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({}).sort({ createdAt: -1 });

        const sellersWithDetails = await Promise.all(sellers.map(async (seller) => {
            const payment = await PaymentDetails.findOne({ seller_id: seller._id });
            return {
                ...seller.toObject(),
                payment: payment || {
                    bank_name: 'N/A',
                    account_name: 'N/A',
                    account_number: 'N/A',
                    routing_number: 'N/A'
                }
            };
        }));

        res.status(200).json({
            success: true,
            count: sellers.length,
            sellers: sellersWithDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get details for a specific seller
// @route   GET /api/sellers/:id
// @access  Public/Admin
exports.getSellerById = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }
        const payment = await PaymentDetails.findOne({ seller_id: seller._id });

        res.status(200).json({
            success: true,
            seller: {
                ...seller.toObject(),
                payment: payment || {}
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update seller details
// @route   PUT /api/sellers/:id
// @access  Private/Admin
exports.updateSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const {
            name, email, password, shop_name, freeze,
            bank_name, account_name, account_number, routing_number,
            usdt_link, usdt_address
        } = req.body;

        const seller = await Seller.findById(sellerId);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // Update Seller Fields
        if (name) seller.name = name;
        if (email) seller.email = email;
        if (shop_name) seller.shop_name = shop_name;
        if (typeof freeze !== 'undefined') seller.freeze = freeze;

        // Password update (will be hashed by pre-save hook if modified)
        if (password && password.trim() !== '') {
            seller.password = password;
        }

        await seller.save();

        // Update Payment Details
        let payment = await PaymentDetails.findOne({ seller_id: seller._id });

        if (!payment) {
            payment = new PaymentDetails({ seller_id: seller._id });
        }

        if (bank_name) payment.bank_name = bank_name;
        if (account_name) payment.account_name = account_name;
        if (account_number) payment.account_number = account_number;
        if (routing_number) payment.routing_number = routing_number;
        if (usdt_link) payment.usdt_link = usdt_link;
        if (usdt_address) payment.usdt_address = usdt_address;

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Seller updated successfully',
            seller: {
                ...seller.toObject(),
                payment
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new seller
// @route   POST /api/sellers
// @access  Private/Admin
exports.createSeller = async (req, res) => {
    try {
        const {
            name, email, password, trans_password, shop_name,
            cert_type, ratings, views
        } = req.body;

        const sellerExists = await Seller.findOne({ email });

        if (sellerExists) {
            return res.status(400).json({ success: false, message: 'Seller already exists with this email' });
        }

        let cert_front = '';
        let cert_back = '';

        if (req.files) {
            if (req.files.cert_front) {
                cert_front = `/uploads/${req.files.cert_front[0].filename}`;
            }
            if (req.files.cert_back) {
                cert_back = `/uploads/${req.files.cert_back[0].filename}`;
            }
        }

        const seller = await Seller.create({
            name,
            email,
            password,
            trans_password,
            shop_name,
            cert_type,
            cert_front,
            cert_back,
            ratings: ratings || 0,
            views: views || 0,
            verified: 1, // Auto-verify if created by admin
        });

        if (seller) {
            // Create empty payment details for the new seller
            await PaymentDetails.create({ seller_id: seller._id });

            res.status(201).json({
                success: true,
                message: 'Seller created successfully',
                seller
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid seller data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Get Shop Settings
// @route   GET /api/sellers/shop-settings
// @access  Private/Seller
exports.getShopSettings = async (req, res) => {
    try {
        const sellerId = req.user._id;
        let shopProfile = await ShopProfile.findOne({ seller_id: sellerId });

        if (!shopProfile) {
            // Return default/empty structure if not found
            return res.status(200).json({
                success: true,
                data: {
                    shop_name: req.user.shop_name || '', // Fallback to seller's shop_name
                    shop_logo: '',
                    shop_contact: '',
                    shop_address: '',
                    shop_metatitle: '',
                    shop_metadesc: '',
                    language: req.user.language || 'English (US)',
                    settings: req.user.settings || {
                        currency: 'USD',
                        timezone: 'UTC',
                        theme: 'light',
                        notifications: { orders: true, stock: true, reviews: false, reports: false },
                        twoFactor: false
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...(shopProfile ? shopProfile.toObject() : {}),
                language: req.user.language || 'English (US)',
                settings: req.user.settings || {
                    currency: 'USD',
                    timezone: 'UTC',
                    theme: 'light',
                    notifications: { orders: true, stock: true, reviews: false, reports: false },
                    twoFactor: false
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Shop Settings
// @route   PUT /api/sellers/shop-settings
// @access  Private/Seller
exports.updateShopSettings = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const {
            shop_name,
            shop_contact,
            shop_address,
            shop_metatitle,
            shop_metadesc,
            language,
            settings
        } = req.body;

        // Prepare updates for main Seller model to avoid validation errors with missing fields (like password)
        const sellerUpdates = {};
        if (language) sellerUpdates.language = language;
        if (settings) {
            // Parse settings if it's a string (though it should be parsed by express already)
            const parsedSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
            sellerUpdates.settings = { ...(req.user.settings || {}), ...parsedSettings };
        }
        if (shop_name) sellerUpdates.shop_name = shop_name;
        
        let shop_logo = '';
        if (req.files && req.files.shop_logo) {
            const file = req.files.shop_logo[0];
            // If using Cloudinary, file.path is the full URL
            // If using local storage, file.path is the local path (needs to be transformed)
            shop_logo = (file.path && typeof file.path === 'string' && file.path.startsWith('http')) 
                ? file.path 
                : `/uploads/${file.filename}`;
            sellerUpdates.shop_logo = shop_logo;
        }

        if (Object.keys(sellerUpdates).length > 0) {
            await Seller.findByIdAndUpdate(sellerId, { $set: sellerUpdates });
        }

        let shopProfile = await ShopProfile.findOne({ seller_id: sellerId });

        if (shopProfile) {
            // Update
            shopProfile.shop_name = shop_name || shopProfile.shop_name;
            shopProfile.shop_contact = shop_contact || shopProfile.shop_contact;
            shopProfile.shop_address = shop_address || shopProfile.shop_address;
            shopProfile.shop_metatitle = shop_metatitle || shopProfile.shop_metatitle;
            shopProfile.shop_metadesc = shop_metadesc || shopProfile.shop_metadesc;

            if (shop_logo) {
                shopProfile.shop_logo = shop_logo;
            }

            await shopProfile.save();
        } else {
            // Create
            shopProfile = await ShopProfile.create({
                seller_id: sellerId,
                shop_name: shop_name || req.user.shop_name,
                shop_contact: shop_contact || '',
                shop_address: shop_address || '',
                shop_metatitle: shop_metatitle || '',
                shop_metadesc: shop_metadesc || '',
                shop_logo: shop_logo || ''
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shop settings updated successfully',
            data: shopProfile
        });

    } catch (error) {
        console.error('Update Shop Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

// @desc    Update password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const seller = await Seller.findById(req.user._id);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        if (!(await seller.matchPassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Invalid current password' });
        }

        seller.password = newPassword;
        await seller.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Transaction Password
// @route   PUT /api/sellers/transaction-password
// @access  Private
exports.updateTransactionPassword = async (req, res) => {
    try {
        const { currentPassword, newTransactionPassword } = req.body;
        const seller = await Seller.findById(req.user._id);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // Must verify current login password to change transaction password
        if (!(await seller.matchPassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Invalid current login password' });
        }

        seller.trans_password = newTransactionPassword;
        await seller.save();

        res.status(200).json({
            success: true,
            message: 'Transaction password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getSellers: exports.getSellers,
    getSellerById: exports.getSellerById,
    getDashboardStats: exports.getDashboardStats,
    updateSeller: exports.updateSeller,
    createSeller: exports.createSeller,
    getShopSettings: exports.getShopSettings,
    updateShopSettings: exports.updateShopSettings,
    updateTransactionPassword: exports.updateTransactionPassword,
    updatePassword: exports.updatePassword
};
