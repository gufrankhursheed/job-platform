import Application from "../models/application.model.js"

const applyJob = async(req, res) => {
    try {
        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        if (user?.role !== "candidate") {
            return res.status(403).json({ message: "Only candidates can apply to jobs" })
        }

        const candidateId = user?._id

        const { jobId } = req.body

        if(!candidateId || !jobId) {
            return res.status(400).json({message: "Information missing"})
        }

        const applied = await Application.findOne({
            where: {
                candidateId: candidateId,
                jobId: jobId
            }
        })

        if(applied) {
            return res.status(400).json({message: "Candidate has already applied to this job"})
        }

        const application = await Application.create({
            candidateId,
            jobId
        })

        return res.status(200).json({message: "Application submitted", application})
    } catch (error) {
        console.log("Application submission failed:", error)
        return res.status(400).json({ error: error })
    }
}

const getCandidateApplication = async(req, res) => {
    try {
        const { candidateId } = req.params

        if(!candidateId) {
            return res.status(400).json({message: "Candidate ID is missing"})
        }

        const applications = await Application.findAll({
            where: {
                candidateId: candidateId
            }
        })

        if(!applications) {
            return res.status(400).json({message: "No applications found"})
        }

        return res.status(200).json({message: "Applications retrieved successfully", applications})
    } catch (error) {
        console.error("Applications retrieve failed", error)
        return res.status(400).json({ error: error })
    }
}

const getJobApplication = async(req, res) => {
    try {
        const { jobId } = req.params

        if(!jobId) {
            return res.status(400).json({message: "Job ID is missing"})
        }

        const applications = await Application.findAll({
            where: {
                jobId: jobId
            }
        })

        if(!applications) {
            return res.status(400).json({message: "No applications found for this job"})
        }

        return res.status(200).json({message: "Applications retrieved successfully", applications})
    } catch (error) {
        console.error("Applications retrieve failed", error)
        return res.status(400).json({ error: error })
    }
}

const updateApplication = async(req, res) => {
    try {
        const { id } = req.params

        if(!id) {
            return res.status(400).json({message: "Application id is required"})
        }

        const { status } = req.body

        if(!status) {
            return res.status(400).json({message: "Status is required"})
        }

        const application = await Application.findByPk(id)

        if(!application) {
            return res.status(400).json({message: "Application does not exists"})
        }

        if(status !== undefined) application.status = status.trim()
            
        await application.save()

        return res.status(200).json({ message: "Application updated successfully", application })
    } catch (error) {
        console.log("Application update failed:", error);
        return res.status(400).json({ error: error });
    }
}

const deleteApplication = async(req, res) => {
    try {
        const { id } = req.params

        if(!id) {
            return res.status(400).json({message: "Application id is required"})
        }

        const application = await Application.findByPk(id)

        if(!application) {
            return res.status(400).json({message: "Application does not exists"})
        }

        await application.destroy()

        return res.status(200).json({ message: "Application deleted successfully", application});
    } catch (error) {
        console.log("Application delete failed:", error);
        return res.status(400).json({ error: error });
    }
}

export {
    applyJob,
    getCandidateApplication,
    getJobApplication,
    updateApplication,
    deleteApplication
}