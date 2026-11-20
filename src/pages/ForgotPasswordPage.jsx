import { useState } from 'react'
import { Link } from 'react-router'
import AuthLayout from '../Components/common/AuthLayout'
import Button from '../Components/common/Button'
import { MailIcon, CheckIcon } from '../Components/common/icons'
import { requestPasswordReset } from '../services/eventService'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle')
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setStatus('loading')
        setError('')
        try {
            await requestPasswordReset(email)
            setStatus('succeeded')
        } catch (requestError) {
            setStatus('failed')
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                'Unable to send a password reset email.',
            )
        }
    }

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your account email and we’ll send you a reset link."
        >
            {status === 'succeeded' ? (
                <div className="grid gap-5">
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
                            <CheckIcon className="h-5 w-5" />
                        </span>
                        <p role="status" className="text-sm leading-6 text-emerald-200">
                            If an account exists for that email, a password reset link has been sent.
                            Check your inbox and spam folder.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110"
                    >
                        Back to sign in
                    </Link>
                </div>
            ) : (
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
                    {error && (
                        <p role="alert" className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                            {error}
                        </p>
                    )}
                    <Button type="submit" disabled={status === 'loading'} className="w-full py-3.5">
                        {status === 'loading' ? 'Sending link...' : 'Send reset link'}
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

export default ForgotPasswordPage
