import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'error'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: Object,
        default: {}
    }
},{
    timestamps: true
})

export const Notification = mongoose.model("Notification", notificationSchema)