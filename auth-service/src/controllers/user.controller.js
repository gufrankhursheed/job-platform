import { User } from "../models/user.model"


const register = async(req, res, next) => {
    try {
        const { name, email, password, role } = req.body

        if ([name, email, password, role].some(
            (field) => (field?.trim() === "")
        )) {
            return res.status(400).json({message: "All fields are required"})
        }

        const userExists = await User.findOne({email})

        if(!userExists) {
            return res.status(400).json({message: "User already exists"})
        }

        const user = await User.create({
            name,
            email,
            password,
            role
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser) {
            return res.status(400).json({message: "User registration failed"})
        }

        return res.status(200).json({message: "User registration successfull"})
    } catch (error) {
        console.log("User registration failed:", error)
        return res.status(400).json({error: error})
    }
}

export {
    register
}