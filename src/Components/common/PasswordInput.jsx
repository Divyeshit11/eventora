import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from './icons'

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
        <label className="grid gap-2 text-sm font-medium text-slate-300">
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
                    className="field w-full py-3 pr-12"
                />
                <button
                    type="button"
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isVisible}
                    onClick={() => setIsVisible((visible) => !visible)}
                    className="absolute inset-y-0 right-3 my-auto grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-surface-raised hover:text-white"
                >
                    {isVisible ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                </button>
            </span>
        </label>
    )
}

export default PasswordInput
