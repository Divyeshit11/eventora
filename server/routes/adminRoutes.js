const express = require('express')
const { requireAuth, requireAdmin } = require('../middleware/requireAuth')
const { getUsers, setUserRole, exportSalesReport } = require('../controllers/adminController')

const router = express.Router()
router.use(requireAuth, requireAdmin)
router.get('/users', getUsers)
router.patch('/users/:userId/role', setUserRole)
router.get('/reports/sales.csv', exportSalesReport)

module.exports = router
