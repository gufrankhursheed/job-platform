import { DataTypes } from "sequelize";
import { sequelize } from "../db";

const Application = sequelize.define('Application', {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'applied'
    },
    resumeScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    appliedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default Application