import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Reveal from '../Components/common/Reveal'
import heroImage from '../assets/hero.png'
import {
    SparklesIcon,
    ArrowRightIcon,
    MusicIcon,
    CpuIcon,
    BriefcaseIcon,
    UsersIcon,
    ShieldIcon,
    TicketIcon,
    CalendarIcon,
    StarIcon,
} from '../Components/common/icons'

const categories = [
    {
        icon: MusicIcon,
        title: 'Live music',
        description: 'Find your next favorite show.',
        accent: 'from-brand-500/25 to-brand-700/10 text-brand-300 ring-brand-400/30',
    },
    {
        icon: CpuIcon,
        title: 'Technology',
        description: 'Meet ideas shaping what’s next.',
        accent: 'from-accent-500/25 to-accent-600/10 text-accent-300 ring-accent-400/30',
    },
    {
        icon: BriefcaseIcon,
        title: 'Business',
        description: 'Connect with people who inspire you.',
        accent: 'from-accent-500/25 to-accent-600/10 text-accent-300 ring-accent-400/30',
    },
]

const steps = [
    {
        icon: UsersIcon,
        number: '01',
        title: 'Create your account',
        description: 'Sign up with your email and a password. It only takes a moment.',
    },
    {
        icon: SparklesIcon,
        number: '02',
        title: 'Find your kind of event',
        description: 'Explore experiences by category, search, price, and date.',
    },
    {
        icon: TicketIcon,
        number: '03',
        title: 'Save what you love',
        description: 'Keep your favorite events together and come back when you’re ready.',
    },
]

const marqueeItems = [
    'Live Music', 'Tech Talks', 'Comedy Nights', 'Business Meetups',
    'Food Festivals', 'Art Exhibitions', 'Sports Events', 'Workshops',
]

function HomePage() {
    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main>
                {/* Hero */}
                <section className="relative isolate overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(36,116,86,0.23),_transparent_55%)]" />
                    <div className="pointer-events-none absolute -left-32 top-40 -z-10 h-96 w-96 animate-float-slow rounded-full bg-accent-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 animate-float rounded-full bg-brand-600/15 blur-3xl" />
                    <svg className="pointer-events-none absolute right-[8%] top-24 hidden h-72 w-72 animate-spin-slow opacity-20 lg:block" viewBox="0 0 200 200" fill="none" aria-hidden="true">
                        <circle cx="100" cy="100" r="82" stroke="url(#home-orbit)" strokeDasharray="2 8" />
                        <circle cx="100" cy="100" r="58" stroke="white" strokeOpacity=".25" />
                        <path d="M100 8v18m0 148v18M8 100h18m148 0h18" stroke="#91B9A2" strokeWidth="2" />
                        <defs><linearGradient id="home-orbit" x1="20" y1="20" x2="180" y2="180"><stop stopColor="#247456" /><stop offset="1" stopColor="#D59A82" /></linearGradient></defs>
                    </svg>

                    <div className="mx-auto grid min-h-[640px] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
                        <div>
                            <Reveal>
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/15 bg-brand-400/[0.08] px-4 py-2 text-sm font-medium text-brand-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-accent-300 shadow-[0_0_16px_rgba(213,154,130,0.8)]" />
                                FIND YOUR NEXT MOMENT
                                </span>
                            </Reveal>
                            <Reveal delay={100}>
                                <h1 className="mt-7 max-w-2xl font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                                    Make room for
                                    <span className="text-gradient block">something exciting.</span>
                                </h1>
                            </Reveal>
                            <Reveal delay={200}>
                                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400 sm:text-xl">
                                    Discover concerts, ideas, and experiences worth sharing.
                                    Find your next event with Eventora.
                                </p>
                            </Reveal>
                            <Reveal delay={300}>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-[0_18px_40px_-16px_rgba(13,81,62,0.65)] transition duration-300 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-brand-500/50"
                                    >
                                        Create your free account
                                        <ArrowRightIcon className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center rounded-xl border border-surface-border bg-surface-card/60 px-7 py-3.5 font-semibold text-slate-200 backdrop-blur transition hover:border-brand-500/50 hover:bg-surface-card"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            </Reveal>
                            <Reveal delay={400}>
                                <p className="mt-4 text-sm text-slate-500">
                                    Already a member? Sign in to explore and save events.
                                </p>
                            </Reveal>
                        </div>

                        {/* Hero visual */}
                        <Reveal delay={250} className="relative mx-auto w-full max-w-lg">
                            <div className="absolute -inset-5 animate-pulse-soft rounded-[2.5rem] bg-gradient-to-br from-brand-600/20 to-accent-500/15 blur-2xl" />
                            <div className="gradient-border relative overflow-hidden rounded-[2rem] shadow-[0_40px_100px_-40px_rgba(13,81,62,0.45)]">
                                <img
                                    src={heroImage}
                                    alt="People enjoying a live event together"
                                    className="h-80 w-full object-cover transition-transform duration-[1200ms] hover:scale-105 sm:h-[26rem]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/15 to-transparent" />
                                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent" />

                                {/* Floating cards */}
                                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                                    <div className="glass flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 shadow-xl">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                                            <CalendarIcon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-xs text-slate-400">Next up</p>
                                            <p className="text-sm font-semibold">Neon Nights Live</p>
                                        </div>
                                    </div>
                                    <div className="glass hidden items-center gap-2 rounded-2xl px-4 py-3 sm:flex">
                                        <StarIcon filled className="h-4 w-4 text-amber-400" />
                                        <span className="text-sm font-semibold">4.9</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -right-4 -top-6 animate-float rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur sm:-right-8">
                                <p className="text-xs text-slate-400">This weekend</p>
                                <p className="font-display text-lg font-extrabold text-gradient">120+ events</p>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Marquee */}
                <section className="relative overflow-hidden border-y border-surface-border/70 bg-surface-card/40 py-5">
                    <div className="flex w-max animate-marquee gap-10">
                        {[...marqueeItems, ...marqueeItems].map((item, index) => (
                            <span key={index} className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                <SparklesIcon className="h-4 w-4 text-brand-400" />
                                {item}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Categories */}
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
                    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                                Browse by interest
                            </span>
                            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Something for <span className="text-gradient">everyone</span>
                            </h2>
                        </div>
                        <Link to="/events" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-400 transition hover:text-brand-300">
                            View all events
                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Reveal>

                    <div className="grid gap-5 sm:grid-cols-3">
                        {categories.map((category, index) => (
                            <Reveal key={category.title} delay={index * 110}>
                                <Link
                                    to="/events"
                                    className="card-surface card-hover group flex h-full flex-col items-start rounded-3xl p-7"
                                >
                                    <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${category.accent} ring-1 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                                        <category.icon className="h-7 w-7" />
                                    </span>
                                    <h3 className="mt-5 font-display text-xl font-bold text-white group-hover:text-brand-200">
                                        {category.title}
                                    </h3>
                                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                                        {category.description}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 transition group-hover:gap-2.5">
                                        Discover
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </span>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="border-y border-surface-border/70 bg-surface-card/40">
                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
                        <Reveal className="mb-12 text-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                                How it works
                            </span>
                            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Three steps to your <span className="text-gradient">next night out</span>
                            </h2>
                        </Reveal>

                        <div className="grid gap-6 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <Reveal key={step.number} delay={index * 120}>
                                    <article className="card-surface card-hover relative h-full overflow-hidden rounded-3xl p-7">
                                        <span className="pointer-events-none absolute -right-4 -top-6 font-display text-8xl font-extrabold text-white/[0.04]">
                                            {step.number}
                                        </span>
                                        <span className="relative grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-300 ring-1 ring-brand-500/30">
                                            <step.icon className="h-6 w-6" />
                                        </span>
                                        <h3 className="relative mt-5 font-display text-xl font-bold text-white">
                                            {step.title}
                                        </h3>
                                        <p className="relative mt-2 leading-7 text-slate-400">
                                            {step.description}
                                        </p>
                                    </article>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
                    <Reveal>
                        <div className="gradient-border relative overflow-hidden rounded-[2.5rem] bg-grid">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
                            <div className="relative grid items-center gap-10 px-8 py-14 sm:px-14 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="text-center lg:text-left">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">
                                        <SparklesIcon className="h-3.5 w-3.5" />
                                        Your next experience is waiting
                                    </span>
                                    <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                                        Go from “we should” to{' '}
                                        <span className="text-gradient">“that was amazing.”</span>
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400 lg:mx-0">
                                        Join Eventora to explore events and keep the ones you love close.
                                    </p>
                                    <Link
                                        to="/register"
                                        className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 font-semibold text-white shadow-xl shadow-brand-600/30 transition hover:shadow-brand-500/50 hover:brightness-110"
                                    >
                                        Get started free
                                        <ArrowRightIcon className="h-5 w-5" />
                                    </Link>
                                </div>
                                <div className="relative mx-auto hidden w-full max-w-sm lg:block">
                                    <div className="absolute -inset-4 animate-pulse-soft rounded-[2rem] bg-accent-500/15 blur-2xl" />
                                    <img
                                        src={heroImage}
                                        alt="Eventora community"
                                        className="relative h-64 w-full rounded-[1.75rem] border border-surface-border object-cover"
                                    />
                                    <div className="glass absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 shadow-xl">
                                        <ShieldIcon className="h-4 w-4 text-emerald-400" />
                                        <span className="text-sm font-semibold">Free to join</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
