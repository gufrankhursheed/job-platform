import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Job from "./job.model.js";

const SavedJob = sequelize.define("SavedJob", {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

SavedJob.belongsTo(Job, { foreignKey: "jobId" });

export default SavedJob;