import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Button from '../Components/common/Button'
import PasswordInput from '../Components/common/PasswordInput'
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
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
                <h1 className="text-3xl font-bold">Choose a new password</h1>
                <p className="mt-3 text-slate-400">
                    Use at least 6 characters. Passwords must be no more than 72 UTF-8 bytes.
                </p>
                {!token ? (
                    <div className="mt-8 rounded-2xl border border-surface-border bg-surface-card p-6">
                        <p role="alert" className="text-red-300">
                            This password reset link is invalid or expired.
                        </p>
                        <Link to="/forgot-password" className="mt-5 inline-block text-brand-400 hover:text-brand-300">
                            Request a new reset link
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 grid gap-5 rounded-2xl border border-surface-border bg-surface-card p-6"
                    >
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
                        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
                        <Button type="submit" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Updating password...' : 'Reset password'}
                        </Button>
                        <Link to="/login" className="text-sm text-brand-400 hover:text-brand-300">
                            Back to sign in
                        </Link>
                    </form>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default ResetPasswordPage
