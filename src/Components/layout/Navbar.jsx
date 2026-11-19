import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, NavLink } from "react-router"
import Button from "../common/Button"
import { logout } from "../../features/auth/authSlice"

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
        `text-sm font-medium transition-colors ${isActive
            ? 'text-white'
            : 'text-slate-400 hover:text-white'
        }`

    return (
        <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/95 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
                <Link
                    to="/"
                    className="text-2xl font-extrabold tracking-tight text-white"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Eventora <span className="text-brand-500">.</span>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 lg:flex">
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
                            <Link to="/account" className="max-w-40 truncate text-sm text-slate-400 transition-colors hover:text-white" title={user.email}>
                                {user.email}
                            </Link>
                            <Button variant="secondary" onClick={() => dispatch(logout())}>
                                Sign out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white">
                                Sign in
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    className="rounded-lg border border-surface-border px-3 py-2 text-white lg:hidden"
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </nav>

            {isMenuOpen && (
                <div className="border-t border-surface-border px-4 py-4 lg:hidden">
                    <div className="flex flex-col gap-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={getLinkClass}
                                onClick={() => setIsMenuOpen(false)}>
                                {item.label}
                            </NavLink>
                        ))}

                        {user ? (
                            <>
                                <span className="truncate text-sm text-slate-400">{user.email}</span>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        dispatch(logout())
                                        setIsMenuOpen(false)
                                    }}
                                >
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-sm font-semibold text-slate-300"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-sm font-semibold text-brand-400"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

        </header>
    )
}

export default Navbar
