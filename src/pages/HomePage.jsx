import { useEffect, useState } from "react";
import Navbar from "../Components/layout/Navbar";
import Hero from "../Components/layout/Hero";
import CategorySection from "../Components/events/CategorySection";
import FeaturedEvents from "../Components/events/FeaturedEvents";
import Footer from "../Components/layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../features/events/eventsSlice";

function HomePage() {
    const dispatch = useDispatch()
    const [selectedCategory, setSelectedCategory] = useState('all')
    const events = useSelector((state)=>state.events.items)
    const eventStatus = useSelector((state) => state.events.status)
    const eventError = useSelector((state) => state.events.error)
    const pagination = useSelector((state) => state.events.pagination)

    useEffect(() => {
        const controller = new AbortController()
        dispatch(fetchEvents({
            page: 1,
            limit: 9,
            ...(selectedCategory !== 'all' && { category: selectedCategory }),
        }, { signal: controller.signal }))
        return () => controller.abort()
    }, [dispatch, selectedCategory])


    function handleCategorySelect(categoryId) {
        setSelectedCategory(categoryId)

        document.getElementById('events')?.scrollIntoView({behavior:'smooth'})
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <Hero />

            <CategorySection
            onCategorySelect={handleCategorySelect}/>

            <FeaturedEvents
            events={events}
            pagination={{ totalEvents: pagination?.totalEvents ?? events.length, totalPages: 0 }}
            currentPage={1}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            isLoading={eventStatus === 'idle' || eventStatus === 'loading'}
            error={eventStatus === 'failed' ? eventError : ''}
            showFilters={false}
            />

            <Footer />
            
        </div>
    )
}

export default HomePage