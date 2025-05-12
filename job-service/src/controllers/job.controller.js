import Job from "../models/job.model";

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      companyName,
      salaryRange,
      location,
      remote,
      category,
    } = req.body;

    if (
      [
        title,
        description,
        companyName,
        salaryRange,
        location,
        remote,
        category,
      ].some((field) => field?.trim() === "")
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const employerId = req.user?._id

    if(req.user?.role !== "recruiter") {
      return res.status(400).json({ message: "Unauthorized: Only recruiter can post a job" });
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
    const jobs = await Job.findAll();

    return res
      .status(200)
      .json({ message: "All jobs retrieved successfully", jobs });
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

    return res.status(200).json({ message: "Job found successfully", job});
  } catch (error) {
    console.log("Job fetch failed:", error);
    return res.status(400).json({ error: error });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, location, salaryRange, company, status } = req.body

    if(req.user?.role !== "recruiter") {
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

      if(req.user?.role !== "recruiter") {
        return res.status(400).json({ message: "Unauthorized: Only recruiter can delete a job" });
      }  
  
      const job = await Job.findByPk(id);
  
      if (!job) {
        return res.status(400).json({ message: "Job not found" });
      }

      await job.destroy()
  
      return res.status(200).json({ message: "Job deleted successfully", job});
    } catch (error) {
      console.log("Job delete failed:", error);
      return res.status(400).json({ error: error });
    }
};

export { createJob, getAllJobs, getJobById, updateJob, deleteJob };
