import Reveal from './Reveal'

function PageHeader({ eyebrow, title, description, children, align = 'left' }) {
    const centered = align === 'center'
    return (
        <div className={`page-shell relative overflow-hidden ${centered ? 'text-center' : ''}`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(36,116,86,0.16),_transparent_58%)]" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 animate-float-slow rounded-full bg-accent-500/10 blur-3xl" />
            <div className={`pointer-events-none absolute top-8 hidden h-72 w-72 rounded-full border border-white/[0.035] lg:block ${centered ? 'right-[12%]' : 'right-[9%]'}`}>
                <span className="absolute inset-8 rounded-full border border-dashed border-brand-300/10" />
                <span className="absolute right-10 top-12 h-2 w-2 animate-pulse-soft rounded-full bg-accent-300 shadow-[0_0_20px_rgba(213,154,130,0.8)]" />
            </div>
            <Reveal className={`relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pb-14 sm:pt-20 ${centered ? 'text-center' : ''}`}>
                {eyebrow && (
                    <span className="page-eyebrow inline-flex items-center gap-2 rounded-full border border-brand-300/15 bg-brand-400/[0.08] px-4 py-2 text-[0.68rem] font-bold uppercase text-brand-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-300 shadow-[0_0_12px_rgba(213,154,130,0.7)]" />
                        {eyebrow}
                    </span>
                )}
                <h1 className={`mt-5 max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl ${centered ? 'mx-auto' : ''}`}>
                    {title}
                </h1>
                {description && (
                    <p className={`mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg ${centered ? 'mx-auto' : ''}`}>
                        {description}
                    </p>
                )}
                {children}
            </Reveal>
        </div>
    )
}

export default PageHeader
