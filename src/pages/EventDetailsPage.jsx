import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Badge from '../Components/common/Badge'
import EventImage from '../Components/common/EventImage'
import { selectEventById } from '../features/events/eventsSelectors'
import { getEventById, getSeatAvailability } from '../services/eventService'
import { addCartItem } from '../app/cart'

function EventDetailPage() {
    const { eventId } = useParams()
    const cachedEvent = useSelector((state) => selectEventById(state, eventId))
    const userId = useSelector((state) => state.auth.user?.id)
    const navigate = useNavigate()
    const [request, setRequest] = useState({
        eventId: null,
        event: null,
        status: 'loading',
        error: '',
    })
    const [ticketQuantityState, setTicketQuantityState] = useState({ eventId: null, quantities: {} })
    const [booking, setBooking] = useState({ status: 'idle', message: '' })
    const [sessionDate, setSessionDate] = useState('')
    const [seats, setSeats] = useState({ status: 'idle', reservedSeats: [], rows: 0, seatsPerRow: 0 })
    const [selectedSeats, setSelectedSeats] = useState([])

    useEffect(() => {
        if (cachedEvent) return undefined

        let isCurrent = true

        getEventById(eventId)
            .then((event) => {
                if (!isCurrent) return
                setRequest({
                    eventId,
                    event,
                    status: 'succeeded',
                    error: '',
                })
            })
            .catch((requestError) => {
                if (!isCurrent) return
                setRequest({
                    eventId,
                    event: null,
                    status: 'failed',
                    error:
                        requestError.response?.data?.message ||
                        requestError.message ||
                        'Unable to load this event.',
                })
            })

        return () => {
            isCurrent = false
        }
    }, [cachedEvent, eventId])

    const hasCurrentRequest = request.eventId === eventId
    const event = cachedEvent ?? (hasCurrentRequest ? request.event : null)
    const status = cachedEvent
        ? 'succeeded'
        : hasCurrentRequest
            ? request.status
            : 'loading'
    const error = hasCurrentRequest ? request.error : ''
    const ticketsRemaining = event
        ? Math.max(0, (event.ticketCapacity ?? 100) - (event.ticketsSold ?? 0))
        : 0
    const ticketTypes = event?.ticketTypes?.length
        ? event.ticketTypes
        : event ? [{ _id: '', name: 'General admission', price: event.price, quantity: event.ticketCapacity ?? 100, sold: event.ticketsSold ?? 0 }] : []
    const ticketQuantities = ticketQuantityState.eventId === eventId ? ticketQuantityState.quantities : {}
    const selectedTicketItems = ticketTypes.flatMap((type, index) => {
        const key = String(type._id || type.name)
        const remaining = Math.max(0, type.quantity - (type.sold || 0))
        const quantity = ticketQuantities[key] ?? (index === 0 ? Math.min(1, remaining) : 0)
        return quantity > 0 ? [{ ...type, quantity }] : []
    })
    const totalQuantity = selectedTicketItems.reduce((total, item) => total + item.quantity, 0)
    const totalPrice = selectedTicketItems.reduce((total, item) => total + item.price * item.quantity, 0)

    const sessions = event?.sessions?.length ? event.sessions : event ? [{ date: event.date, label: event.date }] : []
    const activeSessionDate = sessionDate || sessions[0]?.date || ''

    useEffect(() => {
        if (!event?.seatingEnabled || !activeSessionDate) return
        let active = true
        getSeatAvailability(eventId, activeSessionDate).then((data) => active && setSeats({ status: 'succeeded', ...data })).catch(() => active && setSeats({ status: 'failed', reservedSeats: [], rows: 0, seatsPerRow: 0 }))
        return () => { active = false }
    }, [activeSessionDate, event?.seatingEnabled, eventId])

    function handleAddToCart() {
        if (!totalQuantity || totalQuantity > 10) {
            setBooking({ status: 'failed', message: 'Choose between 1 and 10 tickets before continuing.' })
            return
        }
        if (event.seatingEnabled && selectedSeats.length !== totalQuantity) { setBooking({ status: 'failed', message: `Select ${totalQuantity} seat${totalQuantity === 1 ? '' : 's'} before continuing.` }); return }
        const cartTicketItems = selectedTicketItems.map((item) => ({
            ticketTypeId: item._id || '',
            ticketTypeName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
        }))
        addCartItem(userId, {
            eventId,
            title: event.title,
            sessionDate: activeSessionDate,
            quantity: totalQuantity,
            ticketItems: cartTicketItems,
            ticketTypeId: cartTicketItems.length === 1 ? cartTicketItems[0].ticketTypeId : '',
            ticketTypeName: cartTicketItems.map((item) => `${item.ticketTypeName} × ${item.quantity}`).join(', '),
            unitPrice: totalPrice / totalQuantity,
            selectedSeats,
            totalPrice,
        })
        navigate('/cart')
    }

    function setTicketQuantity(ticketType, index, value) {
        const key = String(ticketType._id || ticketType.name)
        const remaining = Math.max(0, ticketType.quantity - (ticketType.sold || 0))
        const currentQuantity = ticketQuantities[key] ?? (index === 0 ? Math.min(1, remaining) : 0)
        const otherQuantity = totalQuantity - currentQuantity
        const nextQuantity = Math.max(0, Math.min(Number(value), remaining, 10 - otherQuantity))
        setTicketQuantityState((current) => ({
            eventId,
            quantities: {
                ...(current.eventId === eventId ? current.quantities : {}),
                [key]: nextQuantity,
            },
        }))
        setSelectedSeats((current) => current.slice(0, otherQuantity + nextQuantity))
        setBooking({ status: 'idle', message: '' })
    }

    function toggleSeat(seat) { if (seats.reservedSeats.includes(seat)) return; setSelectedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : current.length < totalQuantity ? [...current, seat] : current) }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                <Link
                    to="/events"
                    className="inline-block text-sm text-slate-400 transition hover:text-white"
                >
                    ← Back to Events
                </Link>

                {status === 'loading' && (
                    <p className="py-16 text-center text-slate-400" role="status">
                        Loading event...
                    </p>
                )}

                {status === 'failed' && (
                    <section className="mx-auto max-w-3xl py-16 text-center">
                        <h1 className="text-3xl font-bold">Event unavailable</h1>
                        <p className="mt-4 text-slate-400">{error}</p>
                        <Link
                            to="/events"
                            className="mt-6 inline-block text-brand-500 hover:text-brand-400"
                        >
                            Browse Events
                        </Link>
                    </section>
                )}

                {status === 'succeeded' && !event && (
                    <section className="mx-auto max-w-3xl py-16 text-center">
                        <h1 className="text-3xl font-bold">Event not found</h1>
                        <p className="mt-4 text-slate-400">
                            Sorry, we couldn't find the event you're looking for.
                        </p>
                    </section>
                )}

                {event && (
                    <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
                        <EventImage
                            src={event.image}
                            alt={event.title}
                            className="h-72 w-full rounded-2xl border border-surface-border object-cover sm:h-96"
                        />
                        <div>
                            <Badge variant={event.category?.toLowerCase()}>
                                {event.category}
                            </Badge>

                            <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
                                {event.title}
                            </h1>

                            <div className="mt-6 space-y-4 text-slate-300">
                                <p>📍 Location: {event.location}</p>
                                {event.venueAddress && <p>Venue address: {event.venueAddress}</p>}
                                {event.venueContact && <p>Venue contact: {event.venueContact}</p>}
                                <p>📅 Date: {event.date}</p>
                                <p className="text-2xl font-bold text-white">
                                    {ticketTypes.length > 1 ? 'Tickets from' : 'Price'}: ₹{Math.min(...ticketTypes.map((type) => type.price))}
                                </p>
                            </div>

                            <p className="mt-6 leading-7 text-slate-400">
                                {event.description ||
                                    'Discover this event with Eventora. Explore the event details and find an experience that matches your interests.'}
                            </p>

                            <div className="mt-8">
                                <p className="mb-3 text-sm text-slate-400">
                                    {ticketsRemaining > 0 ? `${ticketsRemaining} ticket${ticketsRemaining === 1 ? '' : 's'} remaining` : 'Sold out'}
                                </p>
                                {ticketTypes.length > 1 && <p className="mb-3 text-sm text-slate-400">Choose quantities for each ticket type. All selected types are paid together at checkout.</p>}
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {ticketTypes.map((type, index) => {
                                        const key = String(type._id || type.name)
                                        const remaining = Math.max(0, type.quantity - (type.sold || 0))
                                        const selectedQuantity = ticketQuantities[key] ?? (index === 0 ? Math.min(1, remaining) : 0)
                                        const maxQuantity = Math.min(remaining, 10 - totalQuantity + selectedQuantity)
                                        return (
                                            <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-4">
                                                <div>
                                                    <p className="font-semibold">{type.name}</p>
                                                    <p className="mt-1 text-sm text-slate-400">₹{type.price} · {remaining} left</p>
                                                </div>
                                                <label className="text-sm text-slate-300">
                                                    Qty
                                                    <select
                                                        aria-label={`${type.name} quantity`}
                                                        value={selectedQuantity}
                                                        disabled={remaining === 0}
                                                        onChange={(change) => setTicketQuantity(type, index, change.target.value)}
                                                        className="ml-2 rounded-lg border border-surface-border bg-surface px-3 py-2 text-white disabled:opacity-50"
                                                    >
                                                        {Array.from({ length: maxQuantity + 1 }, (_, value) => (
                                                            <option key={value} value={value}>{value}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                                {sessions.length > 1 && <label className="mt-4 inline-block text-sm text-slate-300">Date<select value={activeSessionDate} onChange={(change) => { setSessionDate(change.target.value); setSelectedSeats([]) }} className="ml-2 rounded-lg border border-surface-border bg-surface px-3 py-3 text-white">{sessions.map((session) => <option key={session.date} value={session.date}>{session.label || session.date}</option>)}</select></label>}
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <p className="mr-auto text-sm text-slate-300">
                                        {totalQuantity} selected · Total ₹{totalPrice}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={totalQuantity === 0}
                                        className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Add selected tickets to Cart
                                    </button>
                                </div>
                                {event.seatingEnabled && (
                                    <section className="mt-6 rounded-xl border border-surface-border p-4" aria-label="Seat selection">
                                        <p className="text-sm font-semibold">
                                            Select seats ({selectedSeats.length}/{totalQuantity})
                                        </p>
                                        <div className="mt-4 overflow-x-auto pb-2">
                                            <div className="w-max min-w-full">
                                                <div className="mb-5 rounded-lg border border-surface-border bg-surface-card px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                    Stage
                                                </div>
                                                {Array.from({ length: seats.rows || 0 }, (_, rowIndex) => {
                                                    const row = String.fromCharCode(65 + rowIndex)
                                                    return (
                                                        <div key={row} className="mb-2 flex items-center gap-2 last:mb-0">
                                                            <span className="sticky left-0 z-10 w-6 shrink-0 bg-surface py-2 text-center text-xs font-semibold text-slate-400">
                                                                {row}
                                                            </span>
                                                            <div
                                                                className="grid gap-1.5"
                                                                style={{ gridTemplateColumns: `repeat(${seats.seatsPerRow}, 2.25rem)` }}
                                                            >
                                                                {Array.from({ length: seats.seatsPerRow || 0 }, (_, seatIndex) => {
                                                                    const seat = `${row}${seatIndex + 1}`
                                                                    const reserved = seats.reservedSeats.includes(seat)
                                                                    const selected = selectedSeats.includes(seat)
                                                                    return (
                                                                        <button
                                                                            key={seat}
                                                                            type="button"
                                                                            disabled={reserved}
                                                                            onClick={() => toggleSeat(seat)}
                                                                            aria-label={`${seat}${reserved ? ', reserved' : selected ? ', selected' : ', available'}`}
                                                                            aria-pressed={selected}
                                                                            className={`h-9 w-9 rounded-md text-[10px] font-semibold transition-colors ${reserved ? 'cursor-not-allowed bg-slate-800 text-slate-500' : selected ? 'bg-brand-600 text-white' : 'border border-surface-border text-slate-300 hover:border-brand-500 hover:bg-brand-500/10'}`}
                                                                        >
                                                                            {seat}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        {seats.status === 'loading' && <p className="mt-3 text-sm text-slate-400">Loading seats...</p>}
                                        {seats.status === 'failed' && <p className="mt-3 text-sm text-red-300" role="alert">Unable to load seat availability. Please refresh and try again.</p>}
                                        {seats.status === 'succeeded' && seats.rows > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-surface-border pt-3 text-xs text-slate-400">
                                                <span><span className="mr-1.5 inline-block h-3 w-3 rounded-sm border border-surface-border align-middle" />Available</span>
                                                <span><span className="mr-1.5 inline-block h-3 w-3 rounded-sm bg-brand-600 align-middle" />Selected</span>
                                                <span><span className="mr-1.5 inline-block h-3 w-3 rounded-sm bg-slate-700 align-middle" />Reserved</span>
                                            </div>
                                        )}
                                        {seats.status === 'succeeded' && seats.rows === 0 && <p className="mt-3 text-sm text-slate-400">Seat layout is not available for this event.</p>}
                                    </section>
                                )}
                                {booking.message && (
                                    <p className={`mt-3 text-sm ${booking.status === 'failed' ? 'text-red-300' : 'text-emerald-300'}`} role={booking.status === 'failed' ? 'alert' : 'status'}>
                                        {booking.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default EventDetailPage
