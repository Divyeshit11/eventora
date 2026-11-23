import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import EmptyState from '../Components/common/EmptyState'
import Reveal from '../Components/common/Reveal'
import EventImage from '../Components/common/EventImage'
import { cancelBooking, getMyBookings } from '../services/eventService'
import {
    TicketIcon,
    MapPinIcon,
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    XIcon,
    CompassIcon,
} from '../Components/common/icons'

function formatBookingDate(date) {
    if (!date) return ''
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate)
}

const statusStyles = {
    paid: { label: 'Confirmed', className: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300', icon: CheckIcon },
    pending: { label: 'Payment pending', className: 'border-amber-500/30 bg-amber-500/15 text-amber-300', icon: ClockIcon },
    cancelled: { label: 'Cancelled', className: 'border-red-500/30 bg-red-500/15 text-red-300', icon: XIcon },
}

function MyBookingsPage() {
    const [state, setState] = useState({ status: 'loading', bookings: [], error: '' })

    useEffect(() => {
        let active = true
        getMyBookings()
            .then((bookings) => active && setState({ status: 'succeeded', bookings, error: '' }))
            .catch((error) => active && setState({ status: 'failed', bookings: [], error: error.response?.data?.message || 'Unable to load bookings.' }))
        return () => { active = false }
    }, [])

    async function handleCancel(bookingId) {
        try {
            await cancelBooking(bookingId)
            setState((current) => ({ ...current, bookings: current.bookings.map((booking) => booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking) }))
        } catch (error) {
            setState((current) => ({ ...current, error: error.response?.data?.message || 'Unable to cancel booking.' }))
        }
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main>
                <PageHeader
                    eyebrow="Your tickets"
                    title="My Bookings"
                    description="All your confirmed and pending event bookings in one place."
                />

                <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
                    {state.error && (
                        <p className="mb-6 rounded-2xl border border-red-800 bg-red-950/30 p-4 text-red-300" role="alert">
                            {state.error}
                        </p>
                    )}

                    {state.status === 'loading' && (
                        <div className="space-y-4" aria-live="polite">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="card-surface flex animate-pulse gap-5 rounded-3xl p-5">
                                    <div className="img-shimmer h-32 w-full rounded-2xl sm:w-44" />
                                    <div className="flex-1 space-y-3 py-2">
                                        <div className="h-4 w-24 rounded-lg bg-surface-raised" />
                                        <div className="h-6 w-2/3 rounded-lg bg-surface-raised" />
                                        <div className="h-4 w-1/2 rounded-lg bg-surface-raised" />
                                    </div>
                                </div>
                            ))}
                            <p className="sr-only" role="status">Loading bookings...</p>
                        </div>
                    )}

                    {state.status === 'succeeded' && state.bookings.length === 0 && (
                        <EmptyState
                            icon={<TicketIcon className="h-9 w-9" />}
                            title="No bookings yet"
                            description="When you book an event, your tickets will appear here."
                            action={
                                <Link
                                    to="/events"
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110"
                                >
                                    <CompassIcon className="h-5 w-5" />
                                    Explore events
                                </Link>
                            }
                        />
                    )}

                    <div className="space-y-4">
                        {state.bookings.map((booking, index) => {
                            const statusInfo = statusStyles[booking.status] || statusStyles.pending
                            const StatusIcon = statusInfo.icon
                            return (
                                <Reveal key={booking._id} delay={Math.min(index, 5) * 70}>
                                    <article className="card-surface card-hover flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center">
                                        <EventImage
                                            src={booking.event?.image}
                                            alt={booking.event?.title || 'Event'}
                                            className="h-36 w-full rounded-2xl object-cover sm:w-48"
                                        />
                                        <div className="flex-1">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {statusInfo.label}
                                            </span>
                                            <h2 className="mt-2 font-display text-xl font-bold text-white">
                                                {booking.event?.title || 'Removed event'}
                                            </h2>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPinIcon className="h-4 w-4 text-brand-400" />
                                                    {booking.event?.location}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarIcon className="h-4 w-4 text-accent-400" />
                                                    {booking.sessionDate || booking.event?.date}
                                                </span>
                                            </div>
                                            {booking.event?.venueAddress && (
                                                <p className="mt-2 text-sm text-slate-400">
                                                    {booking.event.venueAddress}
                                                </p>
                                            )}
                                            {formatBookingDate(booking.createdAt) && (
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Booked on {formatBookingDate(booking.createdAt)}
                                                </p>
                                            )}
                                            {booking.ticketItems?.length > 1 ? (
                                                <ul className="mt-3 space-y-1 text-sm text-slate-300">
                                                    {booking.ticketItems.map((item) => (
                                                        <li key={item.ticketTypeId || item.ticketTypeName}>
                                                            {item.ticketTypeName} × {item.quantity} · ₹{item.unitPrice * item.quantity}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="mt-3 font-semibold text-white">
                                                    {booking.ticketTypeName || 'General admission'} · {booking.quantity} ticket{booking.quantity === 1 ? '' : 's'} · ₹{booking.totalPrice}
                                                </p>
                                            )}
                                            {booking.selectedSeats?.length > 0 && (
                                                <p className="mt-2 text-sm text-slate-400">
                                                    Seats: {booking.selectedSeats.join(', ')}
                                                </p>
                                            )}
                                            {booking.status === 'paid' && (
                                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                                    <p className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30">
                                                        <TicketIcon className="h-4 w-4" />
                                                        Ticket code: {booking.ticketCode}
                                                    </p>
                                                    <Link
                                                        to={`/tickets/${booking._id}`}
                                                        className="text-sm font-semibold text-brand-400 hover:text-brand-300"
                                                    >
                                                        Open digital ticket
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                        {booking.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => handleCancel(booking._id)}
                                                className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 sm:self-center"
                                            >
                                                <XIcon className="h-4 w-4" />
                                                Cancel reservation
                                            </button>
                                        )}
                                    </article>
                                </Reveal>
                            )
                        })}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default MyBookingsPage
