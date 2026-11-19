const express = require('express')
const { requireAuth } = require('../middleware/requireAuth')
const { createOrder, verifyPayment } = require('../controllers/paymentController')

const router = express.Router()
router.post('/create-order', requireAuth, createOrder)
router.post('/verify', requireAuth, verifyPayment)
module.exports = router
