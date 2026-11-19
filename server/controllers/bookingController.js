const mongoose = require('mongoose')
const Booking = require('../models/Booking')
const Event = require('../models/Event')

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
            .populate('event', 'title location date image price ticketCapacity ticketsSold')
            .sort({ createdAt: -1 })
            .lean()
        return res.json({ success: true, data: bookings })
    } catch (error) {
        console.error('Failed to fetch bookings:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load bookings' })
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
        await Event.updateOne({ _id: booking.event }, { $inc: { ticketsSold: -booking.quantity } })
        return res.json({ success: true, message: 'Booking cancelled', data: booking })
    } catch (error) {
        console.error('Failed to cancel booking:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to cancel booking' })
    }
}

module.exports = { createBooking, getMyBookings, cancelBooking }
