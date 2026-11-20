import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import AuthLayout from '../Components/common/AuthLayout'
import Button from '../Components/common/Button'
import PasswordInput from '../Components/common/PasswordInput'
import { LockIcon } from '../Components/common/icons'
import { resetPassword } from '../services/eventService'

function ResetPasswordPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const token = new URLSearchParams(location.hash.slice(1)).get('token') || ''
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState('idle')
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        if (new TextEncoder().encode(password).length > 72) {
            setError('Password must be no more than 72 UTF-8 bytes.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setStatus('loading')
        setError('')
        try {
            const response = await resetPassword({ token, password })
            navigate('/login', {
                replace: true,
                state: { notice: response.message },
            })
        } catch (requestError) {
            setStatus('failed')
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                'Unable to reset your password.',
            )
        }
    }

    return (
        <AuthLayout
            title="Choose a new password"
            subtitle="Use at least 6 characters. Passwords must be no more than 72 UTF-8 bytes."
        >
            {!token ? (
                <div className="grid gap-5">
                    <div className="flex items-start gap-3 rounded-2xl border border-red-800 bg-red-950/30 p-4">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-500/20 text-red-300">
                            <LockIcon className="h-5 w-5" />
                        </span>
                        <p role="alert" className="text-sm leading-6 text-red-200">
                            This password reset link is invalid or expired.
                        </p>
                    </div>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110"
                    >
                        Request a new reset link
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid gap-5">
                    <PasswordInput
                        label="New password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={6}
                        maxLength={128}
                    />
                    <PasswordInput
                        label="Confirm new password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        minLength={6}
                        maxLength={128}
                    />
                    {error && (
                        <p role="alert" className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                            {error}
                        </p>
                    )}
                    <Button type="submit" disabled={status === 'loading'} className="w-full py-3.5">
                        {status === 'loading' ? 'Updating password...' : 'Reset password'}
                    </Button>
                    <Link
                        to="/login"
                        className="text-center text-sm font-medium text-brand-400 transition hover:text-brand-300"
                    >
                        Back to sign in
                    </Link>
                </form>
            )}
        </AuthLayout>
    )
}

export default ResetPasswordPage
