const PDFDocument = require('pdfkit')
const QRCode = require('qrcode')

function formatDate(date) {
    const value = new Date(`${date}T00:00:00.000Z`)
    return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat('en-IN', { dateStyle: 'full', timeZone: 'UTC' }).format(value)
}

async function createTicketPdf(booking) {
    const qrDataUrl = await QRCode.toDataURL(booking.ticketCode, { margin: 1, width: 300 })
    const qrImage = Buffer.from(qrDataUrl.split(',')[1], 'base64')
    const event = booking.event || {}
    return new Promise((resolve, reject) => {
        const document = new PDFDocument({ size: 'A4', margin: 48 })
        const chunks = []
        document.on('data', (chunk) => chunks.push(chunk))
        document.on('end', () => resolve(Buffer.concat(chunks)))
        document.on('error', reject)
        document.fillColor('#4f46e5').fontSize(12).text('EVENTORA  /  DIGITAL TICKET')
        document.moveDown().fillColor('#111827').fontSize(26).font('Helvetica-Bold').text(event.title || 'Eventora event')
        document.moveDown(0.5).font('Helvetica').fontSize(12).fillColor('#475569').text(`${formatDate(booking.sessionDate || event.date || '')}  •  ${event.location || 'Venue to be confirmed'}`)
        if (event.venueAddress) document.moveDown(0.3).text(`Address: ${event.venueAddress}`)
        if (event.venueContact) document.text(`Venue contact: ${event.venueContact}`)
        document.moveDown(2).image(qrImage, { fit: [190, 190], align: 'center' })
        document.moveDown().fillColor('#111827').font('Helvetica-Bold').fontSize(18).text(booking.ticketCode, { align: 'center' })
        document.moveDown().font('Helvetica').fontSize(12)
        if (booking.ticketItems?.length > 1) {
            document.text('Tickets:', { align: 'center' })
            booking.ticketItems.forEach((item) => {
                document.text(`${item.ticketTypeName} × ${item.quantity}`, { align: 'center' })
            })
        } else {
            document.text(`Ticket type: ${booking.ticketTypeName || 'General admission'}  ·  Tickets: ${booking.quantity}`, { align: 'center' })
        }
        document.text(`Seats: ${booking.selectedSeats?.length ? booking.selectedSeats.join(', ') : 'General admission'}`, { align: 'center' })
        document.moveDown(3).fillColor('#64748b').fontSize(10).text('Present this QR code or ticket code at the event entrance. This ticket is valid for one check-in.', { align: 'center' })
        document.end()
    })
}

module.exports = { createTicketPdf }
