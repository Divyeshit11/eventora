import { useState } from "react";
import Navbar from "../Components/layout/Navbar";
import Hero from "../Components/layout/Hero";
import CategorySection from "../Components/events/CategorySection";
import FeaturedEvents from "../Components/events/FeaturedEvents";
import Footer from "../Components/layout/Footer";
import events from "../data/events";
import { useSelector } from "react-redux";

function HomePage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const events = useSelector((state)=>state.events.items)


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
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            />

            <Footer />
            
        </div>
    )
}

export default HomePage