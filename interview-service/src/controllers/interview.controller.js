import Interview from "../models/interview.model.js"
import { publishToQueue } from "../utils/rabbitmq.js"

const scheduleInterview = async(req, res) => {
    try {
        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        if (user?.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiter can schedule interview" })
        }

        const recruiterId = user?._id

        const { candidateId, jobId, applicationId, scheduledAt, durationMinutes, notes } = req.body

        if (
            typeof candidateId !== 'string' || candidateId.trim() === "" ||
            typeof recruiterId !== 'string' || recruiterId.trim() === "" ||
            typeof scheduledAt !== 'string' || scheduledAt.trim() === "" ||
            typeof notes !== 'string' || notes.trim() === ""
        ) {
            return res.status(400).json({ message: "All fields are required" });
          }

        if (
            typeof jobId !== 'number' || isNaN(jobId) ||
            typeof applicationId !== 'number' || isNaN(applicationId)
        ) {
            return res.status(400).json({ message: "Job ID, Application ID must be valid numbers" });
          }

        if(jobId == undefined) {
            return res.status(400).json({message: "Job ID is required"})
        }

        if(applicationId == undefined) {
            return res.status(400).json({message: "Application ID is required"})
        }

        const alreadyScheduled = await Interview.findOne({candidateId, jobId})

        if(alreadyScheduled) {
            return res.status(400).json({message: "Interview is already scheduled for the candidate for this job"})
        }

        const startDate = new Date(scheduledAt)
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

        const start = startDate.toISOString()
        const end = endDate.toISOString()

        const eventDetails = {
            summary: "Job Interview",
            description: notes,
            start: {
                dateTime: start,
                timeZone: 'Asia/Kolkata'
            },
            end: {
                dateTime: end,
                timeZone: 'Asia/Kolkata'
            }
        }

        const response = await fetch(`${process.env.API_GATEWAY_SERVICE}/api/auth/google/calendar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: recruiterId,
                eventDetails
            })
        })

        let meetingLink = response.data.hangoutLink 
        let calendarEventId = response.data.id

        const interview = await Interview.create({
            candidateId,
            recruiterId,
            jobId,
            applicationId,
            scheduledAt,
            durationMinutes,
            meetingLink,
            calendarEventId,
            notes
        })

        await publishToQueue({
            userId: candidateId,
            message: `You have an interview scheduled at ${scheduledAt}`,
            type: "info",
            metadata: {
              jobId,
              recruiterId,
              scheduledAt,
              durationMinutes,
              notes
            }
        })

        return res.status(200).json({message: "Interview scheduled", interview})
    } catch (error) {
        console.log("Interview schedule failed:", error)
        return res.status(400).json({error: error})
    }
}

const getInterviewsByRecruiter = async(req, res) => {
    try {
        const { id } = req.params

        if(!id) {
            return res.status(400).json({message: "Recruiter Id is required"})
        }

        const interviews = await Interview.findOne({
            where: {
                recruiterId: id
            }
        })

        if(!interviews) {
            return res.status(400).json({message: "No interviews found"})
        }

        return res.status(200).json({message: "Interview fetched successfully", interviews})
    } catch (error) {
        console.log("Interview fetch failed:", error)
        return res.status(400).json({error: error})
    }
}

const getInterviewsByCandidate = async(req, res) => {
    try {
        const { id } = req.params

        if(!id) {
            return res.status(400).json({message: "Candidate Id is required"})
        }

        const interviews = await Interview.findOne({
            where: {
                candidateId: id
            }
        })

        if(!interviews) {
            return res.status(400).json({message: "No interviews found"})
        }

        return res.status(200).json({message: "Interview fetched successfully", interviews})
    } catch (error) {
        console.log("Interview fetch failed:", error)
        return res.status(400).json({error: error})
    }
}

const updateInterview = async(req, res) => {
    try {
        const { id } = req.params
        const { scheduledAt, durationMinutes, status, notes } = req.body

        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }  

        const user = JSON.parse(userHeader)

        if(user?.role !== "recruiter") {
            return res.status(400).json({ message: "Unauthorized: Only recruiter can update an interview" });
        }

        const interview = await Interview.findByPk(id)

        if(!interview) {
            return res.status(400).json({ message: "Interview not found" })
        }

        const start = new Date(scheduledAt).toISOString()
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000).toISOString()

        const updateDetails = {
            summary: "Job Interview",
            description: notes ? notes : interview.notes,
            start: {
                dateTime: start,
                timeZone: 'Asia/Kolkata'
            },
            end: {
                dateTime: end,
                timeZone: 'Asia/Kolkata'
            }
        }

        await fetch(`${process.env.API_GATEWAY_SERVICE}/api/google/calendar/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: interview.recruiterId,
                updateDetails,
                eventId: interview.calendarEventId
            })
        })

        if (scheduledAt) interview.scheduledAt = scheduledAt
        if (durationMinutes) interview.durationMinutes = durationMinutes
        if (status) interview.status = status
        if(notes) interview.notes = notes

        await interview.save()

        return res.status(200).json({ message: "Interview updated successfully", interview })
    } catch (error) {
        console.log("Interview update failed:", error)
        return res.status(400).json({error: error})
    }
}

const cancelInterview = async(req, res) => {
    try {
        const { id } = req.params

        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }  

        const user = JSON.parse(userHeader)

        if(user?.role !== "recruiter") {
            return res.status(400).json({ message: "Unauthorized: Only recruiter can delete an interview" });
        }

        const interview = await Interview.findByPk(id)

        if(!interview) {
            return res.status(400).json({ message: "Interview not found" })
        }

        await fetch(`${process.env.API_GATEWAY_SERVICE}/api/google/calendar/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: interview.recruiterId,
                eventId: interview.calendarEventId
            })
        })

        await interview.destroy()
  
        return res.status(200).json({ message: "Interview deleted successfully", interview});
    } catch (error) {
        console.log("Interview delete failed:", error)
        return res.status(400).json({error: error})
    }
}
export {
    scheduleInterview,
    getInterviewsByRecruiter,
    getInterviewsByCandidate,
    updateInterview,
    cancelInterview
}