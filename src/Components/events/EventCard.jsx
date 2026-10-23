
import { Link } from 'react-router';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite } from '../../features/events/eventsSlice'
import { selectFavoriteIds } from '../../features/events/eventsSelectors'

const categoryVariants = {
  Technology: 'technology',
  Music: 'music',
  Business: 'business',
  Comedy: 'comedy',
};

function EventCard({ event }) {
  if (!event) {
    return null;
  }

  const dispatch = useDispatch()
  const favoriteIds = useSelector(selectFavoriteIds)

  const isFavorite = favoriteIds.some(
    (id) => String(id) === String(event.id)
  )

  const categoryVariant =
    categoryVariants[event.category] ?? 'technology';

  return (
    <article className="group overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition duration-300 hover:-translate-y-1 hover:border-brand-500/60">
      <div className="relative overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4">
          <Badge variant={categoryVariant}>
            {event.category}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-white">
          {event.title}
        </h3>

        <button
        type="button"
        onClick={() => dispatch(toggleFavorite(event.id))}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
          ? `Remove ${event.title} from favorites`
          : `Add ${event.title} to favorites`
        }
        className={`rounded-lg border px-3 py-2 text-sm transition ${isFavorite
          ? 'border-pink-500 bg-pink-500/10 text-pink-400'
          : 'border-surface-border text-slate-300 hover:text-pink-400'
        }`}
        >
          {isFavorite ? '♥ Saved' : '♡ Favorite'}

        </button>

        <div className="mt-3 space-y-2 text-sm text-slate-400">
          <p>📍 {event.location}</p>
          <p>📅 {event.date}</p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-surface-border pt-4">
          <div>
            <p className="text-xs text-slate-400">
              Starting from
            </p>
            <p className="text-xl font-bold text-white">
              ₹{event.price}
            </p>
          </div>
<Link to={`/events/${event.id}`} className='block'>
          <Button>View Event</Button>

</Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
