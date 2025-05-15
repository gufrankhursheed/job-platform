import { Router } from "express";
import { oAuth2Client } from "../utils/googleAuth.js";
import { google } from "googleapis";
import { User } from "../models/user.model.js";

const router = Router()

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

router.get("/google", (req, res) => {
    const url = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ['profile', 'email']
    })

    res.redirect(url)
})

router.get("/google/callback", async(req, res) => {
    const code = req.query.code

    if(!code) {
        return res.status(400).json({messsgae: "Missing Code"})
    }

    const { tokens } = await oAuth2Client.getToken(code)
    oAuth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client })
    const { data } = await oauth2.userinfo.get()

    const { email, name } = data

    if(!email || !name) {
        return res.status(400).json({messsgae: "Email or name is missing"})
    }

    let user = await User.findOne({ email })

    if (!user) {
        user = await User.create({
          name,
          email,
          password: "google-oauth",
        });
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
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json({message: "Google auth login successful", loggedInUser, accessToken, refreshToken})
})

export default router