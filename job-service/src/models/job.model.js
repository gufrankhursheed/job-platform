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
        allowNull: false,
    },
    remote: {
        type: DataTypes.BOOLEAN,
    },
    datePosted: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
})

export default Job