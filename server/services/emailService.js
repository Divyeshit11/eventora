const nodemailer = require('nodemailer')

let transporter

function getTransporter() {
    if (transporter) return transporter

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const password = process.env.SMTP_PASSWORD
    const from = process.env.SMTP_FROM
    const secure = process.env.SMTP_SECURE

    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from) {
        throw new Error('SMTP_HOST, SMTP_PORT, and SMTP_FROM must be configured')
    }
    if (Boolean(user) !== Boolean(password)) {
        throw new Error('SMTP_USER and SMTP_PASSWORD must both be configured or both be empty')
    }
    if (secure && !['true', 'false'].includes(secure.toLowerCase())) {
        throw new Error('SMTP_SECURE must be true or false')
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: secure ? secure.toLowerCase() === 'true' : port === 465,
        ...(user ? { auth: { user, pass: password } } : {}),
    })
    return transporter
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character])
}

async function sendPasswordResetEmail(email, resetUrl) {
    const from = process.env.SMTP_FROM
    const safeResetUrl = escapeHtml(resetUrl)
    await getTransporter().sendMail({
        from,
        to: email,
        subject: 'Reset your Eventora password',
        text: `We received a request to reset your Eventora password. Use this link within 15 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>We received a request to reset your Eventora password.</p><p><a href="${safeResetUrl}">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>`,
    })
}

function formatEventDate(date) {
    const parsed = new Date(`${date}T00:00:00.000Z`)
    return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('en-IN', { dateStyle: 'full', timeZone: 'UTC' }).format(parsed)
}

function eventDetails(event) {
    return { title: String(event.title || 'your Eventora event'), location: String(event.location || 'Venue to be confirmed'), date: formatEventDate(event.date || '') }
}

async function sendBookingConfirmationEmail(email, booking) {
    const event = eventDetails(booking.event)
    const ticketCode = String(booking.ticketCode || 'Available in your bookings')
    await getTransporter().sendMail({
        from: process.env.SMTP_FROM, to: email, subject: `Booking confirmed: ${event.title}`,
        text: `Your booking is confirmed.\n\nEvent: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\nTickets: ${booking.quantity}\nTicket code: ${ticketCode}\n\nKeep this email for your records.`,
        html: `<h1>Your booking is confirmed</h1><p><strong>${escapeHtml(event.title)}</strong></p><p>${escapeHtml(event.date)}<br>${escapeHtml(event.location)}</p><p>Tickets: ${booking.quantity}<br>Ticket code: <strong>${escapeHtml(ticketCode)}</strong></p><p>Keep this email for your records.</p>`,
    })
}

async function sendEventReminderEmail(email, booking) {
    const event = eventDetails(booking.event)
    const ticketCode = String(booking.ticketCode || 'Available in your bookings')
    await getTransporter().sendMail({
        from: process.env.SMTP_FROM, to: email, subject: `Reminder: ${event.title} is tomorrow`,
        text: `A reminder that ${event.title} is tomorrow.\n\nDate: ${event.date}\nLocation: ${event.location}\nTickets: ${booking.quantity}\nTicket code: ${ticketCode}\n\nWe look forward to seeing you there.`,
        html: `<h1>Your event is tomorrow</h1><p><strong>${escapeHtml(event.title)}</strong></p><p>${escapeHtml(event.date)}<br>${escapeHtml(event.location)}</p><p>Tickets: ${booking.quantity}<br>Ticket code: <strong>${escapeHtml(ticketCode)}</strong></p><p>We look forward to seeing you there.</p>`,
    })
}

module.exports = { sendPasswordResetEmail, sendBookingConfirmationEmail, sendEventReminderEmail }
