const mongoose = require('mongoose')

async function connectDB() {
    const mongoURI = process.env.MONGODB_URI
    const databaseName = process.env.MONGODB_DB || 'eventora'

    if (!mongoURI) {
        throw new Error (`MONGODB_URI is missing from .env`)
    }

    await mongoose.connect(mongoURI, { dbName: databaseName })

    console.log(`MongoDB connected successfully to ${databaseName}`)
}

module.exports = connectDB