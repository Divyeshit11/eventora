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
import { clearFavorites, fetchFavorites } from './features/events/eventsSlice'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AccountPage from './pages/AccountPage'
import AnalyticsPage from './pages/AnalyticsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import TicketPage from './pages/TicketPage'
import CheckInPage from './pages/CheckInPage'
import AdminOperationsPage from './pages/AdminOperationsPage'
import OrganizerEventPage from './pages/OrganizerEventPage'

function RequireAuth({ children, adminOnly = false, organizerAllowed = false }) {
  const user = useSelector((state) => state.auth.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/events" replace />
  }
  if (organizerAllowed && !['admin', 'organizer'].includes(user.role)) {
    return <Navigate to="/events" replace />
  }
  return children
}

function App() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const userId = user?.id

  useEffect(() => {
    const handleUnauthorized = () => dispatch(logout())
    window.addEventListener('eventora:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('eventora:unauthorized', handleUnauthorized)
  }, [dispatch])

  useEffect(() => {
    if (userId) dispatch(fetchFavorites())
    else dispatch(clearFavorites())
  }, [dispatch, userId])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<RequireAuth><EventsPage /></RequireAuth>} />
      <Route path="/events/:eventId" element={<RequireAuth><EventDetailPage /></RequireAuth>} />
      <Route
        path="/manage-events"
        element={<RequireAuth organizerAllowed><EventManagerPage /></RequireAuth>}
      />
      <Route path="/manage-events/:eventId" element={<RequireAuth organizerAllowed><OrganizerEventPage /></RequireAuth>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
      <Route path="/bookings" element={<RequireAuth><MyBookingsPage /></RequireAuth>} />
      <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth adminOnly><AnalyticsPage /></RequireAuth>} />
      <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
      <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
      <Route path="/tickets/:bookingId" element={<RequireAuth><TicketPage /></RequireAuth>} />
      <Route path="/check-in" element={<RequireAuth organizerAllowed><CheckInPage /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth adminOnly><AdminOperationsPage /></RequireAuth>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
