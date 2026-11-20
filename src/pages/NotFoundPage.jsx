import { Link } from 'react-router'
import Button from "../Components/common/Button";
import Footer from "../Components/layout/Footer";
import Navbar from "../Components/layout/Navbar";
import { CompassIcon, SparklesIcon } from '../Components/common/icons'

function NotFoundPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-surface text-white">
            <div className="pointer-events-none absolute inset-0 bg-grid" />
            <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/15 blur-3xl" />
            <Navbar />

            <main className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
                <div className="animate-float">
                    <span className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-300 ring-1 ring-brand-500/30">
                        <CompassIcon className="h-12 w-12" />
                    </span>
                </div>

                <p className="mt-8 animate-fade-up font-display text-7xl font-extrabold tracking-tight text-gradient sm:text-9xl">
                    404
                </p>

                <h1 className="mt-4 animate-fade-up font-display text-3xl font-bold sm:text-4xl [animation-delay:120ms]">
                    Page not Found
                </h1>

                <p className="mt-4 max-w-md animate-fade-up text-slate-400 [animation-delay:200ms]">
                    The page you are looking for doesn't exist or may have been moved.
                    Let's get you back to discovering something great.
                </p>

                <div className="mt-8 flex animate-fade-up flex-wrap justify-center gap-3 [animation-delay:300ms]">
                    <Link to="/">
                        <Button>
                            <SparklesIcon className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>

                    <Link to="/events">
                        <Button variant='secondary'>Explore Events</Button>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default NotFoundPage
