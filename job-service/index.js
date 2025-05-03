import dotenv from "dotenv"
import app from "./app.js"
import { connectDb } from "./src/db/index.js"

dotenv.config({
    path: "./.env"
})

connectDb()
.then(() => {
    app.listen(process.env.PORT || 5003, () => {
        console.log(`Job server is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Error: ", error)
})