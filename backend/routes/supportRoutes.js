const express = require('express');
const router = express.Router();
const { getMyTickets, createTicket, getTicketById } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMyTickets)
    .post(protect, createTicket);

router.route('/:id')
    .get(protect, getTicketById);

module.exports = router;
