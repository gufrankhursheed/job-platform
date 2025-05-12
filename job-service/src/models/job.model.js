import { DataTypes } from "sequelize";
import { sequelize } from "../db";

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
        allowNull: true,
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