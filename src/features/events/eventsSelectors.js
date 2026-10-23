import { createSelector } from '@reduxjs/toolkit'

export const selectAllEvents = (state) => state.events.items

export const selectEventCount = (state) =>
    state.events.items.length

export const selectEventById = (state, eventId) =>
    state.events.items.find(
        (event) => String(event.id) === String(eventId)
    )

export const selectFavoriteIds = (state) =>
    state.events.favorites

export const selectFavoriteEvents = createSelector(
    [selectAllEvents, selectFavoriteIds],
    (items, favorites) =>
        items.filter((event) =>
            favorites.some((id) => String(id) === String(event.id))
        )
)