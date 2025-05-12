import dotenv from "dotenv"
import app from "./app.js"

dotenv.config({
    path: "./.env"
})

app.listen(process.env.PORT || PORT, ()=> {
    console.log(`Interview service is running on port ${process.env.PORT}`)
})