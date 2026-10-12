function Button({ 
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false, 
}) {
  const baseClasses =
  'inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition-colors duration-200 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50'
  
  const variants = {
    primary:
    'bg-brand-600 text-white hover:bg-brand-700',
    secondary:
    'border border-surface-border bg-surface-card text-white hover:bg-slate-800', 
    ghost:
    'text-slate-300 hover:bg-slate-800 hover:text-white',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant] ?? variants.primary}`}
    >
      {children}
    </button>
  );
}

export default Button;