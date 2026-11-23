function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
}) {
  const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'

  const variants = {
    primary:
    'bg-brand-600 text-white shadow-[0_12px_30px_-12px_rgba(13,81,62,0.55)] hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_18px_38px_-12px_rgba(13,81,62,0.65)]',
    secondary:
    'border border-white/10 bg-white/[0.035] text-white shadow-sm hover:-translate-y-0.5 hover:border-brand-300/35 hover:bg-white/[0.07]',
    ghost:
    'text-slate-300 hover:bg-white/[0.06] hover:text-white',
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