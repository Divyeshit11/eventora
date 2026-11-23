import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import Reveal from '../Components/common/Reveal'
import { getAdminAnalytics } from '../services/eventService'
import {
    WalletIcon,
    TicketIcon,
    ChartIcon,
    CalendarIcon,
    ArrowRightIcon,
    SparklesIcon,
} from '../Components/common/icons'

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0)
const formatMoney = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)

const metricIcons = [WalletIcon, TicketIcon, ChartIcon, CalendarIcon]
const metricAccents = [
    'from-emerald-500/25 to-teal-500/10 text-emerald-300 ring-emerald-400/30',
    'from-brand-500/25 to-brand-700/10 text-brand-300 ring-brand-400/30',
    'from-accent-500/25 to-accent-600/10 text-accent-300 ring-accent-400/30',
    'from-accent-500/25 to-accent-600/10 text-accent-300 ring-accent-400/30',
]

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

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main>
                <PageHeader
                    eyebrow="Administration"
                    title="Analytics Dashboard"
                    description="A live overview of bookings, sales, and event performance."
                >
                    <Link
                        to="/manage-events"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-500/50 hover:bg-surface-raised"
                    >
                        Manage events
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </PageHeader>

                <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
                    {state.status === 'loading' && (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="card-surface h-32 animate-pulse rounded-3xl" />
                            ))}
                            <p className="sr-only" role="status">Loading analytics...</p>
                        </div>
                    )}
                    {state.status === 'failed' && (
                        <p className="rounded-2xl border border-red-800 bg-red-950/30 p-5 text-red-300" role="alert">
                            {state.error}
                        </p>
                    )}
                    {state.status === 'succeeded' && (
                        <>
                            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {metrics.map(([label, value, detail], index) => {
                                    const Icon = metricIcons[index % metricIcons.length]
                                    const accent = metricAccents[index % metricAccents.length]
                                    return (
                                        <Reveal key={label} delay={index * 80}>
                                            <article className="card-surface card-hover h-full rounded-3xl p-5">
                                                <div className="flex items-center justify-between">
                                                    <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${accent} ring-1`}>
                                                        <Icon className="h-5 w-5" />
                                                    </span>
                                                </div>
                                                <p className="mt-4 text-sm text-slate-400">{label}</p>
                                                <p className="mt-1 font-display text-2xl font-extrabold text-white">{value}</p>
                                                <p className="mt-2 text-xs text-slate-500">{detail}</p>
                                            </article>
                                        </Reveal>
                                    )
                                })}
                            </section>

                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                <Reveal delay={100}>
                                    <section className="card-surface h-full rounded-3xl p-6 sm:p-8">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
                                                <ChartIcon className="h-5 w-5" />
                                            </span>
                                            <h2 className="font-display text-xl font-bold">Revenue, last 7 days</h2>
                                        </div>
                                        <div className="mt-8 flex h-48 items-end gap-3">
                                            {state.data.dailyRevenue.length ? state.data.dailyRevenue.map((day, index) => (
                                                <div key={day.date} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                                                    <div
                                                        className="min-h-1 animate-fade-up rounded-t-lg bg-gradient-to-t from-brand-600 to-accent-500 transition-all duration-700 hover:from-brand-500 hover:to-accent-400"
                                                        style={{ height: `${Math.max(4, Math.round((day.revenue / maxRevenue) * 100))}%`, animationDelay: `${index * 90}ms` }}
                                                        title={`${day.date}: ${formatMoney(day.revenue)}`}
                                                    />
                                                    <span className="text-xs text-slate-400">{day.date.slice(5)}</span>
                                                </div>
                                            )) : (
                                                <p className="self-center text-sm text-slate-400">No paid bookings in the last 7 days.</p>
                                            )}
                                        </div>
                                    </section>
                                </Reveal>

                                <Reveal delay={180}>
                                    <section className="card-surface h-full rounded-3xl p-6 sm:p-8">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/30">
                                                <SparklesIcon className="h-5 w-5" />
                                            </span>
                                            <h2 className="font-display text-xl font-bold">Top events</h2>
                                        </div>
                                        {state.data.topEvents.length ? (
                                            <div className="mt-5 space-y-4">
                                                {state.data.topEvents.map((event, index) => (
                                                    <div key={event.eventId || event.title} className="flex items-center justify-between gap-4 rounded-2xl border border-surface-border/60 bg-surface/40 px-4 py-3 transition hover:border-brand-500/40">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/25 to-accent-500/15 font-display text-sm font-bold text-brand-300 ring-1 ring-brand-500/30">
                                                                {index + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-white">{event.title}</p>
                                                                <p className="mt-0.5 text-xs text-slate-400">{formatNumber(event.tickets)} tickets sold</p>
                                                            </div>
                                                        </div>
                                                        <p className="shrink-0 font-semibold text-emerald-300">{formatMoney(event.revenue)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="mt-6 text-sm text-slate-400">No paid bookings yet.</p>
                                        )}
                                    </section>
                                </Reveal>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default AnalyticsPage
