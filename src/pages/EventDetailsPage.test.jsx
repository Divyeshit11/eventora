import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EventDetailsPage from './EventDetailsPage'
import { addCartItem } from '../app/cart'

vi.mock('../app/cart', () => ({ addCartItem: vi.fn() }))
vi.mock('../services/eventService', () => ({
    getEventById: vi.fn(),
    getSeatAvailability: vi.fn(),
}))

const event = {
    _id: 'event-1',
    title: 'Mixed tickets event',
    category: 'Music',
    location: 'Local',
    date: '2026-12-01',
    price: 99,
    ticketCapacity: 30,
    ticketsSold: 0,
    seatingEnabled: false,
    ticketTypes: [
        { _id: 'tier-general', name: 'General', price: 99, quantity: 20, sold: 0 },
        { _id: 'tier-vip', name: 'VIP', price: 199, quantity: 10, sold: 0 },
    ],
}

describe('EventDetailsPage ticket selection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('adds multiple ticket types to one cart item for a single checkout', async () => {
        const user = userEvent.setup()
        const store = configureStore({
            reducer: {
                auth: () => ({ user: { id: 'user-1' } }),
                events: () => ({ items: [event] }),
            },
        })

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event-1']}>
                    <Routes>
                        <Route path="/events/:eventId" element={<EventDetailsPage />} />
                        <Route path="/cart" element={<p>Cart reached</p>} />
                    </Routes>
                </MemoryRouter>
            </Provider>,
        )

        await user.selectOptions(screen.getByRole('combobox', { name: 'VIP quantity' }), '1')
        expect(screen.getByText('2 selected · Total ₹298')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Add selected tickets to Cart' }))

        expect(addCartItem).toHaveBeenCalledWith('user-1', expect.objectContaining({
            quantity: 2,
            totalPrice: 298,
            ticketItems: [
                { ticketTypeId: 'tier-general', ticketTypeName: 'General', quantity: 1, unitPrice: 99 },
                { ticketTypeId: 'tier-vip', ticketTypeName: 'VIP', quantity: 1, unitPrice: 199 },
            ],
        }))
        expect(await screen.findByText('Cart reached')).toBeInTheDocument()
    })
})
