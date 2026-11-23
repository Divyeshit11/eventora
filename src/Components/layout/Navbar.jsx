import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router'
import Logo from '../common/Logo'
import { ArrowRightIcon, MenuIcon, XIcon } from '../common/icons'
import { logout } from '../../features/auth/authSlice'

const primaryLinks = [
    { label: 'Home', to: '/' },
    { label: 'Explore events', to: '/events' },
]

const personalLinks = [
    { label: 'My bookings', to: '/bookings' },
    { label: 'Favorites', to: '/favorites' },
    { label: 'Cart', to: '/cart' },
    { label: 'Account settings', to: '/account' },
]

const organizerLinks = [
    { label: 'My events', to: '/manage-events' },
    { label: 'Attendee check-in', to: '/check-in' },
]

const adminLinks = [
    { label: 'Admin operations', to: '/admin' },
    { label: 'Event manager', to: '/manage-events' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'Attendee check-in', to: '/check-in' },
]

function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [accountOpen, setAccountOpen] = useState(false)
    const accountRef = useRef(null)
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const avatar = user?.email?.[0]?.toUpperCase() || 'U'
    const roleLinks = user?.role === 'admin'
        ? adminLinks
        : user?.role === 'organizer'
            ? organizerLinks
            : []

    useEffect(() => {
        if (!mobileOpen) return undefined

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMobileOpen(false)
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', closeOnEscape)
        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', closeOnEscape)
        }
    }, [mobileOpen])

    useEffect(() => {
        if (!accountOpen) return undefined

        const closeOnOutsideClick = (event) => {
            if (!accountRef.current?.contains(event.target)) setAccountOpen(false)
        }
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setAccountOpen(false)
        }

        document.addEventListener('pointerdown', closeOnOutsideClick)
        window.addEventListener('keydown', closeOnEscape)
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick)
            window.removeEventListener('keydown', closeOnEscape)
        }
    }, [accountOpen])

    function closeMenus() {
        setMobileOpen(false)
        setAccountOpen(false)
    }

    function signOut() {
        dispatch(logout())
        closeMenus()
    }

    function renderLinks(links, className) {
        return links.map((item) => (
            <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={closeMenus}
                className={({ isActive }) => `${className} ${isActive ? 'is-active' : ''}`}
            >
                <span>{item.label}</span>
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
            </NavLink>
        ))
    }

    const desktopLinkClass = ({ isActive }) => (
        `primary-nav-link ${isActive ? 'is-active' : ''}`
    )

    return (
        <>
            <header className="site-header sticky top-0 z-50">
                <nav aria-label="Main navigation" className="nav-bar mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-4 sm:px-6">
                    <Link to="/" onClick={closeMenus} className="w-fit rounded-md focus-visible:outline-offset-4">
                        <Logo />
                    </Link>

                    <div className="hidden items-center gap-8 lg:flex">
                        {primaryLinks.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={desktopLinkClass}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden items-center justify-self-end gap-3 lg:flex">
                        {user ? (
                            <div ref={accountRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setAccountOpen((open) => !open)}
                                    aria-expanded={accountOpen}
                                    aria-haspopup="menu"
                                    className="account-trigger"
                                >
                                    <span className="account-avatar">{avatar}</span>
                                    <span className="account-trigger-copy">
                                        <span className="max-w-40 truncate text-sm font-semibold text-white">{user.email}</span>
                                        <span className="account-trigger-role">{user.role || 'Member'}</span>
                                    </span>
                                    <span className={`account-chevron ${accountOpen ? 'is-open' : ''}`}>⌄</span>
                                </button>
                                {accountOpen && (
                                    <div role="menu" className="account-menu">
                                        <div className="account-menu-profile">
                                            <span className="account-avatar h-11 w-11 text-base">{avatar}</span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-white">{user.email}</span>
                                                <span className="mt-1 block text-xs capitalize text-slate-400">{user.role || 'Member'} account</span>
                                            </span>
                                        </div>
                                        <p className="account-menu-label">Account</p>
                                        {renderLinks(personalLinks, 'account-menu-link')}
                                        {roleLinks.length > 0 && (
                                            <>
                                                <p className="account-menu-label account-menu-section">
                                                    {user.role === 'admin' ? 'Administration' : 'Organizer tools'}
                                                </p>
                                                {renderLinks(roleLinks, 'account-menu-link')}
                                            </>
                                        )}
                                        <button type="button" onClick={signOut} className="account-signout">
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="nav-signin">Sign in</Link>
                                <Link to="/register" className="nav-create">Get started <ArrowRightIcon className="h-4 w-4" /></Link>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        className="nav-menu-trigger col-start-3 justify-self-end lg:hidden"
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-navigation-drawer"
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen
                            ? <XIcon className="h-5 w-5" />
                            : <MenuIcon className="h-5 w-5" />}
                    </button>
                </nav>
            </header>

            {mobileOpen && (
                <div
                    className="mobile-nav-overlay lg:hidden"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeMenus()
                    }}
                >
                    <aside
                        id="mobile-navigation-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        className="mobile-nav-drawer"
                    >
                        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-5">
                            <Link to="/" onClick={closeMenus} className="rounded-full">
                                <Logo />
                            </Link>
                            <button
                                type="button"
                                className="nav-menu-trigger"
                                aria-label="Close navigation menu"
                                onClick={closeMenus}
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mobile-nav-content">
                            {user && (
                                <div className="mobile-profile">
                                    <span className="account-avatar h-11 w-11 text-base">{avatar}</span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-white">{user.email}</span>
                                        <span className="mt-1 block text-xs capitalize text-slate-400">{user.role} account</span>
                                    </span>
                                </div>
                            )}

                            <p className="mobile-nav-label">Discover</p>
                            <div className="grid gap-1.5">
                                {renderLinks(primaryLinks, 'mobile-nav-link')}
                            </div>

                            {user && (
                                <>
                                    <p className="mobile-nav-label mt-7">Your account</p>
                                    <div className="grid gap-1.5">
                                        {renderLinks(personalLinks, 'mobile-nav-link')}
                                    </div>
                                </>
                            )}

                            {roleLinks.length > 0 && (
                                <>
                                    <p className="mobile-nav-label mt-7">
                                        {user.role === 'admin' ? 'Administration' : 'Organizer tools'}
                                    </p>
                                    <div className="grid gap-1.5">
                                        {renderLinks(roleLinks, 'mobile-nav-link')}
                                    </div>
                                </>
                            )}

                            {!user ? (
                                <div className="mt-7 grid gap-2">
                                    <Link to="/login" onClick={closeMenus} className="mobile-nav-secondary">Sign in</Link>
                                    <Link to="/register" onClick={closeMenus} className="nav-create justify-center">Create your account <ArrowRightIcon className="h-4 w-4" /></Link>
                                </div>
                            ) : (
                                <button type="button" onClick={signOut} className="mobile-nav-signout">
                                    Sign out
                                    <ArrowRightIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="mobile-nav-footer">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                            Find your next moment
                        </div>
                    </aside>
                </div>
            )}
        </>
    )
}

export default Navbar
