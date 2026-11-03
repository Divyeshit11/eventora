import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import {
    selectAllEvents,
    selectEventCount,
} from '../features/events/eventsSelectors'
import {
    createEventThunk,
    deleteEventThunk,
    updateEventThunk,
} from '../features/events/eventsSlice'
import { changePassword as changePasswordAPI, exportEventsCsv } from '../services/eventService'
import { getEventId } from '../utils/eventIdentity'
import Navbar from '../Components/layout/Navbar'
import Button from '../Components/common/Button'
import Footer from '../Components/layout/Footer'
import CsvImport from '../Components/events/CsvImport'
import { logout } from '../features/auth/authSlice'

const emptyForm = {
    title: '',
    category: 'Technology',
    location: '',
    date: '',
    price: '',
    image: '',
    description: '',
}

function EventManagerPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const currentUser = useSelector((state) => state.auth.user)
    const events = useSelector(selectAllEvents)
    const eventCount = useSelector(selectEventCount)
    const eventsStatus = useSelector((state) => state.events.status)
    const eventsError = useSelector((state) => state.events.error)
    const createStatus = useSelector((state) => state.events.createStatus)
    const createError = useSelector((state) => state.events.createError)
    const updateStatus = useSelector((state) => state.events.updateStatus)
    const updateError = useSelector((state) => state.events.updateError)
    const deleteStatus = useSelector((state) => state.events.deleteStatus)
    const deleteError = useSelector((state) => state.events.deleteError)
    const [formData, setFormData] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [saveSuccess, setSaveSuccess] = useState('')
    const [exportStatus, setExportStatus] = useState('idle')
    const [exportError, setExportError] = useState('')
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    })
    const [passwordStatus, setPasswordStatus] = useState('idle')
    const [passwordMessage, setPasswordMessage] = useState('')

    function handleChange(event) {
        const { name, value } = event.target
        setSaveSuccess('')
        setFormData((previous) => ({ ...previous, [name]: value }))
    }

    function resetForm() {
        setFormData(emptyForm)
        setEditingId(null)
    }

    function handleEdit(event) {
        const eventId = getEventId(event)
        setSaveSuccess('')
        setEditingId(eventId)
        setFormData({
            title: event.title || '',
            category: event.category || 'Other',
            location: event.location || '',
            date: event.date?.slice(0, 10) || '',
            price: String(event.price ?? ''),
            image: event.image || '',
            description: event.description || '',
        })
        document.getElementById('event-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSaveSuccess('')
        const isEditing = Boolean(editingId)
        const payload = {
            ...formData,
            price: Number(formData.price),
        }
        const result = isEditing
            ? await dispatch(updateEventThunk({ id: editingId, eventData: payload }))
            : await dispatch(createEventThunk(payload))

        if (
            (isEditing && updateEventThunk.fulfilled.match(result)) ||
            (!isEditing && createEventThunk.fulfilled.match(result))
        ) {
            setSaveSuccess(
                isEditing ? 'Event updated successfully.' : 'Event created successfully.'
            )
            resetForm()
        }
    }

    async function handleRemoveEvent(eventId) {
        if (!window.confirm('Are you sure you want to delete this event?')) return
        await dispatch(deleteEventThunk(eventId))
    }

    async function handleExport() {
        setExportStatus('loading')
        setExportError('')
        try {
            const blob = await exportEventsCsv()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'eventora-events.csv'
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
            setExportStatus('succeeded')
        } catch (error) {
            setExportStatus('failed')
            setExportError(
                error.response?.data?.message || error.message || 'CSV export failed.'
            )
        }
    }

    async function handlePasswordChange(event) {
        event.preventDefault()
        setPasswordStatus('loading')
        setPasswordMessage('')
        try {
            const response = await changePasswordAPI(passwordForm)
            dispatch(logout())
            navigate('/login', {
                replace: true,
                state: { notice: response.message },
            })
        } catch (error) {
            setPasswordStatus('failed')
            setPasswordMessage(
                error.response?.data?.message ||
                error.message ||
                'Unable to change password'
            )
        }
    }

    const isSaving = createStatus === 'loading' || updateStatus === 'loading'

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                <h1 className="text-3xl font-bold sm:text-4xl">Event Manager</h1>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">
                        Signed in as {currentUser?.email}
                    </p>
                    <Button variant="secondary" onClick={() => dispatch(logout())}>
                        Sign out
                    </Button>
                </div>
                <details className="mt-5 rounded-xl border border-surface-border bg-surface-card p-4">
                    <summary className="cursor-pointer font-semibold">
                        Change administrator password
                    </summary>
                    <form onSubmit={handlePasswordChange} className="mt-4 grid gap-4 sm:max-w-lg">
                        <label className="grid gap-2 text-sm text-slate-300">
                            Current password
                            <input
                                type="password"
                                autoComplete="current-password"
                                value={passwordForm.currentPassword}
                                onChange={(event) => setPasswordForm((form) => ({
                                    ...form,
                                    currentPassword: event.target.value,
                                }))}
                                required
                                className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            />
                        </label>
                        <label className="grid gap-2 text-sm text-slate-300">
                            New password (12 characters minimum)
                            <input
                                type="password"
                                autoComplete="new-password"
                                minLength="12"
                                maxLength="128"
                                value={passwordForm.newPassword}
                                onChange={(event) => setPasswordForm((form) => ({
                                    ...form,
                                    newPassword: event.target.value,
                                }))}
                                required
                                className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            />
                        </label>
                        {passwordMessage && (
                            <p
                                role={passwordStatus === 'failed' ? 'alert' : 'status'}
                                className="text-sm text-red-300"
                            >
                                {passwordMessage}
                            </p>
                        )}
                        <Button type="submit" disabled={passwordStatus === 'loading'}>
                            {passwordStatus === 'loading' ? 'Changing password...' : 'Change password'}
                        </Button>
                    </form>
                </details>
                <p className="mt-3 text-slate-400">Total events: {eventCount}</p>
                <p className="mt-3 text-slate-400">
                    Create and manage events using MongoDB.
                </p>

                <form
                    id="event-form"
                    onSubmit={handleSubmit}
                    className="mt-8 grid scroll-mt-6 gap-4 rounded-2xl border border-surface-border bg-surface-card p-5 sm:grid-cols-2"
                >
                    <label className="grid gap-2 text-sm text-slate-300">
                        Event Title
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength="160"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                        Category
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                        >
                            {['Technology', 'Music', 'Business', 'Comedy', 'Other'].map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                        Location
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            maxLength="160"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                        Event Date
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                        Ticket Price (₹)
                        <input
                            type="number"
                            name="price"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                        Event Image URL
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/event.jpg"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300 sm:col-span-2">
                        Event Description
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength="5000"
                            rows="4"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                        />
                    </label>

                    {(editingId ? updateStatus === 'failed' : createStatus === 'failed') && (
                        <p className="text-sm text-red-400 sm:col-span-2" role="alert">
                            {editingId ? updateError : createError}
                        </p>
                    )}
                    {saveSuccess && (
                        <p className="text-sm text-green-400 sm:col-span-2" role="status">
                            {saveSuccess}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3 sm:col-span-2">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving
                                ? (editingId ? 'Saving Changes...' : 'Creating Event...')
                                : (editingId ? 'Save Changes' : 'Create Event')}
                        </Button>
                        {editingId && (
                            <Button variant="secondary" onClick={resetForm}>
                                Cancel Edit
                            </Button>
                        )}
                    </div>
                </form>

                <section className="mt-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-2xl font-bold">Events ({events.length})</h2>
                        <Button
                            variant="secondary"
                            onClick={handleExport}
                            disabled={exportStatus === 'loading'}
                        >
                            {exportStatus === 'loading' ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    </div>
                    {exportError && <p className="mt-3 text-sm text-red-400" role="alert">{exportError}</p>}
                    {exportStatus === 'succeeded' && (
                        <p className="mt-3 text-sm text-green-400" role="status">
                            CSV export downloaded.
                        </p>
                    )}
                    {deleteStatus === 'failed' && (
                        <p className="mt-3 text-sm text-red-400" role="alert">{deleteError}</p>
                    )}
                    {eventsStatus === 'failed' && (
                        <p className="mt-3 text-sm text-red-400" role="alert">
                            {eventsError || 'Unable to load events.'}
                        </p>
                    )}

                    <div className="mt-5 space-y-3">
                        {(eventsStatus === 'idle' || eventsStatus === 'loading') && (
                            <p className="py-6 text-center text-slate-400" role="status">
                                Loading events...
                            </p>
                        )}
                        {events.map((event) => {
                            const eventId = getEventId(event)
                            return (
                                <article
                                    key={eventId}
                                    className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {event.location} · ₹{event.price}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {event.category} · {event.date}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Link
                                            to={`/events/${eventId}`}
                                            className="text-sm font-medium text-brand-500 hover:text-brand-400"
                                        >
                                            View Details
                                        </Link>
                                        <Button variant="secondary" onClick={() => handleEdit(event)}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            disabled={deleteStatus === 'loading'}
                                            onClick={() => handleRemoveEvent(eventId)}
                                        >
                                            {deleteStatus === 'loading' ? 'Removing...' : 'Remove'}
                                        </Button>
                                    </div>
                                </article>
                            )
                        })}
                        {eventsStatus === 'succeeded' && events.length === 0 && (
                            <p className="rounded-xl border border-surface-border p-6 text-center text-slate-400">
                                No events available.
                            </p>
                        )}
                    </div>
                </section>

                <CsvImport />
            </main>
            <Footer />
        </div>
    )
}

export default EventManagerPage
