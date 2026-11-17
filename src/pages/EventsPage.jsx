import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from '../Components/layout/Navbar'
import FeaturedEvents from '../Components/events/FeaturedEvents'
import Footer from '../Components/layout/Footer'
import { fetchEvents } from '../features/events/eventsSlice'

const PAGE_SIZE = 9

function EventsPage() {
    const dispatch = useDispatch()
    const events = useSelector((state) => state.events.items)
    const pagination = useSelector((state) => state.events.pagination)
    const status = useSelector((state) => state.events.status)
    const error = useSelector((state) => state.events.error)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [maxPrice, setMaxPrice] = useState(5000)
    const [sortBy, setSortBy] = useState('default')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const controller = new AbortController()
        const timer = window.setTimeout(() => {
            dispatch(fetchEvents({
                page: currentPage,
                limit: PAGE_SIZE,
                ...(searchTerm.trim() && { search: searchTerm.trim() }),
                ...(selectedCategory !== 'all' && { category: selectedCategory }),
                maxPrice,
                sort: sortBy,
            }, { signal: controller.signal }))
        }, searchTerm ? 250 : 0)

        return () => {
            window.clearTimeout(timer)
            controller.abort()
        }
    }, [currentPage, dispatch, maxPrice, searchTerm, selectedCategory, sortBy])

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
                    events={events}
                    pagination={pagination}
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
