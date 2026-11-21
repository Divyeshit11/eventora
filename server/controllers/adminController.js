const mongoose = require('mongoose')
const User = require('../models/User')
const Booking = require('../models/Booking')

async function getUsers(req, res) {
    try {
        const role = req.query.role
        const filter = role && ['user', 'organizer', 'admin'].includes(role) ? { role } : {}
        const users = await User.find(filter).select('email role createdAt').sort({ createdAt: -1 }).lean()
        return res.json({ success: true, data: users })
    } catch (error) {
        console.error('Failed to load users:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load users' })
    }
}

async function setUserRole(req, res) {
    if (!mongoose.isValidObjectId(req.params.userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' })
    }
    const role = req.body?.role
    if (!['user', 'organizer'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Choose user or organizer access' })
    }
    if (req.params.userId === req.auth.sub) {
        return res.status(400).json({ success: false, message: 'You cannot change your own account role' })
    }
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.userId, role: { $ne: 'admin' } },
            { $set: { role }, $inc: { tokenVersion: 1 } },
            { new: true, runValidators: true }
        )
        if (!user) return res.status(404).json({ success: false, message: 'User not found or administrator accounts cannot be changed here' })
        return res.json({
            success: true,
            data: { id: String(user._id), email: user.email, role: user.role, createdAt: user.createdAt },
        })
    } catch (error) {
        console.error('Failed to update user role:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to update user role' })
    }
}

function csvCell(value) {
    const text = String(value ?? '')
    const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text
    return /[",\r\n]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText
}

async function exportSalesReport(req, res) {
    try {
        const bookings = await Booking.find().populate('user', 'email').populate('event', 'title').sort({ createdAt: -1 }).lean()
        const rows = [
            ['Event', 'Attendee email', 'Ticket code', 'Ticket type', 'Quantity', 'Amount', 'Status', 'Booked at', 'Checked in at'],
            ...bookings.map((booking) => [
                booking.event?.title,
                booking.user?.email,
                booking.ticketCode,
                booking.ticketTypeName,
                booking.quantity,
                booking.totalPrice,
                booking.status,
                booking.createdAt?.toISOString(),
                booking.checkedInAt?.toISOString(),
            ]),
        ]
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', 'attachment; filename="eventora-sales-report.csv"')
        return res.send(rows.map((row) => row.map(csvCell).join(',')).join('\r\n'))
    } catch (error) {
        console.error('Failed to export sales report:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to export sales report' })
    }
}

module.exports = { getUsers, setUserRole, exportSalesReport }
