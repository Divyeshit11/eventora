import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import Button from '../Components/common/Button'
import PasswordInput from '../Components/common/PasswordInput'
import PageHeader from '../Components/common/PageHeader'
import Reveal from '../Components/common/Reveal'
import { logout } from '../features/auth/authSlice'
import { changePassword } from '../services/eventService'
import {
    HeartIcon,
    TicketIcon,
    ShieldIcon,
    SettingsIcon,
    ArrowRightIcon,
} from '../Components/common/icons'

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
            <main>
                <PageHeader
                    eyebrow="Account settings"
                    title="My Account"
                    description="Manage your Eventora account and keep your sign-in secure."
                />

                <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <Reveal>
                            <section className="card-surface gradient-border h-full rounded-3xl p-6" aria-labelledby="account-details-heading">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-300 ring-1 ring-brand-500/30">
                                        <SettingsIcon className="h-5 w-5" />
                                    </span>
                                    <h2 id="account-details-heading" className="font-display text-xl font-bold">Profile</h2>
                                </div>
                                <div className="mt-6 flex items-center gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 font-display text-2xl font-extrabold text-white shadow-lg shadow-brand-600/30" aria-hidden="true">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold" title={user?.email}>{user?.email}</p>
                                        <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold capitalize text-brand-300 ring-1 ring-brand-500/30">
                                            {user?.role || 'user'} account
                                        </p>
                                    </div>
                                </div>
                                <dl className="mt-7 space-y-4 border-t border-surface-border/70 pt-6 text-sm">
                                    <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Email</dt><dd className="truncate text-right">{user?.email}</dd></div>
                                    <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Account type</dt><dd className="capitalize">{user?.role || 'user'}</dd></div>
                                </dl>
                                <div className="mt-7 border-t border-surface-border/70 pt-6">
                                    <p className="text-sm font-semibold">Your activity</p>
                                    <div className="mt-3 grid gap-2">
                                        <Link to="/bookings" className="group flex items-center justify-between rounded-xl border border-surface-border px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-500/50 hover:bg-surface-raised">
                                            <span className="inline-flex items-center gap-2"><TicketIcon className="h-4 w-4 text-brand-400" />My bookings</span>
                                            <ArrowRightIcon className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-brand-400" />
                                        </Link>
                                        <Link to="/favorites" className="group flex items-center justify-between rounded-xl border border-surface-border px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-500/50 hover:bg-surface-raised">
                                            <span className="inline-flex items-center gap-2"><HeartIcon className="h-4 w-4 text-pink-400" />Favorites</span>
                                            <ArrowRightIcon className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-brand-400" />
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        </Reveal>

                        <Reveal delay={120}>
                            <section className="card-surface gradient-border h-full rounded-3xl p-6 sm:p-8" aria-labelledby="password-heading">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
                                        <ShieldIcon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h2 id="password-heading" className="font-display text-xl font-bold">Change password</h2>
                                        <p className="mt-0.5 text-sm text-slate-400">For your security, you’ll be signed out after changing your password.</p>
                                    </div>
                                </div>
                                <form onSubmit={handlePasswordChange} className="mt-7 grid gap-5">
                                    <PasswordInput label="Current password" autoComplete="current-password" value={form.currentPassword} onChange={updateField('currentPassword')} />
                                    <PasswordInput label={`New password (at least ${minimumLength} characters)`} autoComplete="new-password" minLength={minimumLength} value={form.newPassword} onChange={updateField('newPassword')} />
                                    <PasswordInput label="Confirm new password" autoComplete="new-password" minLength={minimumLength} value={form.confirmPassword} onChange={updateField('confirmPassword')} />
                                    {message && (
                                        <p role={status === 'failed' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${status === 'failed'
                                            ? 'border-red-800 bg-red-950/30 text-red-300'
                                            : 'border-emerald-800 bg-emerald-950/30 text-emerald-300'}`}>
                                            {message}
                                        </p>
                                    )}
                                    <Button type="submit" disabled={status === 'loading'} className="w-full py-3.5">
                                        {status === 'loading' ? 'Changing password...' : 'Change password'}
                                    </Button>
                                </form>
                            </section>
                        </Reveal>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default AccountPage
