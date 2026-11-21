import { useState } from 'react'
import Navbar from '../Components/layout/Navbar'
import Footer from '../Components/layout/Footer'
import PageHeader from '../Components/common/PageHeader'
import Button from '../Components/common/Button'
import { checkInTicket } from '../services/eventService'
import { CheckIcon, TicketIcon } from '../Components/common/icons'

function CheckInPage() {
    const [ticketCode, setTicketCode] = useState('')
    const [state, setState] = useState({ status: 'idle', message: '', booking: null })

    async function submit(event) {
        event.preventDefault()
        setState({ status: 'loading', message: '', booking: null })
        try {
            const response = await checkInTicket(ticketCode)
            setState({ status: 'succeeded', message: response.message, booking: response.data })
            setTicketCode('')
        } catch (error) {
            setState({
                status: 'failed',
                message: error.response?.data?.message || 'Unable to check in ticket',
                booking: error.response?.data?.data || null,
            })
        }
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main>
                <PageHeader
                    eyebrow="Event operations"
                    title={<>Welcome them <span className="text-gradient">in.</span></>}
                    description="Scan a guest's QR code or enter their ticket code to verify admission."
                    align="center"
                />
                <div className="mx-auto max-w-xl px-4 pb-20 sm:px-6">
                    <form onSubmit={submit} className="card-surface gradient-border rounded-3xl p-6 sm:p-8">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-400/[0.1] text-brand-200 ring-1 ring-brand-300/15">
                            <TicketIcon className="h-7 w-7" />
                        </div>
                        <label className="mt-7 grid gap-2 text-sm font-medium text-slate-300">
                            Ticket code
                            <input
                                autoFocus
                                value={ticketCode}
                                onChange={(event) => setTicketCode(event.target.value.toUpperCase())}
                                placeholder="EVT-XXXXXXXX"
                                className="field py-4 text-center font-mono text-lg tracking-[0.16em]"
                                required
                            />
                        </label>
                        <Button type="submit" disabled={state.status === 'loading'} className="mt-5 w-full">
                            {state.status === 'loading' ? 'Verifying ticket...' : 'Check in attendee'}
                        </Button>
                        {state.message && (
                            <p
                                role={state.status === 'failed' ? 'alert' : 'status'}
                                className={`mt-4 rounded-xl border p-4 text-sm ${state.status === 'failed'
                                    ? 'border-red-400/20 bg-red-400/[0.07] text-red-300'
                                    : 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'}`}
                            >
                                {state.status === 'succeeded' && <CheckIcon className="mr-2 inline h-4 w-4" />}
                                {state.message}
                                {state.booking && (
                                    <span className="mt-1 block text-slate-300">
                                        {state.booking.event?.title} · {state.booking.quantity} ticket(s)
                                    </span>
                                )}
                            </p>
                        )}
                    </form>
                    <p className="mt-5 text-center text-xs text-slate-500">
                        Check-in details update the attendee record immediately.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default CheckInPage
