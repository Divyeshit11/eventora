import { useState } from "react"
import { Link, NavLink } from "react-router"
import Button from "../common/Button"

const navigation = [
    { label: 'Home', to: '/' },
    { label: 'Explore Events', to: '/events' },
    { label: 'Favorites', to: '/favorites' },

]
function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

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
                <div className="hidden items-center gap-8 md:flex">
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
{/* Desktop Action */}
                <div className="hidden md:block">
                    <Link to="/events">
                        <Button>Explore Events</Button>
                    </Link>
                </div>
                <button
                    type="button"
                    className="rounded-lg border border-surface-border px-3 py-2 text-white md:hidden"
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </nav>

            {isMenuOpen && (
                <div className="border-t border-surface-border px-4 py-4 md:hidden">
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

                        <Link
                            to="/events"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Button>Explore Events</Button>
                        </Link>
                    </div>
                </div>
            )}

        </header>
    )
}

export default Navbar