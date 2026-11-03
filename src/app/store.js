import { configureStore } from "@reduxjs/toolkit";
import eventsReducer from '../features/events/eventsSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
    reducer:{
        events:eventsReducer,
        auth:authReducer,
    },
})