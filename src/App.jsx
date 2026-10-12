import Hero from "./Components/layout/Hero";
import Navbar from "./Components/layout/Navbar";
import FeaturedEvents from "./Components/events/FeaturedEvents";  
import  events  from "./data/events";

function App() {
  return (
    <div className="min-h-screen bg-surface text-white">
      <Navbar />
      <Hero />

      <FeaturedEvents events={events} />
    </div>
  );
}

export default App;