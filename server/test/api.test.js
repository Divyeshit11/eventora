const assert = require('node:assert/strict')
const { once } = require('node:events')
const test = require('node:test')
const { parse } = require('csv-parse/sync')
const bcrypt = require('bcryptjs')
process.env.JWT_SECRET = 'automated-test-signing-secret-with-adequate-length'
const Event = require('../models/Event')
const User = require('../models/User')
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
        select: async () => users.get(query.email) || null,
    })
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
        let response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Blocked without login' }),
        })
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
                email: 'regular@example.test',
                password: 'regular-user-password-123',
            }),
        })
        assert.equal(response.status, 201)
        assert.equal((await response.json()).data.role, 'user')

        response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'regular@example.test',
                password: 'regular-user-password-123',
            }),
        })
        const userToken = (await response.json()).data.token
        response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ title: 'Blocked for regular user' }),
        })
        assert.equal(response.status, 403)

        for (const path of ['/events', '/events/']) {
            response = await fetch(
                `${baseUrl}${path}?page=1&limit=5&search=meetup&category=Music&maxPrice=200&sort=price-low`
            )
            assert.equal(response.status, 200)
            const payload = await response.json()
            assert.equal(payload.success, true)
            assert.equal(payload.pagination.limit, 5)
        }

        response = await fetch(`${baseUrl}/events/not-an-id`)
        assert.equal(response.status, 400)
        response = await fetch(`${baseUrl}/events/507f1f77bcf86cd799439011`)
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

        response = await fetch(`${baseUrl}/events/export-csv`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        })
        assert.equal(response.status, 200)
        const exportedRows = parse(await response.text(), { columns: true })
        assert.equal(exportedRows[0].description, 'Music, friends')

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
