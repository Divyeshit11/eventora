const express = require('express')
const connectDB = require('./config/db')
const eventRoutes = require('./routes/eventRoutes')
const authRoutes = require('./routes/authRoutes')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { bootstrapAdmin } = require('./controllers/authController')
const { getJwtSecret } = require('./middleware/requireAuth')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

function validateProductionConfiguration() {
    if (process.env.NODE_ENV !== 'production') return
    if (!process.env.CLIENT_URL) {
        throw new Error('CLIENT_URL must be configured in production')
    }
    for (const origin of allowedOrigins) {
        const parsedOrigin = new URL(origin)
        if (parsedOrigin.protocol !== 'https:' || parsedOrigin.origin !== origin) {
            throw new Error('Production CLIENT_URL entries must be HTTPS origins without a path')
        }
    }
    if (process.env.TRUST_PROXY === 'true') {
        const hops = Number.parseInt(process.env.TRUST_PROXY_HOPS, 10)
        if (!Number.isInteger(hops) || hops < 1 || hops > 5) {
            throw new Error('TRUST_PROXY_HOPS must be configured from 1 to 5 when enabling TRUST_PROXY')
        }
    }
}

app.disable('x-powered-by')
app.set(
    'trust proxy',
    process.env.TRUST_PROXY === 'true'
        ? Number.parseInt(process.env.TRUST_PROXY_HOPS || '1', 10)
        : false
)
app.use(helmet())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }
        callback(new Error('Origin is not allowed by CORS'))
    },
}))
app.use(express.json({ limit: '1mb' }))
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
}))

app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success:true,
        message: 'Eventora API is running!',
    })
})

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    })
})

app.use((error, req, res, next) => {
    if (res.headersSent) {
        next(error)
        return
    }

    const isCorsError = error.message === 'Origin is not allowed by CORS'
    const status = isCorsError
        ? 403
        : error.type === 'entity.parse.failed'
            ? 400
            : error.type === 'entity.too.large'
                ? 413
                : 500
    res.status(status).json({
        success: false,
        message: isCorsError
            ? 'Origin is not allowed by CORS'
            : status === 400
                ? 'Invalid JSON request body'
                : status === 413
                    ? 'Request body is too large'
                    : 'Internal server error',
    })
})

async function startServer() {
    try {
        validateProductionConfiguration()
        getJwtSecret()
        await connectDB()
        await bootstrapAdmin()

        app.listen(PORT, () => {
            console.log(`Eventora API running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start Eventora API:', error.message)
        process.exit(1)
    }
}

if (require.main === module) {
    startServer()
}

module.exports = { app, startServer }