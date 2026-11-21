import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import EmptyState from '../Components/common/EmptyState'
import Reveal from '../Components/common/Reveal'
import { selectFavoriteIds } from '../features/events/eventsSelectors'
import { setFavorite } from '../features/events/eventsSlice'
import EventImage from '../Components/common/EventImage'
import { getEventId } from '../utils/eventIdentity'
import { getEventById } from '../services/eventService'
import {
    HeartIcon,
    MapPinIcon,
    CalendarIcon,
    ArrowRightIcon,
    CompassIcon,
} from '../Components/common/icons'

function FavoritesPage() {
  const favoriteIds = useSelector(selectFavoriteIds)
  const dispatch = useDispatch()
  const [favoriteEvents, setFavoriteEvents] = useState([])
  const [request, setRequest] = useState({ key: '', status: 'loading', error: '' })
  const favoriteKey = JSON.stringify(favoriteIds)
  const requestStatus = favoriteIds.length === 0
    ? 'empty'
    : request.key === favoriteKey
      ? request.status
      : 'loading'

  useEffect(() => {
    let isCurrent = true
    if (favoriteIds.length === 0) return undefined
    Promise.all(favoriteIds.map((id) => getEventById(id)))
      .then((events) => {
        if (!isCurrent) return
        setFavoriteEvents(events)
        setRequest({ key: favoriteKey, status: 'succeeded', error: '' })
      })
      .catch((error) => {
        if (!isCurrent) return
        setRequest({
          key: favoriteKey,
          status: 'failed',
          error: error.response?.data?.message || error.message || 'Unable to load your saved events.',
        })
      })

    return () => {
      isCurrent = false
    }
  }, [favoriteIds, favoriteKey])

  return (
    <div className="min-h-screen bg-surface text-white">
      <Navbar />

      <main>
        <PageHeader
          eyebrow="Your collection"
          title={<>My <span className="text-gradient">Favorites</span></>}
          description="Events you've saved for later — your personal shortlist of can't-miss experiences."
        />

        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          {requestStatus === 'failed' ? (
            <p className="rounded-2xl border border-red-800 bg-red-950/30 p-5 text-red-300" role="alert">
              {request.error}
            </p>
          ) : requestStatus === 'loading' ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card-surface animate-pulse overflow-hidden rounded-3xl">
                  <div className="img-shimmer h-48 w-full" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded-lg bg-surface-raised" />
                    <div className="h-4 w-1/2 rounded-lg bg-surface-raised" />
                  </div>
                </div>
              ))}
              <p className="sr-only" role="status">Loading favorites...</p>
            </div>
          ) : favoriteEvents.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteEvents.map((event, index) => (
                <Reveal key={getEventId(event)} delay={Math.min(index, 6) * 70}>
                  <article className="card-surface card-hover group flex h-full flex-col overflow-hidden rounded-3xl">
                    <div className="relative overflow-hidden">
                      <EventImage
                        src={event.image}
                        alt={event.title}
                        className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                      <button
                        type="button"
                        onClick={() => dispatch(setFavorite({ eventId: getEventId(event), isFavorite: false }))}
                        aria-label={`Remove ${event.title} from favorites`}
                        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-accent-400/50 bg-accent-500/25 text-accent-300 shadow-lg shadow-accent-500/30 backdrop-blur-md transition hover:scale-110"
                      >
                        <HeartIcon filled className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-sm font-semibold text-brand-400">
                        {event.category}
                      </p>

                      <h2 className="mt-2 font-display text-lg font-bold leading-snug text-white group-hover:text-brand-200">
                        {event.title}
                      </h2>

                      <div className="mt-3 space-y-1.5 text-sm text-slate-400">
                        <p className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 shrink-0 text-brand-400" />
                          <span className="truncate">{event.location}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 shrink-0 text-accent-400" />
                          {event.date}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-surface-border/70 pt-4">
                        <p className="font-display text-xl font-extrabold text-white">
                          ₹{event.price}
                        </p>
                        <Link
                          to={`/events/${getEventId(event)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:shadow-brand-500/40 hover:brightness-110"
                        >
                          View
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<HeartIcon className="h-9 w-9" />}
              title="No favorites yet"
              description="Browse events and save the ones you like — they'll show up here."
              action={
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110"
                >
                  <CompassIcon className="h-5 w-5" />
                  Explore Events
                </Link>
              }
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default FavoritesPage
