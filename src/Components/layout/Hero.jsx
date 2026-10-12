
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-600/15 via-transparent to-purple-500/10" />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center justify-center px-4 py-20 text-center sm:px-6 lg:min-h-[640px]">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-100">
            Discover experiences worth remembering
          </span>

          <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Discover Amazing
            <span className="block text-brand-500">
              Events Near You
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Find exciting concerts, technology conferences,
            business meetups, and unforgettable experiences
            with Eventora.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#events"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-7 py-3.5 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              Explore Events
            </a>

            <a
              href="#categories"
              className="inline-flex items-center justify-center rounded-xl border border-surface-border px-7 py-3.5 font-semibold text-slate-200 transition hover:bg-surface-card"
            >
              Browse Categories
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-surface-border pt-8">
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
