const { Schema, model } = require('mongoose')

const bookingSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
        quantity: { type: Number, required: true, min: 1, max: 10 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'], default: 'pending' },
        paymentProvider: { type: String, enum: ['razorpay'], default: 'razorpay' },
        razorpayOrderId: { type: String, unique: true, sparse: true },
        razorpayPaymentId: { type: String, unique: true, sparse: true },
        paymentVerifiedAt: Date,
        reservationExpiresAt: { type: Date, index: true },
        ticketCode: { type: String, unique: true, sparse: true },
        confirmationEmailSentAt: Date,
        confirmationEmailInProgressAt: Date,
        reminderEmailSentAt: Date,
        reminderEmailInProgressAt: Date,
    },
    { timestamps: true }
)

bookingSchema.index({ user: 1, createdAt: -1 })

module.exports = model('Booking', bookingSchema)
