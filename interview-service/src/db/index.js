import { Sequelize } from "sequelize"

const sequelize = new Sequelize({
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    dialect: "mysql"
})

const connectDb = async() => {
    try {
        await sequelize.authenticate()
        console.log("Connect to MySQL")
    } catch (error) {
        console.error("Connection to DB failed: ", error)
        process.exit(1)
    }
}

export {
    sequelize,
    connectDb
}