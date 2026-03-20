const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 5 }
    ]), createProduct);

router.route('/my-products').get(protect, getSellerProducts);
router.route('/featured').get(getFeaturedProducts);
router.route('/image/:filename').get(serveProductImage);
router.route('/add-to-store').post(protect, addToMyStore);
router.route('/from-store/:productId').delete(protect, removeFromStore);

router.route('/:id')
    .get(getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
