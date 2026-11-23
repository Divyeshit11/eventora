const PDFDocument = require('pdfkit')
const QRCode = require('qrcode')
const path = require('node:path')
const fs = require('node:fs')

const logoPath = path.resolve(__dirname, '../assets/eventora-logo.png')
const colors = {
    forest: '#0b2d23',
    green: '#175d45',
    copper: '#c88970',
    cream: '#f7f3eb',
    paleGreen: '#edf4ef',
    ink: '#17382b',
    muted: '#64756b',
    border: '#dce6de',
    white: '#ffffff',
}

function formatDate(date) {
    const value = new Date(`${date}T00:00:00.000Z`)
    return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat('en-IN', { dateStyle: 'full', timeZone: 'UTC' }).format(value)
}

function safeText(value, fallback = '') {
    return String(value || fallback).replace(/\s+/g, ' ').trim()
}

function fitText(document, value, width, maxHeight, fontSize, font = 'Helvetica') {
    const text = safeText(value)
    if (!text) return ''

    let fitted = text
    while (fitted.length > 1 && document.font(font).fontSize(fontSize).heightOfString(fitted, { width, lineGap: 2 }) > maxHeight) {
        fitted = `${fitted.slice(0, -2).trimEnd()}…`
    }
    return fitted
}

function drawLabel(document, label, x, y, width) {
    document.font('Helvetica-Bold').fontSize(8).fillColor(colors.muted)
        .text(label.toUpperCase(), x, y, { width, characterSpacing: 0.9, lineBreak: false })
}

async function createTicketPdf(booking) {
    const qrDataUrl = await QRCode.toDataURL(booking.ticketCode, { margin: 1, width: 300 })
    const qrImage = Buffer.from(qrDataUrl.split(',')[1], 'base64')
    const event = booking.event || {}
    
    // Read the optional logo before PDFKit starts drawing. Passing a verified
    // buffer is reliable in Vercel's read-only serverless filesystem.
    let logoImage
    try {
        logoImage = fs.readFileSync(logoPath)
    } catch (error) {
        console.warn('Ticket PDF logo is unavailable; generating without it:', error.message)
    }
    
    return new Promise((resolve, reject) => {
        const document = new PDFDocument({ size: 'A4', margin: 0, compress: true })
        const chunks = []
        document.on('data', (chunk) => chunks.push(chunk))
        document.on('end', () => resolve(Buffer.concat(chunks)))
        document.on('error', reject)
        const { width: pageWidth, height: pageHeight } = document.page
        const margin = 42
        const cardX = margin
        const cardY = 298
        const cardWidth = pageWidth - margin * 2
        const cardHeight = 414
        const stubWidth = 194
        const seamX = cardX + cardWidth - stubWidth
        const leftX = cardX + 25
        const leftWidth = seamX - leftX - 24
        const ticketCode = safeText(booking.ticketCode, 'Ticket code unavailable')
        const eventTitle = safeText(event.title, 'Eventora event')
        const eventDate = formatDate(booking.sessionDate || event.date || '')
        const venue = safeText(event.location, 'Venue to be confirmed')
        const ticketItems = Array.isArray(booking.ticketItems) && booking.ticketItems.length
            ? booking.ticketItems
            : [{ ticketTypeName: booking.ticketTypeName || 'General admission', quantity: booking.quantity || 1 }]

        document.rect(0, 0, pageWidth, pageHeight).fill(colors.cream)
        document.rect(0, 0, pageWidth, 116).fill(colors.forest)
        
        // A logo issue must never prevent a paid attendee downloading a valid
        // QR ticket. PDFKit continues with the rest of the ticket if needed.
        if (logoImage) {
            try {
                document.image(logoImage, margin, 31, { fit: [205, 58] })
            } catch (error) {
                console.warn('Ticket PDF logo could not be drawn:', error.message)
            }
        }
        document.font('Helvetica-Bold').fontSize(9).fillColor(colors.cream)
            .text('YOUR EVENT PASS', pageWidth - margin - 150, 42, {
                width: 150,
                align: 'right',
                characterSpacing: 1.4,
                lineBreak: false,
            })
        document.font('Helvetica').fontSize(9).fillColor('#b7c8bc')
            .text('Keep it ready at the entrance', pageWidth - margin - 190, 59, {
                width: 190,
                align: 'right',
                lineBreak: false,
            })
        document.rect(margin, 115, pageWidth - margin * 2, 2).fill(colors.copper)

        document.font('Helvetica-Bold').fontSize(8).fillColor(colors.green)
            .text('ADMISSION PASS', margin, 145, { characterSpacing: 1.8, lineBreak: false })
        document.font('Helvetica-Bold').fontSize(25).fillColor(colors.ink)
        document.text(fitText(document, eventTitle, pageWidth - margin * 2, 62, 25, 'Helvetica-Bold'), margin, 166, {
            width: pageWidth - margin * 2,
            height: 62,
            lineGap: 2,
        })
        document.font('Helvetica').fontSize(11).fillColor(colors.muted)
            .text(`${eventDate}   ·   ${fitText(document, venue, 230, 15, 11)}`, margin, 236, {
                width: pageWidth - margin * 2,
                height: 18,
                lineBreak: false,
            })

        document.roundedRect(cardX, cardY, cardWidth, cardHeight, 16)
            .fillAndStroke(colors.white, colors.border)
        document.save()
        document.roundedRect(seamX, cardY, stubWidth, cardHeight, 16).clip()
        document.rect(seamX, cardY, stubWidth, cardHeight).fill(colors.paleGreen)
        document.restore()

        document.save()
        document.lineWidth(1).strokeColor('#b8cdbf').dash(3, { space: 4 })
        document.moveTo(seamX, cardY + 18).lineTo(seamX, cardY + cardHeight - 18).stroke()
        document.undash()
        document.restore()

        for (const cutY of [cardY, cardY + cardHeight]) {
            document.circle(seamX, cutY, 8).fill(colors.cream)
        }

        drawLabel(document, 'Ticket code', leftX, cardY + 27, leftWidth)
        document.font('Helvetica-Bold').fontSize(17).fillColor(colors.ink)
            .text(fitText(document, ticketCode, leftWidth, 25, 17, 'Helvetica-Bold'), leftX, cardY + 45, {
                width: leftWidth,
                height: 25,
                lineBreak: false,
            })
        document.moveTo(leftX, cardY + 83).lineTo(seamX - 22, cardY + 83)
            .lineWidth(1).strokeColor(colors.border).stroke()

        drawLabel(document, 'Ticket type', leftX, cardY + 103, leftWidth)
        const visibleItems = ticketItems.slice(0, 5)
        visibleItems.forEach((item, index) => {
            const rowY = cardY + 123 + index * 23
            const name = fitText(document, item.ticketTypeName || 'General admission', leftWidth - 46, 16, 10)
            document.font('Helvetica').fontSize(10).fillColor(colors.ink)
                .text(name, leftX, rowY, { width: leftWidth - 50, height: 16, lineBreak: false })
            document.font('Helvetica-Bold').fontSize(10).fillColor(colors.green)
                .text(`× ${item.quantity || 1}`, seamX - 70, rowY, {
                    width: 45,
                    align: 'right',
                    lineBreak: false,
                })
        })
        if (ticketItems.length > visibleItems.length) {
            document.font('Helvetica-Oblique').fontSize(9).fillColor(colors.muted)
                .text(`+ ${ticketItems.length - visibleItems.length} more ticket types`, leftX, cardY + 123 + visibleItems.length * 23)
        }

        const seats = Array.isArray(booking.selectedSeats) && booking.selectedSeats.length
            ? booking.selectedSeats.join(', ')
            : 'General admission'
        drawLabel(document, 'Seats', leftX, cardY + 267, leftWidth)
        document.font('Helvetica').fontSize(10).fillColor(colors.ink)
            .text(fitText(document, seats, leftWidth, 48, 10), leftX, cardY + 285, {
                width: leftWidth,
                height: 48,
                lineGap: 2,
            })
        if (event.venueAddress || event.venueContact) {
            const details = [event.venueAddress, event.venueContact && `Contact: ${event.venueContact}`]
                .filter(Boolean)
                .map((value) => safeText(value))
                .join('  ·  ')
            document.font('Helvetica').fontSize(8.5).fillColor(colors.muted)
                .text(fitText(document, details, leftWidth, 24, 8.5), leftX, cardY + 350, {
                    width: leftWidth,
                    height: 24,
                    lineBreak: false,
                })
        }

        const qrSize = 144
        const qrX = seamX + (stubWidth - qrSize) / 2
        const qrY = cardY + 47
        document.roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12).fill(colors.white)
        document.image(qrImage, qrX, qrY, { width: qrSize, height: qrSize })
        document.font('Helvetica-Bold').fontSize(8).fillColor(colors.green)
            .text('SCAN AT EVENT ENTRY', seamX + 12, qrY + qrSize + 28, {
                width: stubWidth - 24,
                align: 'center',
                characterSpacing: 1,
                lineBreak: false,
            })
        document.font('Helvetica-Bold').fontSize(10).fillColor(colors.ink)
            .text(fitText(document, ticketCode, stubWidth - 24, 16, 10, 'Helvetica-Bold'), seamX + 12, qrY + qrSize + 48, {
                width: stubWidth - 24,
                align: 'center',
                lineBreak: false,
            })
        document.font('Helvetica').fontSize(8).fillColor(colors.muted)
            .text('Valid for one check-in', seamX + 12, qrY + qrSize + 68, {
                width: stubWidth - 24,
                align: 'center',
                lineBreak: false,
            })

        document.font('Helvetica-Bold').fontSize(9).fillColor(colors.ink)
            .text('Enjoy the event.', margin, 741, { width: pageWidth - margin * 2, align: 'center' })
        document.font('Helvetica').fontSize(8).fillColor(colors.muted)
            .text('Present this pass at the entrance. Keep your QR code private and ready to scan.', margin, 758, {
                width: pageWidth - margin * 2,
                align: 'center',
            })
        document.moveTo(margin, 786).lineTo(pageWidth - margin, 786)
            .lineWidth(0.7).strokeColor(colors.border).stroke()
        document.font('Helvetica').fontSize(7.5).fillColor(colors.muted)
            .text('EVENTORA  ·  FIND YOUR NEXT MOMENT', margin, 800, {
                width: pageWidth - margin * 2,
                align: 'center',
                characterSpacing: 1.1,
                lineBreak: false,
            })
        document.end()
    })
}

module.exports = { createTicketPdf }
