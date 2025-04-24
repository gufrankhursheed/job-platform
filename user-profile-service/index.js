import dotenv from "dotenv"
import app from "./app.js"

dotenv.config({
    path: "./.env"
})

app.listen(process.env.PORT || 5002, () => {
    console.log(`User-profile-server is running on port: ${process.env.PORT}`)
})