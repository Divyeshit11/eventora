import { Link, useParams } from "react-router";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import Badge from "../Components/common/Badge";
import events from "../data/events";
import { useSelector } from "react-redux";
import { selectEventById } from "../features/events/eventsSelectors";

function EventDetailPage() {
    const { eventId } = useParams()

    const event = useSelector((state) => selectEventById(state, eventId))

    if (!event) {
        return (
            <div className="min-h-screen bg-surface text-white">
                <Navbar />

                <main className="mx-auto max-w-3xl px-4 py-24 text-center">
                    <h1 className="text-3xl font-bold">
                        Event not found
                    </h1>

                    <p className="mt-4 text-slate-400">
                        Sorry, we couldn't find the event you're looking for.

                    </p>

                    <Link
                        to="/events"
                        className="mt-6 inline-block text-brand-500 hover:text-brand-400">
                        ← Back to Events
                    </Link>
                </main>

                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                <Link
                    to="/events"
                    className="inline-block text-sm text-slate-400 transition hover:text-white">
                    ← Back to Events
                </Link>

                <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:items-start">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="h-72 w-full rounded-2xl border border-surface-border object-cover sm:h-96" />
                    <div>
                        <Badge variant={event.category.toLowerCase()}>
                            {event.category}
                        </Badge>

                        <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
                            {event.title}
                        </h1>

                        <div className="mt-6 space-y-4 text-slate-300">
                            <p>📍 Location: {event.location}</p>
                            <p>📅 Date: {event.date}</p>
                            <p className="text-2xl font-bold text-white">
                                Price:₹{event.price}
                            </p>

                        </div>
                        <p className="mt-6 leading-7 text-slate-400">
                            Discover this event with Eventora. Explore the event
                            details and find an experience that matches your interests.

                        </p>

                        <div className="mt-8">
                            <button onClick={()=>window.alert('Booking will be added in a future phase!')}>
                                Book This Event

                            </button>

                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>

    )
}

export default EventDetailPage