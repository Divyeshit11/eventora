import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Badge from '../Components/common/Badge'
import EventImage from '../Components/common/EventImage'
import Reveal from '../Components/common/Reveal'
import EmptyState from '../Components/common/EmptyState'
import { selectEventById } from '../features/events/eventsSelectors'
import { createPaymentOrder, getEventById, verifyPayment } from '../services/eventService'
import {
    ArrowLeftIcon,
    MapPinIcon,
    CalendarIcon,
    TicketIcon,
    WalletIcon,
    CompassIcon,
    SparklesIcon,
} from '../Components/common/icons'

const categoryVariants = {
    Technology: 'technology',
    Music: 'music',
    Business: 'business',
    Comedy: 'comedy',
    Other: 'other',
}

function EventDetailPage() {
    const { eventId } = useParams()
    const cachedEvent = useSelector((state) => selectEventById(state, eventId))
    const [request, setRequest] = useState({
        eventId: null,
        event: null,
        status: 'loading',
        error: '',
    })
    const [quantity, setQuantity] = useState(1)
    const [booking, setBooking] = useState({ status: 'idle', message: '' })

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
    const totalPrice = event ? Number(event.price) * quantity : 0

    async function handleBooking() {
        setBooking({ status: 'loading', message: '' })
        try {
            const order = await createPaymentOrder(eventId, quantity)
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                    script.onload = resolve
                    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.'))
                    document.body.appendChild(script)
                })
            }
            const checkout = new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'Eventora',
                description: event.title,
                order_id: order.orderId,
                handler: async (payment) => {
                    try {
                        await verifyPayment(payment)
                        setBooking({ status: 'succeeded', message: 'Payment verified. Your tickets are confirmed—see My Bookings.' })
                    } catch (error) {
                        setBooking({ status: 'failed', message: error.response?.data?.message || 'Payment received but verification is pending. Please contact support.' })
                    }
                },
                modal: { ondismiss: () => setBooking({ status: 'idle', message: 'Payment was not completed. Your seat reservation expires in 15 minutes.' }) },
                theme: { color: '#6366f1' },
            })
            checkout.open()
        } catch (bookingError) {
            setBooking({
                status: 'failed',
                message: bookingError.response?.data?.message || bookingError.message || 'Unable to complete booking.',
            })
        }
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
                <Reveal>
                    <Link
                        to="/events"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
                    >
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Events
                    </Link>
                </Reveal>

                {status === 'loading' && (
                    <div className="grid gap-10 py-16 lg:grid-cols-2" aria-live="polite">
                        <div className="img-shimmer h-72 w-full animate-pulse rounded-3xl sm:h-96" />
                        <div className="space-y-4">
                            <div className="h-6 w-32 animate-pulse rounded-full bg-surface-raised" />
                            <div className="h-10 w-3/4 animate-pulse rounded-xl bg-surface-raised" />
                            <div className="h-4 w-1/2 animate-pulse rounded-lg bg-surface-raised" />
                            <div className="h-24 w-full animate-pulse rounded-2xl bg-surface-raised" />
                        </div>
                        <p className="sr-only" role="status">Loading event...</p>
                    </div>
                )}

                {status === 'failed' && (
                    <EmptyState
                        className="mx-auto mt-10 max-w-3xl"
                        icon={<CompassIcon className="h-9 w-9" />}
                        title="Event unavailable"
                        description={error}
                        action={
                            <Link
                                to="/events"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110"
                            >
                                Browse Events
                                <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                            </Link>
                        }
                    />
                )}

                {status === 'succeeded' && !event && (
                    <EmptyState
                        className="mx-auto mt-10 max-w-3xl"
                        icon={<CompassIcon className="h-9 w-9" />}
                        title="Event not found"
                        description="Sorry, we couldn't find the event you're looking for."
                        action={
                            <Link
                                to="/events"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110"
                            >
                                Browse Events
                                <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                            </Link>
                        }
                    />
                )}

                {event && (
                    <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                        {/* Media + details */}
                        <div>
                            <Reveal>
                                <div className="gradient-border relative overflow-hidden rounded-[2rem]">
                                    <EventImage
                                        src={event.image}
                                        alt={event.title}
                                        className="h-72 w-full object-cover sm:h-[26rem]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                                    <div className="absolute bottom-5 left-5">
                                        <Badge variant={categoryVariants[event.category] ?? 'other'}>
                                            {event.category}
                                        </Badge>
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal delay={120}>
                                <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                                    {event.title}
                                </h1>
                            </Reveal>

                            <Reveal delay={200}>
                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    <div className="card-surface flex items-center gap-3 rounded-2xl p-4">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
                                            <MapPinIcon className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">Location</p>
                                            <p className="truncate text-sm font-semibold text-white">{event.location}</p>
                                        </div>
                                    </div>
                                    <div className="card-surface flex items-center gap-3 rounded-2xl p-4">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/30">
                                            <CalendarIcon className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">Date</p>
                                            <p className="truncate text-sm font-semibold text-white">{event.date}</p>
                                        </div>
                                    </div>
                                    <div className="card-surface flex items-center gap-3 rounded-2xl p-4">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                                            <TicketIcon className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">Tickets left</p>
                                            <p className="text-sm font-semibold text-white">
                                                {ticketsRemaining > 0 ? ticketsRemaining : 'Sold out'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal delay={280}>
                                <div className="card-surface mt-8 rounded-3xl p-6 sm:p-8">
                                    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
                                        <SparklesIcon className="h-5 w-5 text-accent-400" />
                                        About this event
                                    </h2>
                                    <p className="mt-4 leading-8 text-slate-300">
                                        {event.description ||
                                            'Discover this event with Eventora. Explore the event details and find an experience that matches your interests.'}
                                    </p>
                                </div>
                            </Reveal>
                        </div>

                        {/* Booking panel */}
                        <Reveal delay={200} className="lg:sticky lg:top-24">
                            <div className="gradient-border card-surface rounded-[2rem] p-6 sm:p-7">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400">Ticket price</p>
                                        <p className="font-display text-4xl font-extrabold text-white">
                                            ₹{event.price}
                                        </p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        ticketsRemaining > 0
                                            ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                                            : 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30'
                                    }`}>
                                        {ticketsRemaining > 0 ? 'Available' : 'Sold out'}
                                    </span>
                                </div>

                                <div className="mt-6 border-t border-surface-border/70 pt-6">
                                    <label className="grid gap-2 text-sm font-medium text-slate-300">
                                        Number of tickets
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            disabled={ticketsRemaining === 0 || booking.status === 'loading'}
                                            className="field py-3"
                                        >
                                            {Array.from({ length: Math.min(10, ticketsRemaining) }, (_, index) => index + 1).map((value) => (
                                                <option key={value} value={value}>{value}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface/60 px-4 py-3 text-sm">
                                        <span className="text-slate-400">Total</span>
                                        <span className="font-display text-lg font-bold text-white">₹{totalPrice}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleBooking}
                                        disabled={ticketsRemaining === 0 || booking.status === 'loading'}
                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:shadow-brand-500/50 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <WalletIcon className="h-5 w-5" />
                                        {booking.status === 'loading' ? 'Opening secure payment...' : 'Book This Event'}
                                    </button>

                                    {booking.message && (
                                        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${booking.status === 'failed'
                                            ? 'border-red-800 bg-red-950/30 text-red-300'
                                            : 'border-emerald-800 bg-emerald-950/30 text-emerald-300'
                                            }`} role={booking.status === 'failed' ? 'alert' : 'status'}>
                                            {booking.message}
                                        </p>
                                    )}

                                    <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                        <SparklesIcon className="h-3.5 w-3.5 text-brand-400" />
                                        Secure checkout powered by Razorpay
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default EventDetailPage
