import Hero from "./Components/layout/Hero";
import Navbar from "./Components/layout/Navbar";
import FeaturedEvents from "./Components/events/FeaturedEvents";  
import  events  from "./data/events";
import { useState } from "react";
import CategorySection from "./Components/events/CategorySection";
import Footer from "./Components/layout/Footer";


function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  function handleCategorySelect(categoryId) {
    setSelectedCategory(categoryId)

    document.getElementById('events')?.scrollIntoView({
      behavior: 'smooth',
    })
  }
  return (
    <div className="min-h-screen bg-surface text-white">
      <Navbar />
      <Hero />

      <CategorySection
      onCategorySelect={handleCategorySelect}
      />

      <FeaturedEvents 
      events={events}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory} />

      <Footer />
    </div>
  );
}

export default App;