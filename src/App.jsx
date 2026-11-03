import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import EventManagerPage from "./pages/EventManagerPage";
import FavoritesPage from './pages/FavoritesPage'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEvents } from './features/events/eventsSlice'
import { logout } from './features/auth/authSlice'
import AdminLoginPage from './pages/AdminLoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchEvents({ limit: 100 }))
  }, [dispatch])

  useEffect(() => {
    const handleUnauthorized = () => dispatch(logout())
    window.addEventListener('eventora:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('eventora:unauthorized', handleUnauthorized)
  }, [dispatch])

  const isAdmin = useSelector((state) => state.auth.user?.role === 'admin')

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/manage-events" element={isAdmin ? <EventManagerPage /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
