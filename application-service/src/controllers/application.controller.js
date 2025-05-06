import Application from "../models/application.model"


const applyJob = async(req, res) => {
    try {
        const { candidateId, jobId } = req.body

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
        console.log("Job creation failed:", error)
        return res.status(400).json({ error: error })
    }
}



export {
    applyJob
}