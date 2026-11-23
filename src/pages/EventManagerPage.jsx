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
import EventImage from '../Components/common/EventImage'
import CsvImport from '../Components/events/CsvImport'
import {
    CalendarIcon,
    MapPinIcon,
    SparklesIcon,
    TicketIcon,
} from '../Components/common/icons'
import { logout } from '../features/auth/authSlice'

const emptyForm = {
    title: '',
    category: 'Technology',
    location: '',
    venueAddress: '',
    venueContact: '',
    date: '',
    ticketTypes: [{ name: 'General admission', price: '', quantity: '100' }],
    image: '',
    description: '',
    additionalDates: '',
    seatingEnabled: false,
    seatRows: '0',
    seatsPerRow: '0',
}

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
        dispatch(fetchEvents({ page: managerPage, limit: 20, management: true }, { signal: controller.signal }))
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
            venueAddress: event.venueAddress || '',
            venueContact: event.venueContact || '',
            date: event.date?.slice(0, 10) || '',
            ticketTypes: event.ticketTypes?.length
                ? event.ticketTypes.map(({ name, price, quantity, _id }) => ({ name, price: String(price), quantity: String(quantity), _id }))
                : [{ name: 'General admission', price: String(event.price ?? ''), quantity: String(event.ticketCapacity ?? 100) }],
            image: event.image || '',
            description: event.description || '',
            additionalDates: (event.sessions || []).map((session) => session.date).filter((date) => date !== event.date).join(', '),
            seatingEnabled: Boolean(event.seatingEnabled),
            seatRows: String(event.seatRows || 0),
            seatsPerRow: String(event.seatsPerRow || 0),
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
        const ticketTypes = formData.ticketTypes.map((ticketType) => ({
            ...ticketType,
            price: Number(ticketType.price),
            quantity: Number(ticketType.quantity),
        }))
        const payload = {
            ...formData,
            ticketTypes,
            price: Math.min(...ticketTypes.map((ticketType) => ticketType.price)),
            ticketCapacity: ticketTypes.reduce((total, ticketType) => total + ticketType.quantity, 0),
            seatRows: Number(formData.seatRows || 0),
            seatsPerRow: Number(formData.seatsPerRow || 0),
            sessions: [formData.date, ...formData.additionalDates.split(',').map((date) => date.trim()).filter(Boolean)].map((date) => ({ date, label: date })),
        }

        delete payload.additionalDates
        const result = isEditing
            ? await dispatch(updateEventThunk({ id: editingId, eventData: payload }))
            : await dispatch(createEventThunk(payload))

        if (
            (isEditing && updateEventThunk.fulfilled.match(result)) ||
            (!isEditing && createEventThunk.fulfilled.match(result))
        ) {
        const requiresApproval = currentUser?.role === 'organizer'
        setSaveSuccess(isEditing
            ? requiresApproval ? 'Changes submitted for administrator approval.' : 'Event updated successfully.'
            : requiresApproval ? 'Event submitted for administrator approval.' : 'Event created and published.')
            resetForm()
        }
    }

    function updateTicketType(index, field, value) {
        setFormData((form) => ({
            ...form,
            ticketTypes: form.ticketTypes.map((ticketType, typeIndex) =>
                typeIndex === index ? { ...ticketType, [field]: value } : ticketType
            ),
        }))
    }

    function addTicketType() {
        setFormData((form) => form.ticketTypes.length >= 10 ? form : ({
            ...form,
            ticketTypes: [...form.ticketTypes, { name: '', price: '', quantity: '100' }],
        }))
    }

    function removeTicketType(index) {
        setFormData((form) => form.ticketTypes.length <= 1 ? form : ({
            ...form,
            ticketTypes: form.ticketTypes.filter((_, typeIndex) => typeIndex !== index),
        }))
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
                    description={`Signed in as ${currentUser?.email} — create, edit, and manage events on Eventora.`}
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
                <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
                <details className="card-surface rounded-2xl p-4">
                    <summary className="cursor-pointer font-semibold">
                        Change account password
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
                <p className="mt-3 text-slate-400">
                    Create an event, set its venue and ticket types, then submit it for administrator approval.
                </p>

                <form
                    id="event-form"
                    onSubmit={handleSubmit}
                    className="card-surface gradient-border mt-8 grid scroll-mt-6 gap-5 rounded-3xl p-6 sm:grid-cols-2 sm:p-8"
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
                        Venue name / location
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
                        Venue address
                        <input
                            name="venueAddress"
                            value={formData.venueAddress}
                            onChange={handleChange}
                            maxLength="500"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                            required
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                        Venue contact
                        <input
                            name="venueContact"
                            value={formData.venueContact}
                            onChange={handleChange}
                            maxLength="160"
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
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
                        Additional dates (comma separated)
                        <input name="additionalDates" value={formData.additionalDates} onChange={handleChange} placeholder="2027-04-12, 2027-04-13" className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white" />
                    </label>
                    <fieldset className="grid gap-3 sm:col-span-2">
                        <legend className="text-sm font-semibold text-slate-200">Ticket types and inventory</legend>
                        {formData.ticketTypes.map((ticketType, index) => (
                            <div key={ticketType._id || index} className="grid gap-3 rounded-xl border border-surface-border p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
                                <label className="grid gap-2 text-sm text-slate-300">
                                    Type name
                                    <input value={ticketType.name} onChange={(event) => updateTicketType(index, 'name', event.target.value)} maxLength="80" placeholder="General admission or VIP" className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white" required />
                                </label>
                                <label className="grid gap-2 text-sm text-slate-300">
                                    Price (₹)
                                    <input type="number" min="0" step="0.01" value={ticketType.price} onChange={(event) => updateTicketType(index, 'price', event.target.value)} className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white" required />
                                </label>
                                <label className="grid gap-2 text-sm text-slate-300">
                                    Quantity
                                    <input type="number" min="1" max="100000" step="1" value={ticketType.quantity} onChange={(event) => updateTicketType(index, 'quantity', event.target.value)} className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white" required />
                                </label>
                                <Button type="button" variant="secondary" disabled={formData.ticketTypes.length <= 1} onClick={() => removeTicketType(index)}>Remove</Button>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" disabled={formData.ticketTypes.length >= 10} onClick={addTicketType}>Add ticket type</Button>
                    </fieldset>
                    <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2">
                        <input type="checkbox" name="seatingEnabled" checked={formData.seatingEnabled} onChange={(event) => setFormData((form) => ({ ...form, seatingEnabled: event.target.checked }))} />
                        Use assigned seating for this event
                    </label>
                    {formData.seatingEnabled && <><label className="grid gap-2 text-sm text-slate-300">Seat rows<input type="number" name="seatRows" min="1" max="26" value={formData.seatRows} onChange={handleChange} className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white" required /></label><label className="grid gap-2 text-sm text-slate-300">Seats per row<input type="number" name="seatsPerRow" min="1" max="50" value={formData.seatsPerRow} onChange={handleChange} className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white" required /></label></>}
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
                        <h2 className="text-2xl font-bold">Events ({eventCount.toLocaleString()})</h2>
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
                                    className="card-surface card-hover flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
                                >
                                    <EventImage
                                        src={event.image}
                                        alt={event.title}
                                        className="h-24 w-full shrink-0 rounded-xl object-cover sm:w-36"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-display font-semibold text-white">{event.title}</h3>
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                                            {(event.status || 'published').replaceAll('_', ' ')}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                                            <span className="inline-flex items-center gap-1.5"><MapPinIcon className="h-4 w-4 text-brand-400" />{event.location}</span>
                                            <span className="inline-flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-accent-400" />{event.date}</span>
                                            <span className="inline-flex items-center gap-1.5"><TicketIcon className="h-4 w-4 text-emerald-400" />₹{event.price}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {event.category} · Capacity {event.ticketCapacity ?? 100}
                                        </p>
                                        {event.moderationNote && <p className="mt-2 max-w-xl text-sm text-amber-300">Review note: {event.moderationNote}</p>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Link
                                            to={`/events/${eventId}`}
                                            className="text-sm font-medium text-brand-500 hover:text-brand-400"
                                        >
                                            View Details
                                        </Link>
                                        <Link
                                            to={`/manage-events/${eventId}`}
                                            className="text-sm font-medium text-brand-400 hover:text-brand-300"
                                        >
                                            Sales & attendees
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
                    {eventsPagination && eventsPagination.totalPages > 1 && (
                        <div className="mt-5 flex items-center justify-center gap-4">
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

                {currentUser?.role === 'admin' && <CsvImport onEventsRefreshed={() => setManagerPage(1)} />}
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default EventManagerPage
