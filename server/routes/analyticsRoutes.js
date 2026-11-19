const express = require('express')
const { requireAuth, requireAdmin } = require('../middleware/requireAuth')
const { getAdminAnalytics } = require('../controllers/analyticsController')

const router = express.Router()
router.get('/', requireAuth, requireAdmin, getAdminAnalytics)

module.exports = router
