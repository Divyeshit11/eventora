import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import {
    downloadSalesReport,
    getEvents,
    getAdminUsers,
    moderateEvent,
    updateUserRole,
} from '../services/eventService'

function AdminOperationsPage() {
    const [state, setState] = useState({ status: 'loading', users: [], events: [], error: '' })
    const [notes, setNotes] = useState({})
    const [busyId, setBusyId] = useState('')
    const [reportMessage, setReportMessage] = useState('')

    const refresh = useCallback(async () => {
        setState((current) => ({ ...current, status: 'loading', error: '' }))
        try {
            const [users, eventResponse] = await Promise.all([
                getAdminUsers(),
                getEvents({ management: true, page: 1, limit: 100 }),
            ])
            setState({ status: 'succeeded', users, events: eventResponse.data, error: '' })
        } catch (error) {
            setState((current) => ({
                ...current,
                status: 'failed',
                error: error.response?.data?.message || 'Unable to load administrator operations.',
            }))
        }
    }, [])

    useEffect(() => { refresh() }, [refresh])

    async function changeRole(user, role) {
        setBusyId(String(user._id))
        try {
            await updateUserRole(user._id, role)
            await refresh()
        } catch (error) {
            setState((current) => ({ ...current, error: error.response?.data?.message || 'Unable to update account role.' }))
        } finally {
            setBusyId('')
        }
    }

    async function reviewEvent(event, status) {
        setBusyId(String(event._id))
        try {
            await moderateEvent(event._id, status, notes[event._id] || '')
            await refresh()
        } catch (error) {
            setState((current) => ({ ...current, error: error.response?.data?.message || 'Unable to review event.' }))
        } finally {
            setBusyId('')
        }
    }

    async function exportReport() {
        setReportMessage('')
        try {
            const blob = await downloadSalesReport()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'eventora-sales-report.csv'
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
            setReportMessage('Sales report downloaded.')
        } catch (error) {
            setReportMessage(error.response?.data?.message || 'Unable to download sales report.')
        }
    }

    return <div className="min-h-screen bg-surface text-white"><Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <PageHeader
                eyebrow="Administration"
                title={<>Operations <span className="text-gradient">center</span></>}
                description="Review event submissions, manage organizer access, and export performance reports."
            />
            <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/analytics" className="rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold hover:bg-slate-800">Sales analytics</Link>
                <Link to="/manage-events" className="rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold hover:bg-slate-800">All events</Link>
                <button type="button" onClick={exportReport} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold hover:bg-brand-700">Export sales report</button>
            </div>
            {reportMessage && <p className="mt-3 text-sm text-slate-300" role="status">{reportMessage}</p>}
            {state.error && <p className="mt-5 rounded-xl border border-red-800 p-4 text-red-300" role="alert">{state.error}</p>}
            {state.status === 'loading' && <p className="py-12 text-center text-slate-400" role="status">Loading operations...</p>}
            {state.status !== 'loading' && <>
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold">Users and organizers ({state.users.length})</h2>
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-border">
                        <table className="w-full min-w-[36rem] text-left text-sm"><thead className="bg-surface-card text-slate-400"><tr><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Organizer access</th></tr></thead>
                            <tbody>{state.users.filter((user) => user.role !== 'admin').map((user) => <tr key={user._id} className="border-t border-surface-border"><td className="p-4">{user.email}</td><td className="p-4 capitalize">{user.role}</td><td className="p-4"><select aria-label={`Role for ${user.email}`} value={user.role} disabled={Boolean(busyId)} onChange={(change) => changeRole(user, change.target.value)} className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-white"><option value="user">Customer</option><option value="organizer">Organizer</option></select></td></tr>)}</tbody>
                        </table>
                    </div>
                </section>
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold">Event approval and moderation ({state.events.length})</h2>
                    {state.events.length === 0 ? <p className="mt-4 rounded-xl border border-surface-border p-5 text-slate-400">No events are waiting for approval.</p> :
                        <div className="mt-4 space-y-4">{state.events.map((event) => <article key={event._id} className="card-surface card-hover rounded-2xl p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-semibold">{event.title}</h3><p className="mt-1 text-sm capitalize text-amber-300">{(event.status || 'published').replaceAll('_', ' ')}</p><p className="mt-1 text-sm text-slate-400">{event.location} · {event.date} · Submitted by {event.organizer?.email || 'Administrator / legacy event'}</p><p className="mt-1 text-sm text-slate-400">{event.ticketTypes?.map((type) => `${type.name}: ₹${type.price} (${type.quantity})`).join(' · ') || `₹${event.price} · ${event.ticketCapacity} tickets`}</p></div><Link to={`/events/${event._id}`} className="text-sm text-brand-400 hover:text-brand-300">Review event details</Link></div>
                            <label className="mt-4 grid gap-2 text-sm text-slate-300">Moderation note (required when rejecting)<textarea value={notes[event._id] || ''} onChange={(change) => setNotes((current) => ({ ...current, [event._id]: change.target.value }))} maxLength="1000" rows="2" className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-white" /></label>
                            <div className="mt-4 flex flex-wrap gap-3">{event.status !== 'published' && <button type="button" disabled={Boolean(busyId)} onClick={() => reviewEvent(event, 'published')} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold disabled:opacity-50">{event.status === 'pending_approval' ? 'Approve and publish' : 'Publish event'}</button>}{event.status === 'published' && <button type="button" disabled={Boolean(busyId)} onClick={() => reviewEvent(event, 'suspended')} className="rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-300 disabled:opacity-50">Suspend event</button>}{event.status === 'pending_approval' && <button type="button" disabled={Boolean(busyId) || !notes[event._id]?.trim()} onClick={() => reviewEvent(event, 'rejected')} className="rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 disabled:opacity-50">Reject</button>}</div>
                        </article>)}</div>}
                </section>
            </>}
        </main><Footer />
    </div>
}

export default AdminOperationsPage
