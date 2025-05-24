import "./src/config/env.js"

import app from "./app.js"
import connectDb from "./src/db/index.js"

connectDb()
.then(() => {
    app.listen(process.env.PORT || 5006, () => {
        console.log(`Notification service is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Error: ", error)
})