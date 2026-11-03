const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { getJwtSecret } = require('../middleware/requireAuth')

const PASSWORD_MIN_LENGTH = 12

function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function createToken(user) {
    return jwt.sign(
        { role: user.role, tokenVersion: user.tokenVersion ?? 0 },
        getJwtSecret(),
        {
            algorithm: 'HS256',
            subject: String(user._id),
            issuer: 'eventora-api',
            audience: 'eventora-client',
            expiresIn: '8h',
        }
    )
}

async function register(req, res) {
    const email = normalizeEmail(req.body?.email)
    const password = req.body?.password
    const configuredAdminEmail = normalizeEmail(process.env.ADMIN_EMAIL)

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'A valid email address is required',
        })
    }

    if (
        typeof password !== 'string' ||
        password.length < PASSWORD_MIN_LENGTH ||
        password.length > 128 ||
        Buffer.byteLength(password, 'utf8') > 72
    ) {
        return res.status(400).json({
            success: false,
            message: `Password must be ${PASSWORD_MIN_LENGTH}-128 characters and no more than 72 UTF-8 bytes`,
        })
    }
    if (email === configuredAdminEmail) {
        return res.status(409).json({
            success: false,
            message: 'This email is reserved for the configured administrator',
        })
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12)
        const user = await User.create({ email, passwordHash })
        return res.status(201).json({
            success: true,
            message: 'Account created. Administrator approval is required to manage events.',
            data: { id: String(user._id), email: user.email, role: user.role },
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An account with that email already exists',
            })
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message,
            })
        }
        console.error('Registration failed:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Unable to create account',
        })
    }
}

async function login(req, res) {
    const email = normalizeEmail(req.body?.email)
    const password = req.body?.password

    if (
        !email ||
        typeof password !== 'string' ||
        password.length > 128 ||
        Buffer.byteLength(password, 'utf8') > 72
    ) {
        return res.status(400).json({
            success: false,
            message: 'Valid email and password are required',
        })
    }

    try {
        const user = await User.findOne({ email }).select('+passwordHash')
        const isValidPassword = user
            ? await bcrypt.compare(password, user.passwordHash)
            : false

        if (!user || !isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                token: createToken(user),
                user: {
                    id: String(user._id),
                    email: user.email,
                    role: user.role,
                },
            },
        })
    } catch (error) {
        console.error('Login failed:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Unable to sign in',
        })
    }
}

async function changePassword(req, res) {
    const currentPassword = req.body?.currentPassword
    const newPassword = req.body?.newPassword

    if (
        typeof currentPassword !== 'string' ||
        typeof newPassword !== 'string' ||
        newPassword.length < PASSWORD_MIN_LENGTH ||
        newPassword.length > 128 ||
        Buffer.byteLength(newPassword, 'utf8') > 72
    ) {
        return res.status(400).json({
            success: false,
            message: `New password must be ${PASSWORD_MIN_LENGTH}-128 characters and no more than 72 UTF-8 bytes`,
        })
    }

    try {
        const user = await User.findById(req.auth.sub).select('+passwordHash')
        if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            })
        }

        user.passwordHash = await bcrypt.hash(newPassword, 12)
        user.tokenVersion += 1
        await user.save()
        return res.status(200).json({
            success: true,
            message: 'Password changed. Sign in again with your new password.',
        })
    } catch (error) {
        console.error('Password change failed:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Unable to change password',
        })
    }
}

async function bootstrapAdmin() {
    const email = normalizeEmail(process.env.ADMIN_EMAIL)
    const password = process.env.ADMIN_PASSWORD

    if (!email && !password) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in production')
        }
        console.warn('Admin account not bootstrapped; set ADMIN_EMAIL and ADMIN_PASSWORD to enable event management')
        return
    }

    if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== 'string' ||
        password.length < PASSWORD_MIN_LENGTH ||
        password.length > 128
    ) {
        throw new Error(`Configure a valid ADMIN_EMAIL and an ADMIN_PASSWORD of ${PASSWORD_MIN_LENGTH}-128 characters`)
    }

    const existing = await User.findOne({ email }).select('+passwordHash')
    if (existing) {
        if (existing.role !== 'admin') {
            throw new Error('Configured ADMIN_EMAIL belongs to a non-admin user; promote it through a secure maintenance process')
        }
        return
    }

    await User.create({
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'admin',
    })
    console.log('Initial administrator account created')
}

module.exports = { bootstrapAdmin, changePassword, login, register }
