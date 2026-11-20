import { Link } from 'react-router'
import Logo from '../common/Logo'
import { SparklesIcon, MapPinIcon, MailIcon } from '../common/icons'

const footerLinks = [
    {
        title: 'Explore',
        links: [
            { label: 'All Events', to: '/events' },
            { label: 'Favorites', to: '/favorites' },
            { label: 'My Bookings', to: '/bookings' },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'Sign in', to: '/login' },
            { label: 'Create account', to: '/register' },
            { label: 'Account settings', to: '/account' },
        ],
    },
];

function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-surface-border bg-surface">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                    <div>
                        <Logo />
                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                            Discover exciting experiences, find your next event, and make every moment memorable.
                        </p>
                        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                            <MapPinIcon className="h-4 w-4 text-brand-400" />
                            Events happening near you
                        </div>
                    </div>

                    {footerLinks.map((group) => (
                        <div key={group.title}>
                            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">{group.title}</h3>
                            <ul className="mt-4 space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                                        >
                                            <span className="h-1 w-1 rounded-full bg-brand-500/60 transition group-hover:bg-accent-400" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div>
                        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Stay in the loop</h3>
                        <p className="mt-4 text-sm leading-6 text-slate-400">
                            New events, presale drops and community picks — straight to your inbox.
                        </p>
                        <Link
                            to="/register"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110"
                        >
                            <MailIcon className="h-4 w-4" />
                            Get early access
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-border/70 pt-6 sm:flex-row">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Eventora. All rights reserved.
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        Crafted with <SparklesIcon className="h-4 w-4 text-accent-400" /> for people who love live moments
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;