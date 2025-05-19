import { google } from "googleapis"
import { User } from "../models/user.model"
import { oAuth2Client } from "../utils/googleAuth"

const createCalendarEvent = async(req, res) => {
    try {
        const { userId, eventDetails } = req.body

        if(!userId || !eventDetails){
            return res.status(400).json({ message: "Missing userId or event details" })
        }

        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({ message: "User not found" })
        }

        if(!user.google?.accessToken || !user.google.refreshToken) {
            return res.status(400).json({ message: "User not connected to google" })
        }

        oAuth2Client.setCredentials({
            access_token: user.google.accessToken,
            refresh_token: user.google.refreshToken
        })

        const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

        const response = await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: 1,
            requestBody: {
                ...eventDetails,
                conferenceData: {
                    createRequest: {
                      requestId: `meet-${Date.now()}`,
                      conferenceSolutionKey: {
                        type: "hangoutsMeet"
                      }
                    }
                }
            }
        })

        return res.status(200).json({ message: "Calendar event created", data: response.data})
    } catch (error) {
        console.log("Calendar event creation failed:", error)
        return res.status(400).json({error: error})
    }
}

const updateCalendarEvent = async(req, res) => {
    try {
        const { userId, updatedDetails, eventId } = req.body

        if(!userId || !updatedDetails){
            return res.status(400).json({ message: "Missing userId or event details" })
        }

        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({ message: "User not found" })
        }

        if(!user.google?.accessToken || !user.google.refreshToken) {
            return res.status(400).json({ message: "User not connected to google" })
        }

        if(!eventId){
            return res.status(400).json({ message: "Calendar Event Id is missing" })
        }

        oAuth2Client.setCredentials({
            access_token: user.google.accessToken,
            refresh_token: user.google.refreshToken
        })

        const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

        const response = await calendar.events.update({
            calendarId: "primary",
            eventId: eventId,
            requestBody: {
                ...updatedDetails,
            }
        })

        return res.status(200).json({ message: "Calendar event updated", data: response.data})
    } catch (error) {
        console.log("Calendar event update failed:", error)
        return res.status(400).json({error: error})
    }
}

const deleteCalendarEvent = async(req, res) => {
    try {
        const { userId, eventId } = req.body

        if(!userId){
            return res.status(400).json({ message: "Missing userId or event details" })
        }

        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({ message: "User not found" })
        }

        if(!user.google?.accessToken || !user.google.refreshToken) {
            return res.status(400).json({ message: "User not connected to google" })
        }

        if(!eventId){
            return res.status(400).json({ message: "Calendar Event Id is missing" })
        }

        oAuth2Client.setCredentials({
            access_token: user.google.accessToken,
            refresh_token: user.google.refreshToken
        })

        const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

        const response = await calendar.events.delete({
            calendarId: 'primary',
            eventId: calendarEventId
        })

        return res.status(200).json({ message: "Calendar event deleted", data: response.data})
    } catch (error) {
        console.log("Calendar event delete failed:", error)
        return res.status(400).json({error: error})
    }
}

export {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
}