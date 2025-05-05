import Job from "../models/job.model"


const createJob = async(req, res) => {
    try {
        const { title, description, companyName, salaryRange, location, remote, category } = req.body

        if ([title, description, companyName, salaryRange, location, remote, category].some(
            (field) => (field?.trim() === "")
        )) {
            return res.status(400).json({message: "All fields are required"})
        }

        const existingJob = await Job.findOne({
            where: {
                title: title,
                companyName: companyName,
                status: 'open'
            }
        })

        if(existingJob) {
            return res.status(400).json({message: "Job already exists"})
        }

        const job = await Job.create({
            title,
            description,
            companyName,
            salaryRange,
            location,
            remote,
            category,
            status: 'open'
        })

        return res.status(200).json({message: "Job created successfully"})
    } catch (error) {
        console.log("Job creation failed:", error)
        return res.status(400).json({error: error})
    }
}

export {
    createJob
}