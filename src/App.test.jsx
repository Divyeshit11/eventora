import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { getEvents } from './services/eventService'

vi.mock('./services/eventService', () => ({
  getEvents: vi.fn(() => Promise.resolve({ data: [], pagination: { totalPages: 1 } })),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

describe('App routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthenticated admin navigation to the sign-in page', async () => {
    const store = configureStore({
      reducer: {
        auth: (state = { user: null, status: 'idle', error: null }) => state,
        events: (
          state = {
            items: [],
            favorites: [],
            pagination: null,
            status: 'idle',
            error: null,
            createStatus: 'idle',
            createError: null,
            updateStatus: 'idle',
            updateError: null,
            deleteStatus: 'idle',
            deleteError: null,
          },
        ) => state,
      },
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/manage-events']}>
          <App />
        </MemoryRouter>
      </Provider>,
    )

    expect(await screen.findByRole('heading', { name: /administrator sign in/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(getEvents).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 100 }),
      )
    })
  })
})
