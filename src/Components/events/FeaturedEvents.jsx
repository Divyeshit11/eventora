
import { useEffect, useState } from 'react'
import EventGrid from './EventGrid'
import EventFilters from './Eventfilters'
import { Link } from 'react-router'

function FeaturedEvents({
  events,
  selectedCategory,
  onCategoryChange,
}) {
  // 1. Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sortBy, setSortBy] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const eventsPerPage = 3

  // 2. Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, maxPrice, sortBy])

  // 3. Filter events
  const filteredEvents = events
    .filter((event) => {
      const searchText = searchTerm.trim().toLowerCase()

      const matchesSearch =
        event.title.toLowerCase().includes(searchText) ||
        event.location.toLowerCase().includes(searchText)

      const matchesCategory =
        selectedCategory === 'all' ||
        event.category === selectedCategory

      const matchesPrice = event.price <= maxPrice

      return matchesSearch && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price

        case 'price-high':
          return b.price - a.price

        case 'title':
          return a.title.localeCompare(b.title)

        default:
          return 0
      }
    })

  // 4. Calculate pagination
  const totalPages = Math.ceil(
    filteredEvents.length / eventsPerPage
  )

  const startIndex = (currentPage - 1) * eventsPerPage

  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + eventsPerPage
  )

  // 5. Reset all filters
  function handleResetFilters() {
    setSearchTerm('')
    onCategoryChange('all')
    setMaxPrice(5000)
    setSortBy('default')
    setCurrentPage(1)
  }

  return (
    <section
      id="events"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
          Explore
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Discover Events
        </h2>

        <p className="mt-3 text-slate-400">
          Find events that match your interests.
        </p>
      </div>

      <EventFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <p
        className="mb-5 text-sm text-slate-400"
        aria-live="polite"
      >
        {filteredEvents.length}{' '}
        {filteredEvents.length === 1 ? 'event' : 'events'} found
      </p>

      <div className="mb-6 flex items-center justify-end gap-2">
        <span className="mr-2 text-sm text-slate-400">
          View:
        </span>

        <button
          type='button'
          onClick={() => setViewMode('grid')}
          aria-pressed={viewMode === 'grid'}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${viewMode === 'grid'
              ? 'bg-brand-600 text-white'
              : 'border border-surface-border text-slate-300 hover:bg-slate-800'
            }`}>
          ▦ Grid
        </button>

        <button
          type="button"
          onClick={() => setViewMode('list')}
          aria-pressed={viewMode === 'list'}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${viewMode === 'list'
              ? 'bg-brand-600 text-white'
              : 'border border-surface-border text-slate-300 hover:bg-slate-800'
            }`}>
          ☰ List

        </button>


      </div>

      {filteredEvents.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <EventGrid events={paginatedEvents} />
          ) : (
            <div className='space-y-4'>
              {paginatedEvents.map((event)=>(
                <article
                key={event.id}
                className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-4 sm:flex-row sm:items-center">
                  <img
                  src={event.image}
                  alt={event.title}
                  className="h-48 w-full rounded-xl object-cover sm:h-28 sm:w-40"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-brand-500">
                      {event.category}
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-white">
                      {event.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {event.location} . {event.date}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className='text-lg font-bold text-white'>
                        ₹{event.price}
                    </p>

                    <Link
                    to={`/events/${event.id}`}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
                      view Event
                    </Link>
                  </div>

                </article>
              ))}

            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => page - 1)
                }
                disabled={currentPage === 1}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-current={
                    currentPage === page ? 'page' : undefined
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${currentPage === page
                      ? 'bg-brand-600 text-white'
                      : 'border border-surface-border text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => page + 1)
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-surface-border bg-surface-card px-6 py-12 text-center">
          <h3 className="text-xl font-semibold text-white">
            No events found
          </h3>

          <p className="mt-2 text-slate-400">
            Try changing your search, category, or price.
          </p>

          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  )
}

export default FeaturedEvents
