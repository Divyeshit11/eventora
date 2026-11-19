const express = require('express')
const { requireAuth } = require('../middleware/requireAuth')
const { getMyBookings, cancelBooking } = require('../controllers/bookingController')

const router = express.Router()
router.get('/me', requireAuth, getMyBookings)
router.patch('/:bookingId/cancel', requireAuth, cancelBooking)

module.exports = router
