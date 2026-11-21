const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const test = require('node:test')

test('confirms a captured Razorpay payment from a signed raw webhook payload', async () => {
    const previousSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret'

    const notificationService = require('../services/notificationService')
    const originalNotification = notificationService.sendBookingConfirmation
    const Booking = require('../models/Booking')
    const originalFindOneAndUpdate = Booking.findOneAndUpdate
    let confirmedBookingId
    let updateArguments

    notificationService.sendBookingConfirmation = async (bookingId) => {
        confirmedBookingId = bookingId
    }
    Booking.findOneAndUpdate = async (...args) => {
        updateArguments = args
        return { _id: 'booking-1' }
    }

    try {
        // Require after replacing the notification function: the controller
        // captures the dependency when it is loaded.
        delete require.cache[require.resolve('../controllers/paymentController')]
        const { razorpayWebhook } = require('../controllers/paymentController')
        const body = Buffer.from(JSON.stringify({
            event: 'payment.captured',
            payload: { payment: { entity: { order_id: 'order_123', id: 'pay_123' } } },
        }))
        const signature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex')
        const response = {
            statusCode: 200,
            body: undefined,
            status(code) { this.statusCode = code; return this },
            json(value) { this.body = value; return this },
            send(value) { this.body = value; return this },
        }

        await razorpayWebhook({ body, get: (name) => name === 'x-razorpay-signature' ? signature : '' }, response)

        assert.equal(response.statusCode, 200)
        assert.deepEqual(response.body, { received: true })
        assert.equal(updateArguments[0].razorpayOrderId, 'order_123')
        assert.equal(updateArguments[1].$set.razorpayPaymentId, 'pay_123')
        assert.equal(confirmedBookingId, 'booking-1')
    } finally {
        notificationService.sendBookingConfirmation = originalNotification
        Booking.findOneAndUpdate = originalFindOneAndUpdate
        if (previousSecret === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET
        else process.env.RAZORPAY_WEBHOOK_SECRET = previousSecret
        delete require.cache[require.resolve('../controllers/paymentController')]
    }
})
