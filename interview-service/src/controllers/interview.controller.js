import Interview from "../models/interview.model"

const scheduleInterview = async(req, res) => {
    try {
        const { candidateId, recruiterId, jobId, applicationId, scheduledAt, durationMinutes, status, notes } = req.body

        if([candidateId, recruiterId, jobId, applicationId, scheduledAt, durationMinutes, status, notes].some(
            (field) => (field.trim() === "")
        )){
            return res.status(400).json({message: "All fields are required"})
        }

        const alreadyScheduled = await Interview.findOne({candidateId, jobId})

        if(!alreadyScheduled) {
            return res.status(400).json({message: "Interview is already scheduled for the candidate for this job"})
        }

        const interview = await Interview.create({
            candidateId,
            recruiterId,
            jobId,
            applicationId,
            scheduledAt,
            durationMinutes,
            status,
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


export {
    scheduleInterview,
    getInterviewsByRecruiter,
    getInterviewsByCandidate
}