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

        const job = await fetch(`http://localhost:5002/api/job/${jobId}`)
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
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
        const page = req.query.page || 1
        const limit = req.query.page || 10
        const offset = (page - 1) * limit

        if(!candidateId) {
            return res.status(400).json({message: "Candidate ID is missing"})
        }

        const { count, rows: applications } = await Application.findAndCountAll({
            where: {
                candidateId: candidateId
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        })

        if (applications.length === 0) {
            return res.status(404).json({ message: "No applications found for this candidate" })
        }

        const enrichedApplications = await Promise.all(applications.map(async(app) => {
            let job = null
            let recruiter = null

            try {
                const jobId = app.jobId
                job = await fetch(`http://localhost:5002/api/job/${jobId}`)
            } catch (error) {
                console.log(`Failed to fetch job ${app.jobId}`, error)
            }

            try {        
                if(job?.employerId) {
                    const recruiterId = job.employerId
                    recruiter = await fetch(`http://localhost:5000/api/user/${recruiterId}}`)
                }
            } catch (error) {
                console.log(`Failed to fetch recruiter`, error)
            }

            return {
                ...app.toJSON(),
                job: job ? {
                    title: job.title,
                    companyName: job.companyName,
                    location: job.location,
                } : null,
                recruiter: recruiter ? {
                    name: recruiter.name,
                    email: recruiter.email,
                } : null,
            }
        }))

        /*const applications = await Application.findAll({
            where: {
                candidateId: candidateId
            }
        })

        if(!applications) {
            return res.status(400).json({message: "No applications found"})
        }*/

        return res.status(200).json({message: "Applications retrieved successfully",
            applications: enrichedApplications,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        })
    } catch (error) {
        console.error("Applications retrieve failed", error)
        return res.status(400).json({ error: error })
    }
}

const getApplicationByIdWithRecruiter = async(req, res) => {
    try {
        const { id } = req.params

        if(!id) {
            return res.status(400).json({message: "Application ID is missing"})
        }

        const application = await Application.findByPk(id)

        if(!application) {
            return res.status(400).json({message: "Application does not exists"})
        }

        const jobId = application.jobId

        const job = await fetch(`http://localhost:5002/api/job/${jobId}`)

        if(!job) {
            return res.status(400).json({message: "Job not found"})
        }

        const recruiterId = job.employerId

        const recruiter = await fetch(`http://localhost:5000/api/user/${recruiterId}}`)

        if(!recruiter) {
            return res.status(400).json({message: "Recruiter not found"})
        }

        return res.status(200).json({message: "Application fetched successsfully", application, recruiter, job})
    } catch (error) {
        console.error("Applications retrieve failed", error)
        return res.status(400).json({ error: error })
    }
}

const getJobApplication = async(req, res) => {
    try {
        const { jobId } = req.params
        const page = req.query.page || 1
        const limit = req.query.page || 10
        const offset = (page - 1) * limit

        if(!jobId) {
            return res.status(400).json({message: "Job ID is missing"})
        }

        const { count, rows: applications } = await Application.findAndCountAll({
            where: {
                jobId: jobId
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        })

        if (applications.length === 0) {
            return res.status(404).json({ message: "No applications found for this job" })
        }

        const enrichedApplications = await Promise.all(applications.map(async(app) => {
            let job = null
            let candidate = null

            try {
                const jobId = app.jobId
                job = await fetch(`http://localhost:5002/api/job/${jobId}`)
            } catch (error) {
                console.log(`Failed to fetch job ${app.jobId}`, error)
            }

            try {
                const candidateId = app.candidateId
                candidate = await fetch(`http://localhost:5001/api/profile/${candidateId}`)
            } catch (error) {
                console.log(`Failed to fetch candidate ${app.candidateId}`, error)
            }

            return {
                ...app.toJSON(),
                job: job ? {
                    title: job.title,
                    companyName: job.companyName,
                    location: job.location,
                } : null,
                candidate: candidate ? candidate : null
            }
        }))



        /*const applications = await Application.findAll({
            where: {
                jobId: jobId
            }
        })

        if(!applications) {
            return res.status(400).json({message: "No applications found for this job"})
        }*/

        return res.status(200).json({message: "Applications retrieved successfully",
            applications: enrichedApplications,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        })
    } catch (error) {
        console.error("Applications retrieve failed", error)
        return res.status(400).json({ error: error })
    }
}

const getApplicationByIdWithCandidate = async(req, res) => {
    try {
        const { id } = req.params

        if(!id) {
            return res.status(400).json({message: "Application ID is missing"})
        }

        const application = await Application.findByPk(id)

        if(!application) {
            return res.status(400).json({message: "Application does not exists"})
        }

        const jobId = application.jobId

        const job = await fetch(`http://localhost:5002/api/job/${jobId}`)

        if(!job) {
            return res.status(400).json({message: "Job not found"})
        }

        const candidateId = application.candidateId

        const candidate = await fetch(`http://localhost:5001/api/profile/${candidateId}`)

        if(!candidate) {
            return res.status(400).json({message: "candidate not found"})
        }

        return res.status(200).json({message: "Application fetched successsfully", application, candidate, job})
    } catch (error) {
        
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
    getApplicationByIdWithRecruiter,
    updateApplication,
    deleteApplication,
    getApplicationByIdWithCandidate
}