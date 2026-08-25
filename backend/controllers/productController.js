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
    if (!imgPath || typeof imgPath !== 'string') return '';
    // Already a full URL (http/https) or proper path starting with / → leave alone
    if (imgPath.startsWith('http') || imgPath.startsWith('/')) return imgPath;
    // New-style DB-stored images have filenames like: image-<timestamp>-<name>.ext
    // or gallery-<timestamp>-<name>.ext → serve via /api/products/image/:filename
    if (imgPath.startsWith('image-') || imgPath.startsWith('gallery-')) {
        return `/api/products/image/${imgPath}`;
    }
    // Local product_images files: named like "1743859072_38fcfd6cf1e7933dffad.jpg"
    // Match: starts with digits followed by underscore and hex chars
    if (/^\d+_[a-f0-9]+\.(jpg|jpeg|png|webp|gif)$/i.test(imgPath)) {
        return `/product_images/${imgPath}`;
    }
    // Legacy bare filename (e.g. product_395.jpg) → /uploads/<filename>
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

    // Total Count and Data fetch in parallel
    const countFeatures = new APIFeatures(Product.find(filter).lean(), req.query).search().filter();
    const features = new APIFeatures(Product.find(filter).lean(), req.query)
        .search()
        .filter()
        .sort()
        .paginate();

    const [totalCount, products] = await Promise.all([
        Product.countDocuments(countFeatures.query.getFilter()),
        features.query
    ]);

    const limit = req.query.limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / limit);

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
    let products = await Product.find({ isDeleted: { $ne: true }, isFeatured: true }).limit(20).lean();

    // Fallback block if admin hasn't selected any featured products yet
    if (products.length === 0) {
        products = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(10).lean();
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
    const product = await Product.findById(req.params.id).lean();

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
        
        let buffer;
        if (file.buffer) {
            buffer = file.buffer;
        } else if (file.path && !file.path.startsWith('http')) {
            const fs = require('fs');
            buffer = fs.readFileSync(file.path);
        }

        if (file.path && file.path.startsWith('http')) {
            productData.image = file.path;
        } else if (buffer) {
            await ProductImage.create({
                filename,
                imageData: buffer.toString('base64'),
                contentType: file.mimetype
            });
            productData.image = `/api/products/image/${filename}`;
        }
    }

    // Handle gallery images
    if (req.files && req.files.gallery) {
        const galleryUrls = [];
        for (const file of req.files.gallery) {
            const filename = `gallery-${Date.now()}-${file.originalname}`;
            let buffer;
            if (file.buffer) {
                buffer = file.buffer;
            } else if (file.path && !file.path.startsWith('http')) {
                const fs = require('fs');
                buffer = fs.readFileSync(file.path);
            }

            if (file.path && file.path.startsWith('http')) {
                galleryUrls.push(file.path);
            } else if (buffer) {
                await ProductImage.create({
                    filename,
                    imageData: buffer.toString('base64'),
                    contentType: file.mimetype
                });
                galleryUrls.push(`/api/products/image/${filename}`);
            }
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
            
            let buffer;
            if (file.buffer) {
                buffer = file.buffer;
            } else if (file.path && !file.path.startsWith('http')) {
                const fs = require('fs');
                buffer = fs.readFileSync(file.path);
            }

            if (file.path && file.path.startsWith('http')) {
                req.body.image = file.path;
            } else if (buffer) {
                await ProductImage.create({
                    filename,
                    imageData: buffer.toString('base64'),
                    contentType: file.mimetype
                });
                req.body.image = `/api/products/image/${filename}`;
            }
        }
        if (req.files.gallery) {
            const galleryUrls = [];
            for (const file of req.files.gallery) {
                const filename = `gallery-${Date.now()}-${file.originalname}`;
                let buffer;
                if (file.buffer) {
                    buffer = file.buffer;
                } else if (file.path && !file.path.startsWith('http')) {
                    const fs = require('fs');
                    buffer = fs.readFileSync(file.path);
                }

                if (file.path && file.path.startsWith('http')) {
                    galleryUrls.push(file.path);
                } else if (buffer) {
                    await ProductImage.create({
                        filename,
                        imageData: buffer.toString('base64'),
                        contentType: file.mimetype
                    });
                    galleryUrls.push(`/api/products/image/${filename}`);
                }
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
const sellerProductCache = new Map();
const SELLER_PRODUCT_CACHE_DURATION = 30 * 1000; // 30 seconds

const getSellerProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const keyword = req.query.keyword ? req.query.keyword.toLowerCase() : null;
    const sellerId = req.user.id;

    const cacheKey = `${sellerId}_${page}_${limit}_${keyword}`;
    const cached = sellerProductCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < SELLER_PRODUCT_CACHE_DURATION)) {
        return res.json(cached.data);
    }
    const sellerObjectId = req.user._id; // ObjectId

    const sellerIdFilter = [
        sellerId,
        String(sellerId),
        sellerObjectId,
        String(sellerObjectId)
    ].filter(v => v !== undefined && v !== null);

    let query = { seller_id: { $in: sellerIdFilter } };

    // Get ALL linked product links
    const sellerProductsLink = await SellerProduct.find(query).sort({ created_at: -1 }).lean();

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
    }).lean();

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
            const normalized = normalizeProduct(product);
            return {
                ...normalized,
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

    const skip = (page - 1) * limit;

    // 5. Client-side Pagination
    const totalCount = combinedProducts.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Slice for current page
    const paginatedProducts = combinedProducts.slice(skip, skip + limit);

    const responseData = {
        success: true,
        count: paginatedProducts.length,
        totalCount,
        totalPages,
        currentPage: page,
        data: paginatedProducts.map(normalizeProduct)
    };

    // Save to Cache
    sellerProductCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    res.json(responseData);
});

// @desc    Get just the IDs of logged-in seller's products (High Performance)
// @route   GET /api/products/my-product-ids
// @access  Private/Seller
const getSellerProductIds = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    const sellerObjectId = req.user._id;

    const sellerIdFilter = [
        sellerId,
        String(sellerId),
        sellerObjectId,
        String(sellerObjectId)
    ].filter(v => v !== undefined && v !== null);

    let query = { seller_id: { $in: sellerIdFilter } };

    // Only fetch the product_id field
    const sellerProductsLink = await SellerProduct.find(query, 'product_id').lean();
    
    // Return flat array of string IDs
    const ids = sellerProductsLink.map(link => String(link.product_id));
    
    res.json({
        success: true,
        data: ids
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
    const sellerNumericId = req.user.id; // numeric id field

    const sellerIdFilter = [
        sellerId,
        String(sellerId),
        sellerNumericId,
        String(sellerNumericId)
    ].filter(v => v !== undefined && v !== null);

    // Check how many products the seller has already added
    const currentCount = await SellerProduct.countDocuments({
        seller_id: { $in: sellerIdFilter }
    });

    // Check the seller's plan product limit
    // Sort by product_limit DESC to get the best (highest) active package
    const Package = require('../models/Package');
    const bestPackage = await Package.findOne({
        seller_id: { $in: sellerIdFilter },
        status: 1
    }).sort({ product_limit: -1 });
    const productLimit = bestPackage ? bestPackage.product_limit : 10; // Default free plan = 10

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

// @desc    Get all unique categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category', { isDeleted: { $ne: true } });
    res.json({ success: true, data: categories });
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    getSellerProductIds,
    addToMyStore,
    removeFromStore,
    getFeaturedProducts,
    serveProductImage,
    getProductCategories,
    normalizeImagePath,
    normalizeProduct
};

