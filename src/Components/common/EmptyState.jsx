import Reveal from './Reveal'

function EmptyState({ icon, title, description, action, className = '' }) {
    return (
        <Reveal
            className={`card-surface gradient-border rounded-3xl px-6 py-14 text-center ${className}`}
        >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/25 to-accent-500/20 text-brand-300 ring-1 ring-brand-500/30">
                {icon}
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold text-white">{title}</h2>
            {description && <p className="mx-auto mt-3 max-w-md text-slate-400">{description}</p>}
            {action && <div className="mt-7 flex justify-center">{action}</div>}
        </Reveal>
    )
}

export default EmptyState
