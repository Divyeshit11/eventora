import { useState } from "react";
import Navbar from "../Components/layout/Navbar";
import FeaturedEvents from "../Components/events/FeaturedEvents";
import events from "../data/events";
import Footer from "../Components/layout/Footer";
import { useSelector } from "react-redux";


function EventsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
  const events = useSelector((state) => state.events.items)
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
                        DisCover Conferences,music nights, business meetups, and more. find and event that matches your interests.


                    </p>
                </div>
<FeaturedEvents
events={events}
selectedCategory={selectedCategory}
onCategoryChange={setSelectedCategory}
/>
            </main>
            <Footer />
        </div>
    )
}

export default EventsPage