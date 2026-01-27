import Application from "../models/application.model.js"
import { publishToQueue } from "../utils/rabbitmq.js"

const applyJob = async (req, res) => {
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

        if (!candidateId || !jobId) {
            return res.status(400).json({ message: "Information missing" })
        }

        const jobRes = await fetch(`http://localhost:5002/api/job/${jobId}`)

        if (!jobRes) {
            return res.status(404).json({ message: "Job not found" })
        }

        const jobData = await jobRes.json()
        const job = jobData.job

        const applied = await Application.findOne({
            where: {
                candidateId: candidateId,
                jobId: jobId
            }
        })

        if (applied) {
            return res.status(400).json({ message: "Candidate has already applied to this job" })
        }

        const application = await Application.create({
            candidateId,
            jobId
        })

        await publishToQueue({
            userId: job.employerId,
            type: "info",
            message: `${candidateId} applied to your job: ${job.title}`,
            metadata: {
                entity: "application",
                candidateId,
                jobId,
                applicationId: application._id
            }
        })

        return res.status(200).json({ message: "Application submitted", application })
    } catch (error) {
        console.log("Application submission failed:", error)
        return res.status(400).json({ error: error })
    }
}

const getCandidateApplication = async (req, res) => {
    try {
        const { candidateId } = req.params
        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 10
        const offset = (page - 1) * limit

        if (!candidateId) {
            return res.status(400).json({ message: "Candidate ID is missing" })
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

        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            let job = null
            let recruiter = null

            try {
                const jobId = app.jobId
                const jobRes = await fetch(`http://localhost:5002/api/job/${jobId}`)
                const jobData = await jobRes.json()
                job = jobData.job
            } catch (error) {
                console.log(`Failed to fetch job ${app.jobId}`, error)
            }

            try {
                if (job?.employerId) {
                    const recruiterId = job.employerId
                    recruiter = await fetch(`http://localhost:5000/api/user/${recruiterId}`)
                }
            } catch (error) {
                console.log(`Failed to fetch recruiter`, error)
            }

            return {
                ...app.toJSON(),
                job: job ? {
                    id: job.id,
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

        return res.status(200).json({
            message: "Applications retrieved successfully",
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

const getApplicationByIdWithRecruiter = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Application ID is missing" })
        }

        const application = await Application.findByPk(id)

        if (!application) {
            return res.status(400).json({ message: "Application does not exists" })
        }

        const jobId = application.jobId

        const job = await fetch(`http://localhost:5002/api/job/${jobId}`)

        if (!job) {
            return res.status(400).json({ message: "Job not found" })
        }

        const recruiterId = job.employerId

        const recruiter = await fetch(`http://localhost:5000/api/user/${recruiterId}}`)

        if (!recruiter) {
            return res.status(400).json({ message: "Recruiter not found" })
        }

        return res.status(200).json({ message: "Application fetched successsfully", application, recruiter, job })
    } catch (error) {
        console.error("Applications retrieve failed", error)
        return res.status(400).json({ error: error })
    }
}

const getRecentApplicantsForRecruiter = async (req, res) => {
    try {
        const userHeader = req.headers['x-user'];
        if (!userHeader) {
            return res.status(400).json({ message: "User info missing" });
        }

        const user = JSON.parse(userHeader);
        if (user.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiters allowed" });
        }

        const recruiterId = user._id;
        const limit = Number(req.query.limit) || 5;

        const jobsResponse = await fetch(`http://localhost:5002/api/job/employer/${recruiterId}`);
        const jobs = await jobsResponse.json();

        if (!Array.isArray(jobs) || jobs.length === 0) {
            return res.status(200).json([]); // No jobs → no applicants
        }

        const jobIds = jobs.map(job => job.id);

        const applications = await Application.findAll({
            where: { jobId: jobIds },
            order: [["createdAt", "DESC"]],
            limit
        });

        const enriched = await Promise.all(
            applications.map(async (app) => {
                let candidate = null;
                let job = null;

                try {
                    const candResponse = await fetch(`http://localhost:5001/api/profile/${app.candidateId}`);
                    candidate = await candResponse.json();
                } catch (err) {
                    console.log("Failed fetching candidate", err);
                }

                try {
                    const jobResponse = await fetch(`http://localhost:5002/api/job/${app.jobId}`);
                    job = await jobResponse.json();
                } catch (err) {
                    console.log("Failed fetching job", err);
                }

                return {
                    id: app.id,
                    candidateId: app.candidateId,
                    name: candidate?.fullName || "Unknown User",
                    appliedAt: app.createdAt,
                    jobId: app.jobId,
                    jobTitle: job?.title || "Unknown Job"
                };
            })
        );

        return res.status(200).json(enriched);

    } catch (error) {
        console.error("Failed to fetch recent applicants:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getTotalApplicantsForRecruiter = async (req, res) => {
    try {
        const userHeader = req.headers["x-user"];
        if (!userHeader) {
            return res.status(400).json({ message: "User info missing" });
        }

        const user = JSON.parse(userHeader);
        if (user.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiters allowed" });
        }

        const recruiterId = user._id;

        const jobsResponse = await fetch(
            `http://localhost:5002/api/job/employer/${recruiterId}`
        );

        const jobsData = await jobsResponse.json();

        const jobs = jobsData?.jobs || [];

        if (!Array.isArray(jobs) || jobs.length === 0) {
            return res.status(200).json({ count: 0 });
        }

        const jobIds = jobs.map((job) => job.id);

        const totalApplicants = await Application.count({
            where: { jobId: jobIds },
        });

        return res.status(200).json({
            message: "Total applicants retrieved successfully",
            count: totalApplicants,
        });
    } catch (error) {
        console.error("Failed to get recruiters applicant count:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getJobApplication = async (req, res) => {
    try {
        const { jobId } = req.params

        const { status } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is missing" })
        }

        const baseWhere = { jobId };

        const whereCondition = { ...baseWhere };

        if (status) {
            whereCondition.status = status;
        }

        const statusCountsRaw = await Application.findAll({
            where: baseWhere,
            attributes: [
                'status',
                [Application.sequelize.fn('COUNT', 'id'), 'count']
            ],
            group: ['status']
        });

        const statusCounts = {};
        statusCountsRaw.forEach(row => {
            statusCounts[row.status] = Number(row.get('count'));
        });


        const { count, rows: applications } = await Application.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        })


        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            let job = null
            let profile = null
            let user = null

            try {
                const jobId = app.jobId
                const jobRes = await fetch(`http://localhost:5002/api/job/${jobId}`)
                const jobData = await jobRes.json()
                job = jobData.job
            } catch (error) {
                console.log(`Failed to fetch job ${app.jobId}`, error)
            }

            try {
                const candidateId = app.candidateId
                const profileRes = await fetch(`http://localhost:5001/api/profile/${candidateId}`)
                const profileData = await profileRes.json();
                profile = profileData.profile;
            } catch (error) {
                console.log(`Failed to fetch candidate ${app.candidateId}`, error)
            }

            try {
                const userRes = await fetch(
                    `http://localhost:5000/api/user/${app.candidateId}/public`
                );
                const userData = await userRes.json();
                user = {
                    email: userData.user.email,
                };
            } catch (e) {
                console.log("User fetch failed", e);
            }

            return {
                ...app.toJSON(),
                job: job ? {
                    title: job.title,
                    companyName: job.companyName,
                    location: job.location,
                } : null,
                candidate: {
                    email: user?.email || null,
                    profile,
                },
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

        return res.status(200).json({
            message: "Applications retrieved successfully",
            applications: enrichedApplications,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            },
            counts: {
                applied: statusCounts.applied || 0,
                shortlisted: statusCounts.shortlisted || 0,
                rejected: statusCounts.rejected || 0,
            }
        })
    } catch (error) {
        console.error("Applications retrieve failed", error)
        return res.status(400).json({ error: error })
    }
};

const getApplicationByIdWithCandidate = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Application ID is missing" })
        }

        const application = await Application.findByPk(id)

        if (!application) {
            return res.status(400).json({ message: "Application does not exists" })
        }

        const jobId = application.jobId

        const job = await fetch(`http://localhost:5002/api/job/${jobId}`)

        if (!job) {
            return res.status(400).json({ message: "Job not found" })
        }

        const candidateId = application.candidateId

        const candidate = await fetch(`http://localhost:5001/api/profile/${candidateId}`)

        if (!candidate) {
            return res.status(400).json({ message: "candidate not found" })
        }

        return res.status(200).json({ message: "Application fetched successsfully", application, candidate, job })
    } catch (error) {

    }
};

const getApplicationCountsForRecruiter = async (req, res) => {
    try {
        const userHeader = req.headers["x-user"];
        if (!userHeader) {
            return res.status(400).json({ message: "User info missing" });
        }

        const user = JSON.parse(userHeader);
        if (user.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiters allowed" });
        }

        const recruiterId = user._id;

        // 🔹 Get all jobs created by this recruiter
        const jobsResponse = await fetch(
            `http://localhost:5002/api/job/employer/${recruiterId}`
        );

        const jobsData = await jobsResponse.json();
        const jobs = jobsData?.jobs || jobsData || [];

        if (!Array.isArray(jobs) || jobs.length === 0) {
            return res.status(200).json({ counts: [] });
        }

        const jobIds = jobs.map((job) => job.id);

        // 🔹 Query application counts grouped by jobId
        const { sequelize } = Application;
        const results = await Application.findAll({
            attributes: [
                "jobId",
                [sequelize.fn("COUNT", sequelize.col("jobId")), "count"],
            ],
            where: {
                jobId: jobIds,
            },
            group: ["jobId"],
            raw: true,
        });

        // Format: [{ jobId: 11, count: '4' }]
        const formatted = results.map((r) => ({
            jobId: r.jobId,
            count: Number(r.count),
        }));

        return res.status(200).json({ counts: formatted });

    } catch (error) {
        console.error("Failed to fetch application counts:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updateApplication = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Application id is required" })
        }

        const { status } = req.body

        if (!status) {
            return res.status(400).json({ message: "Status is required" })
        }

        const application = await Application.findByPk(id)

        if (!application) {
            return res.status(400).json({ message: "Application does not exists" })
        }

        if (status !== undefined) application.status = status.trim()

        await application.save()

        return res.status(200).json({ message: "Application updated successfully", application })
    } catch (error) {
        console.log("Application update failed:", error);
        return res.status(400).json({ error: error });
    }
}

const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Application id is required" })
        }

        const application = await Application.findByPk(id)

        if (!application) {
            return res.status(400).json({ message: "Application does not exists" })
        }

        await application.destroy()

        return res.status(200).json({ message: "Application deleted successfully", application });
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
    getRecentApplicantsForRecruiter,
    getTotalApplicantsForRecruiter,
    getApplicationCountsForRecruiter,
    updateApplication,
    deleteApplication,
    getApplicationByIdWithCandidate
}