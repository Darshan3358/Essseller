const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    trans_password: {
        type: String,
        required: false, // Make optional if not essential for all
    },
    shop_name: {
        type: String,
        required: true,
    },
    shop_logo: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['admin', 'seller'],
        default: 'seller',
    },
    cert_type: {
        type: String,
        enum: ['id_card', 'passport', 'driving_license', ''],
        default: '',
    },
    cert_front: {
        type: String,
        default: '',
    },
    cert_back: {
        type: String,
        default: '',
    },
    verified: {
        type: Number, // 0 = pending, 1 = verified
        default: 0,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    views: {
        type: Number,
        default: 0,
    },
    used_views: {
        type: Number,
        default: 0,
    },
    freeze: {
        type: Number, // 0 = not frozen, 1 = frozen
        default: 0,
    },
    invitation_code: {
        type: String,
        required: false,
    },
    otp: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Date,
        required: false
    },
    wallet_balance: {
        type: Number,
        default: 0,
    },
    guarantee_balance: {
        type: Number,
        default: 0,
    },
    language: {
        type: String,
        default: 'English (US)',
    },
    settings: {
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' },
        theme: { type: String, default: 'light' },
        notifications: {
            orders: { type: Boolean, default: true },
            stock: { type: Boolean, default: true },
            reviews: { type: Boolean, default: false },
            reports: { type: Boolean, default: false },
        },
        twoFactor: { type: Boolean, default: false },
    },
    bank_details: {
        bank_name: { type: String, default: '' },
        account_number: { type: String, default: '' },
        account_name: { type: String, default: '' },
        ifsc_code: { type: String, default: '' },
        upi_id: { type: String, default: '' },
    },
    store_health: {
        type: Number,
        default: 95,
    },
    store_performance: {
        type: String,
        default: 'Excellent',
    },
    store_status: {
        type: String,
        default: 'ACTIVE',
    },
    store_health_updated_at: {
        type: Date,
        default: Date.now,
    },
    views: {
        type: Number,
        default: 0
    },
    used_views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
sellerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Match transaction password
sellerSchema.methods.matchTransPassword = async function (enteredPassword) {
    if (!this.trans_password || this.trans_password.trim() === '') return false;

    // Check if it's plaintext (older records migration)
    const isString = typeof this.trans_password === 'string';
    if (isString && !this.trans_password.startsWith('$2a$') && !this.trans_password.startsWith('$2b$')) {
        return enteredPassword === this.trans_password;
    }

    return await bcrypt.compare(enteredPassword, this.trans_password);
};

// Encrypt password using bcrypt
// NOTE: In Mongoose 9.x, async pre-save hooks must NOT call next() — the returned
// promise automatically signals completion. Calling next() throws "next is not a function".
sellerSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('trans_password') && this.trans_password && this.trans_password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        this.trans_password = await bcrypt.hash(this.trans_password, salt);
    }
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
