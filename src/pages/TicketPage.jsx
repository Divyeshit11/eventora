import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import QRCode from 'qrcode'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import Button from '../Components/common/Button'
import Logo from '../Components/common/Logo'
import { downloadBookingTicket, getBookingTicket, resendBookingConfirmation } from '../services/eventService'

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
    async function resendConfirmation() {
        setState((current) => ({ ...current, error: '', resendStatus: 'loading', resendMessage: '' }))
        try {
            const response = await resendBookingConfirmation(bookingId)
            setState((current) => ({ ...current, resendStatus: 'sent', resendMessage: response.message || 'Confirmation email sent.' }))
        } catch (error) {
            setState((current) => ({ ...current, resendStatus: 'failed', resendMessage: error.response?.data?.message || 'Unable to send confirmation email.' }))
        }
    }
    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main>
                <PageHeader
                    eyebrow="Your pass"
                    title={<>Digital <span className="text-gradient">ticket</span></>}
                    description="Keep this pass ready at the door. Your QR code is unique to this booking."
                    align="center"
                />
                <div className="mx-auto max-w-xl px-4 pb-20 sm:px-6">
                    {state.status === 'loading' && (
                        <div className="card-surface animate-pulse rounded-3xl p-8 text-center text-slate-400" role="status">
                            Preparing your ticket...
                        </div>
                    )}
                    {state.error && (
                        <p className="rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-red-300" role="alert">
                            {state.error}
                        </p>
                    )}
                    {ticket && (
                        <>
                            <article className="animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-[#f7f3eb] text-[#17382b] shadow-[0_28px_80px_-40px_rgba(0,0,0,0.85)]">
                                <header className="relative overflow-hidden bg-[#0b2d23] px-6 py-6 text-[#f7f3eb] sm:px-8">
                                    <div className="pointer-events-none absolute -right-16 -top-28 h-64 w-64 rounded-full border border-[#c88970]/15" />
                                    <div className="pointer-events-none absolute -right-8 -top-20 h-48 w-48 rounded-full border border-dashed border-[#c88970]/20" />
                                    <div className="relative flex items-center justify-between gap-4">
                                        <Logo />
                                        <span className="rounded-full border border-[#c88970]/45 bg-[#c88970]/10 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#e2b29a]">
                                            Admission pass
                                        </span>
                                    </div>
                                    <div className="relative mt-7 border-t border-white/10 pt-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a9c5b2]">
                                            {ticket.sessionDate || ticket.event?.date} <span className="px-1 text-[#c88970]">·</span> {ticket.event?.location}
                                        </p>
                                        <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                                            {ticket.event?.title}
                                        </h2>
                                        {ticket.event?.venueAddress && (
                                            <p className="mt-2 text-sm text-[#c4d2c8]">{ticket.event.venueAddress}</p>
                                        )}
                                        {ticket.event?.venueContact && (
                                            <p className="mt-1 text-sm text-[#c4d2c8]">Venue contact: {ticket.event.venueContact}</p>
                                        )}
                                    </div>
                                </header>

                                <div className="grid sm:grid-cols-[1fr_208px]">
                                    <div className="p-6 sm:p-8">
                                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#64756b]">
                                            Ticket code
                                        </p>
                                        <p className="mt-1 break-all font-mono text-xl font-bold tracking-[0.08em] text-[#0b2d23] sm:text-2xl">
                                            {ticket.ticketCode}
                                        </p>
                                        <div className="mt-5 h-px border-t border-dashed border-[#c7d4ca]" />

                                        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
                                            <div>
                                                <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-[#75867b]">Tickets</p>
                                                <p className="mt-1 font-semibold text-[#17382b]">{ticket.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-[#75867b]">Seats</p>
                                                <p className="mt-1 break-words text-sm font-semibold text-[#17382b]">
                                                    {ticket.selectedSeats?.length ? ticket.selectedSeats.join(', ') : 'General admission'}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-[#75867b]">Ticket type</p>
                                                {ticket.ticketItems?.length > 1 ? (
                                                    <ul className="mt-1 space-y-1 text-sm font-medium text-[#17382b]">
                                                        {ticket.ticketItems.map((item) => (
                                                            <li key={item.ticketTypeId || item.ticketTypeName}>
                                                                {item.ticketTypeName}<span className="ml-2 text-[#64756b]">× {item.quantity}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="mt-1 font-semibold text-[#17382b]">{ticket.ticketTypeName || 'General admission'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center border-t border-dashed border-[#c7d4ca] bg-[#edf4ef] p-6 text-center sm:border-l sm:border-t-0 sm:p-5">
                                        <div className="rounded-2xl border border-[#dce6de] bg-white p-2.5 shadow-[0_12px_30px_-20px_rgba(11,45,35,0.45)]">
                                            <img src={state.qr} alt={`QR code for ticket ${ticket.ticketCode}`} className="h-40 w-40" />
                                        </div>
                                        <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#175d45]">
                                            Scan at event entry
                                        </p>
                                        <p className="mt-1 text-xs text-[#64756b]">Valid for one check-in</p>
                                    </div>
                                </div>

                                <footer className="flex items-center justify-center gap-2 border-t border-[#dce6de] px-6 py-3.5 text-center text-xs text-[#64756b]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#c88970]" />
                                    Keep this pass ready at the entrance
                                </footer>
                            </article>
                            <Button onClick={downloadTicket} className="mt-5 w-full">Download PDF ticket</Button>
                            <Button onClick={resendConfirmation} disabled={state.resendStatus === 'loading'} variant="secondary" className="mt-3 w-full">
                                {state.resendStatus === 'loading' ? 'Sending confirmation email...' : 'Send ticket to my email'}
                            </Button>
                            {state.resendMessage && (
                                <p className={`mt-3 text-center text-sm ${state.resendStatus === 'sent' ? 'text-emerald-300' : 'text-red-300'}`} role={state.resendStatus === 'failed' ? 'alert' : 'status'}>
                                    {state.resendMessage}
                                </p>
                            )}
                        </>
                    )}
                    <Link to="/bookings" className="mt-6 inline-flex text-sm text-brand-300 transition hover:text-white">
                        ← View all bookings
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    )
}
export default TicketPage
