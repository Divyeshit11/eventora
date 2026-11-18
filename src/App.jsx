import { Navigate, Route, Routes, useLocation } from "react-router";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import EventManagerPage from "./pages/EventManagerPage";
import FavoritesPage from './pages/FavoritesPage'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from './features/auth/authSlice'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function RequireAuth({ children, adminOnly = false }) {
  const user = useSelector((state) => state.auth.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/events" replace />
  }
  return children
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleUnauthorized = () => dispatch(logout())
    window.addEventListener('eventora:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('eventora:unauthorized', handleUnauthorized)
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<RequireAuth><EventsPage /></RequireAuth>} />
      <Route path="/events/:eventId" element={<RequireAuth><EventDetailPage /></RequireAuth>} />
      <Route
        path="/manage-events"
        element={<RequireAuth adminOnly><EventManagerPage /></RequireAuth>}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
