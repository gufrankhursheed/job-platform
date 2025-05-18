import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Application = sequelize.define('Application', {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'applied'
    },
    appliedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    candidateId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default Application