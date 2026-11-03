const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        tokenVersion: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
