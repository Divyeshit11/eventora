import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import EventManagerPage from "./pages/EventManagerPage";
import FavoritesPage from './pages/FavoritesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/manage-events" element={<EventManagerPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
