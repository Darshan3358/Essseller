const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrder,
    deleteOrder,
    payStorehouse
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById)
    .delete(protect, deleteOrder)
    .put(protect, updateOrder);

router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/pay-storehouse').put(protect, payStorehouse);

module.exports = router;
