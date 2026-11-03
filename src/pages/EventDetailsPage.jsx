import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Badge from '../Components/common/Badge'
import EventImage from '../Components/common/EventImage'
import { selectEventById } from '../features/events/eventsSelectors'
import { getEventById } from '../services/eventService'

function EventDetailPage() {
    const { eventId } = useParams()
    const cachedEvent = useSelector((state) => selectEventById(state, eventId))
    const [request, setRequest] = useState({
        eventId: null,
        event: null,
        status: 'loading',
        error: '',
    })

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
                                <button
                                    type="button"
                                    onClick={() =>
                                        window.alert('Booking will be added in a future phase!')
                                    }
                                    className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
                                >
                                    Book This Event
                                </button>
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
