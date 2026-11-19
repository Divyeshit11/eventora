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

module.exports = { sendPasswordResetEmail }
