import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import AuthLayout from '../Components/common/AuthLayout'
import Button from '../Components/common/Button'
import PasswordInput from '../Components/common/PasswordInput'
import { MailIcon } from '../Components/common/icons'
import { registerThunk } from '../features/auth/authSlice'

function getFriendlyPasswordError(message) {
    const legacyPasswordError = message?.match(
        /password must be (\d+)-\d+ characters and no more than 72 UTF-8 bytes/i,
    )
    if (legacyPasswordError) {
        return `Please use at least ${legacyPasswordError[1]} characters for your password.`
    }
    return message
}

function RegisterPage() {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const status = useSelector((state) => state.auth.status)
    const error = useSelector((state) => state.auth.error)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/manage-events' : '/events'} replace />
    }

    async function handleSubmit(event) {
        event.preventDefault()
        if (new TextEncoder().encode(password).length > 72) {
            setPasswordError('Password must be no more than 72 UTF-8 bytes.')
            return
        }
        setPasswordError('')
        await dispatch(registerThunk({ email, password }))
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Sign up once and start discovering events right away."
        >
            <form onSubmit={handleSubmit} className="grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                    Email address
                    <span className="relative">
                        <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            maxLength="254"
                            required
                            placeholder="you@example.com"
                            className="field field-with-icon py-3"
                        />
                    </span>
                </label>
                <PasswordInput
                    label="Password (at least 6 characters)"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value)
                        setPasswordError('')
                    }}
                    minLength={6}
                />
                <p className="-mt-3 text-xs text-slate-500">
                    You’ll be signed in automatically after creating your account.
                </p>
                {(passwordError || error) && (
                    <p role="alert" className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                        {passwordError || getFriendlyPasswordError(error)}
                    </p>
                )}
                <Button type="submit" disabled={status === 'loading'} className="w-full py-3.5">
                    {status === 'loading' ? 'Creating account...' : 'Create account'}
                </Button>
                <p className="text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-brand-400 transition hover:text-brand-300">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}

export default RegisterPage
