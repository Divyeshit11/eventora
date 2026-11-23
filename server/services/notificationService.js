const Booking = require('../models/Booking')
const { sendBookingConfirmationEmail, sendEventReminderEmail } = require('./emailService')

const CLAIM_TIMEOUT_MS = 15 * 60 * 1000

async function claimBookingDelivery(bookingId, type) {
    const sentField = `${type}EmailSentAt`
    const progressField = `${type}EmailInProgressAt`
    return Booking.findOneAndUpdate(
        { _id: bookingId, status: 'paid', [sentField]: { $exists: false }, $or: [{ [progressField]: { $exists: false } }, { [progressField]: { $lt: new Date(Date.now() - CLAIM_TIMEOUT_MS) } }] },
        { $set: { [progressField]: new Date() } }, { new: true }
    ).populate('user', 'email').populate('event', 'title location venueAddress venueContact date')
}

async function deliver(bookingId, type) {
    const sentField = `${type}EmailSentAt`
    const progressField = `${type}EmailInProgressAt`
    const booking = await claimBookingDelivery(bookingId, type)
    if (!booking?.user?.email || !booking.event) {
        console.warn(`Cannot send ${type} email for booking ${bookingId}: missing user email or event data`)
        return false
    }
    try {
        if (type === 'confirmation') await sendBookingConfirmationEmail(booking.user.email, booking)
        else await sendEventReminderEmail(booking.user.email, booking)
        await Booking.updateOne({ _id: booking._id, [progressField]: booking[progressField] }, { $set: { [sentField]: new Date() }, $unset: { [progressField]: 1 } })
        console.log(`Successfully sent ${type} email for booking ${bookingId} to ${booking.user.email}`)
        return true
    } catch (error) {
        await Booking.updateOne({ _id: booking._id }, { $unset: { [progressField]: 1 } })
        console.error(`Unable to send ${type} email for booking ${bookingId}:`, error.message)
        if (error.stack) console.error(error.stack)
        return false
    }
}

async function sendBookingConfirmation(bookingId) { return deliver(bookingId, 'confirmation') }

function reminderDays() {
    const value = Number.parseInt(process.env.EVENT_REMINDER_DAYS || '1', 10)
    return Number.isInteger(value) && value >= 1 && value <= 30 ? value : 1
}

function daysUntilEvent(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null
    const eventDay = Date.parse(`${date}T00:00:00.000Z`)
    const now = new Date()
    const todayDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    return Math.round((eventDay - todayDay) / 86400000)
}

async function sendEventReminders() {
    const candidates = await Booking.find({ status: 'paid', reminderEmailSentAt: { $exists: false } }).populate('event', 'date').select('_id event').lean()
    const due = candidates.filter((booking) => daysUntilEvent(booking.event?.date) === reminderDays())
    const results = await Promise.allSettled(due.map((booking) => deliver(booking._id, 'reminder')))
    return { due: due.length, sent: results.filter((result) => result.status === 'fulfilled' && result.value).length }
}

module.exports = { sendBookingConfirmation, sendEventReminders }
