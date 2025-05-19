import Interview from "../models/interview.model"

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

        const recruiterId = user?.id

        const { candidateId, jobId, applicationId, scheduledAt, durationMinutes, status, notes } = req.body

        if([candidateId, recruiterId, jobId, applicationId, scheduledAt, durationMinutes, status, notes].some(
            (field) => (field.trim() === "")
        )){
            return res.status(400).json({message: "All fields are required"})
        }

        const alreadyScheduled = await Interview.findOne({candidateId, jobId})

        if(!alreadyScheduled) {
            return res.status(400).json({message: "Interview is already scheduled for the candidate for this job"})
        }

        const start = new Date(scheduledAt).toISOString()
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000).toISOString()

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

        const response = await fetch(`${process.env.API_GATEWAY_SERVICE}/api/google/calendar`, {
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
            status,
            meetingLink,
            calendarEventId,
            notes
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
            method: "PATCH",
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


export {
    scheduleInterview,
    getInterviewsByRecruiter,
    getInterviewsByCandidate,
    updateInterview
}