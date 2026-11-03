
const express = require('express')
const multer = require('multer')
const { requireAuth, requireAdmin } = require('../middleware/requireAuth')

const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    exportEventsToCsv,
    importEventsFromCsv,
} = require('../controllers/eventController')

const router = express.Router()

const MAX_CSV_FILES = 5
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

router.get('/', getEvents)
router.post('/', requireAuth, requireAdmin, createEvent)

router.post('/import-csv', requireAuth, requireAdmin, uploadCsv, importEventsFromCsv)
router.get('/export-csv', requireAuth, requireAdmin, exportEventsToCsv)

router.get('/:id', getEventById)
router.put('/:id', requireAuth, requireAdmin, updateEvent)
router.delete('/:id', requireAuth, requireAdmin, deleteEvent)

module.exports = router