import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router'
import { logout } from '../../features/auth/authSlice'

const primaryLinks = [{ label: 'Home', to: '/' }, { label: 'Explore events', to: '/events' }]
const personalLinks = [{ label: 'My bookings', to: '/bookings' }, { label: 'Favorites', to: '/favorites' }, { label: 'Cart', to: '/cart' }, { label: 'Account settings', to: '/account' }]
const organizerLinks = [{ label: 'My events', to: '/manage-events' }, { label: 'Attendee check-in', to: '/check-in' }]
const adminLinks = [{ label: 'Admin operations', to: '/admin' }, { label: 'Event manager', to: '/manage-events' }, { label: 'Analytics', to: '/analytics' }, { label: 'Attendee check-in', to: '/check-in' }]

function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [accountOpen, setAccountOpen] = useState(false)
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const linkClass = ({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-500/10 text-brand-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
    const closeMenus = () => { setMobileOpen(false); setAccountOpen(false) }
    const avatar = user?.email?.[0]?.toUpperCase() || 'U'

    const menuLinks = (links) => links.map((item) => <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'} onClick={closeMenus}>{item.label}</NavLink>)

    return <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/95 shadow-lg shadow-black/10 backdrop-blur">
        <nav className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link to="/" onClick={closeMenus} className="shrink-0 text-xl font-extrabold tracking-tight text-white sm:text-2xl">Eventora<span className="text-brand-500">.</span></Link>
            <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">{menuLinks(primaryLinks)}</div>
            <div className="hidden items-center gap-2 lg:flex">
                {user ? <div className="relative"><button type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} aria-haspopup="menu" className="flex max-w-60 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-left transition hover:border-brand-500/60"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold">{avatar}</span><span className="max-w-32 truncate text-sm font-medium text-slate-200">{user.email}</span><span className="text-xs text-slate-400">⌄</span></button>{accountOpen && <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-surface-border bg-surface-card p-2 shadow-2xl"><p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Your account</p>{menuLinks(personalLinks)}{['admin', 'organizer'].includes(user.role) && <><div className="my-2 border-t border-surface-border" /><p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{user.role === 'admin' ? 'Administration' : 'Organizer tools'}</p>{menuLinks(user.role === 'admin' ? adminLinks : organizerLinks)}</>}<div className="my-2 border-t border-surface-border" /><button type="button" onClick={() => { dispatch(logout()); closeMenus() }} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10">Sign out</button></div>}</div> : <><Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white">Sign in</Link><Link to="/register" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">Create account</Link></>}
            </div>
            <button type="button" className="rounded-xl border border-surface-border p-2.5 text-white transition hover:bg-slate-800 lg:hidden" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? '✕' : '☰'}</button>
        </nav>
        {mobileOpen && <div className="border-t border-surface-border bg-surface px-4 py-4 lg:hidden"><div className="mx-auto grid max-w-7xl gap-1"><p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Navigate</p>{menuLinks(primaryLinks)}{user ? <><div className="my-3 border-t border-surface-border" /><div className="flex items-center gap-3 px-3 py-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold">{avatar}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.email}</p><p className="text-xs capitalize text-slate-400">{user.role} account</p></div></div>{menuLinks(personalLinks)}{['admin', 'organizer'].includes(user.role) && <><p className="mt-3 px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{user.role === 'admin' ? 'Administration' : 'Organizer tools'}</p>{menuLinks(user.role === 'admin' ? adminLinks : organizerLinks)}</>}<button type="button" onClick={() => { dispatch(logout()); closeMenus() }} className="mt-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10">Sign out</button></> : <><div className="my-3 border-t border-surface-border" /><Link to="/login" className={linkClass} onClick={closeMenus}>Sign in</Link><Link to="/register" className="mt-1 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white" onClick={closeMenus}>Create account</Link></>}</div></div>}
    </header>
}

export default Navbar
