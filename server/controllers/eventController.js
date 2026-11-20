const { parse: parseCsv } = require('csv-parse')
const mongoose = require('mongoose')
const Event = require('../models/Event')
const Booking = require('../models/Booking')

const EVENT_FIELDS = [
    'title',
    'category',
    'location',
    'date',
    'price',
    'ticketCapacity',
    'image',
    'description',
    'sessions',
    'seatingEnabled',
    'seatRows',
    'seatsPerRow',
    'venueAddress',
    'venueContact',
    'ticketTypes',
]
const CSV_EVENT_FIELDS = EVENT_FIELDS.filter((field) => field !== 'ticketTypes')
const CATEGORIES = ['Technology', 'Music', 'Business', 'Comedy', 'Other']
const REQUIRED_CSV_HEADERS = ['title', 'category', 'location', 'date', 'price']
const INSERT_CHUNK_SIZE = 500

function getEventPayload(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null
    return Object.fromEntries(
        EVENT_FIELDS
            .filter((field) => Object.hasOwn(body, field))
            .map((field) => [field, body[field]])
    )
}

function normalizedDuplicateKey(event) {
    return JSON.stringify([
        event.title,
        event.location,
        event.date,
        Number(event.price),
    ].map((value) => String(value ?? '').trim().toLowerCase()))
}

function exactCaseInsensitive(value) {
    const escapedValue = String(value ?? '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escapedValue}$`, 'i')
}

function sendBadRequest(res, message) {
    return res.status(400).json({ success: false, message })
}

function normalizeTicketTypes(payload, currentEvent) {
    const rawTypes = payload.ticketTypes === undefined
        ? [{
            name: 'General admission',
            price: payload.price ?? currentEvent?.price,
            quantity: payload.ticketCapacity ?? currentEvent?.ticketCapacity ?? 100,
        }]
        : payload.ticketTypes
    if (!Array.isArray(rawTypes) || rawTypes.length < 1 || rawTypes.length > 10) return null

    const existingTypes = currentEvent?.ticketTypes || []
    const names = new Set()
    const ticketTypes = []
    for (const rawType of rawTypes) {
        const name = typeof rawType?.name === 'string' ? rawType.name.trim() : ''
        const price = Number(rawType?.price)
        const quantity = Number(rawType?.quantity)
        const key = name.toLowerCase()
        if (!name || name.length > 80 || names.has(key) || !Number.isFinite(price) || price < 0 ||
            !Number.isInteger(quantity) || quantity < 1 || quantity > 100000) return null
        names.add(key)
        const existing = existingTypes.find((type) => String(type._id) === String(rawType._id))
        ticketTypes.push({
            ...(existing ? { _id: existing._id } : {}),
            name,
            price,
            quantity,
            sold: existing?.sold ?? (existingTypes.length ? 0 : currentEvent?.ticketsSold ?? 0),
        })
    }
    if (existingTypes.some((type) =>
        type.sold > 0 && !ticketTypes.some((nextType) => String(nextType._id) === String(type._id))
    )) return null
    return ticketTypes
}

function ticketInventorySummary(ticketTypes) {
    return {
        price: Math.min(...ticketTypes.map((type) => type.price)),
        ticketCapacity: ticketTypes.reduce((total, type) => total + type.quantity, 0),
        ticketsSold: ticketTypes.reduce((total, type) => total + type.sold, 0),
    }
}

async function getEvents(req, res, managementRoute = false) {
    try {
        const pageValue = Number.parseInt(req.query.page, 10)
        const limitValue = Number.parseInt(req.query.limit, 10)
        const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1
        const limit = Number.isFinite(limitValue)
            ? Math.min(100, Math.max(1, limitValue))
            : 12
        const filter = {}
        const conditions = []
        const management = managementRoute === true || req.query.management === 'true'
        if (management) {
            if (!['admin', 'organizer'].includes(req.auth.role)) {
                return res.status(403).json({ success: false, message: 'Organizer access is required' })
            }
            if (req.auth.role === 'organizer') filter.organizer = req.auth.sub
        } else {
            conditions.push({ $or: [{ status: 'published' }, { status: { $exists: false } }] })
        }
        const search = typeof req.query.search === 'string'
            ? req.query.search.trim()
            : ''

        if (management && req.query.status) {
            if (!['pending_approval', 'published', 'rejected', 'suspended'].includes(req.query.status)) {
                return sendBadRequest(res, 'status is not supported')
            }
            filter.status = req.query.status
        }

        if (search.length > 200) {
            return sendBadRequest(res, 'search must be 200 characters or fewer')
        }

        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const searchRegex = new RegExp(escapedSearch, 'i')
            conditions.push({ $or: [
                { title: searchRegex },
                { location: searchRegex },
                { description: searchRegex },
            ] })
        }

        if (typeof req.query.category === 'string' && req.query.category !== 'all') {
            if (!CATEGORIES.includes(req.query.category)) {
                return sendBadRequest(res, 'category is not supported')
            }
            filter.category = req.query.category
        }

        if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
            const maxPrice = Number(req.query.maxPrice)
            if (!Number.isFinite(maxPrice) || maxPrice < 0) {
                return sendBadRequest(res, 'maxPrice must be a valid non-negative number')
            }
            filter.price = { $lte: maxPrice }
        }

        if (conditions.length) filter.$and = conditions

        const sortOptions = {
            default: { createdAt: -1 },
            'price-low': { price: 1 },
            'price-high': { price: -1 },
            title: { title: 1 },
        }
        const sortBy = sortOptions[req.query.sort] || sortOptions.default
        const skip = (page - 1) * limit
        const [events, totalEvents] = await Promise.all([
            Event.find(filter).sort(sortBy).skip(skip).limit(limit).lean(),
            Event.countDocuments(filter),
        ])

        return res.status(200).json({
            success: true,
            data: events,
            pagination: {
                currentPage: page,
                limit,
                totalEvents,
                totalPages: Math.ceil(totalEvents / limit),
                hasNextPage: page * limit < totalEvents,
                hasPrevPage: page > 1,
            },
        })
    } catch (error) {
        console.error('Failed to fetch events:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
        })
    }
}

async function getPendingEvents(req, res) {
    try {
        const events = await Event.find({ status: 'pending_approval' })
            .populate('organizer', 'email')
            .sort({ createdAt: 1 })
            .lean()
        return res.json({ success: true, data: events })
    } catch (error) {
        console.error('Failed to load pending events:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load pending events' })
    }
}

async function getEventById(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return sendBadRequest(res, 'Invalid event ID')
        }

        const event = await Event.findById(req.params.id)
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            })
        }
        if (event.status && event.status !== 'published' &&
            !(req.auth.role === 'organizer' && String(event.organizer) === req.auth.sub) &&
            req.auth.role !== 'admin') {
            return res.status(404).json({ success: false, message: 'Event not found' })
        }

        return res.status(200).json({ success: true, data: event })
    } catch (error) {
        console.error('Failed to fetch event:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
        })
    }
}

async function getSeatAvailability(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) return sendBadRequest(res, 'Invalid event ID')
    try {
        const event = await Event.findById(req.params.id).select('seatingEnabled seatRows seatsPerRow date sessions status organizer')
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        if (event.status && event.status !== 'published' &&
            !(req.auth.role === 'organizer' && String(event.organizer) === req.auth.sub) &&
            req.auth.role !== 'admin') return res.status(404).json({ success: false, message: 'Event not found' })
        if (!event.seatingEnabled) return res.json({ success: true, data: { enabled: false, reservedSeats: [] } })
        const sessionDate = typeof req.query.date === 'string' ? req.query.date : event.date
        const reserved = await require('../models/Booking').find({
            event: event._id,
            sessionDate,
            status: { $in: ['paid', 'pending'] },
            $or: [{ status: 'paid' }, { reservationExpiresAt: { $gt: new Date() } }],
        }).select('selectedSeats').lean()
        return res.json({ success: true, data: { enabled: true, rows: event.seatRows, seatsPerRow: event.seatsPerRow, reservedSeats: [...new Set(reserved.flatMap((booking) => booking.selectedSeats || []))] } })
    } catch (error) {
        console.error('Failed to load seat availability:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load seat availability' })
    }
}

async function createEvent(req, res) {
    try {
        const payload = getEventPayload(req.body)
        if (!payload) return sendBadRequest(res, 'Event data must be a JSON object')
        if (typeof payload.venueAddress !== 'string' || !payload.venueAddress.trim()) {
            return sendBadRequest(res, 'Venue address is required')
        }

        const ticketTypes = normalizeTicketTypes(payload)
        if (!ticketTypes) return sendBadRequest(res, 'Add 1–10 ticket types with unique names, valid prices, and quantities from 1 to 100000')
        const inventory = ticketInventorySummary(ticketTypes)
        const duplicate = await Event.findOne({
            title: exactCaseInsensitive(payload.title),
            location: exactCaseInsensitive(payload.location),
            date: payload.date,
            price: inventory.price,
        })
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'This event already exists (title, location, date, and price match)',
            })
        }

        const event = await Event.create({
            ...payload,
            ...inventory,
            ticketTypes,
            organizer: req.auth.sub,
            status: req.auth.role === 'admin' ? 'published' : 'pending_approval',
        })
        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event,
        })
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return sendBadRequest(res, error.message)
        }
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'This event already exists (title, location, date, and price match)',
            })
        }
        console.error('Failed to create event:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Failed to create event',
        })
    }
}

async function updateEvent(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return sendBadRequest(res, 'Invalid event ID')
        }

        const payload = getEventPayload(req.body)
        if (!payload) return sendBadRequest(res, 'Event data must be a JSON object')
        if (Object.keys(payload).length === 0) {
            return sendBadRequest(res, 'Provide at least one event field to update')
        }

        const currentEvent = await Event.findById(req.params.id)
        if (!currentEvent) return res.status(404).json({ success: false, message: 'Event not found' })
        if (req.auth.role === 'organizer' && String(currentEvent.organizer) !== req.auth.sub) {
            return res.status(403).json({ success: false, message: 'You can only manage your own events' })
        }
        let inventoryChanged = false
        if (payload.ticketTypes !== undefined || payload.price !== undefined || payload.ticketCapacity !== undefined) {
            const ticketTypes = normalizeTicketTypes(payload, currentEvent)
            if (!ticketTypes) return sendBadRequest(res, 'Add 1–10 ticket types with unique names, valid prices, and quantities from 1 to 100000')
            if (ticketTypes.some((type) => type.quantity < type.sold)) {
                return sendBadRequest(res, 'Ticket type quantity cannot be lower than tickets already reserved or sold')
            }
            payload.ticketTypes = ticketTypes
            Object.assign(payload, ticketInventorySummary(ticketTypes))
            inventoryChanged = true
        }
        if (payload.ticketCapacity !== undefined && Number(payload.ticketCapacity) < currentEvent.ticketsSold) {
            return sendBadRequest(res, 'Ticket capacity cannot be lower than tickets already reserved or sold')
        }
        if (req.auth.role === 'organizer') {
            payload.status = 'pending_approval'
            payload.moderationNote = ''
        }

        const updateFilter = { _id: req.params.id }
        if (inventoryChanged) {
            updateFilter.$and = [
                currentEvent.ticketsSold === undefined
                    ? { $or: [{ ticketsSold: { $exists: false } }, { ticketsSold: 0 }] }
                    : { ticketsSold: currentEvent.ticketsSold },
                ...(currentEvent.ticketTypes || []).map((type) => ({
                    ticketTypes: { $elemMatch: { _id: type._id, sold: type.sold } },
                })),
            ]
        }
        const event = inventoryChanged
            ? await Event.findOneAndUpdate(
                updateFilter,
                { $set: payload },
                { returnDocument: 'after', runValidators: true, context: 'query' }
            )
            : await Event.findByIdAndUpdate(
                req.params.id,
                { $set: payload },
                { returnDocument: 'after', runValidators: true, context: 'query' }
            )
        if (!event) {
            if (inventoryChanged) return res.status(409).json({ success: false, message: 'Ticket sales changed while you were editing. Refresh the event and try again.' })
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: event,
        })
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return sendBadRequest(res, error.message)
        }
        console.error('Failed to update event:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Failed to update event',
        })
    }
}

async function deleteEvent(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return sendBadRequest(res, 'Invalid event ID')
        }

        const currentEvent = await Event.findById(req.params.id)
        if (!currentEvent) return res.status(404).json({ success: false, message: 'Event not found' })
        if (req.auth.role === 'organizer' && String(currentEvent.organizer) !== req.auth.sub) {
            return res.status(403).json({ success: false, message: 'You can only manage your own events' })
        }
        if (currentEvent.ticketsSold > 0) {
            return res.status(409).json({ success: false, message: 'Events with ticket reservations cannot be deleted; contact an administrator to moderate the event' })
        }
        const event = await Event.findOneAndDelete({
            _id: req.params.id,
            $or: [{ ticketsSold: 0 }, { ticketsSold: { $exists: false } }],
        })
        if (!event) {
            return res.status(currentEvent.ticketsSold > 0 ? 409 : 404).json({
                success: false,
                message: currentEvent.ticketsSold > 0
                    ? 'Events with ticket reservations cannot be deleted; contact an administrator to moderate the event'
                    : 'Event changed while you were deleting it; refresh and try again',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully',
        })
    } catch (error) {
        console.error('Failed to delete event:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Failed to delete event',
        })
    }
}

async function setEventModeration(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) return sendBadRequest(res, 'Invalid event ID')
    const { status, note = '' } = req.body || {}
    if (!['published', 'rejected', 'suspended'].includes(status) ||
        typeof note !== 'string' ||
        note.length > 1000 ||
        (status === 'rejected' && !note.trim())) {
        return sendBadRequest(res, 'Choose a valid moderation status and a note no longer than 1000 characters')
    }
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: { status, moderationNote: note.trim() } },
            { new: true, runValidators: true }
        )
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        return res.json({ success: true, data: event })
    } catch (error) {
        console.error('Failed to moderate event:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to moderate event' })
    }
}

async function getEventSales(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) return sendBadRequest(res, 'Invalid event ID')
    try {
        const event = await Event.findById(req.params.id).select('organizer title ticketTypes price ticketCapacity ticketsSold')
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        if (req.auth.role === 'organizer' && String(event.organizer) !== req.auth.sub) {
            return res.status(403).json({ success: false, message: 'You can only view sales for your own events' })
        }
        const [summary = {}] = await Booking.aggregate([
            { $match: { event: event._id } },
            { $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                paidBookings: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
                paidTickets: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$quantity', 0] } },
                revenue: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totalPrice', 0] } },
                checkedIn: { $sum: { $cond: [{ $ne: ['$checkedInAt', null] }, 1, 0] } },
            } },
        ])
        return res.json({
            success: true,
            data: {
                event: { id: String(event._id), title: event.title },
                summary: { ...summary, ticketCapacity: event.ticketCapacity, ticketsReserved: event.ticketsSold },
                ticketTypes: event.ticketTypes || [],
            },
        })
    } catch (error) {
        console.error('Failed to load event sales:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load event sales' })
    }
}

async function getEventAttendees(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) return sendBadRequest(res, 'Invalid event ID')
    try {
        const event = await Event.findById(req.params.id).select('organizer')
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        if (req.auth.role === 'organizer' && String(event.organizer) !== req.auth.sub) {
            return res.status(403).json({ success: false, message: 'You can only manage attendees for your own events' })
        }
        const attendees = await Booking.find({ event: event._id, status: { $in: ['paid', 'pending'] } })
            .populate('user', 'email')
            .sort({ createdAt: -1 })
            .lean()
        return res.json({ success: true, data: attendees })
    } catch (error) {
        console.error('Failed to load event attendees:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load event attendees' })
    }
}

function safeReportCell(value) {
    const text = String(value ?? '')
    const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text
    return /[",\r\n]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText
}

async function exportEventAttendees(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) return sendBadRequest(res, 'Invalid event ID')
    try {
        const event = await Event.findById(req.params.id).select('organizer title')
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        if (req.auth.role === 'organizer' && String(event.organizer) !== req.auth.sub) {
            return res.status(403).json({ success: false, message: 'You can only export attendees for your own events' })
        }
        const attendees = await Booking.find({ event: event._id }).populate('user', 'email').sort({ createdAt: -1 }).lean()
        const rows = [
            ['Event', 'Attendee email', 'Ticket code', 'Ticket type', 'Quantity', 'Amount', 'Status', 'Checked in at'],
            ...attendees.map((booking) => [
                event.title,
                booking.user?.email,
                booking.ticketCode,
                booking.ticketTypeName,
                booking.quantity,
                booking.totalPrice,
                booking.status,
                booking.checkedInAt?.toISOString(),
            ]),
        ]
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="eventora-attendees-${event._id}.csv"`)
        return res.send(rows.map((row) => row.map(safeReportCell).join(',')).join('\r\n'))
    } catch (error) {
        console.error('Failed to export event attendees:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to export event attendees' })
    }
}

function quoteCsvCell(value) {
    const text = String(value ?? '')
    return /[",\r\n]/.test(text)
        ? `"${text.replace(/"/g, '""')}"`
        : text
}

async function exportEventsToCsv(req, res) {
    try {
        const events = await Event.find().sort({ createdAt: -1 }).lean()
        const rows = [
            CSV_EVENT_FIELDS,
            ...events.map((event) => CSV_EVENT_FIELDS.map((field) =>
                Array.isArray(event[field]) ? JSON.stringify(event[field]) : event[field]
            )),
        ]
        const csv = rows
            .map((row) => row.map(quoteCsvCell).join(','))
            .join('\r\n')

        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', 'attachment; filename="eventora-events.csv"')
        return res.status(200).send(csv)
    } catch (error) {
        console.error('Failed to export events:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Failed to export events',
        })
    }
}

function mapCsvRow(row) {
    const category = String(row.category ?? '').trim()
    const matchedCategory = CATEGORIES.find(
        (value) => value.toLowerCase() === category.toLowerCase()
    )

    return {
        title: String(row.title ?? '').trim(),
        category: matchedCategory || category,
        location: String(row.location ?? '').trim(),
        venueAddress: String(row.venueaddress ?? '').trim(),
        venueContact: String(row.venuecontact ?? '').trim(),
        date: String(row.date ?? '').trim(),
        price: String(row.price ?? '').trim() === '' ? Number.NaN : Number(row.price),
        image: String(row.image ?? '').trim(),
        description: String(row.description ?? '').trim(),
    }
}

async function parseCsvFile(file, existingKeys, uploadedKeys, onProgress) {
    let headers = []
    let duplicateHeaders = []
    const parser = parseCsv(file.buffer, {
        bom: true,
        skip_empty_lines: false,
        trim: true,
        relax_column_count: true,
        info: true,
        columns: (headerRow) => {
            headers = headerRow.map((header) => header.trim().toLowerCase())
            duplicateHeaders = headers.filter(
                (header, index) => headers.indexOf(header) !== index
            )
            return headers
        },
    })

    const events = []
    const errors = []
    let recordCount = 0
    let lastReportedPercent = -1
    let pendingRows = []

    async function processBatch() {
        const validationResults = await Promise.all(pendingRows.map(async ({ eventData, empty }) => {
            if (empty) return null
            try {
                await Event.validate(eventData)
                return null
            } catch (error) {
                return error
            }
        }))

        for (let index = 0; index < pendingRows.length; index += 1) {
            const { eventData, empty, row } = pendingRows[index]
            const rowErrors = []
            if (empty) {
                rowErrors.push('Record is empty')
            } else if (validationResults[index]) {
                rowErrors.push(...Object.values(validationResults[index].errors).map((item) => item.message))
            }

            if (rowErrors.length === 0) {
                const duplicateKey = normalizedDuplicateKey(eventData)
                if (existingKeys.has(duplicateKey)) {
                    rowErrors.push('Duplicate event already exists (title, location, date, and price match)')
                } else if (uploadedKeys.has(duplicateKey)) {
                    rowErrors.push('Duplicate event appears elsewhere in this CSV import')
                } else {
                    uploadedKeys.add(duplicateKey)
                    events.push({ event: eventData, row })
                }
            }

            if (rowErrors.length) {
                errors.push({ file: file.originalname, row, errors: rowErrors })
            }
        }

        const lastRow = pendingRows.at(-1)
        const processedBytes = Math.min(file.buffer.length, Number(lastRow.info.bytes) || 0)
        const percent = file.buffer.length
            ? Math.floor(processedBytes / file.buffer.length * 100)
            : 100
        if (onProgress && (
            lastRow.row === 2 ||
            lastRow.row % 250 === 1 ||
            percent > lastReportedPercent
        )) {
            lastReportedPercent = percent
            await onProgress({ current: lastRow.row - 1, percent })
        }
        pendingRows = []
    }

    for await (const parsedRecord of parser) {
        const { record, info } = parsedRecord
        if (recordCount === 0) {
            const missingHeaders = REQUIRED_CSV_HEADERS.filter(
                (header) => !headers.includes(header)
            )
            const headerErrors = []
            if (missingHeaders.length) {
                headerErrors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
            }
            if (duplicateHeaders.length) {
                headerErrors.push(`Duplicate headers: ${[...new Set(duplicateHeaders)].join(', ')}`)
            }
            if (headerErrors.length) {
                errors.push({ file: file.originalname, row: 1, errors: headerErrors })
                break
            }
        }

        recordCount += 1
        const eventData = mapCsvRow(record)
        pendingRows.push({
            eventData,
            empty: Object.values(record).every((value) => String(value ?? '').trim() === ''),
            info,
            row: recordCount + 1,
        })
        if (pendingRows.length >= 100) {
            await processBatch()
        }
    }

    if (pendingRows.length) await processBatch()

    if (errors.length === 0 && recordCount === 0) {
        const missingHeaders = REQUIRED_CSV_HEADERS.filter(
            (header) => !headers.includes(header)
        )
        const headerErrors = []
        if (missingHeaders.length) {
            headerErrors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
        }
        if (duplicateHeaders.length) {
            headerErrors.push(`Duplicate headers: ${[...new Set(duplicateHeaders)].join(', ')}`)
        }
        errors.push({
            file: file.originalname,
            row: 1,
            errors: headerErrors.length ? headerErrors : ['CSV contains no event records'],
        })
    }

    return { events, errors }
}

function writeImportEvent(res, payload) {
    res.write(`${JSON.stringify(payload)}\n`)
}

async function importEventsFromCsv(req, res) {
    const files = req.files || []
    if (files.length === 0) {
        return sendBadRequest(res, 'Please upload at least one CSV file')
    }

    res.status(200)
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    try {
        const existingEvents = await Event.find()
            .select('title location date price')
            .lean()
        const existingKeys = new Set(existingEvents.map(normalizedDuplicateKey))
        const uploadedKeys = new Set()
        const errors = []
        const successfulRows = []
        let importedCount = 0
        let filesImported = 0
        let filesFailed = 0
        const totalBytes = files.reduce((total, file) => total + file.size, 0)
        let completedBytes = 0

        for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
            const file = files[fileIndex]
            const fileIndexDisplay = fileIndex + 1
            writeImportEvent(res, {
                type: 'progress',
                stage: 'parsing',
                file: file.originalname,
                fileIndex: fileIndexDisplay,
                fileCount: files.length,
                percent: Math.floor(completedBytes / Math.max(totalBytes, 1) * 90),
                message: `Reading ${file.originalname}`,
            })

            try {
                const { events, errors: fileErrors } = await parseCsvFile(
                    file,
                    existingKeys,
                    uploadedKeys,
                    async ({ current, percent }) => {
                        writeImportEvent(res, {
                            type: 'progress',
                            stage: 'validating',
                            file: file.originalname,
                            fileIndex: fileIndexDisplay,
                            fileCount: files.length,
                            current,
                            percent: Math.min(
                                90,
                                Math.floor((completedBytes + file.size * percent / 100) / Math.max(totalBytes, 1) * 90)
                            ),
                            message: `Validating ${file.originalname} (row ${current})`,
                        })
                        await new Promise((resolve) => setImmediate(resolve))
                    }
                )
                errors.push(...fileErrors)
                completedBytes += file.size

                for (let index = 0; index < events.length; index += INSERT_CHUNK_SIZE) {
                    const chunk = events.slice(index, index + INSERT_CHUNK_SIZE)
                    const inserted = await Event.insertMany(
                        chunk.map((entry) => ({ ...entry.event, organizer: req.auth.sub, status: 'published' }))
                    )
                    importedCount += inserted.length
                    successfulRows.push(...chunk.map((entry) => ({
                        file: file.originalname,
                        row: entry.row,
                    })))
                    writeImportEvent(res, {
                        type: 'progress',
                        stage: 'saving',
                        file: file.originalname,
                        fileIndex: fileIndexDisplay,
                        fileCount: files.length,
                        current: Math.min(index + chunk.length, events.length),
                        total: events.length,
                        percent: 90 + Math.floor(
                            ((fileIndex + (index + chunk.length) / Math.max(events.length, 1)) / files.length) * 9
                        ),
                        message: `Saving ${file.originalname} (${Math.min(index + chunk.length, events.length)} of ${events.length})`,
                    })
                    await new Promise((resolve) => setImmediate(resolve))
                }

                if (events.length > 0) filesImported += 1
                if (fileErrors.length > 0 || events.length === 0) filesFailed += 1
            } catch (error) {
                filesFailed += 1
                errors.push({
                    file: file.originalname,
                    row: 1,
                    errors: [error.message || 'Could not parse this CSV file'],
                })
            }
        }

        writeImportEvent(res, {
            type: 'complete',
            success: importedCount > 0,
            message: importedCount > 0
                ? `Imported ${importedCount} event(s); ${errors.length} row(s) were rejected.`
                : 'No events were imported. Review the reported validation errors.',
            count: importedCount,
            successfulRows,
            filesImported,
            filesFailed,
            errors,
            percent: 100,
        })
        return res.end()
    } catch (error) {
        console.error('CSV import error:', error.message)
        writeImportEvent(res, {
            type: 'complete',
            success: false,
            message: 'Failed to import CSV',
            count: 0,
            filesImported: 0,
            filesFailed: files.length,
            errors: [{
                file: '',
                row: 1,
                errors: ['The import could not be completed. Check server logs.'],
            }],
            percent: 100,
        })
        return res.end()
    }
}

module.exports = {
    getEvents,
    getPendingEvents,
    getEventById,
    getSeatAvailability,
    createEvent,
    updateEvent,
    deleteEvent,
    setEventModeration,
    getEventSales,
    getEventAttendees,
    exportEventAttendees,
    exportEventsToCsv,
    importEventsFromCsv,
}
