const assert = require('node:assert/strict')
const test = require('node:test')
const { createMinimalTicketPdf, createTicketPdf } = require('../services/ticketPdfService')

test('creates a dependency-free fallback PDF for a paid ticket', () => {
    const pdf = createMinimalTicketPdf({
        ticketCode: 'EVT-ABC12345',
        quantity: 2,
        ticketTypeName: 'General admission',
        selectedSeats: ['A1', 'A2'],
        sessionDate: '2026-12-01',
        event: { title: 'Eventora test event', location: 'Rajkot', date: '2026-12-01' },
    })

    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-')
    assert.match(pdf.toString('latin1'), /EVT-ABC12345/)
    assert.match(pdf.toString('latin1'), /Eventora test event/)
})

test('creates the designed admission-pass PDF with a vector QR code', async () => {
    const pdf = await createTicketPdf({
        ticketCode: 'EVT-ABC12345',
        quantity: 2,
        ticketTypeName: 'General admission',
        selectedSeats: ['A1', 'A2'],
        sessionDate: '2026-12-01',
        event: { title: 'Eventora test event', location: 'Rajkot', date: '2026-12-01' },
    })

    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-')
    assert.ok(pdf.length > 10_000)
})
