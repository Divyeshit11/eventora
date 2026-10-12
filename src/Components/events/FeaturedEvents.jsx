
import { useState } from 'react'
import EventGrid from './EventGrid'
import Eventfilters from './Eventfilter'

function FeaturedEvents({ events }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredEvents = events.filter((event) => {
    const searchText = searchTerm.trim().toLowerCase()

    const matchesSearch =
      event.title.toLowerCase().includes(searchText) ||
      event.location.toLowerCase().includes(searchText)

    const matchesCategory =
      selectedCategory === 'all' ||
      event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

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

      <Eventfilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredEvents.length > 0 ? (
        <EventGrid events={filteredEvents} />
      ) : (
        <div className="rounded-2xl border border-surface-border bg-surface-card px-6 py-12 text-center">
          <h3 className="text-xl font-semibold text-white">
            No events found
          </h3>

          <p className="mt-2 text-slate-400">
            Try another search term or category.
          </p>
        </div>
      )}
    </section>
  )
}

export default FeaturedEvents
