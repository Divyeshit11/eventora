
const { Schema, model } = require('mongoose')

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [160, 'Event title cannot exceed 160 characters'],
    },

    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: ['Technology', 'Music', 'Business', 'Comedy', 'Other'],
    },

    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: [160, 'Event location cannot exceed 160 characters'],
    },

    date: {
      type: String,
      required: [true, 'Event date is required'],
      trim: true,
      validate: {
        validator: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
          !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
          new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value,
        message: 'Event date must be a valid date in YYYY-MM-DD format',
      },
    },

    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: [0, 'Event price cannot be negative'],
    },

    image: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: (value) => !value || /^https?:\/\/\S+$/i.test(value),
        message: 'Event image must be an HTTP or HTTPS URL',
      },
    },

    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [5000, 'Event description cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
  }
)

module.exports = model('Event', eventSchema)
