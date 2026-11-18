import { useState } from 'react'

function PasswordInput({
    label,
    value,
    onChange,
    autoComplete,
    minLength,
    maxLength = 72,
    required = true,
}) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <label className="grid gap-2 text-sm text-slate-300">
            {label}
            <span className="relative">
                <input
                    type={isVisible ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={onChange}
                    minLength={minLength}
                    maxLength={maxLength}
                    required={required}
                    className="w-full rounded-lg border border-surface-border bg-surface px-3 py-3 pr-16 text-white"
                />
                <button
                    type="button"
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isVisible}
                    onClick={() => setIsVisible((visible) => !visible)}
                    className="absolute inset-y-0 right-3 my-auto text-xs font-semibold text-brand-300 hover:text-white"
                >
                    {isVisible ? 'Hide' : 'Show'}
                </button>
            </span>
        </label>
    )
}

export default PasswordInput
