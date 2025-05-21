import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    senderId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    delivered: {
        type: Boolean,
        default: false
    },
    seen: {
        type: Boolean,
        default: false
    }
    }, 
    {
    timestamps: true
    }
)

export const Message = mongoose.model("Message", messageSchema)