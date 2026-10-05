import EvenGrid from './EventCard'

function FeaturedEvents({events}) {
    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
<div className="mb-10">
    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
Explore
    </p>
<h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
    Featured Events
</h2>

<p className="mt-3 max-w-2xl text-slate-400">
    Discover exciting events happening aroung you.
</p>
</div>

<EvenGrid events={events}/>
        </section>
    )
}
export default FeaturedEvents