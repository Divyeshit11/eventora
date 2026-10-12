const badgeVariants = {
    technology: 'bg-blue-500/15 text-blue-300',
    music: 'bg-purple-500/15 text-purple-300',
    business:'bg-amber-500/15 text-amber-300',
    comedy: 'bg-pink-500/15 text-pink-300',

}

function Badge({children,variant = 'technology'}) {
const variantClasses =
badgeVariants[variant] ?? badgeVariants.technology

return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semiblod ${variantClasses}`}>
{children}
    </span>
)
}

export default Badge