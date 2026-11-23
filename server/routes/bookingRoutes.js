const express = require('express')
const { requireAuth } = require('../middleware/requireAuth')
const { getMyBookings, getBookingTicket, downloadBookingTicket, resendBookingConfirmation, checkInTicket, cancelBooking } = require('../controllers/bookingController')

const router = express.Router()
router.get('/me', requireAuth, getMyBookings)
router.get('/:bookingId/ticket', requireAuth, getBookingTicket)
router.get('/:bookingId/ticket.pdf', requireAuth, downloadBookingTicket)
router.post('/:bookingId/resend-confirmation', requireAuth, resendBookingConfirmation)
router.post('/check-in', requireAuth, checkInTicket)
router.patch('/:bookingId/cancel', requireAuth, cancelBooking)

module.exports = router
