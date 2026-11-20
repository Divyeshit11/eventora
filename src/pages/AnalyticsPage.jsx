import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import { getAdminAnalytics } from '../services/eventService'

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0)
const formatMoney = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)

function AnalyticsPage() {
    const [state, setState] = useState({ status: 'loading', data: null, error: '' })

    useEffect(() => {
        let active = true
        getAdminAnalytics()
            .then((data) => active && setState({ status: 'succeeded', data, error: '' }))
            .catch((error) => active && setState({ status: 'failed', data: null, error: error.response?.data?.message || 'Unable to load analytics.' }))
        return () => { active = false }
    }, [])

    const overview = state.data?.overview
    const maxRevenue = Math.max(...(state.data?.dailyRevenue || []).map((day) => day.revenue), 1)
    const metrics = overview ? [
        ['Revenue', formatMoney(overview.revenue), 'From paid bookings'],
        ['Paid tickets', formatNumber(overview.paidTickets), `${formatNumber(overview.paidBookings)} paid bookings`],
        ['Sell-through', `${overview.sellThroughRate}%`, `${formatNumber(overview.ticketsSold)} of ${formatNumber(overview.ticketCapacity)} tickets`],
        ['Live events', formatNumber(overview.liveEvents), `${formatNumber(overview.totalEvents)} total events · ${formatNumber(overview.pendingBookings)} pending bookings`],
    ] : []

    return <div className="min-h-screen bg-surface text-white"><Navbar />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-brand-500">Administration</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Analytics Dashboard</h1><p className="mt-3 text-slate-400">A live overview of bookings, sales, and event performance.</p></div><Link to="/manage-events" className="rounded-xl border border-surface-border bg-surface-card px-5 py-3 text-sm font-semibold transition hover:bg-slate-800">Manage events</Link></div>
            {state.status === 'loading' && <p className="py-20 text-center text-slate-400" role="status">Loading analytics...</p>}
            {state.status === 'failed' && <p className="mt-8 rounded-xl border border-red-800 bg-red-950/30 p-5 text-red-300" role="alert">{state.error}</p>}
            {state.status === 'succeeded' && <>
                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, detail]) => <article key={label} className="rounded-2xl border border-surface-border bg-surface-card p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></article>)}</section>
                <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-surface-border bg-surface-card p-6"><h2 className="text-xl font-semibold">Revenue, last 7 days</h2><div className="mt-8 flex h-48 items-end gap-3">{state.data.dailyRevenue.length ? state.data.dailyRevenue.map((day) => <div key={day.date} className="flex h-full flex-1 flex-col justify-end gap-2 text-center"><div className="min-h-1 rounded-t bg-brand-600 transition-all" style={{ height: `${Math.max(4, Math.round((day.revenue / maxRevenue) * 100))}%` }} title={`${day.date}: ${formatMoney(day.revenue)}`} /><span className="text-xs text-slate-400">{day.date.slice(5)}</span></div>) : <p className="self-center text-sm text-slate-400">No paid bookings in the last 7 days.</p>}</div></section>
                    <section className="rounded-2xl border border-surface-border bg-surface-card p-6"><h2 className="text-xl font-semibold">Top events</h2>{state.data.topEvents.length ? <div className="mt-5 space-y-4">{state.data.topEvents.map((event, index) => <div key={event.eventId || event.title} className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm text-slate-500">#{index + 1}</p><p className="truncate font-medium">{event.title}</p><p className="mt-1 text-xs text-slate-400">{formatNumber(event.tickets)} tickets sold</p></div><p className="shrink-0 font-semibold text-emerald-300">{formatMoney(event.revenue)}</p></div>)}</div> : <p className="mt-6 text-sm text-slate-400">No paid bookings yet.</p>}</section></div>
            </>}
        </main><Footer />
    </div>
}

export default AnalyticsPage
