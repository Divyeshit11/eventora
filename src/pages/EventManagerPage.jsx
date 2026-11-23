import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import {
    selectAllEvents,
    selectEventCount,
} from '../features/events/eventsSelectors'
import {
    createEventThunk,
    deleteEventThunk,
    fetchEvents,
    updateEventThunk,
} from '../features/events/eventsSlice'
import { changePassword as changePasswordAPI, exportEventsCsv } from '../services/eventService'
import { getEventId } from '../utils/eventIdentity'
import Navbar from '../Components/layout/Navbar'
import Button from '../Components/common/Button'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import Reveal from '../Components/common/Reveal'
import CsvImport from '../Components/events/CsvImport'
import EventImage from '../Components/common/EventImage'
import { logout } from '../features/auth/authSlice'
import {
    CalendarIcon,
    MapPinIcon,
    TicketIcon,
    DownloadIcon,
    EditIcon,
    TrashIcon,
    ShieldIcon,
    SparklesIcon,
} from '../Components/common/icons'

const emptyForm = {
    title: '',
    category: 'Technology',
    location: '',
    date: '',
    price: '',
    ticketCapacity: '100',
    image: '',
    description: '',
}

const inputClass = 'field py-3'

function EventManagerPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const currentUser = useSelector((state) => state.auth.user)
    const events = useSelector(selectAllEvents)
    const eventCount = useSelector(selectEventCount)
    const eventsPagination = useSelector((state) => state.events.pagination)
    const eventsStatus = useSelector((state) => state.events.status)
    const eventsError = useSelector((state) => state.events.error)
    const createStatus = useSelector((state) => state.events.createStatus)
    const createError = useSelector((state) => state.events.createError)
    const updateStatus = useSelector((state) => state.events.updateStatus)
    const updateError = useSelector((state) => state.events.updateError)
    const deleteStatus = useSelector((state) => state.events.deleteStatus)
    const deleteError = useSelector((state) => state.events.deleteError)
    const [formData, setFormData] = useState(emptyForm)
    const [managerPage, setManagerPage] = useState(1)
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

    useEffect(() => {
        const controller = new AbortController()
        dispatch(fetchEvents({ page: managerPage, limit: 20 }, { signal: controller.signal }))
        return () => controller.abort()
    }, [dispatch, managerPage])

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
            ticketCapacity: String(event.ticketCapacity ?? 100),
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
            ticketCapacity: Number(formData.ticketCapacity),
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
        const result = await dispatch(deleteEventThunk(eventId))
        if (
            deleteEventThunk.fulfilled.match(result) &&
            events.length === 1 &&
            managerPage > 1
        ) {
            setManagerPage((page) => page - 1)
        }
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
            <main>
                <PageHeader
                    eyebrow="Administration"
                    title="Event Manager"
                    description={`Signed in as ${currentUser?.email} — create, edit, and manage every event on Eventora.`}
                >
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-300">
                            <SparklesIcon className="h-4 w-4" />
                            {eventCount.toLocaleString()} total events
                        </span>
                        <Button variant="secondary" onClick={() => dispatch(logout())}>
                            Sign out
                        </Button>
                    </div>
                </PageHeader>

                <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
                    <details className="card-surface group rounded-2xl p-5">
                        <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold text-white">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                                <ShieldIcon className="h-4.5 w-4.5" />
                            </span>
                            Change administrator password
                            <span className="ml-auto text-slate-500 transition group-open:rotate-180">▾</span>
                        </summary>
                        <form onSubmit={handlePasswordChange} className="mt-5 grid gap-4 sm:max-w-lg">
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
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
                                    className={inputClass}
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
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
                                    className={inputClass}
                                />
                            </label>
                            {passwordMessage && (
                                <p
                                    role={passwordStatus === 'failed' ? 'alert' : 'status'}
                                    className={`rounded-xl border px-4 py-3 text-sm ${passwordStatus === 'failed'
                                        ? 'border-red-800 bg-red-950/30 text-red-300'
                                        : 'border-emerald-800 bg-emerald-950/30 text-emerald-300'}`}
                                >
                                    {passwordMessage}
                                </p>
                            )}
                            <Button type="submit" disabled={passwordStatus === 'loading'} className="sm:w-fit">
                                {passwordStatus === 'loading' ? 'Changing password...' : 'Change password'}
                            </Button>
                        </form>
                    </details>

                    <Reveal delay={80}>
                        <form
                            id="event-form"
                            onSubmit={handleSubmit}
                            className="card-surface gradient-border mt-8 grid scroll-mt-24 gap-5 rounded-3xl p-6 sm:grid-cols-2 sm:p-8"
                        >
                            <div className="sm:col-span-2">
                                <h2 className="font-display text-xl font-bold text-white">
                                    {editingId ? 'Edit event' : 'Create a new event'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    {editingId ? 'Update the details below and save your changes.' : 'Fill in the details to publish a new event.'}
                                </p>
                            </div>
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Event Title
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    maxLength="160"
                                    className={inputClass}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Category
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    {['Technology', 'Music', 'Business', 'Comedy', 'Other'].map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Location
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    maxLength="160"
                                    className={inputClass}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Event Date
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Ticket Price (₹)
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300">
                                Ticket Capacity
                                <input
                                    type="number"
                                    name="ticketCapacity"
                                    min="1"
                                    max="100000"
                                    step="1"
                                    value={formData.ticketCapacity}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300 sm:col-span-2">
                                Event Image URL
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/event.jpg"
                                    className={inputClass}
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-300 sm:col-span-2">
                                Event Description
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength="5000"
                                    rows="4"
                                    className={`${inputClass} resize-y`}
                                />
                            </label>

                            {(editingId ? updateStatus === 'failed' : createStatus === 'failed') && (
                                <p className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300 sm:col-span-2" role="alert">
                                    {editingId ? updateError : createError}
                                </p>
                            )}
                            {saveSuccess && (
                                <p className="rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300 sm:col-span-2" role="status">
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
                    </Reveal>

                    <section className="mt-12">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="font-display text-2xl font-bold text-white">
                                Events <span className="text-slate-500">({eventCount.toLocaleString()})</span>
                            </h2>
                            <Button
                                variant="secondary"
                                onClick={handleExport}
                                disabled={exportStatus === 'loading'}
                            >
                                <DownloadIcon className="h-4 w-4" />
                                {exportStatus === 'loading' ? 'Exporting...' : 'Export CSV'}
                            </Button>
                        </div>
                        {exportError && <p className="mt-3 text-sm text-red-400" role="alert">{exportError}</p>}
                        {exportStatus === 'succeeded' && (
                            <p className="mt-3 rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300" role="status">
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
                                        className="card-surface card-hover flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
                                    >
                                        <EventImage
                                            src={event.image}
                                            alt={event.title}
                                            className="h-24 w-full shrink-0 rounded-xl object-cover sm:w-36"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-display font-semibold text-white">{event.title}</h3>
                                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPinIcon className="h-4 w-4 text-brand-400" />
                                                    {event.location}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarIcon className="h-4 w-4 text-accent-400" />
                                                    {event.date}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <TicketIcon className="h-4 w-4 text-emerald-400" />
                                                    ₹{event.price}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {event.category} · Capacity {event.ticketCapacity ?? 100}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                to={`/events/${eventId}`}
                                                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-400 transition hover:bg-brand-500/10 hover:text-brand-300"
                                            >
                                                View Details
                                            </Link>
                                            <Button variant="secondary" onClick={() => handleEdit(event)} className="!px-4 !py-2 text-sm">
                                                <EditIcon className="h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                disabled={deleteStatus === 'loading'}
                                                onClick={() => handleRemoveEvent(eventId)}
                                                className="!px-4 !py-2 text-sm text-red-300 hover:border-red-500/50"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                                {deleteStatus === 'loading' ? 'Removing...' : 'Remove'}
                                            </Button>
                                        </div>
                                    </article>
                                )
                            })}
                            {eventsStatus === 'succeeded' && events.length === 0 && (
                                <p className="card-surface rounded-2xl p-8 text-center text-slate-400">
                                    No events available.
                                </p>
                            )}
                        </div>

                        {eventsPagination && eventsPagination.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <Button
                                    variant="secondary"
                                    disabled={managerPage <= 1 || eventsStatus === 'loading'}
                                    onClick={() => setManagerPage((page) => page - 1)}
                                >
                                    Previous
                                </Button>
                                <p className="text-sm text-slate-400">
                                    Page {managerPage.toLocaleString()} of {eventsPagination.totalPages.toLocaleString()}
                                </p>
                                <Button
                                    variant="secondary"
                                    disabled={managerPage >= eventsPagination.totalPages || eventsStatus === 'loading'}
                                    onClick={() => setManagerPage((page) => page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </section>

                    <CsvImport onEventsRefreshed={() => setManagerPage(1)} />
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default EventManagerPage
