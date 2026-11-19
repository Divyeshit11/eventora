const mongoose = require('mongoose')
const User = require('../models/User')
const Event = require('../models/Event')

async function getFavorites(req, res) {
    try {
        const user = await User.findById(req.auth.sub).select('favoriteEvents').lean()
        return res.json({ success: true, data: user?.favoriteEvents?.map(String) || [] })
    } catch (error) {
        console.error('Failed to load favorites:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to load favorites' })
    }
}

async function addFavorite(req, res) {
    const { eventId } = req.params
    if (!mongoose.isValidObjectId(eventId)) return res.status(400).json({ success: false, message: 'Invalid event ID' })
    try {
        if (!await Event.exists({ _id: eventId })) return res.status(404).json({ success: false, message: 'Event not found' })
        await User.updateOne({ _id: req.auth.sub }, { $addToSet: { favoriteEvents: eventId } })
        return res.json({ success: true, data: { eventId } })
    } catch (error) {
        console.error('Failed to save favorite:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to save favorite' })
    }
}

async function removeFavorite(req, res) {
    const { eventId } = req.params
    if (!mongoose.isValidObjectId(eventId)) return res.status(400).json({ success: false, message: 'Invalid event ID' })
    try {
        await User.updateOne({ _id: req.auth.sub }, { $pull: { favoriteEvents: eventId } })
        return res.json({ success: true, data: { eventId } })
    } catch (error) {
        console.error('Failed to remove favorite:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to remove favorite' })
    }
}

module.exports = { getFavorites, addFavorite, removeFavorite }
