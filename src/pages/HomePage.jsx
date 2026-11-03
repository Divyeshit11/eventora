import { useState } from "react";
import Navbar from "../Components/layout/Navbar";
import Hero from "../Components/layout/Hero";
import CategorySection from "../Components/events/CategorySection";
import FeaturedEvents from "../Components/events/FeaturedEvents";
import Footer from "../Components/layout/Footer";
import { useSelector } from "react-redux";

function HomePage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const events = useSelector((state)=>state.events.items)
    const eventStatus = useSelector((state) => state.events.status)
    const eventError = useSelector((state) => state.events.error)
    const featuredEvents = selectedCategory === 'all'
        ? events
        : events.filter((event) => event.category === selectedCategory)


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
            events={featuredEvents}
            pagination={{ totalEvents: featuredEvents.length, totalPages: 0 }}
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