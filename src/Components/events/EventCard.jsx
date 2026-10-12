
import Badge from '../common/Badge';
import Button from '../common/Button';

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

          <Button>View Event</Button>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
