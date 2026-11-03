import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Navbar from '../Components/layout/Navbar'
import FeaturedEvents from '../Components/events/FeaturedEvents'
import Footer from '../Components/layout/Footer'

const PAGE_SIZE = 9

function EventsPage() {
    const events = useSelector((state) => state.events.items)
    const status = useSelector((state) => state.events.status)
    const error = useSelector((state) => state.events.error)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [maxPrice, setMaxPrice] = useState(5000)
    const [sortBy, setSortBy] = useState('default')
    const [currentPage, setCurrentPage] = useState(1)

    const filteredEvents = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        const filtered = events.filter((event) => {
            const matchesSearch =
                !normalizedSearch ||
                `${event.title} ${event.location}`
                    .toLowerCase()
                    .includes(normalizedSearch)
            const matchesCategory =
                selectedCategory === 'all' ||
                event.category === selectedCategory
            const matchesPrice = Number(event.price) <= maxPrice
            return matchesSearch && matchesCategory && matchesPrice
        })

        if (sortBy === 'price-low') {
            filtered.sort((a, b) => Number(a.price) - Number(b.price))
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => Number(b.price) - Number(a.price))
        } else if (sortBy === 'title') {
            filtered.sort((a, b) => a.title.localeCompare(b.title))
        }

        return filtered
    }, [events, maxPrice, searchTerm, selectedCategory, sortBy])

    const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE)
    const pageEvents = filteredEvents.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    )

    function updateFilter(setter, value) {
        setter(value)
        setCurrentPage(1)
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="pt-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
                        Eventora / Explore
                    </p>
                    <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
                        Explore All Events
                    </h1>
                    <p className="mt-4 max-w-2xl text-slate-400">
                        Discover conferences, music nights, business meetups, and more.
                        Find an event that matches your interests.
                    </p>
                </div>
                <FeaturedEvents
                    events={pageEvents}
                    pagination={{
                        totalPages,
                        totalEvents: filteredEvents.length,
                    }}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    searchTerm={searchTerm}
                    onSearchChange={(value) => updateFilter(setSearchTerm, value)}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(value) => updateFilter(setSelectedCategory, value)}
                    maxPrice={maxPrice}
                    onMaxPriceChange={(value) => updateFilter(setMaxPrice, value)}
                    sortBy={sortBy}
                    onSortChange={(value) => updateFilter(setSortBy, value)}
                    isLoading={status === 'loading' || status === 'idle'}
                    error={status === 'failed' ? error : ''}
                />
            </main>
            <Footer />
        </div>
    )
}

export default EventsPage
