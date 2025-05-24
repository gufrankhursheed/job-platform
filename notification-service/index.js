import "./src/config/env.js"

import app from "./app.js"

app.listen(process.env.PORT || 5006, () => {
    console.log(`Notification service is running on port ${process.env.PORT}`)
})