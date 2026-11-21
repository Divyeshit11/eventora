
const { Schema, model } = require('mongoose')

const ticketTypeSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 100000 },
  sold: { type: Number, default: 0, min: 0 },
})

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
    venueAddress: { type: String, default: '', trim: true, maxlength: 500 },
    venueContact: { type: String, default: '', trim: true, maxlength: 160 },
    ticketTypes: {
      type: [ticketTypeSchema],
      default: undefined,
      validate: {
        validator: (types) => !types || (types.length > 0 && new Set(types.map((type) => type.name.toLowerCase())).size === types.length),
        message: 'Add at least one ticket type and use unique names',
      },
    },
    status: {
      type: String,
      enum: ['pending_approval', 'published', 'rejected', 'suspended'],
      default: 'pending_approval',
      index: true,
    },
    moderationNote: { type: String, default: '', trim: true, maxlength: 1000 },

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
    sessions: [{
      date: {
        type: String,
        trim: true,
        validate: {
          validator: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)),
          message: 'Session date must be a valid date in YYYY-MM-DD format',
        },
      },
      label: { type: String, trim: true, maxlength: 80 },
    }],
    seatingEnabled: { type: Boolean, default: false },
    seatRows: { type: Number, default: 0, min: 0, max: 26 },
    seatsPerRow: { type: Number, default: 0, min: 0, max: 50 },

    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: [0, 'Event price cannot be negative'],
    },

    ticketCapacity: {
      type: Number,
      default: 100,
      min: [1, 'Ticket capacity must be at least 1'],
      max: [100000, 'Ticket capacity cannot exceed 100000'],
    },

    ticketsSold: {
      type: Number,
      default: 0,
      min: 0,
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

eventSchema.index({ createdAt: -1 })

module.exports = model('Event', eventSchema)
