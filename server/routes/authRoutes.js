const express = require('express')
const rateLimit = require('express-rate-limit')
const {
    changePassword,
    login,
    register,
    requestPasswordReset,
    resetPassword,
} = require('../controllers/authController')
const { requireAuth } = require('../middleware/requireAuth')

const router = express.Router()
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Try again later.',
    },
})
const passwordResetRequestRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset requests. Try again later.',
    },
})
const passwordResetRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset attempts. Try again later.',
    },
})

router.post('/register', authRateLimit, register)
router.post('/login', authRateLimit, login)
router.post('/forgot-password', passwordResetRequestRateLimit, requestPasswordReset)
router.post('/reset-password', passwordResetRateLimit, resetPassword)
router.post('/change-password', requireAuth, changePassword)

module.exports = router
