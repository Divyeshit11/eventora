
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import {
    getEvents,
    createEvent as createEventAPI,
    updateEvent as updateEventAPI,
    deleteEvent as deleteEventAPI,
} from '../../services/eventService'

// Load favorites from localStorage
function loadFavorites() {
    try {
        const savedFavorites = localStorage.getItem('eventora-favorites')
        const favorites = savedFavorites
            ? JSON.parse(savedFavorites)
            : []

        return Array.isArray(favorites) ? favorites : []
    } catch {
        return []
    }
}

// FETCH EVENTS
export const fetchEvents = createAsyncThunk(
    'events/fetchEvents',
    async (params = {}, { rejectWithValue, signal }) => {
        try {
            const query = {
                ...params,
                page: params.page ?? 1,
                limit: params.limit ?? 9,
            }
            const response = await getEvents(query, { signal })
            const items = Array.isArray(response)
                ? [...response]
                : Array.isArray(response.data)
                    ? [...response.data]
                    : []
            const pagination = response.pagination ?? null

            return {
                items,
                pagination,
            }
        } catch (error) {
            if (signal.aborted) throw error
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'Failed to load events'
            )
        }
    }
)

export const updateEventThunk = createAsyncThunk(
    'events/updateEvent',
    async ({ id, eventData }, { rejectWithValue }) => {
        try {
            return await updateEventAPI(id, eventData)
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'Failed to update event'
            )
        }
    }
)

// CREATE EVENT
export const createEventThunk = createAsyncThunk(
    'events/createEvent',
    async (eventData, { rejectWithValue }) => {
        try {
            return await createEventAPI(eventData)
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'Failed to create event'
            )
        }
    }
)

// DELETE EVENT
export const deleteEventThunk = createAsyncThunk(
    'events/deleteEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            await deleteEventAPI(eventId)
            return eventId
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'Failed to delete event'
            )
        }
    }
)

// EVENTS SLICE
const eventsSlice = createSlice({
    name: 'events',

    initialState: {
        items: [],
        favorites: loadFavorites(),
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

    reducers: {
        addEvent: (state, action) => {
            state.items.push(action.payload)
        },

        removeEvent: (state, action) => {
            const previousCount = state.items.length
            state.items = state.items.filter(
                (event) =>
                    String(event._id ?? event.id) !==
                    String(action.payload)
            )
            if (state.pagination && state.items.length < previousCount) {
                state.pagination.totalEvents = Math.max(
                    0,
                    state.pagination.totalEvents - 1
                )
                state.pagination.totalPages = Math.ceil(
                    state.pagination.totalEvents / state.pagination.limit
                )
            }

            state.favorites = state.favorites.filter(
                (id) => String(id) !== String(action.payload)
            )
        },

        toggleFavorite: (state, action) => {
            const eventId = action.payload

            const alreadyFavorite = state.favorites.some(
                (id) => String(id) === String(eventId)
            )

            if (alreadyFavorite) {
                state.favorites = state.favorites.filter(
                    (id) => String(id) !== String(eventId)
                )
            } else {
                state.favorites.push(eventId)
            }
        },
    },

    extraReducers: (builder) => {
        builder

            // FETCH EVENTS
            .addCase(fetchEvents.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })

            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload.items
                state.pagination = action.payload.pagination
            })

            .addCase(fetchEvents.rejected, (state, action) => {
                if (action.meta.aborted) return
                state.status = 'failed'
                state.error =
                    action.payload || 'Failed to load events'
            })

            // CREATE EVENT
            .addCase(createEventThunk.pending, (state) => {
                state.createStatus = 'loading'
                state.createError = null
            })

            .addCase(createEventThunk.fulfilled, (state, action) => {
                state.createStatus = 'succeeded'
                if (!state.pagination || state.pagination.currentPage === 1) {
                    state.items.unshift(action.payload)
                }
                if (state.pagination) {
                    state.pagination.totalEvents += 1
                    state.pagination.totalPages = Math.ceil(
                        state.pagination.totalEvents / state.pagination.limit
                    )
                }
            })

            .addCase(createEventThunk.rejected, (state, action) => {
                state.createStatus = 'failed'
                state.createError =
                    action.payload || 'Failed to create event'
            })

            .addCase(updateEventThunk.pending, (state) => {
                state.updateStatus = 'loading'
                state.updateError = null
            })

            .addCase(updateEventThunk.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded'
                const updatedId = String(action.payload._id ?? action.payload.id)
                const index = state.items.findIndex(
                    (event) => String(event._id ?? event.id) === updatedId
                )
                if (index !== -1) state.items[index] = action.payload
            })

            .addCase(updateEventThunk.rejected, (state, action) => {
                state.updateStatus = 'failed'
                state.updateError =
                    action.payload || 'Failed to update event'
            })

            // DELETE EVENT
            .addCase(deleteEventThunk.pending, (state) => {
                state.deleteStatus = 'loading'
                state.deleteError = null
            })

            .addCase(deleteEventThunk.fulfilled, (state, action) => {
                state.deleteStatus = 'succeeded'

                const previousCount = state.items.length
                state.items = state.items.filter(
                    (event) =>
                        String(event._id ?? event.id) !==
                        String(action.payload)
                )
                if (state.pagination && state.items.length < previousCount) {
                    state.pagination.totalEvents = Math.max(
                        0,
                        state.pagination.totalEvents - 1
                    )
                    state.pagination.totalPages = Math.ceil(
                        state.pagination.totalEvents / state.pagination.limit
                    )
                }

                state.favorites = state.favorites.filter(
                    (id) => String(id) !== String(action.payload)
                )
            })

            .addCase(deleteEventThunk.rejected, (state, action) => {
                state.deleteStatus = 'failed'
                state.deleteError =
                    action.payload || 'Failed to delete event'
            })
    },
})

export const {
    addEvent,
    removeEvent,
    toggleFavorite,
} = eventsSlice.actions

export default eventsSlice.reducer
