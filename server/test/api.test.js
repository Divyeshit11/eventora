const assert = require('node:assert/strict')
const { once } = require('node:events')
const test = require('node:test')
const { parse } = require('csv-parse/sync')
const bcrypt = require('bcryptjs')
const emailService = require('../services/emailService')
process.env.JWT_SECRET = 'automated-test-signing-secret-with-adequate-length'
process.env.CLIENT_URL = 'http://localhost:5173'
const Event = require('../models/Event')
const User = require('../models/User')
let sentPasswordResetEmail
let failPasswordResetEmail = false
emailService.sendPasswordResetEmail = async (email, resetUrl) => {
    if (failPasswordResetEmail) throw new Error('SMTP unavailable')
    sentPasswordResetEmail = { email, resetUrl }
}
const { app } = require('../server')

test('authentication, event API CRUD, pagination, and CSV workflows', async () => {
    const records = []
    const users = new Map()
    let nextId = 1
    const makeId = () => String(nextId++).padStart(24, '0')
    const admin = {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        email: 'admin@example.test',
        passwordHash: await bcrypt.hash('test-admin-password-123', 4),
        role: 'admin',
        tokenVersion: 0,
    }
    admin.save = async () => admin
    users.set(admin.email, admin)

    User.findById = (id) => ({
        select: async () => [...users.values()].find((user) => user._id === id) || null,
    })
    User.findOne = (query) => ({
        select: async () => {
            if (query.email) return users.get(query.email) || null
            return [...users.values()].find((user) =>
                user.passwordResetTokenHash === query.passwordResetTokenHash &&
                user.passwordResetExpiresAt > query.passwordResetExpiresAt.$gt
            ) || null
        },
    })
    User.updateOne = async (query, update) => {
        const user = [...users.values()].find((candidate) =>
            candidate._id === query._id &&
            candidate.passwordResetTokenHash === query.passwordResetTokenHash
        )
        if (!user) return { matchedCount: 0 }
        for (const field of Object.keys(update.$unset || {})) delete user[field]
        return { matchedCount: 1 }
    }
    User.findOneAndUpdate = async (query, update) => {
        const user = [...users.values()].find((candidate) =>
            candidate._id === query._id &&
            candidate.passwordResetTokenHash === query.passwordResetTokenHash &&
            candidate.passwordResetExpiresAt > query.passwordResetExpiresAt.$gt
        )
        if (!user) return null
        Object.assign(user, update.$set)
        for (const [field, amount] of Object.entries(update.$inc || {})) {
            user[field] = (user[field] || 0) + amount
        }
        for (const field of Object.keys(update.$unset || {})) delete user[field]
        return user
    }
    User.create = async (data) => {
        const user = {
            _id: makeId(),
            role: 'user',
            tokenVersion: 0,
            ...data,
        }
        user.save = async () => user
        users.set(user.email, user)
        return user
    }

    Event.find = () => ({
        select() { return this },
        sort() { return this },
        skip() { return this },
        limit() { return this },
        lean: async () => records.map((record) => ({ ...record })),
    })
    Event.countDocuments = async () => records.length
    Event.findById = async (id) =>
        records.find((record) => record._id === id) || null
    Event.findOne = async (query) => records.find((record) =>
        query.title.test(record.title) &&
        query.location.test(record.location) &&
        record.date === query.date &&
        Number(record.price) === query.price
    ) || null
    Event.create = async (data) => {
        const record = { _id: makeId(), ...data }
        records.unshift(record)
        return record
    }
    Event.findByIdAndUpdate = async (id, update) => {
        const index = records.findIndex((record) => record._id === id)
        if (index < 0) return null
        records[index] = { ...records[index], ...update.$set }
        return { ...records[index] }
    }
    Event.findByIdAndDelete = async (id) => {
        const index = records.findIndex((record) => record._id === id)
        return index < 0 ? null : records.splice(index, 1)[0]
    }
    Event.insertMany = async (items) => {
        const inserted = items.map((item) => ({ _id: makeId(), ...item }))
        records.unshift(...inserted)
        return inserted
    }

    const invalidEvent = new Event({
        title: '',
        category: 'Unknown',
        location: '',
        date: '2026-02-31',
        price: -1,
        image: 'javascript:alert(1)',
    })
    await assert.rejects(invalidEvent.validate(), (error) => {
        assert.equal(error.name, 'ValidationError')
        for (const field of ['title', 'category', 'location', 'date', 'price', 'image']) {
            assert.ok(error.errors[field])
        }
        return true
    })

    const server = app.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`

    try {
        sentPasswordResetEmail = null
        let response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Blocked without login' }),
        })
        assert.equal(response.status, 401)

        response = await fetch(`${baseUrl}/events`)
        assert.equal(response.status, 401)
        response = await fetch(`${baseUrl}/events/507f1f77bcf86cd799439011`)
        assert.equal(response.status, 401)

        response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: admin.email,
                password: 'wrong-password',
            }),
        })
        assert.equal(response.status, 401)

        response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: admin.email,
                password: 'test-admin-password-123',
            }),
        })
        assert.equal(response.status, 200)
        const adminToken = (await response.json()).data.token
        const adminHeaders = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
        }

        response = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'too-short@example.test',
                password: 'abc12',
            }),
        })
        assert.equal(response.status, 400)
        assert.match((await response.json()).message, /at least 6 characters/i)

        response = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'regular@example.test',
                password: 'abc123',
            }),
        })
        assert.equal(response.status, 201)
        const registration = await response.json()
        assert.equal(registration.data.user.role, 'user')
        assert.ok(registration.data.token)

        response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'regular@example.test',
                password: 'abc123',
            }),
        })
        assert.equal(response.status, 200)
        const userToken = (await response.json()).data.token
        response = await fetch(`${baseUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'REGULAR@example.test' }),
        })
        assert.equal(response.status, 200)
        assert.match((await response.json()).message, /if an account exists/i)
        assert.equal(sentPasswordResetEmail.email, 'regular@example.test')
        const resetToken = new URLSearchParams(
            new URL(sentPasswordResetEmail.resetUrl).hash.slice(1)
        ).get('token')
        assert.match(resetToken, /^[a-f0-9]{64}$/)
        const resetUser = [...users.values()].find((user) => user.email === 'regular@example.test')
        assert.notEqual(resetUser.passwordResetTokenHash, resetToken)
        assert.ok(resetUser.passwordResetExpiresAt > new Date())

        const resetRequest = (token, password) => fetch(`${baseUrl}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
        })
        response = await resetRequest('a'.repeat(64), 'new-regular-password-123')
        assert.equal(response.status, 400)
        resetUser.passwordResetExpiresAt = new Date(Date.now() - 1000)
        response = await resetRequest(resetToken, 'new-regular-password-123')
        assert.equal(response.status, 400)

        response = await fetch(`${baseUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'regular@example.test' }),
        })
        assert.equal(response.status, 200)
        const freshResetToken = new URLSearchParams(
            new URL(sentPasswordResetEmail.resetUrl).hash.slice(1)
        ).get('token')
        response = await resetRequest(resetToken, 'short')
        assert.equal(response.status, 400)
        response = await resetRequest(freshResetToken, 'new-regular-password-123')
        assert.equal(response.status, 200)
        assert.match((await response.json()).message, /sign in/i)
        response = await resetRequest(freshResetToken, 'another-password-123')
        assert.equal(response.status, 400)

        response = await fetch(`${baseUrl}/events`, {
            headers: { Authorization: `Bearer ${userToken}` },
        })
        assert.equal(response.status, 401)
        response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'regular@example.test',
                password: 'new-regular-password-123',
            }),
        })
        assert.equal(response.status, 200)
        const renewedUserToken = (await response.json()).data.token

        sentPasswordResetEmail = null
        response = await fetch(`${baseUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'unknown@example.test' }),
        })
        assert.equal(response.status, 200)
        assert.match((await response.json()).message, /if an account exists/i)
        assert.equal(sentPasswordResetEmail, null)

        failPasswordResetEmail = true
        response = await fetch(`${baseUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'regular@example.test' }),
        })
        assert.equal(response.status, 200)
        assert.match((await response.json()).message, /if an account exists/i)
        assert.equal(resetUser.passwordResetTokenHash, undefined)
        failPasswordResetEmail = false

        response = await fetch(`${baseUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'still-unknown@example.test' }),
        })
        assert.equal(response.status, 200)
        assert.match((await response.json()).message, /if an account exists/i)

        response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${renewedUserToken}`,
            },
            body: JSON.stringify({ title: 'Blocked for regular user' }),
        })
        assert.equal(response.status, 403)

        for (const path of ['/events', '/events/']) {
            response = await fetch(
                `${baseUrl}${path}?page=1&limit=5&search=meetup&category=Music&maxPrice=200&sort=price-low`,
                { headers: adminHeaders }
            )
            assert.equal(response.status, 200)
            const payload = await response.json()
            assert.equal(payload.success, true)
            assert.equal(payload.pagination.limit, 5)
        }

        response = await fetch(`${baseUrl}/events/not-an-id`, { headers: adminHeaders })
        assert.equal(response.status, 400)
        response = await fetch(`${baseUrl}/events/507f1f77bcf86cd799439011`, {
            headers: adminHeaders,
        })
        assert.equal(response.status, 404)

        response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                title: 'API Smoke',
                category: 'Music',
                location: 'Local',
                date: '2026-11-15',
                price: 99,
            }),
        })
        assert.equal(response.status, 201)
        const created = (await response.json()).data

        response = await fetch(`${baseUrl}/events/${created._id}`, {
            headers: adminHeaders,
        })
        assert.equal(response.status, 200)
        assert.equal((await response.json()).data._id, created._id)

        response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                title: 'API Smoke',
                category: 'Music',
                location: 'Local',
                date: '2026-11-15',
                price: 99,
            }),
        })
        assert.equal(response.status, 409)
        assert.match((await response.json()).message, /already exists/i)
        assert.equal(records.length, 1)

        response = await fetch(`${baseUrl}/events/${created._id}`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({ title: 'Updated Smoke' }),
        })
        assert.equal(response.status, 200)
        assert.equal((await response.json()).data.title, 'Updated Smoke')

        response = await fetch(`${baseUrl}/events/${created._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminToken}` },
        })
        assert.equal(response.status, 200)

        const csv = [
            'title,category,location,date,price,image,description',
            'Valid Event,Music,Local,2026-11-15,100,,"Music, friends"',
            'Valid Event,Music,Local,2026-11-15,100,,Duplicate',
            'Bad Category,Unknown,Local,2026-11-16,100,,Invalid',
            ',,,,,,',
        ].join('\n')
        const formData = new FormData()
        formData.append('files', new Blob([csv], { type: 'text/csv' }), 'events.csv')
        response = await fetch(`${baseUrl}/events/import-csv`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: formData,
        })
        assert.equal(response.status, 200)
        const messages = (await response.text())
            .trim()
            .split('\n')
            .map((line) => JSON.parse(line))
        const summary = messages.at(-1)
        assert.equal(summary.count, 1)
        assert.equal(summary.errors.length, 3)
        assert.deepEqual(summary.successfulRows, [
            { file: 'events.csv', row: 2 },
        ])
        assert.ok(messages.some((payload) => payload.type === 'progress' && payload.stage === 'validating'))
        assert.ok(messages.some((payload) => payload.type === 'progress' && payload.stage === 'saving'))

        const bulkFormData = new FormData()
        for (let index = 0; index < 10; index += 1) {
            const date = `2026-11-${String(index + 16).padStart(2, '0')}`
            const bulkCsv = [
                'title,category,location,date,price',
                `Bulk Event ${index},Music,Local,${date},${100 + index}`,
            ].join('\n')
            bulkFormData.append(
                'files',
                new Blob([bulkCsv], { type: 'text/csv' }),
                `bulk-${index}.csv`
            )
        }
        response = await fetch(`${baseUrl}/events/import-csv`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: bulkFormData,
        })
        assert.equal(response.status, 200)
        const bulkMessages = (await response.text())
            .trim()
            .split('\n')
            .map((line) => JSON.parse(line))
        const bulkSummary = bulkMessages.at(-1)
        assert.equal(bulkSummary.count, 10)
        assert.equal(bulkSummary.filesImported, 10)
        assert.equal(bulkSummary.successfulRows.length, 10)

        const tooManyFiles = new FormData()
        for (let index = 0; index < 11; index += 1) {
            tooManyFiles.append(
                'files',
                new Blob(['title,category,location,date,price\nA,Music,Local,2026-11-15,1'], { type: 'text/csv' }),
                `too-many-${index}.csv`
            )
        }
        response = await fetch(`${baseUrl}/events/import-csv`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: tooManyFiles,
        })
        assert.equal(response.status, 400)
        assert.match((await response.json()).message, /maximum of 10 CSV files/i)

        response = await fetch(`${baseUrl}/events/export-csv`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        })
        assert.equal(response.status, 200)
        const exportedRows = parse(await response.text(), { columns: true })
        assert.equal(
            exportedRows.find((row) => row.title === 'Valid Event').description,
            'Music, friends'
        )

        const invalidFile = new FormData()
        invalidFile.append(
            'files',
            new Blob(['not a CSV'], { type: 'text/plain' }),
            'events.txt'
        )
        response = await fetch(`${baseUrl}/events/import-csv`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: invalidFile,
        })
        assert.equal(response.status, 400)

        response = await fetch(`${baseUrl}/auth/change-password`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                currentPassword: 'wrong-current-password',
                newPassword: 'new-test-password-123',
            }),
        })
        assert.equal(response.status, 401)

        response = await fetch(`${baseUrl}/auth/change-password`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                currentPassword: 'test-admin-password-123',
                newPassword: 'new-test-password-123',
            }),
        })
        assert.equal(response.status, 200)

        response = await fetch(`${baseUrl}/events/export-csv`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        })
        assert.equal(response.status, 401)

        response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: admin.email,
                password: 'new-test-password-123',
            }),
        })
        assert.equal(response.status, 200)
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve())
        })
    }
})
