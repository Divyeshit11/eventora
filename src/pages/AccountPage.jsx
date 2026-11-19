import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Button from '../Components/common/Button'
import PasswordInput from '../Components/common/PasswordInput'
import { logout } from '../features/auth/authSlice'
import { changePassword } from '../services/eventService'

function AccountPage() {
    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [status, setStatus] = useState('idle')
    const [message, setMessage] = useState('')
    const minimumLength = user?.role === 'admin' ? 12 : 6
    const initials = (user?.email?.[0] || 'U').toUpperCase()

    function updateField(field) {
        return (event) => {
            setForm((current) => ({ ...current, [field]: event.target.value }))
            setMessage('')
        }
    }

    async function handlePasswordChange(event) {
        event.preventDefault()
        if (form.newPassword !== form.confirmPassword) {
            setStatus('failed')
            setMessage('New passwords do not match.')
            return
        }
        if (new TextEncoder().encode(form.newPassword).length > 72) {
            setStatus('failed')
            setMessage('Password must be no more than 72 UTF-8 bytes.')
            return
        }

        setStatus('loading')
        setMessage('')
        try {
            const response = await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            })
            dispatch(logout())
            navigate('/login', {
                replace: true,
                state: { notice: response.message || 'Password changed. Please sign in again.' },
            })
        } catch (error) {
            setStatus('failed')
            setMessage(error.response?.data?.message || error.message || 'Unable to change password.')
        }
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">Account settings</p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">My Account</h1>
                <p className="mt-3 max-w-2xl text-slate-400">Manage your Eventora account and keep your sign-in secure.</p>

                <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                    <section className="rounded-2xl border border-surface-border bg-surface-card p-6" aria-labelledby="account-details-heading">
                        <h2 id="account-details-heading" className="text-xl font-semibold">Profile</h2>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold" aria-hidden="true">{initials}</div>
                            <div className="min-w-0">
                                <p className="truncate font-semibold" title={user?.email}>{user?.email}</p>
                                <p className="mt-1 text-sm capitalize text-slate-400">{user?.role || 'user'} account</p>
                            </div>
                        </div>
                        <dl className="mt-7 space-y-4 border-t border-surface-border pt-6 text-sm">
                            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Email</dt><dd className="truncate text-right">{user?.email}</dd></div>
                            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Account type</dt><dd className="capitalize">{user?.role || 'user'}</dd></div>
                        </dl>
                        <div className="mt-7 border-t border-surface-border pt-6">
                            <p className="text-sm font-semibold">Your activity</p>
                            <div className="mt-3 flex flex-wrap gap-3">
                                <Link to="/bookings" className="rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">My bookings</Link>
                                <Link to="/favorites" className="rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">Favorites</Link>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-surface-border bg-surface-card p-6" aria-labelledby="password-heading">
                        <h2 id="password-heading" className="text-xl font-semibold">Change password</h2>
                        <p className="mt-2 text-sm text-slate-400">For your security, you’ll be signed out after changing your password.</p>
                        <form onSubmit={handlePasswordChange} className="mt-6 grid gap-5">
                            <PasswordInput label="Current password" autoComplete="current-password" value={form.currentPassword} onChange={updateField('currentPassword')} />
                            <PasswordInput label={`New password (at least ${minimumLength} characters)`} autoComplete="new-password" minLength={minimumLength} value={form.newPassword} onChange={updateField('newPassword')} />
                            <PasswordInput label="Confirm new password" autoComplete="new-password" minLength={minimumLength} value={form.confirmPassword} onChange={updateField('confirmPassword')} />
                            {message && <p role={status === 'failed' ? 'alert' : 'status'} className="text-sm text-red-300">{message}</p>}
                            <Button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Changing password...' : 'Change password'}</Button>
                        </form>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default AccountPage
