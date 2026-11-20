const badgeVariants = {
    technology: 'border-blue-400/30 bg-blue-500/15 text-blue-300',
    music: 'border-purple-400/30 bg-purple-500/15 text-purple-300',
    business: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
    comedy: 'border-pink-400/30 bg-pink-500/15 text-pink-300',
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