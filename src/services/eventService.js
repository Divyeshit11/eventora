import axios from 'axios'
import { TOKEN_KEY, clearStoredSession } from '../features/auth/authSlice'

function getApiBaseUrl() {
    // In production the API runs as a Vercel Function on this same domain.
    // VITE_API_URL remains available for local development if needed.
    const defaultApiUrl = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'
    return (import.meta.env.VITE_API_URL || defaultApiUrl)
        .replace(/\/+$/, '')
}

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
})
const eventRequests = new Map()

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
        // Public API requests can still proceed when browser storage is unavailable.
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearStoredSession()
            window.dispatchEvent(new Event('eventora:unauthorized'))
        }
        return Promise.reject(error)
    }
)

export async function getEvents(params = {}, options = {}) {
    const { management, ...query } = params
    const response = await api.get(management ? '/events/manage' : '/events', {
        params: query,
        signal: options.signal,
    })
    return response.data
}

export async function getEventById(id) {
    const key = String(id)
    if (!eventRequests.has(key)) {
        const request = api.get(`/events/${id}`)
            .then((response) => response.data.data)
            .finally(() => eventRequests.delete(key))
        eventRequests.set(key, request)
    }
    return eventRequests.get(key)
}

export async function createEvent(eventData) {
    const response = await api.post('/events', eventData)
    return response.data.data
}

export async function getAdminUsers(role) {
    const response = await api.get('/admin/users', { params: role ? { role } : undefined })
    return response.data.data
}

export async function updateUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response.data.data
}

export async function getPendingEvents() {
    const response = await api.get('/events/pending')
    return response.data.data
}

export async function moderateEvent(eventId, status, note = '') {
    const response = await api.patch(`/events/${eventId}/moderation`, { status, note })
    return response.data.data
}

export async function getEventSales(eventId) {
    const response = await api.get(`/events/${eventId}/sales`)
    return response.data.data
}

export async function getEventAttendees(eventId) {
    const response = await api.get(`/events/${eventId}/attendees`)
    return response.data.data
}

export async function downloadEventAttendees(eventId) {
    const response = await api.get(`/events/${eventId}/attendees.csv`, { responseType: 'blob' })
    return response.data
}

export async function downloadSalesReport() {
    const response = await api.get('/admin/reports/sales.csv', { responseType: 'blob' })
    return response.data
}

export async function updateEvent(id, eventData) {
    const response = await api.put(`/events/${id}`, eventData)
    return response.data.data
}

export async function deleteEvent(id) {
    const response = await api.delete(`/events/${id}`)
    return response.data
}

export async function exportEventsCsv() {
    const response = await api.get('/events/export-csv', {
        responseType: 'blob',
    })
    return response.data
}

export async function login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data.data
}

export async function register(credentials) {
    const response = await api.post('/auth/register', credentials)
    return {
        ...response.data.data,
        message: response.data.message,
    }
}

export async function changePassword(credentials) {
    const response = await api.post('/auth/change-password', credentials)
    return response.data
}

export async function requestPasswordReset(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
}

export async function resetPassword(credentials) {
    const response = await api.post('/auth/reset-password', credentials)
    return response.data
}

export async function createPaymentOrder(eventId, quantity, options = {}) {
    const response = await api.post('/payments/create-order', { eventId, quantity, ...options })
    return response.data.data
}

export async function verifyPayment(paymentData) {
    const response = await api.post('/payments/verify', paymentData)
    return response.data.data
}

export async function getMyBookings() {
    const response = await api.get('/bookings/me')
    return response.data.data
}

export async function cancelBooking(bookingId) {
    const response = await api.patch(`/bookings/${bookingId}/cancel`)
    return response.data.data
}

export async function getSeatAvailability(eventId, date) {
    const response = await api.get(`/events/${eventId}/seats`, { params: { date } })
    return response.data.data
}

export async function getBookingTicket(bookingId) {
    const response = await api.get(`/bookings/${bookingId}/ticket`)
    return response.data.data
}

export async function downloadBookingTicket(bookingId) {
    const response = await api.get(`/bookings/${bookingId}/ticket.pdf`, { responseType: 'blob' })
    return response.data
}

export async function checkInTicket(ticketCode) {
    const response = await api.post('/bookings/check-in', { ticketCode })
    return response.data
}

export async function getAdminAnalytics() {
    const response = await api.get('/analytics')
    return response.data.data
}

export async function getFavorites() {
    const response = await api.get('/users/me/favorites')
    return response.data.data
}

export async function addFavorite(eventId) {
    const response = await api.put(`/users/me/favorites/${eventId}`)
    return response.data.data
}

export async function removeFavorite(eventId) {
    const response = await api.delete(`/users/me/favorites/${eventId}`)
    return response.data.data
}

function consumeNdjson(buffer, chunk, onLine) {
    const nextBuffer = `${buffer}${chunk}`
    const lines = nextBuffer.split('\n')
    const remaining = lines.pop() || ''

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        onLine(JSON.parse(trimmed))
    }

    return remaining
}

export function importEventsFromCsv(files, { onUploadProgress, onProgress } = {}) {
    const formData = new FormData()
    const csvFiles = Array.isArray(files) ? files : [files]

    csvFiles.forEach((file) => {
        formData.append('files', file)
    })

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${getApiBaseUrl()}/events/import-csv`)
        xhr.responseType = 'text'
        try {
            const token = localStorage.getItem(TOKEN_KEY)
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        } catch {
            reject(new Error('Authentication storage is unavailable. Sign in again.'))
            return
        }

        xhr.upload.onprogress = (event) => {
            if (!onUploadProgress) return

            const total = event.total || 0
            const loaded = event.loaded || 0
            onUploadProgress({
                loaded,
                total,
                percent: total ? Math.min(100, Math.round((loaded / total) * 100)) : 0,
            })
        }

        let processedLength = 0
        let lineBuffer = ''
        let lastResult = null

        function readNewText() {
            const text = xhr.responseText || ''
            const chunk = text.slice(processedLength)
            processedLength = text.length
            if (!chunk) return

            try {
                lineBuffer = consumeNdjson(lineBuffer, chunk, (payload) => {
                    if (payload.type === 'complete') {
                        lastResult = payload
                    }
                    onProgress?.(payload)
                })
            } catch (error) {
                reject(error)
            }
        }

        xhr.onprogress = readNewText

        xhr.onload = () => {
            try {
                readNewText()
                if (lineBuffer.trim()) {
                    lineBuffer = consumeNdjson(lineBuffer, '\n', (payload) => {
                        if (payload.type === 'complete') {
                            lastResult = payload
                        }
                        onProgress?.(payload)
                    })
                }
            } catch (error) {
                reject(error)
                return
            }

            if (xhr.status >= 400) {
                try {
                    const errorBody = JSON.parse(xhr.responseText)
                    if (xhr.status === 401) {
                        clearStoredSession()
                        window.dispatchEvent(new Event('eventora:unauthorized'))
                    }
                    const error = new Error(errorBody.message || 'CSV import failed')
                    error.response = { data: errorBody }
                    reject(error)
                } catch {
                    reject(new Error('CSV import failed'))
                }
                return
            }

            if (lastResult) {
                resolve(lastResult)
                return
            }

            try {
                resolve(JSON.parse(xhr.responseText))
            } catch {
                reject(new Error('CSV import failed'))
            }
        }

        xhr.onerror = () => {
            reject(new Error('CSV import failed'))
        }

        xhr.send(formData)
    })
}

export default api
