const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const SellerProduct = require('../models/SellerProduct');
const APIFeatures = require('../utils/apiFeatures');

/**
 * Normalize legacy image paths stored in the DB.
 * Old products have bare filenames like "product_395.jpg".
 * New products have paths like "/api/products/image/image-123.jpg" or full URLs.
 * This converts bare filenames -> /uploads/<filename> so the browser can find them.
 */
const normalizeImagePath = (imgPath) => {
    if (!imgPath) return imgPath;
    // Already a full URL (http/https) or a proper path starting with / -> leave alone
    if (imgPath.startsWith('http') || imgPath.startsWith('/')) return imgPath;
    // Bare filename -> prepend /uploads/
    return `/uploads/${imgPath}`;
};

const normalizeProduct = (product) => {
    const obj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
    if (obj.image) obj.image = normalizeImagePath(obj.image);
    if (Array.isArray(obj.gallery)) {
        obj.gallery = obj.gallery.map(normalizeImagePath);
    }
    return obj;
};


// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    // Only exclude explicitly deleted products
    const queryCopy = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'keyword'];
    excludedFields.forEach(el => delete queryCopy[el]);

    // Handle initial filter (isDeleted)
    let filter = { isDeleted: { $ne: true }, ...queryCopy };

    // Explicitly handle boolean fields from query strings
    if (filter.isFeatured === 'true') filter.isFeatured = true;
    if (filter.isFeatured === 'false') filter.isFeatured = false;
    if (filter.inStorehouseCarousel === 'true') filter.inStorehouseCarousel = true;
    if (filter.inStorehouseCarousel === 'false') filter.inStorehouseCarousel = false;

    // Total Count for Pagination (before pagination is applied)
    const countFeatures = new APIFeatures(Product.find(filter), req.query).search().filter();
    const totalCount = await Product.countDocuments(countFeatures.query.getFilter());

    const limit = req.query.limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / limit);

    const features = new APIFeatures(Product.find(filter), req.query)
        .search()
        .filter()
        .sort()
        .paginate();

    const products = await features.query;

    res.json({
        success: true,
        count: products.length,
        totalCount,
        totalPages,
        data: products.map(normalizeProduct),
    });
});

// @desc    Get featured products for slider
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
    let products = await Product.find({ isDeleted: { $ne: true }, isFeatured: true }).limit(20);

    // Fallback block if admin hasn't selected any featured products yet
    if (products.length === 0) {
        products = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(10);
    }

    res.json({
        success: true,
        count: products.length,
        data: products.map(normalizeProduct),
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product && !product.isDeleted) {
        res.json({ success: true, data: normalizeProduct(product) });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, selling_price, category, brand } = req.body;

    let productData = {
        seller_id: req.user._id,
        name,
        description,
        price: Number(price),
        selling_price: Number(selling_price),
        profit: Number(req.body.profit) || 0,
        category,
        brand
    };

    const ProductImage = require('../models/ProductImage');

    // Handle single image
    if (req.files && req.files.image) {
        const file = req.files.image[0];
        const filename = `image-${Date.now()}-${file.originalname}`;
        await ProductImage.create({
            filename,
            imageData: file.buffer.toString('base64'),
            contentType: file.mimetype
        });
        productData.image = `/api/products/image/${filename}`;
    }

    // Handle gallery images
    if (req.files && req.files.gallery) {
        const galleryUrls = [];
        for (const file of req.files.gallery) {
            const filename = `gallery-${Date.now()}-${file.originalname}`;
            await ProductImage.create({
                filename,
                imageData: file.buffer.toString('base64'),
                contentType: file.mimetype
            });
            galleryUrls.push(`/api/products/image/${filename}`);
        }
        productData.gallery = galleryUrls;
    }

    const product = await Product.create(productData);

    res.status(201).json({
        success: true,
        data: product,
    });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller/Admin
const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Make sure user is product owner or admin
    if (product.seller_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized to update this product');
    }

    // Handle image updates in updateProduct if files are provided
    if (req.files) {
        const ProductImage = require('../models/ProductImage');
        if (req.files.image) {
            const file = req.files.image[0];
            const filename = `image-${Date.now()}-${file.originalname}`;
            await ProductImage.create({
                filename,
                imageData: file.buffer.toString('base64'),
                contentType: file.mimetype
            });
            req.body.image = `/api/products/image/${filename}`;
        }
        if (req.files.gallery) {
            const galleryUrls = [];
            for (const file of req.files.gallery) {
                const filename = `gallery-${Date.now()}-${file.originalname}`;
                await ProductImage.create({
                    filename,
                    imageData: file.buffer.toString('base64'),
                    contentType: file.mimetype
                });
                galleryUrls.push(`/api/products/image/${filename}`);
            }
            req.body.gallery = galleryUrls;
        }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.json({ success: true, data: product });
});

// @desc    Delete a product (Soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Seller/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Make sure user is product owner or admin
    if (product.seller_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized to delete this product');
    }

    product.isDeleted = true;
    await product.save();

    res.json({ success: true, message: 'Product removed' });
});

// @desc    Get logged-in seller's products with Pagination & Search (Handling Missing Products)
// @route   GET /api/products/my-products
// @access  Private/Seller
const getSellerProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword ? req.query.keyword.toLowerCase() : null;

    // 1. Find all SellerProduct entries for this seller
    const sellerId = req.user.id; // Custom Numeric ID
    const sellerObjectId = req.user._id; // ObjectId

    let query = {
        $or: [
            { seller_id: sellerId },
            { seller_id: String(sellerId) },
            { seller_id: sellerObjectId },
            { seller_id: String(sellerObjectId) }
        ]
    };

    // Get ALL linked product links
    const sellerProductsLink = await SellerProduct.find(query).sort({ created_at: -1 });

    if (!sellerProductsLink || sellerProductsLink.length === 0) {
        return res.json({
            success: true,
            count: 0,
            totalCount: 0,
            totalPages: 0,
            currentPage: page,
            data: []
        });
    }

    const productIds = sellerProductsLink.map(sp => sp.product_id);

    // 2. Fetch Actual Products (Bulk)
    // We fetch all potential matches to merge valid data
    const dbProducts = await Product.find({
        $or: [
            { _id: { $in: productIds.filter(id => mongoose.isValidObjectId(id)) } },
            { id: { $in: productIds } }
        ]
    });

    // Create a Lookup Map for O(1) access
    const productMap = new Map();
    dbProducts.forEach(p => {
        productMap.set(String(p._id), p);
        if (p.id) productMap.set(String(p.id), p);
    });

    // 3. Merge & Create Placeholders
    let combinedProducts = sellerProductsLink.map(link => {
        const linkIdStr = String(link.product_id);
        const product = productMap.get(linkIdStr);

        if (product) {
            return {
                ...product.toObject(),
                _id: product._id,
                id: product.id,
                link_id: link._id  // MongoDB _id of the SellerProduct document
            };
        } else {
            // Placeholder for Missing Product
            return {
                _id: mongoose.isValidObjectId(link.product_id) ? link.product_id : undefined,
                id: link.product_id, // Show the ID that is missing
                name: `Product Unavailable (ID: ${link.product_id})`,
                description: 'This product is no longer available in the main catalog.',
                price: 0,
                selling_price: 0,
                profit: 0,
                category: 'Unknown',
                image: '', // Placeholder image could be handled on frontend
                status: 'Unavailable',
                link_id: link.id,
                is_missing: true
            };
        }
    });

    // 4. Client-side Search (In-Memory)
    if (keyword) {
        combinedProducts = combinedProducts.filter(p =>
            (p.name && p.name.toLowerCase().includes(keyword)) ||
            (p.category && p.category.toLowerCase().includes(keyword)) ||
            (p.id && String(p.id).includes(keyword))
        );
    }

    // 5. Client-side Pagination
    const totalCount = combinedProducts.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Slice for current page
    const paginatedProducts = combinedProducts.slice(skip, skip + limit);

    res.json({
        success: true,
        count: paginatedProducts.length,
        totalCount,
        totalPages,
        currentPage: page,
        data: paginatedProducts.map(normalizeProduct)
    });
});

// @desc    Add a product to seller's store (my products)
// @route   POST /api/products/add-to-store
// @access  Private/Seller
const addToMyStore = asyncHandler(async (req, res) => {
    const { product_id } = req.body;

    if (!product_id) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    // Check if product exists
    const product = await Product.findOne({
        $or: [
            { _id: mongoose.isValidObjectId(product_id) ? product_id : null },
            { id: product_id }
        ]
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found in Storehouse');
    }

    const sellerId = req.user._id;

    // Check how many products the seller has already added
    const currentCount = await SellerProduct.countDocuments({ seller_id: req.user._id });

    // Check the seller's plan product limit
    const Package = require('../models/Package');
    const latestPackage = await Package.findOne({ seller_id: sellerId, status: 1 }).sort({ created_at: -1 });
    const productLimit = latestPackage ? latestPackage.product_limit : 10; // Default free plan = 10

    if (currentCount >= productLimit) {
        res.status(400);
        throw new Error(`Product limit reached. Your plan allows ${productLimit} products. Please upgrade your package.`);
    }

    // We prefer using the same ID type as found in Product.
    const linkProductId = product._id;

    try {
        const newLink = await SellerProduct.create({
            seller_id: sellerId,
            product_id: linkProductId
        });

        return res.status(201).json({
            success: true,
            message: 'Product added to your store',
            data: newLink
        });
    } catch (err) {
        // Handle MongoDB duplicate key error (compound index)
        if (err.code === 11000) {
            res.status(400);
            throw new Error('Product already added to your store');
        }
        throw err;
    }
});

// @desc    Remove a product from seller's store (delete the SellerProduct link)
// @route   DELETE /api/products/from-store/:linkId
// @access  Private/Seller
const removeFromStore = asyncHandler(async (req, res) => {
    const linkId = req.params.productId;
    const sellerId = req.user._id;

    let deleted = false;

    // Strategy 1: try deleting by the SellerProduct's own _id (most reliable)
    if (mongoose.isValidObjectId(linkId)) {
        const result = await SellerProduct.deleteOne({
            _id: new mongoose.Types.ObjectId(linkId)
        });
        if (result.deletedCount > 0) deleted = true;
    }

    // Strategy 2: try matching as product_id (ObjectId)
    if (!deleted && mongoose.isValidObjectId(linkId)) {
        const result = await SellerProduct.deleteOne({
            product_id: new mongoose.Types.ObjectId(linkId)
        });
        if (result.deletedCount > 0) deleted = true;
    }

    // Strategy 3: try matching as product_id (string/number)
    if (!deleted) {
        const result = await SellerProduct.deleteOne({
            product_id: linkId
        });
        if (result.deletedCount > 0) deleted = true;
    }

    if (!deleted) {
        res.status(404);
        throw new Error('Product link not found in your store');
    }

    res.json({ success: true, message: 'Product removed from your store' });
});

// @desc    Serve product image from database
// @route   GET /api/products/image/:filename
// @access  Public
const serveProductImage = asyncHandler(async (req, res) => {
    const filename = req.params.filename;
    const ProductImage = require('../models/ProductImage');
    const image = await ProductImage.findOne({ filename });

    if (!image) {
        res.status(404);
        throw new Error('Image not found');
    }

    const buffer = Buffer.from(image.imageData, 'base64');
    res.set('Content-Type', image.contentType);
    res.send(buffer);
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    addToMyStore,
    removeFromStore,
    getFeaturedProducts,
    serveProductImage
};

