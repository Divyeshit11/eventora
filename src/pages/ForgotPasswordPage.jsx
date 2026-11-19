import { useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Button from '../Components/common/Button'
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
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
                <h1 className="text-3xl font-bold">Reset your password</h1>
                <p className="mt-3 text-slate-400">
                    Enter your account email and we’ll send you a reset link.
                </p>
                {status === 'succeeded' ? (
                    <div className="mt-8 rounded-2xl border border-surface-border bg-surface-card p-6">
                        <p role="status" className="text-slate-300">
                            If an account exists for that email, a password reset link has been sent.
                            Check your inbox and spam folder.
                        </p>
                        <Link to="/login" className="mt-5 inline-block text-brand-400 hover:text-brand-300">
                            Back to sign in
                        </Link>
                    </div>
                ) : (
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
                        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
                        <Button type="submit" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Sending link...' : 'Send reset link'}
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

export default ForgotPasswordPage
