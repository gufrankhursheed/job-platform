import dotenv from "dotenv"
import app from "./app.js"

dotenv.config({
    path: "./.env"
})

app.listen(process.env.PORT || 5003, () => {
    console.log(`Job server is running on port ${process.env.PORT}`)
})