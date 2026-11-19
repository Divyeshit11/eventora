import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import EventImage from '../Components/common/EventImage'
import { cancelBooking, getMyBookings } from '../services/eventService'

function formatBookingDate(date) {
    if (!date) return ''
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate)
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

    return <div className="min-h-screen bg-surface text-white"><Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">Your tickets</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">My Bookings</h1>
            {state.error && <p className="mt-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-300" role="alert">{state.error}</p>}
            {state.status === 'loading' && <p className="py-16 text-center text-slate-400" role="status">Loading bookings...</p>}
            {state.status === 'succeeded' && state.bookings.length === 0 && <div className="mt-8 rounded-2xl border border-surface-border bg-surface-card p-10 text-center"><p className="text-slate-400">You have no bookings yet.</p><Link to="/events" className="mt-5 inline-block text-brand-400">Explore events</Link></div>}
            <div className="mt-8 grid gap-4">
                {state.bookings.map((booking) => <article key={booking._id} className="flex flex-col gap-5 rounded-2xl border border-surface-border bg-surface-card p-5 sm:flex-row">
                    <EventImage src={booking.event?.image} alt={booking.event?.title || 'Event'} className="h-32 w-full rounded-xl object-cover sm:w-44" />
                    <div className="flex-1"><p className="text-sm text-brand-400">{booking.status === 'paid' ? 'Confirmed' : booking.status === 'pending' ? 'Payment pending' : 'Cancelled'}</p><h2 className="mt-1 text-xl font-semibold">{booking.event?.title || 'Removed event'}</h2><p className="mt-2 text-sm text-slate-400">{booking.event?.location} · {booking.event?.date}</p>{formatBookingDate(booking.createdAt) && <p className="mt-2 text-sm text-slate-400">Booked on {formatBookingDate(booking.createdAt)}</p>}<p className="mt-3">{booking.quantity} ticket{booking.quantity === 1 ? '' : 's'} · ₹{booking.totalPrice}</p>{booking.status === 'paid' && <p className="mt-2 text-sm text-emerald-300">Ticket code: {booking.ticketCode}</p>}{booking.status === 'pending' && <button type="button" onClick={() => handleCancel(booking._id)} className="mt-4 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10">Cancel reservation</button>}</div>
                </article>)}
            </div>
        </main><Footer />
    </div>
}

export default MyBookingsPage
