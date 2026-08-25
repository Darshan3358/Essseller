const Notification = require('../models/Notification');

const createNotification = async ({ seller_id, title, message, type, link }) => {
    try {
        await Notification.create({
            seller_id,
            title,
            message,
            type: type || 'general',
            link: link || ''
        });
        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
};

module.exports = createNotification;
