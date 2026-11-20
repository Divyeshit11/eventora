import Reveal from './Reveal'

function PageHeader({ eyebrow, title, description, children, align = 'left' }) {
    const centered = align === 'center'
    return (
        <div className={`relative overflow-hidden ${centered ? 'text-center' : ''}`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.16),_transparent_60%)]" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
            <Reveal className={`relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 ${centered ? 'text-center' : ''}`}>
                {eyebrow && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-400" />
                        {eyebrow}
                    </span>
                )}
                <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className={`mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg ${centered ? 'mx-auto' : ''}`}>
                        {description}
                    </p>
                )}
                {children}
            </Reveal>
        </div>
    )
}

export default PageHeader
