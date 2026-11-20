import { useState } from 'react'
import EventGrid from './EventGrid'
import EventFilters from './Eventfilters'
import { Link } from 'react-router'
import EventImage from '../common/EventImage'
import EmptyState from '../common/EmptyState'
import Reveal from '../common/Reveal'
import { getEventId } from '../../utils/eventIdentity'
import {
    CompassIcon,
    GridIcon,
    ListIcon,
    MapPinIcon,
    CalendarIcon,
    ArrowRightIcon,
} from '../common/icons'

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
    const visiblePages = [...new Set([
        1,
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
        totalPages,
    ])]
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((left, right) => left - right)

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
            className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12),_transparent_65%)]" />
            <Reveal className="relative mb-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                    <CompassIcon className="h-3.5 w-3.5" />
                    Explore
                </span>

                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Discover <span className="text-gradient">Events</span>
                </h2>

                <p className="mt-3 max-w-xl text-slate-400">
                    Find events that match your interests — from live music to tech talks.
                </p>
            </Reveal>

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
                    <span className="font-semibold text-white">{totalEvents.toLocaleString()}</span> events found
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
                    aria-label="Grid view"
                    className={`grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 ${viewMode === 'grid'
                            ? 'border-transparent bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30'
                            : 'border-surface-border bg-surface-card text-slate-300 hover:border-brand-500/50 hover:text-white'
                        }`}
                >
                    <GridIcon className="h-4.5 w-4.5" />
                </button>

                <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    aria-label="List view"
                    className={`grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 ${viewMode === 'list'
                            ? 'border-transparent bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30'
                            : 'border-surface-border bg-surface-card text-slate-300 hover:border-brand-500/50 hover:text-white'
                        }`}
                >
                    <ListIcon className="h-4.5 w-4.5" />
                </button>
            </div>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="card-surface animate-pulse overflow-hidden rounded-3xl"
                        >
                            <div className="img-shimmer h-52 w-full" />
                            <div className="space-y-3 p-5">
                                <div className="h-5 w-3/4 rounded-lg bg-surface-raised" />
                                <div className="h-4 w-1/2 rounded-lg bg-surface-raised" />
                                <div className="h-4 w-2/3 rounded-lg bg-surface-raised" />
                            </div>
                        </div>
                    ))}
                    <p className="sr-only" role="status">Loading events...</p>
                </div>
            ) : error ? (
                <p className="rounded-2xl border border-red-800 bg-red-950/30 p-6 text-center text-red-300" role="alert">
                    {error}
                </p>
            ) : events.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <EventGrid events={events} />
                    ) : (
                        <div className="space-y-4">
                            {events.map((event, index) => (
                                <Reveal key={getEventId(event)} delay={Math.min(index, 6) * 60}>
                                    <article className="card-surface card-hover flex flex-col gap-4 overflow-hidden rounded-3xl p-4 sm:flex-row sm:items-center">
                                        <EventImage
                                            src={event.image || undefined}
                                            alt={event.title}
                                            className="h-48 w-full rounded-2xl object-cover sm:h-28 sm:w-40"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-brand-400">
                                                {event.category}
                                            </p>

                                            <h3 className="mt-1 font-display text-xl font-bold text-white">
                                                {event.title}
                                            </h3>

                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPinIcon className="h-4 w-4 text-brand-400" />
                                                    {event.location}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarIcon className="h-4 w-4 text-accent-400" />
                                                    {event.date}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                            <p className="font-display text-lg font-extrabold text-white">
                                                ₹{event.price}
                                            </p>

                                            <Link
                                                to={`/events/${getEventId(event)}`}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:shadow-brand-500/40 hover:brightness-110"
                                            >
                                                View Event
                                                <ArrowRightIcon className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </article>
                                </Reveal>
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
                                className="rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-sm font-medium text-white transition hover:border-brand-500/50 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
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
                                        className={`min-w-10 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${currentPage === page
                                                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30'
                                                : 'border border-surface-border bg-surface-card text-slate-300 hover:border-brand-500/50 hover:text-white'
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
                                className="rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-sm font-medium text-white transition hover:border-brand-500/50 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyState
                    icon={<CompassIcon className="h-9 w-9" />}
                    title="No events found"
                    description="Try changing your search, category, or price to discover something new."
                    action={
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110"
                        >
                            Reset Filters
                        </button>
                    }
                />
            )}
        </section>
    )
}

export default FeaturedEvents
