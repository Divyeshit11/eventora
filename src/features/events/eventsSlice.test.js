import { beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

import eventsReducer, { fetchEvents, removeEvent, toggleFavorite } from './eventsSlice'
import { getEvents } from '../../services/eventService'

vi.mock('../../services/eventService', () => ({
  getEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))

describe('eventsSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles favorite ids in state', () => {
    const store = configureStore({ reducer: { events: eventsReducer } })

    store.dispatch(toggleFavorite('evt-1'))
    expect(store.getState().events.favorites).toEqual(['evt-1'])

    store.dispatch(toggleFavorite('evt-1'))
    expect(store.getState().events.favorites).toEqual([])
  })

  it('removes favorite ids when an event is deleted', () => {
    const initialState = eventsReducer(undefined, { type: '@@INIT' })
    const state = {
      ...initialState,
      favorites: ['evt-1', 'evt-2'],
    }

    const nextState = eventsReducer(state, removeEvent('evt-1'))

    expect(nextState.favorites).toEqual(['evt-2'])
  })

  it('loads only the requested page even when the database has many pages', async () => {
    getEvents.mockResolvedValue({
      data: [{ _id: 'evt-1', title: 'First page event' }],
      pagination: {
        currentPage: 1,
        limit: 9,
        totalEvents: 200002,
        totalPages: 22223,
      },
    })
    const store = configureStore({ reducer: { events: eventsReducer } })

    await store.dispatch(fetchEvents({ page: 1, limit: 9 }))

    expect(getEvents).toHaveBeenCalledOnce()
    expect(getEvents).toHaveBeenCalledWith(
      { page: 1, limit: 9 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(store.getState().events.items).toHaveLength(1)
    expect(store.getState().events.pagination.totalEvents).toBe(200002)
  })
})
