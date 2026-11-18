import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'

const categories = [
    { icon: '🎵', title: 'Live music', description: 'Find your next favorite show.' },
    { icon: '💡', title: 'Technology', description: 'Meet ideas shaping what’s next.' },
    { icon: '🤝', title: 'Business', description: 'Connect with people who inspire you.' },
]

function HomePage() {
    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main>
                <section className="relative isolate overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.22),_transparent_55%)]" />
                    <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-100">
                                <span className="h-2 w-2 rounded-full bg-brand-500" />
                                Good plans start here
                            </span>
                            <h1 className="mt-7 max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                                Make room for
                                <span className="block text-brand-500">something exciting.</span>
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                                Discover concerts, ideas, and experiences worth sharing.
                                Find your next event with Eventora.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-7 py-3.5 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                                >
                                    Create your free account
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-xl border border-surface-border px-7 py-3.5 font-semibold text-slate-200 transition hover:border-brand-500/60 hover:bg-surface-card"
                                >
                                    Sign in
                                </Link>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">
                                Already a member? Sign in to explore and save events.
                            </p>
                        </div>

                        <div className="relative mx-auto w-full max-w-lg">
                            <div className="absolute -inset-5 rounded-[2rem] bg-brand-600/10 blur-2xl" />
                            <div className="relative rounded-3xl border border-surface-border bg-surface-card/90 p-5 shadow-2xl shadow-black/30 sm:p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
                                            Your next story
                                        </p>
                                        <h2 className="mt-2 text-2xl font-bold">Starts with a plan</h2>
                                    </div>
                                    <span className="rounded-2xl bg-brand-500/10 p-3 text-2xl" aria-hidden="true">
                                        ✦
                                    </span>
                                </div>
                                <div className="mt-7 grid gap-3">
                                    {categories.map((category, index) => (
                                        <div
                                            key={category.title}
                                            className={`flex items-center gap-4 rounded-2xl border border-surface-border p-4 ${
                                                index === 1 ? 'bg-brand-500/10' : 'bg-surface'
                                            }`}
                                        >
                                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-card text-2xl" aria-hidden="true">
                                                {category.icon}
                                            </span>
                                            <div>
                                                <h3 className="font-semibold">{category.title}</h3>
                                                <p className="mt-1 text-sm text-slate-400">{category.description}</p>
                                            </div>
                                            <span className="ml-auto text-slate-500" aria-hidden="true">→</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 flex items-center gap-3 border-t border-surface-border pt-5">
                                    <div className="flex -space-x-2" aria-hidden="true">
                                        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-surface-card bg-violet-500 text-xs">E</span>
                                        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-surface-card bg-sky-500 text-xs">V</span>
                                        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-surface-card bg-pink-500 text-xs">T</span>
                                    </div>
                                    <p className="text-sm text-slate-400">A little discovery goes a long way.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-y border-surface-border bg-surface-card/40">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
                        {[
                            {
                                number: '01',
                                title: 'Create your account',
                                description: 'Sign up with your email and a password. It only takes a moment.',
                            },
                            {
                                number: '02',
                                title: 'Find your kind of event',
                                description: 'Explore experiences by category, search, price, and date.',
                            },
                            {
                                number: '03',
                                title: 'Save what you love',
                                description: 'Keep your favorite events together and come back when you’re ready.',
                            },
                        ].map((step) => (
                            <article key={step.number}>
                                <p className="text-sm font-bold tracking-widest text-brand-400">{step.number}</p>
                                <h2 className="mt-3 text-xl font-bold">{step.title}</h2>
                                <p className="mt-2 leading-7 text-slate-400">{step.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
                        Your next experience is waiting
                    </p>
                    <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">
                        Go from “we should” to “that was amazing.”
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
                        Join Eventora to explore events and keep the ones you love close.
                    </p>
                    <Link
                        to="/register"
                        className="mt-8 inline-flex items-center justify-center rounded-xl bg-brand-600 px-7 py-3.5 font-semibold text-white transition hover:bg-brand-700"
                    >
                        Get started
                    </Link>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
