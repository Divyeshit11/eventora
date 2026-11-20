import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import { loadCart, saveCart } from '../app/cart'

function CartPage() {
    const userId = useSelector((state) => state.auth.user?.id)
    const [items, setItems] = useState(() => loadCart(userId))
    function removeItem(cartId) {
        const next = items.filter((item) => item.cartId !== cartId)
        setItems(next); saveCart(userId, next)
    }
    return <div className="min-h-screen bg-surface text-white"><Navbar /><main className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><p className="text-sm font-semibold uppercase tracking-wider text-brand-500">Your selections</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Cart</h1>{items.length === 0 ? <div className="mt-8 rounded-2xl border border-surface-border bg-surface-card p-10 text-center"><p className="text-slate-400">Your cart is empty.</p><Link to="/events" className="mt-5 inline-block text-brand-400">Explore events</Link></div> : <div className="mt-8 space-y-4">{items.map((item) => <article key={item.cartId} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface-card p-5"><div><h2 className="text-lg font-semibold">{item.title}</h2><p className="mt-1 text-sm text-slate-400">{item.sessionDate} · {item.quantity} ticket{item.quantity === 1 ? '' : 's'}{item.selectedSeats?.length ? ` · Seats ${item.selectedSeats.join(', ')}` : ''}</p>{item.ticketItems?.length > 1 ? <ul className="mt-2 space-y-1 text-sm text-slate-300">{item.ticketItems.map((ticket) => <li key={ticket.ticketTypeId || ticket.ticketTypeName}>{ticket.ticketTypeName} × {ticket.quantity} · ₹{ticket.unitPrice * ticket.quantity}</li>)}</ul> : <p className="mt-2 text-sm text-slate-300">{item.ticketItems?.[0]?.ticketTypeName || item.ticketTypeName || 'General admission'} × {item.quantity}</p>}<p className="mt-2 font-semibold">Total ₹{item.totalPrice}</p></div><div className="flex gap-3"><Link to={`/checkout?item=${item.cartId}`} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold hover:bg-brand-700">Checkout</Link><button type="button" onClick={() => removeItem(item.cartId)} className="text-sm text-red-300 hover:text-red-200">Remove</button></div></article>)}</div>}</main><Footer /></div>
}
export default CartPage
