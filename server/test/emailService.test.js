const assert = require('node:assert/strict')
const test = require('node:test')
const nodemailer = require('nodemailer')

test('sends password reset email using the configured SMTP transport', async () => {
    const servicePath = require.resolve('../services/emailService')
    const originalCreateTransport = nodemailer.createTransport
    const envKeys = [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_SECURE',
        'SMTP_USER',
        'SMTP_PASSWORD',
        'SMTP_FROM',
    ]
    const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
    let transportOptions
    let sentMessage
    nodemailer.createTransport = (options) => {
        transportOptions = options
        return {
            sendMail: async (message) => {
                sentMessage = message
            },
        }
    }
    delete require.cache[servicePath]

    Object.assign(process.env, {
        SMTP_HOST: 'smtp.example.test',
        SMTP_PORT: '587',
        SMTP_SECURE: 'false',
        SMTP_USER: 'smtp-user',
        SMTP_PASSWORD: 'smtp-password',
        SMTP_FROM: 'Eventora <no-reply@example.test>',
    })

    try {
        const { sendPasswordResetEmail } = require(servicePath)
        const resetUrl = 'https://eventora.example/reset-password#token=abc&next=def'
        await sendPasswordResetEmail('person@example.test', resetUrl)

        assert.deepEqual(transportOptions, {
            host: 'smtp.example.test',
            port: 587,
            secure: false,
            auth: { user: 'smtp-user', pass: 'smtp-password' },
        })
        assert.equal(sentMessage.from, 'Eventora <no-reply@example.test>')
        assert.equal(sentMessage.to, 'person@example.test')
        assert.match(sentMessage.text, new RegExp(resetUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        assert.match(sentMessage.html, /#token=abc&amp;next=def/)
        assert.match(sentMessage.html, /src="cid:eventora-logo"/)
        assert.equal(sentMessage.attachments[0].cid, 'eventora-logo')
        assert.equal(sentMessage.attachments[0].contentType, 'image/png')
    } finally {
        nodemailer.createTransport = originalCreateTransport
        delete require.cache[servicePath]
        for (const key of envKeys) {
            if (previousEnv[key] === undefined) delete process.env[key]
            else process.env[key] = previousEnv[key]
        }
    }
})

test('sends booking confirmation with a downloadable PDF ticket attachment', async () => {
    const servicePath = require.resolve('../services/emailService')
    const originalCreateTransport = nodemailer.createTransport
    const envKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']
    const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
    let sentMessage
    nodemailer.createTransport = () => ({
        sendMail: async (message) => {
            sentMessage = message
        },
    })
    delete require.cache[servicePath]

    Object.assign(process.env, {
        SMTP_HOST: 'smtp.example.test',
        SMTP_PORT: '587',
        SMTP_SECURE: 'false',
        SMTP_USER: 'smtp-user',
        SMTP_PASSWORD: 'smtp-password',
        SMTP_FROM: 'Eventora <no-reply@example.test>',
    })

    try {
        const { sendBookingConfirmationEmail } = require(servicePath)
        await sendBookingConfirmationEmail('person@example.test', {
            ticketCode: 'EVT-3CB4A97E',
            quantity: 2,
            ticketTypeName: 'General × 1, VIP × 1',
            ticketItems: [
                { ticketTypeName: 'General', quantity: 1, unitPrice: 99 },
                { ticketTypeName: 'VIP', quantity: 1, unitPrice: 199 },
            ],
            selectedSeats: ['A1', 'A2'],
            sessionDate: '2026-08-12',
            event: { title: 'Eventora event', location: 'Gandhinagar', date: '2026-08-12' },
        })

        assert.equal(sentMessage.to, 'person@example.test')
        assert.match(sentMessage.text, /downloadable ticket is attached/i)
        assert.match(sentMessage.text, /General × 1, VIP × 1/)
        assert.equal(sentMessage.attachments.length, 2)
        assert.equal(sentMessage.attachments[0].filename, 'eventora-ticket-EVT-3CB4A97E.pdf')
        assert.equal(sentMessage.attachments[0].contentType, 'application/pdf')
        assert.equal(sentMessage.attachments[0].contentDisposition, 'attachment')
        assert.equal(sentMessage.attachments[0].content.subarray(0, 5).toString(), '%PDF-')
        assert.match(sentMessage.html, /src="cid:eventora-logo"/)
        assert.equal(sentMessage.attachments[1].cid, 'eventora-logo')
        assert.equal(sentMessage.attachments[1].contentType, 'image/png')
        assert.equal(sentMessage.attachments[1].contentDisposition, 'inline')
        assert.equal(
            sentMessage.attachments[1].content.subarray(0, 8).toString('hex'),
            '89504e470d0a1a0a'
        )
        const pdfText = sentMessage.attachments[0].content.toString('latin1')
        assert.ok((pdfText.match(/\/Subtype \/Image/g) || []).length >= 2)
    } finally {
        nodemailer.createTransport = originalCreateTransport
        delete require.cache[servicePath]
        for (const key of envKeys) {
            if (previousEnv[key] === undefined) delete process.env[key]
            else process.env[key] = previousEnv[key]
        }
    }
})
