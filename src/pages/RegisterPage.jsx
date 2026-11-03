import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Button from '../Components/common/Button'
import { register } from '../services/eventService'

function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState('idle')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setStatus('loading')
        setError('')
        setMessage('')
        try {
            const response = await register({ email, password })
            setStatus('succeeded')
            setMessage(response.message)
        } catch (requestError) {
            setStatus('failed')
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                'Unable to create account'
            )
        }
    }

    if (status === 'succeeded') {
        return <Navigate to="/login" replace state={{ notice: message }} />
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
                <h1 className="text-3xl font-bold">Create an account</h1>
                <p className="mt-3 text-slate-400">
                    New accounts are regular users. Administrator access is provisioned securely by the server.
                </p>
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 grid gap-5 rounded-2xl border border-surface-border bg-surface-card p-6"
                >
                    <label className="grid gap-2 text-sm text-slate-300">
                        Email
                        <input
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            maxLength="254"
                            required
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                        Password (12 characters minimum)
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength="12"
                            maxLength="128"
                            required
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                        />
                    </label>
                    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
                    <Button type="submit" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Creating account...' : 'Create account'}
                    </Button>
                    <Link to="/login" className="text-sm text-brand-400 hover:text-brand-300">
                        Back to sign in
                    </Link>
                </form>
            </main>
            <Footer />
        </div>
    )
}

export default RegisterPage
