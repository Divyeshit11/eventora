
import { SparklesIcon, CompassIcon, TicketIcon } from '../common/icons'

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_60%)]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 animate-float-slow rounded-full bg-accent-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 animate-float rounded-full bg-brand-600/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center justify-center px-4 py-20 text-center sm:px-6 lg:min-h-[640px]">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-100 animate-fade-up">
            <SparklesIcon className="h-4 w-4 text-accent-400" />
            Discover experiences worth remembering
          </span>

          <h1 className="mt-7 animate-fade-up text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl [animation-delay:120ms]">
            Discover Amazing
            <span className="text-gradient block">
              Events Near You
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-base leading-7 text-slate-400 sm:text-lg sm:leading-8 [animation-delay:240ms]">
            Find exciting concerts, technology conferences,
            business meetups, and unforgettable experiences
            with Eventora.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col justify-center gap-4 sm:flex-row [animation-delay:360ms]">
            <a
              href="#events"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:shadow-brand-500/50 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <CompassIcon className="h-5 w-5" />
              Explore Events
            </a>

            <a
              href="#categories"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card/60 px-7 py-3.5 font-semibold text-slate-200 backdrop-blur transition hover:border-brand-500/50 hover:bg-surface-card"
            >
              <TicketIcon className="h-5 w-5 text-brand-400" />
              Browse Categories
            </a>
          </div>

          <div className="mt-12 grid animate-fade-up grid-cols-3 gap-4 border-t border-surface-border/70 pt-8 [animation-delay:480ms]">
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">
                4+
              </p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Categories
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">
                100%
              </p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Discovery
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">
                One
              </p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Destination
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
