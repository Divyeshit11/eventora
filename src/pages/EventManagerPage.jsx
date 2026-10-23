import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAllEvents, selectEventCount } from "../features/events/eventsSelectors";
import Navbar from "../Components/layout/Navbar";
import { Link } from "react-router";
import Button from "../Components/common/Button";
import Footer from "../Components/layout/Footer";
import { addEvent, removeEvent } from "../features/events/eventsSlice";


function EventManagerPage() {
    const dispatch = useDispatch()

    const events = useSelector(selectAllEvents)
    const eventCount = useSelector(selectEventCount)

    const [title, setTitle] = useState('')
    const [location, setLocation] = useState('')
    const [price, setPrice] = useState('')

    function handleAddEvent(event) {
        event.preventDefault()

        if (!title.trim() || !location.trim() || price === '') {
            return
        }

        const newEvent = {
            id: `custom-${Date.now()}`,
            title: title.trim(),
            category: 'Technology',
            location: location.trim(),
            Date: 'Date to be announced',
            price: Number(price),
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        }
        dispatch(addEvent(newEvent))

        setTitle('')
        setLocation('')
        setPrice('')
    }
    function handleRemoveEvent(eventId) {
        dispatch(removeEvent(eventId))
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                <h1 className="text-3xl font-bold sm:text-4xl">
                    Event Manager
                </h1>

                <p className="mt-3 text-slate-400">Total events:{eventCount}</p>
                <p className="mt-3 text-slate-400">
                    Practice adding and removing events with Redux Toolkit

                </p>

                <form
                    onSubmit={handleAddEvent}
                    className="mt-8 grid gap-4 rounded-2xl border border-surface-border bg-surface-card p-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm text-slate-300">
                        Event title

                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="e.g. React Workshop"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-300">
                        Location

                        <input
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            placeholder="e.g. Rajkot"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-300 sm:col-span-2">
                        Ticket Price (₹)

                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            placeholder="e.g.499"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>

                    <div className="sm:col-span-2">
                        <Button type="submit">Add Event</Button>

                    </div>
                </form>

                <section className="mt-10">
                    <h2 className="text-2xl font-bold">
                        Events ({events.length})

                    </h2>

                    <div className="mt-5 space-y-3">
                        {events.map((event) => (
                            <article
                                key={event.id}
                                className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-semibold">{event.title}</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {event.location} . ₹{event.price}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="inline-flex items-center text-sm font-medium text-brand-500 hover:text-brand-400">
                                        View Details
                                    </Link>

                                    <Button
                                        variant="secondary"
                                        onClick={() => handleRemoveEvent(event.id)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>

                </section>

            </main>
            <Footer />
        </div>
    )
}

export default EventManagerPage