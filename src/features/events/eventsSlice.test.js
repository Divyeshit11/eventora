import { beforeEach, describe, expect, it } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

import eventsReducer, { removeEvent, toggleFavorite } from './eventsSlice'
import { setupFavoritesPersistence } from '../../app/favoritesPersistence'

describe('eventsSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles favorites and persists them to localStorage', () => {
    const store = configureStore({ reducer: { events: eventsReducer } })
    setupFavoritesPersistence(store)

    store.dispatch(toggleFavorite('evt-1'))
    expect(store.getState().events.favorites).toEqual(['evt-1'])
    expect(JSON.parse(localStorage.getItem('eventora-favorites'))).toEqual(['evt-1'])

    store.dispatch(toggleFavorite('evt-1'))
    expect(store.getState().events.favorites).toEqual([])
    expect(JSON.parse(localStorage.getItem('eventora-favorites'))).toEqual([])
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
})
