import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login as loginAPI } from '../../services/eventService'

const TOKEN_KEY = 'eventora-auth-token'

function readStoredSession() {
    try {
        const token = localStorage.getItem(TOKEN_KEY)
        const userValue = localStorage.getItem('eventora-auth-user')
        const user = userValue ? JSON.parse(userValue) : null
        if (!token || !user?.id || !user?.role) return null

        const encodedPayload = token.split('.')[1]
        const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')))
        if (payload.exp * 1000 <= Date.now()) return null

        return { token, user }
    } catch {
        return null
    }
}

function clearStoredSession() {
    try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('eventora-auth-user')
    } catch {
        // Storage may be unavailable in private or restricted browser contexts.
    }
}

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const session = await loginAPI(credentials)
            try {
                localStorage.setItem(TOKEN_KEY, session.token)
                localStorage.setItem('eventora-auth-user', JSON.stringify(session.user))
            } catch {
                return rejectWithValue(
                    'Unable to save the sign-in session in this browser.'
                )
            }
            return session.user
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'Unable to sign in'
            )
        }
    }
)

const initialSession = readStoredSession()

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: initialSession?.user ?? null,
        status: 'idle',
        error: null,
    },
    reducers: {
        logout: (state) => {
            clearStoredSession()
            state.user = null
            state.status = 'idle'
            state.error = null
        },
        clearAuthError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.user = action.payload
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload || 'Unable to sign in'
            })
    },
})

export const { logout, clearAuthError } = authSlice.actions
export { TOKEN_KEY, clearStoredSession }
export default authSlice.reducer
