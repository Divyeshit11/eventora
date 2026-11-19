import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import authReducer from '../features/auth/authSlice'
import {
    login,
    register,
    requestPasswordReset,
    resetPassword,
} from '../services/eventService'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import ForgotPasswordPage from './ForgotPasswordPage'
import ResetPasswordPage from './ResetPasswordPage'

vi.mock('../services/eventService', () => ({
    login: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
}))

function renderAuthRoute(path, initialEntry = path) {
    const store = configureStore({
        reducer: { auth: authReducer },
    })

    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/" element={<h1>Home page</h1>} />
                    <Route path="/events" element={<h1>Events available</h1>} />
                    <Route path="/manage-events" element={<h1>Event manager</h1>} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    )
}

describe('authentication pages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    it('signs in a regular user, stores the session, and navigates to events', async () => {
        login.mockResolvedValue({
            token: 'user-session-token',
            user: { id: 'user-1', email: 'person@example.com', role: 'user' },
        })
        const user = userEvent.setup()

        renderAuthRoute('/login')
        await user.type(screen.getByLabelText(/email address/i), 'person@example.com')
        await user.type(screen.getByLabelText(/^password$/i), 'abc123')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(await screen.findByRole('heading', { name: 'Events available' })).toBeInTheDocument()
        expect(login).toHaveBeenCalledWith({
            email: 'person@example.com',
            password: 'abc123',
        })
        expect(localStorage.getItem('eventora-auth-token')).toBe('user-session-token')
        expect(JSON.parse(localStorage.getItem('eventora-auth-user'))).toEqual({
            id: 'user-1',
            email: 'person@example.com',
            role: 'user',
        })
    })

    it('does not submit a login password over the backend byte limit', async () => {
        const user = userEvent.setup()

        renderAuthRoute('/login')
        await user.type(screen.getByLabelText(/email address/i), 'person@example.com')
        await user.type(screen.getByLabelText(/^password$/i), 'é'.repeat(37))
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Password must be no more than 72 UTF-8 bytes.',
        )
        expect(login).not.toHaveBeenCalled()
    })

    it('redirects an admin to the protected destination after signing in', async () => {
        login.mockResolvedValue({
            token: 'admin-session-token',
            user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
        })
        const user = userEvent.setup()
        const entry = {
            pathname: '/login',
            state: { from: { pathname: '/manage-events' } },
        }

        renderAuthRoute('/login', entry)
        await user.type(screen.getByLabelText(/email address/i), 'admin@example.com')
        await user.type(screen.getByLabelText(/^password$/i), 'a-valid-password')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(await screen.findByRole('heading', { name: 'Event manager' })).toBeInTheDocument()
    })

    it('requires at least six characters for a new user password', async () => {
        const user = userEvent.setup()

        renderAuthRoute('/register')
        const passwordInput = screen.getByLabelText(/password \(at least 6 characters\)/i)
        expect(passwordInput).toHaveAttribute('minLength', '6')
        await user.type(passwordInput, 'abc12')
        expect(passwordInput).toHaveValue('abc12')
        expect(passwordInput.minLength).toBe(6)
    })

    it('explains an older API password requirement in plain language', async () => {
        register.mockRejectedValue({
            response: {
                data: {
                    message: 'Password must be 12-128 characters and no more than 72 UTF-8 bytes',
                },
            },
        })
        const user = userEvent.setup()

        renderAuthRoute('/register')
        await user.type(screen.getByLabelText(/email address/i), 'person@example.com')
        await user.type(screen.getByLabelText(/password \(at least 6 characters\)/i), 'Gohel@123')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Please use at least 12 characters for your password.',
        )
    })

    it('rejects registration passwords over the backend byte limit', async () => {
        const user = userEvent.setup()

        renderAuthRoute('/register')
        await user.type(screen.getByLabelText(/email address/i), 'person@example.com')
        await user.type(screen.getByLabelText(/^password/i), 'é'.repeat(37))
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Password must be no more than 72 UTF-8 bytes.',
        )
        expect(register).not.toHaveBeenCalled()
    })

    it('creates an account, stores the new session, and signs the user in immediately', async () => {
        register.mockResolvedValue({
            token: 'new-user-session-token',
            user: { id: 'new-user', email: 'person@example.com', role: 'user' },
            message: 'Account created successfully.',
        })
        const user = userEvent.setup()

        renderAuthRoute('/register')
        await user.type(screen.getByLabelText(/email address/i), 'person@example.com')
        await user.type(screen.getByLabelText(/^password/i), 'abc123')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        expect(await screen.findByRole('heading', { name: 'Events available' })).toBeInTheDocument()
        expect(register).toHaveBeenCalledWith({
            email: 'person@example.com',
            password: 'abc123',
        })
        expect(localStorage.getItem('eventora-auth-token')).toBe('new-user-session-token')
        expect(JSON.parse(localStorage.getItem('eventora-auth-user'))).toEqual({
            id: 'new-user',
            email: 'person@example.com',
            role: 'user',
        })
    })

    it('lets users reveal and hide their password while signing up', async () => {
        const user = userEvent.setup()

        renderAuthRoute('/register')
        const passwordInput = screen.getByLabelText(/password \(at least 6 characters\)/i)
        await user.type(passwordInput, 'abc123')
        await user.click(screen.getByRole('button', { name: 'Show password' }))
        expect(passwordInput).toHaveAttribute('type', 'text')
        await user.click(screen.getByRole('button', { name: 'Hide password' }))
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('sends a password reset request without revealing whether the email is registered', async () => {
        requestPasswordReset.mockResolvedValue({
            message: 'If an account exists for that email, a password reset link has been sent.',
        })
        const user = userEvent.setup()

        renderAuthRoute('/forgot-password')
        await user.type(screen.getByLabelText(/email address/i), 'person@example.com')
        await user.click(screen.getByRole('button', { name: 'Send reset link' }))

        expect(await screen.findByRole('status')).toHaveTextContent(
            'If an account exists for that email, a password reset link has been sent.',
        )
        expect(requestPasswordReset).toHaveBeenCalledWith('person@example.com')
    })

    it('resets the password with the link token and returns the user to sign in', async () => {
        resetPassword.mockResolvedValue({
            message: 'Password reset successfully. Please sign in with your new password.',
        })
        const user = userEvent.setup()

        renderAuthRoute('/reset-password', '/reset-password#token=reset-token')
        await user.type(screen.getByLabelText('New password'), 'new-password-123')
        await user.type(screen.getByLabelText('Confirm new password'), 'new-password-123')
        await user.click(screen.getByRole('button', { name: 'Reset password' }))

        expect(await screen.findByRole('heading', { name: 'Sign in to Eventora' })).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveTextContent('Password reset successfully.')
        expect(resetPassword).toHaveBeenCalledWith({
            token: 'reset-token',
            password: 'new-password-123',
        })
    })

    it('does not submit a reset when the confirmation password does not match', async () => {
        const user = userEvent.setup()

        renderAuthRoute('/reset-password', '/reset-password#token=reset-token')
        await user.type(screen.getByLabelText('New password'), 'new-password-123')
        await user.type(screen.getByLabelText('Confirm new password'), 'different-password')
        await user.click(screen.getByRole('button', { name: 'Reset password' }))

        expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
        expect(resetPassword).not.toHaveBeenCalled()
    })

    it('asks for a fresh link when the reset token is missing', () => {
        renderAuthRoute('/reset-password')

        expect(screen.getByRole('alert')).toHaveTextContent(
            'This password reset link is invalid or expired.',
        )
        expect(screen.getByRole('link', { name: 'Request a new reset link' })).toHaveAttribute(
            'href',
            '/forgot-password',
        )
    })
})
