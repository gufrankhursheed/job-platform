import Interview from "../models/interview.model.js"
import { publishToQueue } from "../utils/rabbitmq.js"
import { Op } from "sequelize";

const scheduleInterview = async (req, res) => {
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
            typeof scheduledAt !== 'string' || scheduledAt.trim() === ""
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (
            typeof jobId !== 'number' || isNaN(jobId) ||
            typeof applicationId !== 'number' || isNaN(applicationId)
        ) {
            return res.status(400).json({ message: "Job ID, Application ID must be valid numbers" });
        }

        if (jobId == undefined) {
            return res.status(400).json({ message: "Job ID is required" })
        }

        if (applicationId == undefined) {
            return res.status(400).json({ message: "Application ID is required" })
        }

        const alreadyScheduled = await Interview.findOne({
            where: {
                candidateId,
                jobId
            }
        });

        if (alreadyScheduled) {
            return res.status(400).json({ message: "Interview is already scheduled for the candidate for this job" })
        }

        const startDate = new Date(scheduledAt)
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

        const start = startDate.toISOString()
        const end = endDate.toISOString()

        /*const eventDetails = {
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
        let calendarEventId = response.data.id*/

        const interview = await Interview.create({
            candidateId,
            recruiterId,
            jobId,
            applicationId,
            scheduledAt,
            durationMinutes,
            //meetingLink,
            //calendarEventId,
            notes
        })

        await publishToQueue({
            userId: candidateId,
            message: `You have an interview scheduled at ${new Date(scheduledAt).toLocaleString()}`,
            type: "info",
            metadata: {
                entity: "interview",
                jobId,
                recruiterId,
                scheduledAt,
                durationMinutes,
                notes
            }
        })

        return res.status(200).json({ message: "Interview scheduled", interview })
    } catch (error) {
        console.log("Interview schedule failed:", error)
        return res.status(400).json({ error: error })
    }
}

const getInterviewsByRecruiter = async (req, res) => {
    try {
        const { id } = req.params;

        const { status } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        if (!id) {
            return res.status(400).json({ message: "Recruiter Id is required" });
        }

        const baseWhere = { recruiterId: id };
        const whereCondition = { ...baseWhere };

        if (status) {
            whereCondition.status = status;
        }

        const statusCountsRaw = await Interview.findAll({
            where: baseWhere,
            attributes: [
                "status",
                [Interview.sequelize.fn("COUNT", "id"), "count"],
            ],
            group: ["status"],
        });

        const statusCounts = {};
        statusCountsRaw.forEach((row) => {
            statusCounts[row.status] = Number(row.get("count"));
        });

        const { count, rows: interviews } = await Interview.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        const enrichedInterviews = await Promise.all(
            interviews.map(async (interview) => {
                let job = null;
                let profile = null;
                let user = null;

                try {
                    const jobRes = await fetch(
                        `http://localhost:5002/api/job/${interview.jobId}`
                    );
                    const jobData = await jobRes.json();
                    job = jobData.job;
                } catch (e) {
                    console.log(`Failed to fetch job ${interview.jobId}`, e);
                }

                try {
                    const profileRes = await fetch(
                        `http://localhost:5001/api/profile/${interview.candidateId}`
                    );
                    const profileData = await profileRes.json();
                    profile = profileData.profile;
                } catch (e) {
                    console.log("Profile fetch failed", e);
                }

                try {
                    const userRes = await fetch(
                        `http://localhost:5000/api/user/${interview.candidateId}/public`
                    );
                    const userData = await userRes.json();
                    user = { email: userData.user.email };
                } catch (e) {
                    console.log("User fetch failed", e);
                }

                return {
                    ...interview.toJSON(),
                    job: job
                        ? {
                            title: job.title,
                            companyName: job.companyName,
                            location: job.location,
                        }
                        : null,
                    candidate: {
                        email: user?.email || null,
                        profile,
                    },
                };
            })
        );

        return res.status(200).json({
            message: "Interviews retrieved successfully",
            interviews: enrichedInterviews,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit,
            },
            counts: {
                scheduled: statusCounts.scheduled || 0,
                completed: statusCounts.completed || 0,
                cancelled: statusCounts.cancelled || 0,
            },
        });
    } catch (error) {
        console.log("Interview fetch failed:", error);
        return res.status(400).json({ error });
    }
};

const getUpcomingInterviewsByRecruiter = async (req, res) => {
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
        const now = new Date();

        const interviews = await Interview.findAll({
            where: {
                recruiterId: recruiterId,
                scheduledAt: { [Op.gte]: now }
            },
            order: [["scheduledAt", "ASC"]],
            limit
        });

        const enrichedInterviews = await Promise.all(
            interviews.map(async (interview) => {
                let job = null;
                let candidate = null;

                try {
                    const jobRes = await fetch(`http://localhost:5002/api/job/${interview.jobId}`);
                    const jobData = await jobRes.json()
                    job = jobData.job
                } catch (error) {
                    console.log("Failed to fetch job:", error);
                }

                try {
                    const candRes = await fetch(`http://localhost:5001/api/profile/${interview.candidateId}`);
                    const candidateData = await candRes.json();
                    candidate = candidateData.profile;
                } catch (error) {
                    console.log("Failed to fetch candidate:", error);
                }

                return {
                    id: interview.id,
                    date: interview.scheduledAt,
                    jobTitle: job?.title || "Unknown Job",
                    candidateName: candidate?.name || "Unknown Candidate"
                };
            })
        );

        return res.status(200).json({
            message: "Upcoming interviews retrieved successfully",
            interviews: enrichedInterviews
        });

    } catch (error) {
        console.log("Upcoming interview fetch failed:", error);
        return res.status(500).json({ error: error });
    }
};

const getUpcomingInterviewsCountByRecruiter = async (req, res) => {
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
        const now = new Date();

        const count = await Interview.count({
            where: {
                recruiterId: recruiterId,
                scheduledAt: { [Op.gte]: now }
            }
        });

        return res.status(200).json({
            message: "Upcoming interview count retrieved",
            count,
        });

    } catch (error) {
        console.log("Upcoming interview count failed:", error);
        return res.status(500).json({ error: error.toString() });
    }
};

const getInterviewsByCandidate = async (req, res) => {
    try {
        const { id } = req.params
        let status = req.query.status

        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 10
        const offset = (page - 1) * limit

        if (!id) {
            return res.status(400).json({ message: "Candidate Id is required" })
        }

        if (status === undefined) {
            status = null;
        }

        const where = { candidateId: id }

        if (status) {
            where.status = status
        }

        const { count, rows: interviews } = await Interview.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        })

        if (interviews.length === 0) {
            return res.status(200).json({
                message: "No interviews found for this candidate",
                interviews: [],
                pagination: {
                totalItems: 0,
                totalPages: 1,
                currentPage: Number(page),
                pageSize: Number(limit),
                },
            });
        }

        const enrichedInterviews = await Promise.all(interviews.map(async (interview) => {
            let job = null
            let recruiter = null

            try {
                const jobId = interview.jobId
                const jobRes = await fetch(`http://localhost:5002/api/job/${jobId}`)
                const jobData = await jobRes.json()
                job = jobData.job
            } catch (error) {
                console.log(`Failed to fetch job ${candidate.jobId}`, error)
            }

            try {
                const recruiterId = interview.recruiterId
                const recruiterRes = await fetch(`http://localhost:5000/api/user/${recruiterId}`)
                const recruiterData = await recruiterRes.json()
                recruiter = recruiterData.user
            } catch (error) {
                console.log(`Failed to fetch candidate`, error)
            }

            return {
                ...interview.toJSON(),
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

        /*const interviews = await Interview.findOne({
            where: {
                candidateId: id
            }
        })

        if(!interviews) {
            return res.status(400).json({message: "No interviews found"})
        }*/

        return res.status(200).json({
            message: "Interviews retrieved successfully",
            interviews: enrichedInterviews,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        })
    } catch (error) {
        console.log("Interview fetch failed:", error)
        return res.status(400).json({ error: error })
    }
}

const updateInterview = async (req, res) => {
    try {
        const { id } = req.params
        const { scheduledAt, durationMinutes, status, notes } = req.body

        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        if (user?.role !== "recruiter") {
            return res.status(400).json({ message: "Unauthorized: Only recruiter can update an interview" });
        }

        const interview = await Interview.findByPk(id)

        if (!interview) {
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
        if (notes) interview.notes = notes

        await interview.save()

        return res.status(200).json({ message: "Interview updated successfully", interview })
    } catch (error) {
        console.log("Interview update failed:", error)
        return res.status(400).json({ error: error })
    }
}

const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const userHeader = req.headers["x-user"];
    if (!userHeader) {
      return res.status(400).json({ message: "User information is missing" });
    }

    const user = JSON.parse(userHeader);
    if (user?.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiter can update interview status" });
    }

    console.log("id: ", id)
    console.log("status: ", status)
    console.log("user: ", user)

    if (!id) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const interview = await Interview.findByPk(id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = status.trim();
    await interview.save();

    return res.status(200).json({
      message: "Interview status updated successfully",
      interview,
    });
  } catch (error) {
    console.error("Interview status update failed:", error);
    return res.status(400).json({ error });
  }
};

const cancelInterview = async (req, res) => {
    try {
        const { id } = req.params

        const userHeader = req.headers['x-user']

        if (!userHeader) {
            return res.status(400).json({ message: 'User information is missing' })
        }

        const user = JSON.parse(userHeader)

        if (user?.role !== "recruiter") {
            return res.status(400).json({ message: "Unauthorized: Only recruiter can delete an interview" });
        }

        const interview = await Interview.findByPk(id)

        if (!interview) {
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

        return res.status(200).json({ message: "Interview deleted successfully", interview });
    } catch (error) {
        console.log("Interview delete failed:", error)
        return res.status(400).json({ error: error })
    }
}

export {
    scheduleInterview,
    getInterviewsByRecruiter,
    getUpcomingInterviewsByRecruiter,
    getUpcomingInterviewsCountByRecruiter,
    getInterviewsByCandidate,
    updateInterview,
    updateInterviewStatus,
    cancelInterview
}