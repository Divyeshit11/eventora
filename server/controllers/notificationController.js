const { sendEventReminders } = require('../services/notificationService')

async function runEventReminders(req, res) {
    const secret = process.env.CRON_SECRET
    if (!secret || req.get('authorization') !== `Bearer ${secret}`) return res.status(401).json({ success: false, message: 'Unauthorized' })
    try {
        return res.json({ success: true, data: await sendEventReminders() })
    } catch (error) {
        console.error('Event reminder run failed:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to send event reminders' })
    }
}

module.exports = { runEventReminders }
