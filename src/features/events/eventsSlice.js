import { createSlice } from "@reduxjs/toolkit";
import initialEvents from "../../data/events"

function loadFavorites() {
    try {
        const savedFavorites = localStorage.getItem('eventora-favorites')

        const favorites = savedFavorites ? JSON.parse(savedFavorites) : []

        return Array.isArray(favorites) ? favorites : []
    } catch {
        return []
    }
}

const eventsSlice = createSlice({
    name:'events',

    initialState: {
        items: initialEvents,
        favorites: loadFavorites(),
    },

    reducers:{
        addEvent:(state,action) => {
            state.items.push(action.payload)
        },

        removeEvent:(state,action)=> {
            state.items = state.items.filter(
                (event)=> String(event.id) !== String(action.payload)
            )

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
})
export const { addEvent, removeEvent, toggleFavorite } = eventsSlice.actions

export default eventsSlice.reducer