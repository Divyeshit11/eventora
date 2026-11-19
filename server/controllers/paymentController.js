const crypto = require('crypto')
const Razorpay = require('razorpay')
const mongoose = require('mongoose')
const Booking = require('../models/Booking')
const Event = require('../models/Event')
const { sendBookingConfirmation } = require('../services/notificationService')

const RESERVATION_MINUTES = 15

function signaturesMatch(expected, received) {
    const expectedBuffer = Buffer.from(expected)
    const receivedBuffer = Buffer.from(String(received || ''))
    return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

function paymentConfig() {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) throw new Error('Razorpay credentials are not configured')
    return { keyId, keySecret, client: new Razorpay({ key_id: keyId, key_secret: keySecret }) }
}

async function releaseExpiredReservations() {
    const expired = await Booking.find({ status: 'pending', reservationExpiresAt: { $lt: new Date() } })
    for (const candidate of expired) {
        const released = await Booking.findOneAndUpdate(
            { _id: candidate._id, status: 'pending', reservationExpiresAt: { $lt: new Date() } },
            { $set: { status: 'failed' } },
            { new: true }
        )
        if (released) await Event.updateOne({ _id: released.event }, { $inc: { ticketsSold: -released.quantity } })
    }
}

async function createOrder(req, res) {
    const eventId = req.body?.eventId
    const quantity = Number(req.body?.quantity)
    if (!mongoose.isValidObjectId(eventId)) return res.status(400).json({ success: false, message: 'Invalid event ID' })
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return res.status(400).json({ success: false, message: 'Ticket quantity must be a whole number from 1 to 10' })

    try {
        const { keyId, client } = paymentConfig()
        await releaseExpiredReservations()
        const event = await Event.findOneAndUpdate(
            { _id: eventId, $expr: { $lte: [{ $add: ['$ticketsSold', quantity] }, '$ticketCapacity'] } },
            { $inc: { ticketsSold: quantity } }, { new: true }
        )
        if (!event) return res.status(409).json({ success: false, message: 'This event is sold out or does not exist' })

        const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000)
        let booking
        try {
            booking = await Booking.create({ user: req.auth.sub, event: event._id, quantity, unitPrice: event.price, totalPrice: event.price * quantity, reservationExpiresAt: expiresAt })
            const order = await client.orders.create({
                amount: Math.round(booking.totalPrice * 100), currency: 'INR', receipt: `booking_${booking._id}`, notes: { bookingId: String(booking._id), eventId: String(event._id), userId: req.auth.sub },
            })
            booking.razorpayOrderId = order.id
            await booking.save()
            return res.status(201).json({ success: true, data: { bookingId: booking._id, orderId: order.id, amount: order.amount, currency: order.currency, keyId, expiresAt } })
        } catch (error) {
            if (booking) await Booking.deleteOne({ _id: booking._id })
            await Event.updateOne({ _id: eventId }, { $inc: { ticketsSold: -quantity } })
            throw error
        }
    } catch (error) {
        console.error('Failed to create payment order:', error.message)
        return res.status(503).json({ success: false, message: 'Unable to start payment. Please try again.' })
    }
}

async function markPaymentPaid({ orderId, paymentId, signature }) {
    const { keySecret } = paymentConfig()
    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
    const valid = signaturesMatch(expected, signature)
    if (!valid) throw new Error('Invalid payment signature')
    const booking = await Booking.findOneAndUpdate(
        { razorpayOrderId: orderId, status: 'pending', reservationExpiresAt: { $gt: new Date() } },
        { $set: { status: 'paid', razorpayPaymentId: paymentId, paymentVerifiedAt: new Date(), ticketCode: `EVT-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } },
        { new: true }
    )
    if (!booking) {
        const alreadyPaid = await Booking.findOne({ razorpayOrderId: orderId, razorpayPaymentId: paymentId, status: 'paid' })
        if (alreadyPaid) return alreadyPaid
        throw new Error('Payment booking is unavailable or already processed')
    }
    return booking
}

async function verifyPayment(req, res) {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {}
    if (![orderId, paymentId, signature].every(Boolean)) return res.status(400).json({ success: false, message: 'Payment confirmation is incomplete' })
    try {
        const booking = await markPaymentPaid({ orderId, paymentId, signature })
        await sendBookingConfirmation(booking._id)
        return res.json({ success: true, message: 'Payment verified and booking confirmed', data: booking })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message === 'Invalid payment signature' ? error.message : 'Payment could not be confirmed' })
    }
}

async function razorpayWebhook(req, res) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) return res.status(503).send('Webhook is not configured')
    const signature = req.get('x-razorpay-signature') || ''
    const expected = crypto.createHmac('sha256', webhookSecret).update(req.body).digest('hex')
    if (!signaturesMatch(expected, signature)) return res.status(400).send('Invalid webhook signature')
    const payment = req.body?.payload?.payment?.entity
    if (req.body?.event === 'payment.captured' && payment?.order_id && payment?.id) {
        const booking = await Booking.findOneAndUpdate(
            { razorpayOrderId: payment.order_id, status: 'pending' },
            { $set: { status: 'paid', razorpayPaymentId: payment.id, paymentVerifiedAt: new Date(), ticketCode: `EVT-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } }
        )
        if (booking) await sendBookingConfirmation(booking._id)
    }
    return res.status(200).json({ received: true })
}

module.exports = { createOrder, verifyPayment, razorpayWebhook }
