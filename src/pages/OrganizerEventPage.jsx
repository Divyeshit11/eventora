import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import { checkInTicket, downloadEventAttendees, getEventAttendees, getEventSales } from '../services/eventService'

function OrganizerEventPage() {
    const { eventId } = useParams()
    const [state, setState] = useState({ status: 'loading', sales: null, attendees: [], error: '' })
    const [ticketCode, setTicketCode] = useState('')
    const [checkInMessage, setCheckInMessage] = useState('')
    const [checkInStatus, setCheckInStatus] = useState('idle')

    const refresh = useCallback(async () => {
        setState((current) => ({ ...current, status: 'loading', error: '' }))
        try {
            const [sales, attendees] = await Promise.all([getEventSales(eventId), getEventAttendees(eventId)])
            setState({ status: 'succeeded', sales, attendees, error: '' })
        } catch (error) {
            setState((current) => ({ ...current, status: 'failed', error: error.response?.data?.message || 'Unable to load event operations.' }))
        }
    }, [eventId])

    useEffect(() => { refresh() }, [refresh])

    async function submitCheckIn(event) {
        event.preventDefault()
        setCheckInStatus('loading')
        setCheckInMessage('')
        try {
            const response = await checkInTicket(ticketCode)
            setCheckInStatus('succeeded')
            setCheckInMessage(response.message)
            setTicketCode('')
            await refresh()
        } catch (error) {
            setCheckInStatus('failed')
            setCheckInMessage(error.response?.data?.message || 'Unable to check in ticket.')
        }
    }

    async function exportAttendees() {
        try {
            const blob = await downloadEventAttendees(eventId)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `eventora-attendees-${eventId}.csv`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        } catch (error) {
            setState((current) => ({ ...current, error: error.response?.data?.message || 'Unable to export attendees.' }))
        }
    }

    const summary = state.sales?.summary || {}
    return <div className="min-h-screen bg-surface text-white"><Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <Link to="/manage-events" className="text-sm text-brand-400 hover:text-brand-300">← Back to events</Link>
            {state.status === 'loading' && <p className="py-16 text-center text-slate-400" role="status">Loading event sales and attendees...</p>}
            {state.error && <p className="mt-5 rounded-xl border border-red-800 p-4 text-red-300" role="alert">{state.error}</p>}
            {state.status === 'succeeded' && <>
                <h1 className="mt-4 text-3xl font-bold">{state.sales.event.title}</h1>
                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[['Revenue', `₹${summary.revenue || 0}`], ['Paid tickets', summary.paidTickets || 0], ['Paid bookings', summary.paidBookings || 0], ['Checked-in bookings', summary.checkedIn || 0]].map(([label, value]) => <article key={label} className="rounded-2xl border border-surface-border bg-surface-card p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></article>)}
                </section>
                <section className="mt-8 rounded-2xl border border-surface-border bg-surface-card p-5">
                    <h2 className="text-xl font-semibold">Ticket type sales</h2>
                    <div className="mt-4 space-y-3">{state.sales.ticketTypes.map((type) => <p key={type._id} className="flex justify-between gap-3 text-sm"><span>{type.name} · ₹{type.price}</span><span>{type.sold} / {type.quantity} reserved</span></p>)}</div>
                </section>
                <section className="mt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold">Attendees ({state.attendees.length})</h2><button type="button" onClick={exportAttendees} className="rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold hover:bg-slate-800">Export attendees CSV</button></div>
                    <form onSubmit={submitCheckIn} className="mt-4 flex flex-wrap gap-3 rounded-xl border border-surface-border bg-surface-card p-4">
                        <label className="grid flex-1 gap-2 text-sm text-slate-300">Scan or enter ticket code<input autoFocus value={ticketCode} onChange={(change) => setTicketCode(change.target.value.toUpperCase())} placeholder="EVT-XXXXXXXX" required className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white" /></label>
                        <button disabled={checkInStatus === 'loading'} className="self-end rounded-xl bg-brand-600 px-5 py-3 font-semibold disabled:opacity-50">{checkInStatus === 'loading' ? 'Checking in...' : 'Check in'}</button>
                        {checkInMessage && <p role={checkInStatus === 'failed' ? 'alert' : 'status'} className="w-full text-sm text-slate-300">{checkInMessage}</p>}
                    </form>
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-surface-border">
                        <table className="w-full min-w-[44rem] text-left text-sm"><thead className="bg-surface-card text-slate-400"><tr><th className="p-4">Attendee</th><th className="p-4">Ticket</th><th className="p-4">Type</th><th className="p-4">Quantity</th><th className="p-4">Status</th><th className="p-4">Check-in</th></tr></thead>
                            <tbody>{state.attendees.map((attendee) => <tr key={attendee._id} className="border-t border-surface-border"><td className="p-4">{attendee.user?.email || 'Unavailable'}</td><td className="p-4">{attendee.ticketCode || 'Pending payment'}</td><td className="p-4">{attendee.ticketTypeName || 'General admission'}</td><td className="p-4">{attendee.quantity}</td><td className="p-4 capitalize">{attendee.status}</td><td className="p-4">{attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : 'Not checked in'}</td></tr>)}</tbody>
                        </table>
                        {state.attendees.length === 0 && <p className="p-6 text-center text-slate-400">No attendees yet.</p>}
                    </div>
                </section>
            </>}
        </main><Footer />
    </div>
}

export default OrganizerEventPage
