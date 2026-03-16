const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Seller = require('../models/Seller');
const nodemailer = require('nodemailer');
const Order = require('../models/Order');

// Helper to calculate real-time store diagnostics
const getSellerDiagnostics = async (seller) => {
    try {
        const totalOrders = await Order.countDocuments({ seller_id: { $in: [seller._id, seller.id, String(seller._id), String(seller.id)] } });
        const completedOrders = await Order.countDocuments({ 
            seller_id: { $in: [seller._id, seller.id, String(seller._id), String(seller.id)] }, 
            status: { $regex: 'completed|delivered', $options: 'i' } 
        });
        
        const fulfillmentRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(0) : 100;
        
        return {
            fulfillment: `${fulfillmentRate}%`,
            rating: `${seller.ratings || 4.5}/5`,
            responseTime: '< 2 Hours',
            qualityScore: `${seller.store_health || 95}%`
        };
    } catch (error) {
        console.error('Diagnostics calculation error:', error);
        return {
            fulfillment: '100%',
            rating: '4.5/5',
            responseTime: '< 2 Hours',
            qualityScore: '95%'
        };
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Basic validation to avoid bcrypt crashes
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    try {
        const seller = await Seller.findOne({ email });

        if (seller) {
            // Support both hashed and plain text passwords (for seeded data)
            const isMatch = await seller.matchPassword(password) || seller.password === password;

            if (isMatch) {
                // Check if 2FA is enabled
                if (seller.settings && seller.settings.twoFactor) {
                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                    seller.otp = otp;
                    seller.otpExpires = Date.now() + 10 * 60 * 1000;
                    await seller.save();

                    return res.json({
                        requiresOTP: true,
                        email: seller.email,
                        message: 'Two-Factor Authentication is active.'
                    });
                }

                // Verify JWT_SECRET exists
                if (!process.env.JWT_SECRET) {
                    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
                    res.status(500);
                    throw new Error('Server configuration error: Security key missing');
                }

                const diagnostics = await getSellerDiagnostics(seller);

                res.json({
                    token: generateToken(seller._id),
                    user: {
                        _id: seller._id,
                        name: seller.name,
                        email: seller.email,
                        role: seller.role,
                        shop_name: seller.shop_name,
                        shop_logo: seller.shop_logo,
                        verified: seller.verified,
                        store_health: seller.store_health,
                        store_performance: seller.store_performance,
                        store_status: seller.store_status,
                        store_health_updated_at: seller.store_health_updated_at,
                        diagnostics,
                    }
                });
            } else {
                res.status(401);
                throw new Error('Invalid email or password');
            }
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        console.error('Login Error Details:', error);
        // Ensure we don't return 500 without a message
        if (res.statusCode === 200) res.status(500);
        throw error;
    }
});

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller) {
        res.status(404);
        throw new Error('User not found');
    }

    if (seller.otp === otp && seller.otpExpires > Date.now()) {
        // Clear OTP
        seller.otp = undefined;
        seller.otpExpires = undefined;
        await seller.save();

        res.json({
            _id: seller._id,
            name: seller.name,
            email: seller.email,
            role: seller.role,
            shop_name: seller.shop_name,
            shop_logo: seller.shop_logo,
            verified: seller.verified,
            store_health: seller.store_health,
            store_performance: seller.store_performance,
            store_status: seller.store_status,
            store_health_updated_at: seller.store_health_updated_at,
            diagnostics: await getSellerDiagnostics(seller),
            token: generateToken(seller._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }
});

// @desc    Register a new seller
// @route   POST /api/auth/register
// @access  Public
const RegCode = require('../models/RegCode');

// @desc    Register a new seller
// @route   POST /api/auth/register
// @access  Public
const registerSeller = asyncHandler(async (req, res) => {
    const { name, email, password, shop_name, trans_password, cert_type, invitation_code } = req.body;

    // Validate Invitation Code (DISABLED BY USER REQUEST)
    /*
    const validCode = await RegCode.findOne();
    if (!validCode || validCode.code !== invitation_code) {
        res.status(400);
        throw new Error('Invalid or expired invitation code.');
    }
    */

    const sellerExists = await Seller.findOne({ email });

    if (sellerExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Auto-generate a numeric ID if needed (to avoid unique constraint errors if schema requires it)
    const lastSeller = await Seller.findOne().sort({ id: -1 });
    const newId = lastSeller && lastSeller.id ? lastSeller.id + 1 : 1000;

    let cert_front = '';
    let cert_back = '';

    if (req.files) {
        if (req.files.cert_front) {
            const file = req.files.cert_front[0];
            cert_front = file.path.startsWith('http') ? file.path : '/uploads/' + file.filename;
        }
        if (req.files.cert_back) {
            const file = req.files.cert_back[0];
            cert_back = file.path.startsWith('http') ? file.path : '/uploads/' + file.filename;
        }
    }

    try {
        const seller = await Seller.create({
            id: newId,
            name,
            email,
            password,
            shop_name,
            trans_password,
            cert_type: cert_type || '',
            cert_front,
            cert_back,
            invitation_code,
        });

        if (seller) {
            res.status(201).json({
                token: generateToken(seller._id),
                user: {
                    _id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    role: seller.role,
                    shop_name: seller.shop_name,
                    shop_logo: seller.shop_logo,
                    verified: seller.verified,
                    store_health: seller.store_health,
                    store_performance: seller.store_performance,
                    store_status: seller.store_status,
                    store_health_updated_at: seller.store_health_updated_at,
                    diagnostics: await getSellerDiagnostics(seller),
                }
            });
        }
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(400);
        throw new Error('Registration failed: ' + err.message);
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.user._id);

    if (seller) {
        res.json({
            _id: seller._id,
            name: seller.name,
            email: seller.email,
            role: seller.role,
            shop_name: seller.shop_name,
            shop_logo: seller.shop_logo,
            verified: seller.verified,
            store_health: seller.store_health,
            store_performance: seller.store_performance,
            store_status: seller.store_status,
            store_health_updated_at: seller.store_health_updated_at,
            diagnostics: await getSellerDiagnostics(seller),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.user._id);

    if (seller) {
        seller.name = req.body.name || seller.name;
        seller.email = req.body.email || seller.email;
        seller.shop_name = req.body.shop_name || seller.shop_name;
        // Add other fields as needed (phone, address, etc. if added to model)

        if (req.body.password) {
            seller.password = req.body.password;
        }

        const updatedSeller = await seller.save();

        res.json({
            _id: updatedSeller._id,
            name: updatedSeller.name,
            email: updatedSeller.email,
            role: updatedSeller.role,
            shop_name: updatedSeller.shop_name,
            shop_logo: updatedSeller.shop_logo,
            verified: updatedSeller.verified,
            store_health: updatedSeller.store_health,
            store_performance: updatedSeller.store_performance,
            store_status: updatedSeller.store_status,
            store_health_updated_at: updatedSeller.store_health_updated_at,
            diagnostics: await getSellerDiagnostics(updatedSeller),
            token: generateToken(updatedSeller._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { authUser, registerSeller, getUserProfile, updateUserProfile, verifyOtp };
