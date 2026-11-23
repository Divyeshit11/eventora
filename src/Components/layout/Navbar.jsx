import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, NavLink } from "react-router"
import Button from "../common/Button"
import Logo from "../common/Logo"
import { logout } from "../../features/auth/authSlice"
import { MenuIcon, XIcon } from "../common/icons"

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const navigation = [
        { label: 'Home', to: '/' },
        ...(user ? [
            { label: 'Explore Events', to: '/events' },
            { label: 'Favorites', to: '/favorites' },
            { label: 'My Bookings', to: '/bookings' },
            { label: 'Account', to: '/account' },
        ] : []),
        ...(user?.role === 'admin'
            ? [{ label: 'Event Manager', to: '/manage-events' }, { label: 'Analytics', to: '/analytics' }]
            : []),
    ]

    const getLinkClass = ({ isActive }) =>
        `nav-link text-sm font-medium transition-colors ${isActive
            ? 'active text-white'
            : 'text-slate-400 hover:text-white'
        }`

    const initials = (user?.email?.[0] || 'U').toUpperCase()

    return (
        <header className="glass sticky top-0 z-50 border-b border-surface-border/70">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
                <Link
                    to="/"
                    className="shrink-0"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <Logo />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-7 lg:flex">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={getLinkClass}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="hidden items-center gap-4 lg:flex">
                    {user ? (
                        <>
                            <Link
                                to="/account"
                                className="group flex items-center gap-2.5 rounded-full border border-surface-border bg-surface-card/60 py-1.5 pl-1.5 pr-4 transition hover:border-brand-500/50"
                            >
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">
                                    {initials}
                                </span>
                                <span className="max-w-36 truncate text-sm text-slate-300 transition group-hover:text-white" title={user.email}>
                                    {user.email}
                                </span>
                            </Link>
                            <Button variant="secondary" onClick={() => dispatch(logout())}>
                                Sign out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link text-sm font-semibold text-slate-300 transition hover:text-white">
                                Sign in
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:shadow-brand-500/40 hover:brightness-110"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-surface-border bg-surface-card text-white transition hover:border-brand-500/50 lg:hidden"
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                >
                    {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                </button>
            </nav>

            {isMenuOpen && (
                <div className="animate-fade-in border-t border-surface-border/70 px-4 py-5 lg:hidden">
                    <div className="flex flex-col gap-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                                        ? 'bg-brand-500/10 text-white'
                                        : 'text-slate-300 hover:bg-surface-card'
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        ))}

                        <div className="mt-3 border-t border-surface-border/70 pt-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 px-4 pb-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
                                            {initials}
                                        </span>
                                        <span className="truncate text-sm text-slate-300">{user.email}</span>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => {
                                            dispatch(logout())
                                            setIsMenuOpen(false)
                                        }}
                                    >
                                        Sign out
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="rounded-xl border border-surface-border px-4 py-3 text-center text-sm font-semibold text-slate-200"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-center text-sm font-semibold text-white"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
