const nodemailer = require('nodemailer')
const path = require('node:path')
const fs = require('node:fs')
const { createResilientTicketPdf } = require('./ticketPdfService')

const logoPath = path.resolve(__dirname, '../assets/eventora-logo.png')
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

function emailLayout(content) {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1c17;padding:32px 16px;font-family:Arial,sans-serif;color:#f1e4cb"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#10251e;border:1px solid #2b493d;border-radius:16px;overflow:hidden"><tr><td align="center" style="background:#0b1c17;padding:20px"><img src="cid:eventora-logo" alt="Eventora" width="220" style="display:block;width:220px;max-width:100%;height:auto"></td></tr><tr><td style="padding:28px 32px;color:#f1e4cb;font-size:15px;line-height:1.6">${content}</td></tr></table><p style="margin:18px 0 0;color:#91b9a2;font-size:12px">Eventora · Find your next moment</p></td></tr></table>`
}

function inlineLogoAttachment() {
    try {
        // Use bytes rather than a path: Vercel's serverless filesystem is
        // read-only and deployment paths should not decide email delivery.
        return {
            filename: 'eventora-logo.png',
            content: fs.readFileSync(logoPath),
            cid: 'eventora-logo',
            contentType: 'image/png',
            contentDisposition: 'inline',
        }
    } catch (error) {
        console.warn('Email logo is unavailable; sending email without it:', error.message)
        return null
    }
}

async function sendPasswordResetEmail(email, resetUrl) {
    const from = process.env.SMTP_FROM
    const safeResetUrl = escapeHtml(resetUrl)
    await getTransporter().sendMail({
        from,
        to: email,
        subject: 'Reset your Eventora password',
        text: `We received a request to reset your Eventora password. Use this link within 15 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: emailLayout(`<h1>Reset your password</h1><p>We received a request to reset your Eventora password.</p><p><a href="${safeResetUrl}" style="color:#d59a82">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>`),
        attachments: [inlineLogoAttachment()].filter(Boolean),
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
    const pdf = await createResilientTicketPdf(booking)
    // Do not swallow SMTP errors here. The delivery service needs the error to
    // keep the booking eligible for retry instead of falsely marking it sent.
    await getTransporter().sendMail({
        from: process.env.SMTP_FROM, to: email, subject: `Booking confirmed: ${event.title}`,
        text: `Your booking is confirmed.\n\nEvent: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\nTicket type: ${booking.ticketTypeName || 'General admission'}\nTickets: ${booking.quantity}\nTicket code: ${ticketCode}\n\nYour downloadable ticket is attached to this email. Keep it for your records.`,
        html: emailLayout(`<h1>Your booking is confirmed</h1><p><strong>${escapeHtml(event.title)}</strong></p><p>${escapeHtml(event.date)}<br>${escapeHtml(event.location)}</p><p>Ticket type: ${escapeHtml(booking.ticketTypeName || 'General admission')}<br>Tickets: ${booking.quantity}<br>Ticket code: <strong>${escapeHtml(ticketCode)}</strong></p><p>Your downloadable ticket is attached to this email. Keep it for your records.</p>`),
        attachments: [
            { filename: `eventora-ticket-${ticketCode}.pdf`, content: pdf, contentType: 'application/pdf', contentDisposition: 'attachment' },
            inlineLogoAttachment(),
        ].filter(Boolean),
    })
}

async function sendEventReminderEmail(email, booking) {
    const event = eventDetails(booking.event)
    const ticketCode = String(booking.ticketCode || 'Available in your bookings')
    await getTransporter().sendMail({
        from: process.env.SMTP_FROM, to: email, subject: `Reminder: ${event.title} is tomorrow`,
        text: `A reminder that ${event.title} is tomorrow.\n\nDate: ${event.date}\nLocation: ${event.location}\nTickets: ${booking.quantity}\nTicket code: ${ticketCode}\n\nWe look forward to seeing you there.`,
        html: emailLayout(`<h1>Your event is tomorrow</h1><p><strong>${escapeHtml(event.title)}</strong></p><p>${escapeHtml(event.date)}<br>${escapeHtml(event.location)}</p><p>Tickets: ${booking.quantity}<br>Ticket code: <strong>${escapeHtml(ticketCode)}</strong></p><p>We look forward to seeing you there.</p>`),
        attachments: [inlineLogoAttachment()].filter(Boolean),
    })
}

module.exports = { sendPasswordResetEmail, sendBookingConfirmationEmail, sendEventReminderEmail }
