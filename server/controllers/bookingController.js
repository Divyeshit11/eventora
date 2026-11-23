const mongoose = require('mongoose')
const Booking = require('../models/Booking')
const Event = require('../models/Event')
const { createResilientTicketPdf } = require('../services/ticketPdfService')

function invalid(res, message) {
    return res.status(400).json({ success: false, message })
}

async function createBooking(req, res) {
    const { eventId } = req.params
    const quantity = Number(req.body?.quantity)
    if (!mongoose.isValidObjectId(eventId)) return invalid(res, 'Invalid event ID')
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return invalid(res, 'Ticket quantity must be a whole number from 1 to 10')
    }

    try {
        // This conditional update is atomic, so concurrent buyers cannot exceed capacity.
        const event = await Event.findOneAndUpdate(
            {
                _id: eventId,
                $expr: { $lte: [{ $add: ['$ticketsSold', quantity] }, '$ticketCapacity'] },
            },
            { $inc: { ticketsSold: quantity } },
            { new: true }
        )
        if (!event) {
            const exists = await Event.exists({ _id: eventId })
            return res.status(exists ? 409 : 404).json({
                success: false,
                message: exists ? 'Not enough tickets are available' : 'Event not found',
            })
        }

        try {
            const booking = await Booking.create({
                user: req.auth.sub,
                event: event._id,
                quantity,
                unitPrice: event.price,
                totalPrice: event.price * quantity,
            })
            return res.status(201).json({ success: true, message: 'Booking confirmed', data: booking })
        } catch (error) {
            await Event.updateOne({ _id: eventId }, { $inc: { ticketsSold: -quantity } })
            throw error
        }
    } catch (error) {
        console.error('Failed to create booking:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to create booking' })
    }
}

async function getMyBookings(req, res) {
    try {
        const bookings = await Booking.find({ user: req.auth.sub })
            .populate('event', 'title location venueAddress venueContact date image price ticketCapacity ticketsSold')
            .sort({ createdAt: -1 })
            .lean()
        return res.json({ success: true, data: bookings })
    } catch (error) {
        console.error('Failed to fetch bookings:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load bookings' })
    }
}

async function getBookingTicket(req, res) {
    if (!mongoose.isValidObjectId(req.params.bookingId)) return invalid(res, 'Invalid booking ID')
    try {
        const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.auth.sub, status: 'paid' })
            .populate('event', 'title location venueAddress venueContact date image')
            .lean()
        if (!booking) return res.status(404).json({ success: false, message: 'Ticket not found' })
        return res.json({ success: true, data: booking })
    } catch (error) {
        console.error('Failed to load ticket:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load ticket' })
    }
}

async function downloadBookingTicket(req, res) {
    if (!mongoose.isValidObjectId(req.params.bookingId)) return invalid(res, 'Invalid booking ID')
    try {
        console.log(`Attempting to download ticket for booking ${req.params.bookingId}`)
        const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.auth.sub, status: 'paid' }).populate('event', 'title location venueAddress venueContact date')
        if (!booking) {
            console.warn(`Booking ${req.params.bookingId} not found or not paid`)
            return res.status(404).json({ success: false, message: 'Ticket not found' })
        }
        console.log(`Booking found, creating PDF for ticket code: ${booking.ticketCode}`)
        const pdf = await createResilientTicketPdf(booking)
        console.log(`PDF created successfully, size: ${pdf.length} bytes`)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="eventora-ticket-${booking.ticketCode}.pdf"`)
        return res.send(pdf)
    } catch (error) {
        console.error('Failed to create ticket PDF:', error.message)
        console.error('Full error:', error)
        return res.status(500).json({ success: false, message: 'Unable to create ticket PDF', error: error.message })
    }
}

async function checkInTicket(req, res) {
    const ticketCode = String(req.body?.ticketCode || '').trim().toUpperCase()
    if (!/^EVT-[A-Z0-9-]+$/.test(ticketCode)) return invalid(res, 'Enter a valid ticket code')
    try {
        const candidate = await Booking.findOne({ ticketCode, status: 'paid' }).populate('event', 'title date location organizer')
        if (!candidate) return res.status(404).json({ success: false, message: 'No paid ticket found with this code' })
        if (req.auth.role !== 'admin' && (
            req.auth.role !== 'organizer' || String(candidate.event?.organizer) !== req.auth.sub
        )) return res.status(403).json({ success: false, message: 'You can only check in tickets for your own events' })
        if (candidate.checkedInAt) return res.status(409).json({ success: false, message: 'This ticket has already been checked in', data: candidate })
        const booking = await Booking.findOneAndUpdate(
            { _id: candidate._id, status: 'paid', checkedInAt: { $exists: false } },
            { $set: { checkedInAt: new Date() } },
            { new: true }
        ).populate('event', 'title date location')
        if (!booking) return res.status(409).json({ success: false, message: 'This ticket has already been checked in' })
        return res.json({ success: true, message: 'Attendee checked in', data: booking })
    } catch (error) {
        console.error('Failed to check in ticket:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to check in ticket' })
    }
}

async function cancelBooking(req, res) {
    if (!mongoose.isValidObjectId(req.params.bookingId)) return invalid(res, 'Invalid booking ID')
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.bookingId, user: req.auth.sub, status: 'pending' },
            { $set: { status: 'cancelled' } },
            { new: true }
        )
        if (!booking) return res.status(400).json({ success: false, message: 'Only unpaid reservations can be cancelled online' })
        const ticketItems = booking.ticketItems?.length
            ? booking.ticketItems
            : [{ ticketTypeId: booking.ticketTypeId, quantity: booking.quantity }]
        const typedItems = ticketItems.filter((item) => item.ticketTypeId)
        if (!typedItems.length) {
            await Event.updateOne({ _id: booking.event }, { $inc: { ticketsSold: -booking.quantity } })
        } else {
            const inventoryRequests = typedItems.map((item) => ({
                ticketTypeId: item.ticketTypeId,
                quantity: -item.quantity,
            }))
            await Event.updateOne(
                { _id: booking.event },
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
                        ticketsSold: { $add: [{ $ifNull: ['$ticketsSold', 0] }, -booking.quantity] },
                    },
                }],
                { updatePipeline: true }
            )
        }
        return res.json({ success: true, message: 'Booking cancelled', data: booking })
    } catch (error) {
        console.error('Failed to cancel booking:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to cancel booking' })
    }
}

module.exports = { createBooking, getMyBookings, getBookingTicket, downloadBookingTicket, checkInTicket, cancelBooking }
