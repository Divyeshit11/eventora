const badgeVariants = {
    technology: 'border-brand-400/30 bg-brand-500/15 text-brand-300',
    music: 'border-brand-400/30 bg-brand-500/15 text-brand-300',
    business: 'border-accent-400/30 bg-accent-500/15 text-accent-300',
    comedy: 'border-accent-400/30 bg-accent-500/15 text-accent-300',
    other: 'border-slate-400/30 bg-slate-500/15 text-slate-300',
}

function Badge({children,variant = 'technology'}) {
const variantClasses =
badgeVariants[variant] ?? badgeVariants.technology

return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${variantClasses}`}>
{children}
    </span>
)
}

export default Badge