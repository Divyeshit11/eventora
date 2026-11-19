import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Badge from '../Components/common/Badge'
import EventImage from '../Components/common/EventImage'
import { selectEventById } from '../features/events/eventsSelectors'
import { createPaymentOrder, getEventById, verifyPayment } from '../services/eventService'

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
                theme: { color: '#7c3aed' },
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
                                <p>📅 Date: {event.date}</p>
                                <p className="text-2xl font-bold text-white">
                                    Price: ₹{event.price}
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
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="text-sm text-slate-300">
                                        Tickets
                                        <select
                                            value={quantity}
                                            onChange={(event) => setQuantity(Number(event.target.value))}
                                            disabled={ticketsRemaining === 0 || booking.status === 'loading'}
                                            className="ml-2 rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                                        >
                                            {Array.from({ length: Math.min(10, ticketsRemaining) }, (_, index) => index + 1).map((value) => (
                                                <option key={value} value={value}>{value}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleBooking}
                                        disabled={ticketsRemaining === 0 || booking.status === 'loading'}
                                        className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {booking.status === 'loading' ? 'Opening secure payment...' : 'Book This Event'}
                                    </button>
                                </div>
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
