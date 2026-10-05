function EventCard({event}) {
    return (
        <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <img
                src={event.image}
                alt={event.title}
                className="h-52 w-full object-cover"
            />
            <div className="p-5">
                <p className="text-sm font-medium text-indigo-400">
{event.category}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                    {event.title}
                </h3>
<div className="mt-4 space-y-2 text-sm text-slate-400">
<p>
    {event.location}
</p>
<p>
    {event.date}
</p>

</div>
<div className="mt-5 flex items-center justify-bettween">
<p className="text-lg font-bold text-white">
   ${event.price} 
</p>
<button 
type="button"
className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500">
    view Event
</button>
</div>
</div>
        </article>
    )
}
export default EventCard