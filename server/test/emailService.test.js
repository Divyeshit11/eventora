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
    } finally {
        nodemailer.createTransport = originalCreateTransport
        delete require.cache[servicePath]
        for (const key of envKeys) {
            if (previousEnv[key] === undefined) delete process.env[key]
            else process.env[key] = previousEnv[key]
        }
    }
})
