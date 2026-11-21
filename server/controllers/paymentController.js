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
        if (released) {
            await releaseReservedInventory(
                released.event,
                released.ticketItems?.length
                    ? released.ticketItems.map((item) => ({ ticketTypeId: item.ticketTypeId, quantity: item.quantity }))
                    : [{ ticketTypeId: released.ticketTypeId, quantity: released.quantity }],
                released.quantity
            )
        }
    }
}

async function createOrder(req, res) {
    const eventId = req.body?.eventId
    const rawTicketItems = req.body?.ticketItems
    const legacyQuantity = Number(req.body?.quantity)
    const legacyTicketTypeId = req.body?.ticketTypeId
    const sessionDate = typeof req.body?.sessionDate === 'string' ? req.body.sessionDate : ''
    const selectedSeats = Array.isArray(req.body?.selectedSeats) ? req.body.selectedSeats.map((seat) => String(seat).trim().toUpperCase()) : []
    if (!mongoose.isValidObjectId(eventId)) return res.status(400).json({ success: false, message: 'Invalid event ID' })
    if (!Array.isArray(rawTicketItems) && legacyTicketTypeId && !mongoose.isValidObjectId(legacyTicketTypeId)) return res.status(400).json({ success: false, message: 'Invalid ticket type' })
    if (!Array.isArray(rawTicketItems) && (!Number.isInteger(legacyQuantity) || legacyQuantity < 1 || legacyQuantity > 10)) {
        return res.status(400).json({ success: false, message: 'Ticket quantity must be a whole number from 1 to 10' })
    }

    try {
        const { keyId, client } = paymentConfig()
        await releaseExpiredReservations()
        const eventBeforeReservation = await Event.findById(eventId).select('ticketTypes')
        if (!eventBeforeReservation) return res.status(404).json({ success: false, message: 'Event not found' })
        const hasTicketTypes = eventBeforeReservation.ticketTypes?.length > 0
        let requestedItems = Array.isArray(rawTicketItems)
            ? rawTicketItems.map((item) => ({
                ticketTypeId: item?.ticketTypeId ? String(item.ticketTypeId) : '',
                quantity: Number(item?.quantity),
            }))
            : [{ ticketTypeId: legacyTicketTypeId ? String(legacyTicketTypeId) : '', quantity: legacyQuantity }]
        const uniqueTicketTypes = new Set(requestedItems.map((item) => item.ticketTypeId))
        const quantity = requestedItems.reduce((total, item) => total + item.quantity, 0)
        if (!requestedItems.length || requestedItems.length > 10 ||
            requestedItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 ||
                (item.ticketTypeId && !mongoose.isValidObjectId(item.ticketTypeId))) ||
            uniqueTicketTypes.size !== requestedItems.length || !Number.isInteger(quantity) || quantity > 10) {
            return res.status(400).json({ success: false, message: 'Choose up to 10 tickets across distinct ticket types' })
        }
        if (hasTicketTypes && requestedItems.some((item) => !item.ticketTypeId)) {
            return res.status(400).json({ success: false, message: 'Choose a ticket type for every ticket selection' })
        }
        if (!hasTicketTypes && requestedItems.some((item) => item.ticketTypeId)) {
            return res.status(400).json({ success: false, message: 'This event does not use ticket types' })
        }

        const statusFilter = { $or: [{ status: 'published' }, { status: { $exists: false } }] }
        let event
        let inventoryReserved = false
        if (hasTicketTypes) {
            const inventoryRequests = requestedItems.map((item) => ({
                ticketTypeId: new mongoose.Types.ObjectId(item.ticketTypeId),
                quantity: item.quantity,
            }))
            const availableSelections = {
                $expr: {
                    $allElementsTrue: [{
                        $map: {
                            input: { $literal: inventoryRequests },
                            as: 'requested',
                            in: {
                                $gt: [{
                                    $size: {
                                        $filter: {
                                            input: '$ticketTypes',
                                            as: 'tier',
                                            cond: {
                                                $and: [
                                                    { $eq: ['$$tier._id', '$$requested.ticketTypeId'] },
                                                    { $lte: [{ $add: [{ $ifNull: ['$$tier.sold', 0] }, '$$requested.quantity'] }, '$$tier.quantity'] },
                                                ],
                                            },
                                        },
                                    },
                                }, 0],
                            },
                        },
                    }],
                },
            }
            event = await Event.findOneAndUpdate(
                { _id: eventId, ...statusFilter, ...availableSelections },
                [{
                    $set: {
                        ticketTypes: {
                            $map: {
                                input: '$ticketTypes',
                                as: 'tier',
                                in: {
                                    $mergeObjects: [
                                        '$$tier',
                                        {
                                            sold: {
                                                $add: [
                                                    { $ifNull: ['$$tier.sold', 0] },
                                                    {
                                                        $sum: {
                                                            $map: {
                                                                input: {
                                                                    $filter: {
                                                                        input: { $literal: inventoryRequests },
                                                                        as: 'requested',
                                                                        cond: { $eq: ['$$requested.ticketTypeId', '$$tier._id'] },
                                                                    },
                                                                },
                                                                as: 'requested',
                                                                in: '$$requested.quantity',
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        ticketsSold: { $add: [{ $ifNull: ['$ticketsSold', 0] }, quantity] },
                    },
                }],
                { new: true, updatePipeline: true }
            )
        } else {
            event = await Event.findOneAndUpdate(
                { _id: eventId, ...statusFilter, $expr: { $lte: [{ $add: [{ $ifNull: ['$ticketsSold', 0] }, quantity] }, '$ticketCapacity'] } },
                { $inc: { ticketsSold: quantity } }, { new: true }
            )
        }
        if (!event) return res.status(409).json({ success: false, message: 'Tickets are sold out or the event is unavailable' })
        inventoryReserved = true
        const reservationItems = requestedItems
        const releaseReservation = async () => {
            if (!inventoryReserved) return
            await releaseReservedInventory(eventId, reservationItems, quantity)
            inventoryReserved = false
        }
        const availableDates = event.sessions?.length ? event.sessions.map((session) => session.date) : [event.date]
        if (!availableDates.includes(sessionDate || event.date)) {
            await releaseReservation()
            return res.status(400).json({ success: false, message: 'Select a valid event date' })
        }
        if (event.seatingEnabled) {
            if (selectedSeats.length !== quantity || new Set(selectedSeats).size !== selectedSeats.length) {
                await releaseReservation()
                return res.status(400).json({ success: false, message: 'Select one unique seat for every ticket' })
            }
            const reserved = await Booking.exists({
                event: event._id,
                sessionDate: sessionDate || event.date,
                selectedSeats: { $in: selectedSeats },
                $or: [{ status: 'paid' }, { status: 'pending', reservationExpiresAt: { $gt: new Date() } }],
            })
            if (reserved) {
                await releaseReservation()
                return res.status(409).json({ success: false, message: 'One or more selected seats are no longer available' })
            }
        } else if (selectedSeats.length) {
            await releaseReservation()
            return res.status(400).json({ success: false, message: 'This event has general admission seating' })
        }

        const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000)
        let booking
        try {
            const ticketItems = requestedItems.map((item) => {
                const ticketType = item.ticketTypeId &&
                    event.ticketTypes.find((type) => String(type._id) === item.ticketTypeId)
                if (item.ticketTypeId && !ticketType) throw new Error('Selected ticket type is no longer available')
                return {
                    ...(ticketType ? { ticketTypeId: ticketType._id } : {}),
                    ticketTypeName: ticketType?.name || 'General admission',
                    quantity: item.quantity,
                    unitPrice: ticketType?.price ?? event.price,
                }
            })
            const totalPrice = ticketItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
            booking = await Booking.create({
                user: req.auth.sub,
                event: event._id,
                quantity,
                unitPrice: totalPrice / quantity,
                totalPrice,
                ...(ticketItems.length === 1 && ticketItems[0].ticketTypeId
                    ? { ticketTypeId: ticketItems[0].ticketTypeId }
                    : {}),
                ticketTypeName: ticketItems.length === 1
                    ? ticketItems[0].ticketTypeName
                    : ticketItems.map((item) => `${item.ticketTypeName} × ${item.quantity}`).join(', '),
                ticketItems,
                sessionDate: sessionDate || event.date,
                selectedSeats,
                reservationExpiresAt: expiresAt,
            })
            const order = await client.orders.create({
                amount: Math.round(booking.totalPrice * 100), currency: 'INR', receipt: `booking_${booking._id}`, notes: { bookingId: String(booking._id), eventId: String(event._id), userId: req.auth.sub },
            })
            booking.razorpayOrderId = order.id
            await booking.save()
            inventoryReserved = false
            return res.status(201).json({ success: true, data: { bookingId: booking._id, orderId: order.id, amount: order.amount, currency: order.currency, keyId, expiresAt } })
        } catch (error) {
            if (booking) await Booking.deleteOne({ _id: booking._id })
            await releaseReservation()
            throw error
        }
    } catch (error) {
        console.error('Failed to create payment order:', error.message)
        return res.status(503).json({ success: false, message: 'Unable to start payment. Please try again.' })
    }
}

async function releaseReservedInventory(eventId, ticketItems, totalQuantity) {
    const typedItems = ticketItems.filter((item) => item.ticketTypeId)
    if (!typedItems.length) {
        await Event.updateOne({ _id: eventId }, { $inc: { ticketsSold: -totalQuantity } })
        return
    }
    const inventoryRequests = typedItems.map((item) => ({
        ticketTypeId: new mongoose.Types.ObjectId(item.ticketTypeId),
        quantity: -item.quantity,
    }))
    await Event.updateOne(
        { _id: eventId },
        [{
            $set: {
                ticketTypes: {
                    $map: {
                        input: '$ticketTypes',
                        as: 'tier',
                        in: {
                            $mergeObjects: [
                                '$$tier',
                                {
                                    sold: {
                                        $add: [
                                            { $ifNull: ['$$tier.sold', 0] },
                                            {
                                                $sum: {
                                                    $map: {
                                                        input: {
                                                            $filter: {
                                                                input: { $literal: inventoryRequests },
                                                                as: 'requested',
                                                                cond: { $eq: ['$$requested.ticketTypeId', '$$tier._id'] },
                                                            },
                                                        },
                                                        as: 'requested',
                                                        in: '$$requested.quantity',
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                },
                ticketsSold: { $add: [{ $ifNull: ['$ticketsSold', 0] }, -totalQuantity] },
            },
        }],
        { updatePipeline: true }
    )
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

    // Express deliberately keeps this route as raw bytes so the HMAC is checked
    // against exactly what Razorpay sent. Parse only after that verification.
    let payload
    try {
        payload = JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body))
    } catch {
        return res.status(400).send('Invalid webhook payload')
    }

    const payment = payload?.payload?.payment?.entity
    if (payload?.event === 'payment.captured' && payment?.order_id && payment?.id) {
        const booking = await Booking.findOneAndUpdate(
            { razorpayOrderId: payment.order_id, status: 'pending' },
            { $set: { status: 'paid', razorpayPaymentId: payment.id, paymentVerifiedAt: new Date(), ticketCode: `EVT-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } }
        )
        if (booking) await sendBookingConfirmation(booking._id)
    }
    return res.status(200).json({ received: true })
}

module.exports = { createOrder, verifyPayment, razorpayWebhook }
