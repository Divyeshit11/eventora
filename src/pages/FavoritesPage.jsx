
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import { selectFavoriteEvents } from '../features/events/eventsSelectors'
import { toggleFavorite } from '../features/events/eventsSlice'

function FavoritesPage() {
  const favoriteEvents = useSelector(selectFavoriteEvents)
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-surface text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
          Your collection
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          My Favorites ♥
        </h1>

        <p className="mt-3 text-slate-400">
          Events you've saved for later.
        </p>

        {favoriteEvents.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteEvents.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-5">
                  <p className="text-sm text-brand-500">
                    {event.category}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {event.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {event.location} · {event.date}
                  </p>

                  <p className="mt-4 text-lg font-bold">
                    ₹{event.price}
                  </p>

                  <Link
                    to={`/events/${event.id}`}
                    className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    View Event
                  </Link>

                  <button
                    type="button"
                    onClick={() => dispatch(toggleFavorite(event.id))}
                    className="mt-3 rounded-lg border border-pink-500/50 px-4 py-2 text-sm font-semibold text-pink-400 transition hover:bg-pink-500/10"
                  >
                    ♥ Remove Favorite
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-surface-border bg-surface-card px-6 py-12 text-center">
            <p className="text-4xl">♡</p>

            <h2 className="mt-4 text-xl font-semibold">
              No favorites yet
            </h2>

            <p className="mt-2 text-slate-400">
              Browse events and save the ones you like.
            </p>

            <Link
              to="/events"
              className="mt-5 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Explore Events
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default FavoritesPage
