import Job from "../models/job.model.js";
import { Op } from "sequelize";

const createJob = async (req, res) => {
  try {
    const userHeader = req.headers['x-user']

    if (!userHeader) {
      return res.status(400).json({ message: 'User information is missing' })
    }

    const user = JSON.parse(userHeader)

    if (user?.role !== "recruiter") {
      return res.status(400).json({ message: "Unauthorized: Only recruiter can post a job" });
    }

    const userId = user._id

    if (!userId) {
      return res.status(400).json({ message: "User Id is required" })
    }

    const employerId = userId

    const {
      title,
      description,
      companyName,
      salaryRange,
      experienceLevel,
      requirements,
      responsibilities,
      location,
      remote,
      category,
    } = req.body;

    // Validate string fields
    const stringFields = {
      title,
      description,
      companyName,
      salaryRange,
      experienceLevel,
      location,
      category,
    };

    for (const [key, value] of Object.entries(stringFields)) {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return res.status(400).json({ message: `${key} is required` });
      }
    }

    // Validate array fields
    if (
      !Array.isArray(requirements) ||
      requirements.length === 0 ||
      !Array.isArray(responsibilities) ||
      responsibilities.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Requirements and responsibilities must be non-empty arrays" });
    }

    // Validate boolean
    if (typeof remote !== "boolean") {
      return res
        .status(400)
        .json({ message: "Remote field must be boolean" });
    }

    const existingJob = await Job.findOne({
      where: {
        title: title,
        companyName: companyName,
        status: "open",
      },
    });

    if (existingJob) {
      return res.status(400).json({ message: "Job already exists" });
    }

    const job = await Job.create({
      title,
      description,
      companyName,
      salaryRange,
      experienceLevel,
      requirements,
      responsibilities,
      location,
      remote,
      category,
      status: "open",
      employerId
    });

    return res.status(200).json({ message: "Job created successfully", job });
  } catch (error) {
    console.log("Job creation failed:", error);
    return res.status(400).json({ error: error });
  }
};

const getAllJobs = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const search = req.query.search || "";

    const category = req.query.category || null;
    const location = req.query.location || null;
    const remote = req.query.remote;
    const status = req.query.status || "open";

    let whereClause = {
      status: status,
    };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category) whereClause.category = category;
    if (location) {
      whereClause.location = {
        [Op.like]: `%${location}%`
      };
    }
    if (remote === "true") whereClause.remote = true;
    if (remote === "false") whereClause.remote = false;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    return res.status(200).json({
      message: "Jobs retrieved successfully",
      jobs,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit
      }
    });
  } catch (error) {
    console.log("Jobs fetch failed:", error);
    return res.status(400).json({ error: error });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(400).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job found successfully", job });
  } catch (error) {
    console.log("Job fetch failed:", error);
    return res.status(400).json({ error: error });
  }
};

const getJobsByEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;

    if (!employerId) {
      return res.status(400).json({ message: "Recruiter ID is missing" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: {
        employerId: employerId
      },
      order: [["datePosted", "DESC"]],
      limit,
      offset
    });

    return res.status(200).json({
      message: "Jobs retrieved successfully",
      jobs,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit
      }
    });

  } catch (error) {
    console.error("Failed to fetch employer jobs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, location, salaryRange, company, status } = req.body

    const userHeader = req.headers['x-user']

    if (!userHeader) {
      return res.status(400).json({ message: 'User information is missing' })
    }

    const user = JSON.parse(userHeader)

    if (user?.role !== "recruiter") {
      return res.status(400).json({ message: "Unauthorized: Only recruiter can update a job" });
    }

    const job = await Job.findByPk(id)

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    if (title !== undefined) job.title = title.trim()
    if (description !== undefined) job.description = description.trim()
    if (salaryRange !== undefined) job.salaryRange = salaryRange.trim()
    if (location !== undefined) job.location = location.trim()
    if (company !== undefined) job.company = company.trim()
    if (status !== undefined) job.status = status.trim()

    await job.save();

    return res.status(200).json({ message: "Job updated successfully", job })
  } catch (error) {
    console.log("Job update failed:", error);
    return res.status(400).json({ error: error });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const userHeader = req.headers['x-user']

    if (!userHeader) {
      return res.status(400).json({ message: 'User information is missing' })
    }

    const user = JSON.parse(userHeader)

    if (user?.role !== "recruiter") {
      return res.status(400).json({ message: "Unauthorized: Only recruiter can delete a job" });
    }

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(400).json({ message: "Job not found" });
    }

    await job.destroy()

    return res.status(200).json({ message: "Job deleted successfully", job });
  } catch (error) {
    console.log("Job delete failed:", error);
    return res.status(400).json({ error: error });
  }
};

export { createJob, getAllJobs, getJobById, getJobsByEmployer, updateJob, deleteJob };
