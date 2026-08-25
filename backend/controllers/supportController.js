const asyncHandler = require('express-async-handler');
const SupportTicket = require('../models/SupportTicket');

// @desc    Get all tickets for logged in seller
// @route   GET /api/support
// @access  Private/Seller
const getMyTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({ seller_id: req.user._id }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: tickets,
    });
});

// @desc    Create new support ticket
// @route   POST /api/support
// @access  Private/Seller
const createTicket = asyncHandler(async (req, res) => {
    const { subject, description, priority } = req.body;

    const ticket = await SupportTicket.create({
        seller_id: req.user._id,
        subject,
        description,
        priority: priority || 'Medium',
        status: 'Open'
    });

    res.status(201).json({
        success: true,
        data: ticket,
    });
});

// @desc    Get ticket by ID
// @route   GET /api/support/:id
// @access  Private/Seller
const getTicketById = asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, seller_id: req.user._id });

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    res.json({
        success: true,
        data: ticket,
    });
});

module.exports = {
    getMyTickets,
    createTicket,
    getTicketById,
};
