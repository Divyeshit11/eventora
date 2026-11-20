
import { Link } from 'react-router';
import Badge from '../common/Badge';
import EventImage from '../common/EventImage'
import { useDispatch, useSelector } from 'react-redux'
import { setFavorite } from '../../features/events/eventsSlice'
import { selectFavoriteIds } from '../../features/events/eventsSelectors'
import { getEventId } from '../../utils/eventIdentity'
import { MapPinIcon, CalendarIcon, HeartIcon, ArrowRightIcon } from '../common/icons'

const categoryVariants = {
  Technology: 'technology',
  Music: 'music',
  Business: 'business',
  Comedy: 'comedy',
  Other: 'other',
};

function EventCard({ event }) {
  const dispatch = useDispatch()
  const favoriteIds = useSelector(selectFavoriteIds)
  const eventId = getEventId(event)

  if (!event) {
    return null
  }

  const isFavorite = favoriteIds.some(
    (id) => String(id) === String(eventId)
  )

  const categoryVariant =
    categoryVariants[event.category] ?? 'technology';

  return (
    <article className="card-surface card-hover group flex flex-col overflow-hidden rounded-3xl">
      <div className="relative overflow-hidden">
        <EventImage
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-52 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent opacity-80" />

        <div className="absolute left-4 top-4">
          <Badge variant={categoryVariant}>
            {event.category}
          </Badge>
        </div>

        <button
          type="button"
          onClick={() => dispatch(setFavorite({ eventId, isFavorite: !isFavorite }))}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${event.title} from favorites`
              : `Add ${event.title} to favorites`
          }
          className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 ${isFavorite
            ? 'border-pink-400/50 bg-pink-500/25 text-pink-300 shadow-lg shadow-pink-500/30'
            : 'border-white/15 bg-surface/60 text-slate-200 hover:scale-110 hover:border-pink-400/50 hover:text-pink-300'
          }`}
        >
          <HeartIcon filled={isFavorite} className={`h-5 w-5 transition-transform duration-300 ${isFavorite ? 'scale-110' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-brand-200">
          {event.title}
        </h3>

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
          <div>
            <p className="text-xs text-slate-500">
              Starting from
            </p>
            <p className="font-display text-xl font-extrabold text-white">
              ₹{event.price}
            </p>
          </div>
          <Link
            to={`/events/${eventId}`}
            className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:shadow-brand-500/40 hover:brightness-110"
          >
            View
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
