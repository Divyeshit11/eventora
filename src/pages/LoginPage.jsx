import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useLocation } from 'react-router'
import AuthLayout from '../Components/common/AuthLayout'
import Button from '../Components/common/Button'
import PasswordInput from '../Components/common/PasswordInput'
import { MailIcon } from '../Components/common/icons'
import { loginThunk } from '../features/auth/authSlice'

function LoginPage() {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const status = useSelector((state) => state.auth.status)
    const error = useSelector((state) => state.auth.error)
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const requestedPath = location.state?.from?.pathname
    const destination = user?.role === 'admin'
        ? (requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
            ? requestedPath
            : '/manage-events')
        : (requestedPath && requestedPath !== '/manage-events' &&
            requestedPath.startsWith('/') && !requestedPath.startsWith('//')
            ? requestedPath
            : '/events')

    if (user) return <Navigate to={destination} replace />

    async function handleSubmit(event) {
        event.preventDefault()
        if (new TextEncoder().encode(password).length > 72) {
            setPasswordError('Password must be no more than 72 UTF-8 bytes.')
            return
        }
        setPasswordError('')
        await dispatch(loginThunk({ email, password }))
    }

    return (
        <AuthLayout
            title="Sign in to Eventora"
            subtitle="Welcome back — sign in to continue discovering events."
        >
            {location.state?.notice && (
                <p className="mb-5 rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300" role="status">
                    {location.state.notice}
                </p>
            )}
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
                    label="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value)
                        setPasswordError('')
                    }}
                />
                <Link
                    to="/forgot-password"
                    className="-mt-3 justify-self-end text-sm font-medium text-brand-400 transition hover:text-brand-300"
                >
                    Forgot password?
                </Link>
                {passwordError && (
                    <p role="alert" className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                        {passwordError}
                    </p>
                )}
                {error && (
                    <p role="alert" className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                )}
                <Button type="submit" disabled={status === 'loading'} className="w-full py-3.5">
                    {status === 'loading' ? 'Signing in...' : 'Sign in'}
                </Button>
                <p className="text-center text-sm text-slate-400">
                    Need an account?{' '}
                    <Link to="/register" className="font-semibold text-brand-400 transition hover:text-brand-300">
                        Create one
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}

export default LoginPage
