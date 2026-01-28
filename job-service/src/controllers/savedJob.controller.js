import Job from "../models/job.model.js";
import SavedJob from "../models/savedJob.model.js";

const saveJob = async (req, res) => {
    try {
        const userHeader = req.headers["x-user"];

        if (!userHeader) {
            return res.status(400).json({ message: "User information missing" });
        }

        const user = JSON.parse(userHeader);
        const userId = user._id;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        const exists = await SavedJob.findOne({ where: { userId, jobId } });

        if (exists) {
            return res.status(400).json({ message: "Job already saved" });
        }

        await SavedJob.create({ userId, jobId });

        return res.status(200).json({ message: "Job saved successfully" });
    } catch (error) {
        console.log("Save job failed:", error);
        return res.status(500).json({ error: error.message });
    }
};

const unsaveJob = async (req, res) => {
    try {
        const userHeader = req.headers["x-user"];
        const user = JSON.parse(userHeader);
        const userId = user._id;
        const { jobId } = req.params;

        const saved = await SavedJob.findOne({ where: { userId, jobId } });

        if (!saved) {
            return res.status(400).json({ message: "Job not saved" });
        }

        await saved.destroy();

        return res.status(200).json({ message: "Job removed from saved list" });
    } catch (error) {
        console.log("Unsave job failed:", error);
        return res.status(500).json({ error: error.message });
    }
};

const getSavedJobs = async (req, res) => {
    try {
        const userHeader = req.headers["x-user"];
        const user = JSON.parse(userHeader);
        const userId = user._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await SavedJob.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: Job,
                    required: false,
                    attributes: [
                        "id",
                        "title",
                        "companyName",
                        "location",
                        "salaryRange",
                        "remote",
                        "category",
                        "datePosted"
                    ],
                },
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            message: "Saved jobs fetched successfully",
            savedJobs: rows.map(item => item.Job),
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        });
    } catch (error) {
        console.log("Get saved jobs failed:", error);
        return res.status(500).json({ error: error.message });
    }
};

export {
    saveJob,
    unsaveJob,
    getSavedJobs
}
