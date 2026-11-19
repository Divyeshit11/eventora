const Booking = require('../models/Booking')
const Event = require('../models/Event')

async function getAdminAnalytics(req, res) {
    try {
        const [eventSummary, bookingSummary, topEvents, dailyRevenue] = await Promise.all([
            Event.aggregate([
                { $group: { _id: null, totalEvents: { $sum: 1 }, ticketCapacity: { $sum: '$ticketCapacity' }, ticketsSold: { $sum: '$ticketsSold' } } },
            ]),
            Booking.aggregate([
                { $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    paidBookings: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
                    pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    paidTickets: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$quantity', 0] } },
                    revenue: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totalPrice', 0] } },
                } },
            ]),
            Booking.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: '$event', tickets: { $sum: '$quantity' }, revenue: { $sum: '$totalPrice' } } },
                { $sort: { revenue: -1, tickets: -1 } },
                { $limit: 5 },
                { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
                { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
                { $project: { _id: 0, eventId: '$_id', title: { $ifNull: ['$event.title', 'Removed event'] }, tickets: 1, revenue: 1 } },
            ]),
            Booking.aggregate([
                { $match: { status: 'paid', paymentVerifiedAt: { $gte: new Date(Date.now() - 6 * 86400000) } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentVerifiedAt' } }, revenue: { $sum: '$totalPrice' }, tickets: { $sum: '$quantity' } } },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, date: '$_id', revenue: 1, tickets: 1 } },
            ]),
        ])
        const events = eventSummary[0] || { totalEvents: 0, ticketCapacity: 0, ticketsSold: 0 }
        const bookings = bookingSummary[0] || { totalBookings: 0, paidBookings: 0, pendingBookings: 0, paidTickets: 0, revenue: 0 }
        return res.json({
            success: true,
            data: {
                overview: { ...events, ...bookings, sellThroughRate: events.ticketCapacity ? Math.round((events.ticketsSold / events.ticketCapacity) * 100) : 0 },
                topEvents,
                dailyRevenue,
            },
        })
    } catch (error) {
        console.error('Failed to load analytics:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load analytics' })
    }
}

module.exports = { getAdminAnalytics }
