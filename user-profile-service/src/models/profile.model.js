import mongoose, { Schema } from "mongoose";


const profileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    skills: {
        type: [String]
    },
    location: {
        type: String
    },
    resumeUrl: {
        type: String
    }
}, {
    timestamps: true
})

export const Profile = mongoose.model('Profile', profileSchema)