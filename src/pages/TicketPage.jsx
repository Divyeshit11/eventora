import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import QRCode from 'qrcode'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import { downloadBookingTicket, getBookingTicket } from '../services/eventService'

function TicketPage() {
    const { bookingId } = useParams(); const [state, setState] = useState({ status: 'loading', ticket: null, qr: '', error: '' })
    useEffect(() => { let active = true; getBookingTicket(bookingId).then(async (ticket) => { const qr = await QRCode.toDataURL(ticket.ticketCode, { margin: 1, width: 360 }); if (active) setState({ status: 'succeeded', ticket, qr, error: '' }) }).catch((error) => active && setState({ status: 'failed', ticket: null, qr: '', error: error.response?.data?.message || 'Unable to load ticket.' })); return () => { active = false } }, [bookingId])
    const { ticket } = state
    async function downloadTicket() {
        try {
            const pdf = await downloadBookingTicket(bookingId)
            const url = URL.createObjectURL(pdf)
            const link = document.createElement('a')
            link.href = url; link.download = `eventora-ticket-${ticket.ticketCode}.pdf`
            document.body.appendChild(link); link.click(); link.remove()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        } catch (error) {
            let message = error.response?.data?.message || 'Unable to download ticket.'
            if (error.response?.data instanceof Blob) {
                try {
                    const payload = JSON.parse(await error.response.data.text())
                    if (typeof payload.message === 'string') message = payload.message
                } catch (parseError) {
                    console.error('Unable to read ticket download error response:', parseError)
                }
            }
            setState((current) => ({ ...current, error: message }))
        }
    }
    return <div className="min-h-screen bg-surface text-white"><Navbar /><main className="mx-auto max-w-lg px-4 py-12 sm:px-6"><p className="text-sm font-semibold uppercase tracking-wider text-brand-500">Digital ticket</p><h1 className="mt-2 text-3xl font-bold">Your Ticket</h1>{state.status === 'loading' && <p className="py-16 text-center text-slate-400">Loading ticket...</p>}{state.error && <p className="mt-6 rounded-xl border border-red-800 p-4 text-red-300" role="alert">{state.error}</p>}{ticket && <><article className="mt-8 overflow-hidden rounded-2xl border border-surface-border bg-surface-card"><div className="border-b border-dashed border-surface-border p-6"><h2 className="text-2xl font-bold">{ticket.event?.title}</h2><p className="mt-3 text-slate-400">{ticket.sessionDate || ticket.event?.date} · {ticket.event?.location}</p>{ticket.event?.venueAddress && <p className="mt-2 text-sm text-slate-400">{ticket.event.venueAddress}</p>}</div><div className="p-6 text-center"><img src={state.qr} alt={`QR code for ticket ${ticket.ticketCode}`} className="mx-auto h-56 w-56 rounded-xl bg-white p-3" /><p className="mt-5 text-xl font-bold tracking-wider">{ticket.ticketCode}</p>{ticket.ticketItems?.length > 1 ? <ul className="mt-2 space-y-1 text-sm text-slate-400">{ticket.ticketItems.map((item) => <li key={item.ticketTypeId || item.ticketTypeName}>{item.ticketTypeName} × {item.quantity}</li>)}</ul> : <p className="mt-2 text-sm text-slate-400">{ticket.ticketTypeName || 'General admission'}</p>}<p className="mt-2 text-sm text-slate-400">Show this QR code or ticket code at event entry.</p><div className="mt-6 grid grid-cols-2 gap-3 border-t border-surface-border pt-5 text-left"><div><p className="text-xs text-slate-500">Tickets</p><p className="mt-1 font-semibold">{ticket.quantity}</p></div><div><p className="text-xs text-slate-500">Seats</p><p className="mt-1 font-semibold">{ticket.selectedSeats?.length ? ticket.selectedSeats.join(', ') : 'General admission'}</p></div></div></div></article><button type="button" onClick={downloadTicket} className="mt-5 w-full rounded-xl bg-brand-600 px-5 py-3 font-semibold hover:bg-brand-700">Download PDF ticket</button></>}<Link to="/bookings" className="mt-6 inline-block text-brand-400 hover:text-brand-300">View all bookings</Link></main><Footer /></div>
}
export default TicketPage
