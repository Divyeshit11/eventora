const express = require('express')
const { requireAuth } = require('../middleware/requireAuth')
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/userController')

const router = express.Router()
router.get('/me/favorites', requireAuth, getFavorites)
router.put('/me/favorites/:eventId', requireAuth, addFavorite)
router.delete('/me/favorites/:eventId', requireAuth, removeFavorite)

module.exports = router
