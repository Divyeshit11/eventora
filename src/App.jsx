import Hero from "./Components/layout/Hero";
import Navbar from "./Components/layout/Navbar";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <Navbar/>
      <Hero/>
      <div className="text-center">
        <h1 className="text-6xl font-bold">
          Eventora
        </h1>

        <p className="mt-4 text-slate-400">
          Discover. Book. Experience.
        </p>

        <button className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-medium transition hover:bg-indigo-500">
          Explore Events
        </button>
      </div>
    </main>
  )
}

export default App