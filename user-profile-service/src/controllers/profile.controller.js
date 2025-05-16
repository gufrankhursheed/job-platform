import { Profile } from "../models/profile.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js"


const createProfile = async(req, res) => {
    try {
        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        const userId = user._id
        
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
            resumeUrl: resumeUrl.url
        })

        return res.status(200).json({message: "User profile is created", profile})
    } catch (error) {
        console.log("User profile creation failed:", error)
        return res.status(400).json({error: error.message})
    }
}

const getUserProfile = async(req, res) => {
    try {
        const userId = req.params

        if(!userId){
            return res.status(400).json({message: "User Id is required"})
        }

        const profile = await Profile.findOne({ userId })

        if(!profile) {
            return res.status(400).json({message: "Profile is missing"})
        }

        return res.status(200).json({message: "Fetched user profile", profile})
    } catch (error) {
        console.log("Fetch user profile failed:", error)
        return res.status(400).json({error: error.message})
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.user?._id

        if (!userId) {
            return res.status(400).json({ message: "User Id is required" })
        }

        const { id } = req.params

        if(id !== userId) {
            return res.status(400).json({ message: "Not authorized to perform this action" })
        }

        const { firstName, lastName, bio, skills, location } = req.body

        const profile = await Profile.findOne({ userId })

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" })
        }

        if (firstName !== undefined) profile.firstName = firstName.trim()
        if (lastName !== undefined) profile.lastName = lastName.trim()
        if (bio !== undefined) profile.bio = bio.trim()
        if (skills !== undefined) profile.skills = skills.split(",").map(skill => skill.trim())
        if (location !== undefined) profile.location = location.trim()

        await profile.save()

        return res.status(200).json({ message: "Profile updated successfully", profile })
    } catch (error) {
        console.log("Profile update failed:", error)
        return res.status(400).json({ error: error.message })
    }
}

const updateResume = async(req, res) => {
    try {
        const userId = req.user?._id

        if (!userId) {
            return res.status(400).json({ message: "User Id is required" })
        }

        const { id } = req.params

        if(id !== userId) {
            return res.status(400).json({ message: "Not authorized to perform this action" })
        }

        const profile = await Profile.findOne({ userId })

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" })
        }

        const resumeLocalPath = req.file?.path

        if(!resumeLocalPath) {
            return res.status(400).json({message: "Resume file is missing"})
        }

        const resumeUrl = await uploadCloudinary(resumeLocalPath)

        if(!resumeUrl) {
            return res.status(400).json({messsage: "Failed to upload file"})
        }
        
        // After integrating AI
        //const { resumeScore } = req.body

        //if(resumeScore !== undefined) profile.resumeScore = Number(resumeScore)

        profile.resumeUrl = resumeUrl

        await profile.save()

        return res.status(200).json({ message: "Resume updated successfully", profile })
    } catch (error) {
        console.log("Resume update failed:", error)
        return res.status(400).json({ error: error.message })
    }
}

const deleteProfile = async(req, res) => {
    try {
        const userId = req.user?._id

        if (!userId) {
            return res.status(400).json({ message: "User Id is required" })
        }

        const { id } = req.params

        if(id !== userId) {
            return res.status(400).json({ message: "Not authorized to perform this action" })
        }
        
        const profile = await Profile.deleteOne({ userId })

        if(!profile) {
            return res.status(400).json({message: "Profile is missing"})
        }

        return res.status(200).json({message: "Deleted user profile", profile})
    } catch (error) {
        console.log("Delete user profile failed:", error)
        return res.status(400).json({error: error.message})
    }
}

export {
    createProfile,
    getUserProfile,
    updateProfile,
    updateResume,
    deleteProfile
}