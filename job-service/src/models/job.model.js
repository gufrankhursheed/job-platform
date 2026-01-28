import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Job = sequelize.define('Job', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    requirements: {
        type: DataTypes.JSON, 
        allowNull: true,
        defaultValue: []
    },
    responsibilities: {
        type: DataTypes.JSON, 
        allowNull: true,
        defaultValue: []
    },
    experienceLevel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    salaryRange: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    remote: {
        type: DataTypes.BOOLEAN,
    },
    category: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'open',
    },
    datePosted: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    employerId: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

export default Job