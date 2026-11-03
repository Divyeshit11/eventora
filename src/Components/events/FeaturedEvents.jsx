
import { useState } from 'react'
import EventGrid from './EventGrid'
import EventFilters from './Eventfilters'
import { Link } from 'react-router'
import EventImage from '../common/EventImage'
import { getEventId } from '../../utils/eventIdentity'

function FeaturedEvents({
    events,
    pagination,
    currentPage,
    onPageChange,
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    maxPrice,
    onMaxPriceChange,
    sortBy,
    onSortChange,
    isLoading,
    error,
    showFilters = true,
}) {
    const [viewMode, setViewMode] = useState('grid')

    const totalPages = pagination?.totalPages ?? 0
    const totalEvents = pagination?.totalEvents ?? 0

    // Display a compact set of page numbers.
    const visiblePages = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    ).filter((page) =>
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 2
    )

    function handleResetFilters() {
        onSearchChange('')
        onCategoryChange('all')
        onMaxPriceChange(5000)
        onSortChange('default')
        onPageChange(1)
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

            {showFilters && (
                <EventFilters
                    searchTerm={searchTerm}
                    onSearchChange={onSearchChange}
                    selectedCategory={selectedCategory}
                    onCategoryChange={onCategoryChange}
                    maxPrice={maxPrice}
                    onMaxPriceChange={onMaxPriceChange}
                    sortBy={sortBy}
                    onSortChange={onSortChange}
                />
            )}

            <div
                className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400"
                aria-live="polite"
            >
                <p>
                    {totalEvents.toLocaleString()} events found
                </p>

                {totalPages > 0 && (
                    <p>
                        Page {currentPage} of {totalPages}
                    </p>
                )}
            </div>

            <div className="mb-6 flex items-center justify-end gap-2">
                <span className="mr-2 text-sm text-slate-400">
                    View:
                </span>

                <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${viewMode === 'grid'
                            ? 'bg-brand-600 text-white'
                            : 'border border-surface-border text-slate-300 hover:bg-slate-800'
                        }`}
                >
                    ▦ Grid
                </button>

                <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${viewMode === 'list'
                            ? 'bg-brand-600 text-white'
                            : 'border border-surface-border text-slate-300 hover:bg-slate-800'
                        }`}
                >
                    ☰ List
                </button>
            </div>

            {isLoading ? (
                <p className="py-12 text-center text-slate-400">
                    Loading events...
                </p>
            ) : error ? (
                <p className="rounded-xl border border-red-800 bg-red-950/30 p-6 text-center text-red-300" role="alert">
                    {error}
                </p>
            ) : events.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <EventGrid events={events} />
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <article
                                    key={getEventId(event)}
                                    className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-4 sm:flex-row sm:items-center"
                                >
                                    <EventImage
                                        src={event.image || undefined}
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
                                            {event.location} · {event.date}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                        <p className="text-lg font-bold text-white">
                                            ₹{event.price}
                                        </p>

                                        <Link
                                            to={`/events/${getEventId(event)}`}
                                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                                        >
                                            View Event
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
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={
                                    currentPage === 1 || isLoading
                                }
                                className="rounded-lg border border-surface-border px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            {visiblePages.map((page, index) => (
                                <span
                                    key={page}
                                    className="flex items-center gap-2"
                                >
                                    {index > 0 &&
                                        page - visiblePages[index - 1] > 1 && (
                                            <span className="px-1 text-slate-400">
                                                …
                                            </span>
                                        )}

                                    <button
                                        type="button"
                                        onClick={() => onPageChange(page)}
                                        disabled={isLoading}
                                        aria-current={
                                            currentPage === page
                                                ? 'page'
                                                : undefined
                                        }
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${currentPage === page
                                                ? 'bg-brand-600 text-white'
                                                : 'border border-surface-border text-slate-300 hover:bg-slate-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </span>
                            ))}

                            <button
                                type="button"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={
                                    currentPage >= totalPages || isLoading
                                }
                                className="rounded-lg border border-surface-border px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
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
