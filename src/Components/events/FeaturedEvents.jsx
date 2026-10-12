
import { useState } from 'react'
import EventGrid from './EventGrid'
import EventFilters from './Eventfilters'

function FeaturedEvents({
  events,
  selectedCategory,
  onCategoryChange,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sortBy, setSortBy] = useState('default')

  // Step 1: Filter events using search, category, and price.
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

    // Step 2: Sort the filtered events.
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

  // Step 3: Reset all filters.
  function handleResetFilters() {
    setSearchTerm('')
    onCategoryChange('all')
    setMaxPrice(5000)
    setSortBy('default')
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

      {filteredEvents.length > 0 ? (
        <EventGrid events={filteredEvents} />
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
