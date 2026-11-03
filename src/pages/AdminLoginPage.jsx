import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useLocation } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Button from '../Components/common/Button'
import { loginThunk } from '../features/auth/authSlice'

function AdminLoginPage() {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const status = useSelector((state) => state.auth.status)
    const error = useSelector((state) => state.auth.error)
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    if (user?.role === 'admin') return <Navigate to="/manage-events" replace />

    async function handleSubmit(event) {
        event.preventDefault()
        await dispatch(loginThunk({ email, password }))
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
                <h1 className="text-3xl font-bold">Administrator sign in</h1>
                <p className="mt-3 text-slate-400">
                    Sign in to manage Eventora events.
                </p>
                {location.state?.notice && (
                    <p className="mt-4 text-sm text-green-300" role="status">
                        {location.state.notice}
                    </p>
                )}
                {user && user.role !== 'admin' && (
                    <p className="mt-4 text-sm text-amber-300" role="status">
                        This account does not have administrator access.
                    </p>
                )}
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
                        Password
                        <input
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="rounded-lg border border-surface-border bg-surface px-3 py-3 text-white"
                        />
                    </label>
                    {error && (
                        <p role="alert" className="text-sm text-red-300">
                            {error}
                        </p>
                    )}
                    <Button type="submit" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Signing in...' : 'Sign in'}
                    </Button>
                    <p className="text-sm text-slate-400">
                        Need an account?{' '}
                        <Link to="/register" className="text-brand-400 hover:text-brand-300">
                            Register as a user
                        </Link>
                    </p>
                </form>
            </main>
            <Footer />
        </div>
    )
}

export default AdminLoginPage
