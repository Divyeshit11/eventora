function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
}) {
  const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'

  const variants = {
    primary:
    'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 hover:brightness-110',
    secondary:
    'border border-surface-border bg-surface-card text-white hover:border-brand-500/50 hover:bg-surface-raised',
    ghost:
    'text-slate-300 hover:bg-slate-800 hover:text-white',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;