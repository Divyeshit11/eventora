import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Button from '../Components/common/Button'
import PasswordInput from '../Components/common/PasswordInput'
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
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
                <h1 className="text-3xl font-bold">Create your account</h1>
                <p className="mt-3 text-slate-400">
                    Sign up once and start discovering events right away.
                </p>
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 grid gap-5 rounded-2xl border border-surface-border bg-surface-card p-6"
                >
                    <label className="grid gap-2 text-sm text-slate-300">
                        Email address
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            maxLength="254"
                            required
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                        />
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
                        <p role="alert" className="text-sm text-red-300">
                            {passwordError || getFriendlyPasswordError(error)}
                        </p>
                    )}
                    <Button type="submit" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Creating account...' : 'Create account'}
                    </Button>
                    <p className="text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300">
                            Sign in
                        </Link>
                    </p>
                </form>
            </main>
            <Footer />
        </div>
    )
}

export default RegisterPage
