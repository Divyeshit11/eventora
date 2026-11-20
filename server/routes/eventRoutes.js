
const express = require('express')
const multer = require('multer')
const { requireAuth, requireAdmin, requireOrganizerOrAdmin } = require('../middleware/requireAuth')

const {
    getEvents,
    getPendingEvents,
    getEventById,
    getSeatAvailability,
    createEvent,
    updateEvent,
    deleteEvent,
    setEventModeration,
    getEventSales,
    getEventAttendees,
    exportEventAttendees,
    exportEventsToCsv,
    importEventsFromCsv,
} = require('../controllers/eventController')

const router = express.Router()

const MAX_CSV_FILES = 10
const MAX_CSV_SIZE = 10 * 1024 * 1024

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_CSV_SIZE,
        files: MAX_CSV_FILES,
    },
    fileFilter: (req, file, callback) => {
        if (!/\.csv$/i.test(file.originalname)) {
            callback(new Error('Only .csv files are supported'))
            return
        }
        callback(null, true)
    },
})

function uploadCsv(req,res,next) {
    upload.array('files', MAX_CSV_FILES)(req,res,(error)=>{
        if(error) {
            return res.status(400).json({
                success:false,
                message:
                error.code === 'LIMIT_FILE_SIZE'
                ? 'Each CSV file must be 10 MB or smaller'
                : error.code === 'LIMIT_FILE_COUNT'
                ? `You can upload a maximum of ${MAX_CSV_FILES} CSV files at once`
                : error.message,
            })
        }
        next()
    })
}

router.get('/', requireAuth, getEvents)
router.get('/manage', requireAuth, requireOrganizerOrAdmin, (req, res) => getEvents(req, res, true))
router.get('/pending', requireAuth, requireAdmin, getPendingEvents)
router.post('/', requireAuth, requireOrganizerOrAdmin, createEvent)

router.post('/import-csv', requireAuth, requireAdmin, uploadCsv, importEventsFromCsv)
router.get('/export-csv', requireAuth, requireAdmin, exportEventsToCsv)
router.get('/:id/attendees.csv', requireAuth, requireOrganizerOrAdmin, exportEventAttendees)
router.get('/:id/attendees', requireAuth, requireOrganizerOrAdmin, getEventAttendees)
router.get('/:id/sales', requireAuth, requireOrganizerOrAdmin, getEventSales)
router.patch('/:id/moderation', requireAuth, requireAdmin, setEventModeration)
router.get('/:id/seats', requireAuth, getSeatAvailability)

router.get('/:id', requireAuth, getEventById)
router.put('/:id', requireAuth, requireOrganizerOrAdmin, updateEvent)
router.delete('/:id', requireAuth, requireOrganizerOrAdmin, deleteEvent)

module.exports = router
