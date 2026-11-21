import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import EmptyState from '../Components/common/EmptyState'
import Button from '../Components/common/Button'
import { loadCart, saveCart } from '../app/cart'
import { createPaymentOrder, verifyPayment } from '../services/eventService'
import { ShieldIcon, TicketIcon } from '../Components/common/icons'

function CheckoutPage() {
    const userId = useSelector((state) => state.auth.user?.id)
    const [params] = useSearchParams(); const navigate = useNavigate()
    const item = loadCart(userId).find((entry) => entry.cartId === params.get('item'))
    const [state, setState] = useState({ status: 'idle', message: '' })
    async function pay() { try { setState({ status: 'loading', message: '' }); const order = await createPaymentOrder(item.eventId, item.quantity, { ticketItems: item.ticketItems, ticketTypeId: item.ticketTypeId || undefined, sessionDate: item.sessionDate, selectedSeats: item.selectedSeats }); if (!window.Razorpay) { await new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = resolve; script.onerror = () => reject(new Error('Unable to load secure checkout.')); document.body.appendChild(script) }) }; new window.Razorpay({ key: order.keyId, amount: order.amount, currency: order.currency, name: 'Eventora', description: `${item.title} · ${item.ticketTypeName || 'General admission'}`, order_id: order.orderId, handler: async (payment) => { try { const result = await verifyPayment(payment); const next = loadCart(userId).filter((entry) => entry.cartId !== item.cartId); saveCart(userId, next); navigate(`/tickets/${result._id}`) } catch { setState({ status: 'failed', message: 'Payment verification is pending. Check My Bookings shortly.' }) } }, modal: { ondismiss: () => setState({ status: 'idle', message: 'Payment was not completed. Your seat hold expires in 15 minutes.' }) }, theme: { color: '#4f46e5' } }).open() } catch (error) { setState({ status: 'failed', message: error.response?.data?.message || error.message || 'Unable to start payment.' }) } }
    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main>
                <PageHeader
                    eyebrow="Almost there"
                    title={<>Secure <span className="text-gradient">checkout</span></>}
                    description="Review your tickets and complete your booking through secure payment."
                    align="center"
                />
                <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
                    {!item ? (
                        <EmptyState
                            icon={<TicketIcon className="h-9 w-9" />}
                            title="This cart item is unavailable"
                            description="It may have already been checked out or removed from your cart."
                            action={<Link to="/cart"><Button variant="secondary">Return to cart</Button></Link>}
                        />
                    ) : (
                        <section className="card-surface gradient-border animate-scale-in overflow-hidden rounded-3xl">
                            <div className="border-b border-white/[0.07] p-6 sm:p-8">
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/15 bg-brand-400/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-200">
                                    <TicketIcon className="h-3.5 w-3.5" />
                                    Booking summary
                                </span>
                                <h2 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{item.title}</h2>
                                <p className="mt-2 text-sm text-slate-400">{item.sessionDate} · {item.quantity} ticket{item.quantity === 1 ? '' : 's'}</p>
                            </div>
                            <div className="p-6 sm:p-8">
                                {item.ticketItems?.length > 1 ? (
                                    <ul className="space-y-3 text-sm text-slate-300">
                                        {item.ticketItems.map((ticket) => (
                                            <li key={ticket.ticketTypeId || ticket.ticketTypeName} className="flex justify-between gap-4">
                                                <span>{ticket.ticketTypeName} × {ticket.quantity}</span>
                                                <span>₹{ticket.unitPrice * ticket.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-300">
                                        {item.ticketItems?.[0]?.ticketTypeName || item.ticketTypeName || 'General admission'} × {item.quantity}
                                    </p>
                                )}
                                {item.selectedSeats?.length > 0 && (
                                    <p className="mt-3 text-sm text-slate-400">Seats: {item.selectedSeats.join(', ')}</p>
                                )}
                                <div className="mt-6 flex items-end justify-between border-t border-white/[0.08] pt-5">
                                    <span className="text-slate-400">Total due</span>
                                    <span className="font-display text-3xl font-extrabold">₹{item.totalPrice}</span>
                                </div>
                                <Button onClick={pay} disabled={state.status === 'loading'} className="mt-6 w-full">
                                    <ShieldIcon className="h-4 w-4" />
                                    {state.status === 'loading' ? 'Opening secure payment...' : 'Pay securely'}
                                </Button>
                                {state.message && (
                                    <p role={state.status === 'failed' ? 'alert' : 'status'} className="mt-4 text-sm text-red-300">
                                        {state.message}
                                    </p>
                                )}
                                <p className="mt-4 text-center text-xs text-slate-500">
                                    <ShieldIcon className="mr-1 inline h-3.5 w-3.5" />
                                    Encrypted payment · Your ticket is confirmed after successful payment
                                </p>
                            </div>
                        </section>
                    )}
                    <Link to="/cart" className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
                        ← Back to cart
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    )
}
export default CheckoutPage
