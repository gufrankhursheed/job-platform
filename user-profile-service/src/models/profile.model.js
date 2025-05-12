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
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    resumeUrl: {
        type: String,
        required: true
    },
    resumeScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
}, {
    timestamps: true
})

export const Profile = mongoose.model('Profile', profileSchema)