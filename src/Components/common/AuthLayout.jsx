import { Link } from 'react-router'
import Logo from './Logo'
import { SparklesIcon, TicketIcon, ShieldIcon } from './icons'
import heroImage from '../../assets/hero.png'

const perks = [
    {
        icon: TicketIcon,
        title: 'One account, every event',
        description: 'Save favorites and manage bookings in one place.',
    },
    {
        icon: ShieldIcon,
        title: 'Secure by default',
        description: 'Your data is encrypted and your sessions stay protected.',
    },
    {
        icon: SparklesIcon,
        title: 'Discover something new',
        description: 'Concerts, tech talks, comedy nights and more.',
    },
]

function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="grid min-h-screen bg-surface text-white lg:grid-cols-[1.05fr_0.95fr]">
            {/* Brand panel */}
            <aside className="relative hidden overflow-hidden border-r border-surface-border bg-grid lg:flex lg:flex-col lg:justify-between lg:p-12">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.22),_transparent_55%)]" />
                <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl" />

                <Link to="/" className="relative">
                    <Logo />
                </Link>

                <div className="relative">
                    <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                        <SparklesIcon className="h-3.5 w-3.5" />
                        Your next experience awaits
                    </p>
                    <h2 className="mt-5 max-w-md font-display text-4xl font-extrabold leading-tight tracking-tight">
                        Make room for{' '}
                        <span className="text-gradient">something exciting.</span>
                    </h2>
                    <p className="mt-4 max-w-md leading-7 text-slate-400">
                        Join thousands of explorers discovering concerts, conferences,
                        and experiences worth remembering.
                    </p>

                    <div className="mt-8 space-y-4">
                        {perks.map((perk, index) => (
                            <div
                                key={perk.title}
                                className="card-surface card-hover flex items-start gap-4 rounded-2xl p-4"
                                style={{ animationDelay: `${index * 120}ms` }}
                            >
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-300 ring-1 ring-brand-500/30">
                                    <perk.icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-semibold text-white">{perk.title}</h3>
                                    <p className="mt-0.5 text-sm text-slate-400">{perk.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-surface-border">
                    <img
                        src={heroImage}
                        alt="Eventora community enjoying an event"
                        className="h-44 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                    <p className="absolute bottom-4 left-5 text-sm font-medium text-slate-300">
                        “The best nights start with a single click.”
                    </p>
                </div>
            </aside>

            {/* Form panel */}
            <main className="relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.14),_transparent_55%)] lg:hidden" />
                <div className="relative w-full max-w-md">
                    <Link to="/" className="mb-8 inline-block lg:hidden">
                        <Logo />
                    </Link>
                    <div className="animate-fade-up">
                        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            {title}
                        </h1>
                        <p className="mt-3 leading-7 text-slate-400">{subtitle}</p>
                    </div>
                    <div className="card-surface gradient-border mt-8 rounded-3xl p-6 sm:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AuthLayout
