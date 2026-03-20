const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ seller_id: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);

    const unreadCount = await Notification.countDocuments({ 
        seller_id: req.user._id, 
        read: false 
    });

    res.json({
        success: true,
        notifications,
        unreadCount
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.seller_id.toString() === req.user._id.toString()) {
        notification.read = true;
        await notification.save();
        res.json({ success: true, message: 'Notification marked as read' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { seller_id: req.user._id, read: false },
        { $set: { read: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
