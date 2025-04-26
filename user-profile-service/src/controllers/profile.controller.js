import { Profile } from "../models/profile.model"
import { uploadCloudinary } from "../utils/cloudinary"


const createProfile = async(req, res) => {
    try {
        const userId = req.user?._id
        
        if(!userId) {
            return res.status(400).json({message: "User Id is required"})
        }

        const { firstName, lastName, bio, skills, location } = req.body

        if ([firstName, lastName, bio, skills, location].some(
            (field) => (field?.trim() === "")
        )) {
            return res.status(400).json({message: "All fields are required"})
        }

        const profileExists = await Profile.findOne({ userId })

        if(profileExists) {
            return res.status(400).json({message: "User profile already exists"})
        }

        const resumeLocalPath = req.file?.path

        if(!resumeLocalPath) {
            return res.status(400).json({message: "Resume file is missing"})
        }

        const resumeUrl = await uploadCloudinary(resumeLocalPath)

        if(!resumeUrl) {
            return res.status(400).json({messsage: "Failed to upload file"})
        }

        const profile = await Profile.create({
            userId,
            firstName,
            lastName,
            bio,
            skills: skills.split(","),
            location,
            resumeUrl
        })

        return res.status(400).json({message: "User profile is created", profile})
    } catch (error) {
        console.log("User Profile creation failed:", error)
        return res.status(400).json({error: error})
    }
}

export {
    createProfile
}