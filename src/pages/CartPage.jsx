import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import EmptyState from '../Components/common/EmptyState'
import Button from '../Components/common/Button'
import { loadCart, saveCart } from '../app/cart'
import { ArrowRightIcon, CalendarIcon, TicketIcon, TrashIcon } from '../Components/common/icons'

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value || 0)

function CartPage() {
    const userId = useSelector((state) => state.auth.user?.id)
    const [items, setItems] = useState(() => loadCart(userId))

    function removeItem(cartId) {
        const next = items.filter((item) => item.cartId !== cartId)
        setItems(next)
        saveCart(userId, next)
    }

    const total = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
    const ticketCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

    return (
        <div className="flex min-h-screen flex-col bg-surface text-white">
            <Navbar />
            <main className="flex-1">
                <PageHeader
                    eyebrow="Almost yours"
                    title={<>Your <span className="text-gradient">cart</span></>}
                    description="Review your event plans and ticket details before checkout."
                />
                <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
                    {items.length === 0 ? (
                        <EmptyState
                            icon={<TicketIcon className="h-9 w-9" />}
                            title="Your cart is waiting"
                            description="Explore events and add tickets here when something catches your eye."
                            action={
                                <Link to="/events">
                                    <Button>Explore events</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8">
                            <section aria-label="Events in your cart">
                                <div className="mb-4 flex items-center justify-between gap-3 px-1">
                                    <h2 className="font-display text-lg font-bold text-white">Your events</h2>
                                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium text-slate-400">
                                        {items.length} {items.length === 1 ? 'event' : 'events'}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <article
                                            key={item.cartId}
                                            className="card-surface animate-fade-up overflow-hidden rounded-2xl"
                                            style={{ animationDelay: `${index * 70}ms` }}
                                        >
                                            <div className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                                                <div className="hidden h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-xl border border-brand-300/15 bg-brand-500/10 text-brand-200 sm:grid">
                                                    <TicketIcon className="h-8 w-8" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-200">
                                                                <CalendarIcon className="h-3.5 w-3.5 text-accent-400" />
                                                                {item.sessionDate}
                                                            </p>
                                                            <h3 className="mt-1.5 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                                                                {item.title}
                                                            </h3>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.cartId)}
                                                            aria-label={`Remove ${item.title} from cart`}
                                                            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-400/10 hover:text-red-300"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Remove</span>
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-400">
                                                        {item.quantity} ticket{item.quantity === 1 ? '' : 's'}
                                                        {item.selectedSeats?.length > 0 && (
                                                            <span> <span className="px-1 text-slate-600">·</span> Seats {item.selectedSeats.join(', ')}</span>
                                                        )}
                                                    </p>
                                                    <div className="mt-4 border-t border-white/[0.08] pt-4">
                                                        {item.ticketItems?.length > 1 ? (
                                                            <ul className="space-y-2 text-sm">
                                                                {item.ticketItems.map((ticket) => (
                                                                    <li key={ticket.ticketTypeId || ticket.ticketTypeName} className="flex items-center justify-between gap-4">
                                                                        <span className="text-slate-300">
                                                                            <span className="font-medium text-white">{ticket.ticketTypeName}</span>
                                                                            <span className="ml-2 text-slate-500">× {ticket.quantity}</span>
                                                                        </span>
                                                                        <span className="font-medium tabular-nums text-slate-300">
                                                                            {formatMoney(ticket.unitPrice * ticket.quantity)}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="flex items-center justify-between gap-4 text-sm">
                                                                <span className="text-slate-300">
                                                                    <TicketIcon className="mr-2 inline h-4 w-4 text-brand-300" />
                                                                    {item.ticketItems?.[0]?.ticketTypeName || item.ticketTypeName || 'General admission'}
                                                                </span>
                                                                <span className="font-medium tabular-nums text-slate-300">{formatMoney(item.totalPrice)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <aside className="card-surface h-fit overflow-hidden rounded-2xl lg:sticky lg:top-24">
                                <div className="border-b border-white/[0.08] px-5 py-4 sm:px-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">Order summary</p>
                                </div>
                                <div className="p-5 sm:p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span className="text-slate-400">Events</span>
                                            <span className="font-medium text-white">{items.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span className="text-slate-400">Tickets</span>
                                            <span className="font-medium text-white">{ticketCount}</span>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/[0.08] pt-5">
                                        <span className="text-sm font-medium text-slate-300">Total</span>
                                        <span className="font-display text-2xl font-bold tabular-nums text-white">{formatMoney(total)}</span>
                                    </div>
                                    <p className="mt-3 text-xs leading-5 text-slate-500">
                                        Final payment is securely processed at checkout.
                                    </p>
                                    <div className="mt-5 grid gap-2.5">
                                        {items.map((item) => (
                                            <Link key={item.cartId} to={`/checkout?item=${encodeURIComponent(item.cartId)}`}>
                                                <Button className="w-full justify-between">
                                                    <span className="truncate">
                                                        {items.length === 1 ? 'Continue to checkout' : `Checkout · ${item.title}`}
                                                    </span>
                                                    <ArrowRightIcon className="h-4 w-4 shrink-0" />
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default CartPage
