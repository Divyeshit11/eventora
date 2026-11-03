const jwt = require('jsonwebtoken')
const User = require('../models/User')

function getJwtSecret() {
    const secret = process.env.JWT_SECRET
    if (secret && secret.length >= 32) return secret

    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be configured with at least 32 characters')
    }

    return 'eventora-development-only-secret-change-before-deploy'
}

async function requireAuth(req, res, next) {
    const authorization = req.get('authorization') || ''
    const [scheme, token] = authorization.split(' ')

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        })
    }

    let payload
    try {
        payload = jwt.verify(token, getJwtSecret(), {
            algorithms: ['HS256'],
            issuer: 'eventora-api',
            audience: 'eventora-client',
        })
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token',
        })
    }

    const user = await User.findById(payload.sub).select('role tokenVersion')
    if (
        !user ||
        user.role !== payload.role ||
        user.tokenVersion !== payload.tokenVersion
    ) {
        return res.status(401).json({
            success: false,
            message: 'Authentication session is no longer valid',
        })
    }

    req.auth = payload
    return next()
}

function requireAdmin(req, res, next) {
    if (req.auth?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Administrator access required',
        })
    }
    return next()
}

module.exports = { getJwtSecret, requireAuth, requireAdmin }
