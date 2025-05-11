import { User } from "../models/user.model"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log("Something went wrong while generating tokens: ", error)
    }
}

const register = async(req, res) => {
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

const login = async(req, res) => {
    try {
        const { name, email, password } = req.body
        
        if (!(name || email)) {
            return res.status(400).json({message: "username or email is required"})
        }

        const user = await User.findOne({
            $or: [{ name }, { email }]
        })

        if(!user) {
            return res.status(400).json({message: "User not found"})
        }

        const isPasswordCorrect = user.isPasswordCorrect(password)

        if(!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid credentials"})
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
        .status(200)
        .json({message: "User login successful", loggedInUser, accessToken, refreshToken})
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
    } catch (error) {
        console.log("User login failed:", error)
        return res.status(400).json({error: error})
    }
}

const logout = async(req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            { new: true }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .json({message: "User logout successful"})
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
    } catch (error) {
        console.log("User logout failed:", error)
        return res.status(400).json({error: error})
    }
}

const changeCurrentPassword = async(req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user?._id);
    
        const passwordCorrect = await user.isPasswordCorrect(oldPassword)
    
        if (!passwordCorrect) {
            return res.status(400).json({message: "Password is incorrect"})
        }
    
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
    
        return res
            .status(200)
            .json({message: "Password updated successfully"})
    } catch (error) {
        console.log("Password update failed:", error)
        return res.status(400).json({error: error})
    }
}

const refreshAccessToken = async(req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken) {
            return res.status(400).json({message: "Unauthorized accesss"})
        }

        const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodeToken?._id).select(" -password -refreshToken")

        if(!user) {
            return res.status(400).json({message: "Invalid access token"})
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: false,
        }

        return res
        .status(200)
        .json({message: "Refresh access token successful", accessToken, refreshToken})
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
    } catch (error) {
        console.log("Refresh accesss token failed:", error)
        return res.status(400).json({error: error})
    }
}

export {
    register,
    login,
    logout,
    changeCurrentPassword,
    refreshAccessToken
}