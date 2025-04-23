import dotenv from "dotenv"
import app from "./app.js"

dotenv.config({
    path: "./.env"
})

app.listen(process.env.PORT || 5001, () => {
    console.log(`Auth-server is running on port ${process.env.PORT}`)
})