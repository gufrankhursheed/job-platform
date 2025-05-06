import { Sequelize } from "sequelize"


const sequelize = new Sequelize({
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    dialect: "mysql"
})

const connectDB = async(req, res) => {
    try {
        await sequelize.authenticate()
        console.log("Connected to MySql")
    } catch (error) {
        console.error("Connection to DB failed: ", error)
        process.exit(1)
    }
}

export {
    sequelize,
    connectDB
}