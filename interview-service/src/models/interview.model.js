import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const Interview = sequelize.define('Interview', {
    candidateId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recruiterId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'scheduled',
    },
    meetingLink: {
        type: DataTypes.STRING,
    },
    calendarEventId: {
        type: DataTypes.STRING,
    },
    notes: {
        type: DataTypes.TEXT,
    }
})

export default Interview