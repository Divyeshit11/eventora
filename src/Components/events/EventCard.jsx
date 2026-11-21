
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
    <article className="card-surface card-hover group flex flex-col overflow-hidden rounded-[1.65rem]">
      <div className="relative overflow-hidden">
        <EventImage
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-56 w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface/5 to-transparent opacity-90" />
        <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
          Featured experience
        </span>

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
            ? 'border-accent-400/50 bg-accent-500/25 text-accent-300 shadow-lg shadow-accent-500/30'
            : 'border-white/15 bg-surface/60 text-slate-200 hover:scale-110 hover:border-accent-400/50 hover:text-accent-300'
          }`}
        >
          <HeartIcon filled={isFavorite} className={`h-5 w-5 transition-transform duration-300 ${isFavorite ? 'scale-110' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-brand-200">
          {event.title}
        </h3>

        <div className="mt-4 space-y-2.5 text-sm text-slate-400">
          <p className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0 text-brand-400" />
            <span className="truncate">{event.location}</span>
          </p>
          <p className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 text-accent-400" />
            {event.date}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
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
            className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-brand-500/40"
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
