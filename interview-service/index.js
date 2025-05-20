import "./src/config/env.js";

import app from "./app.js"
import { connectDb, sequelize } from "./src/db/index.js"

connectDb()
.then(() => {
    app.listen(process.env.PORT || PORT, ()=> {
        console.log(`Interview service is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Error: ", error)
})

sequelize.sync().then(() => {
    console.log('Sequelize models synchronized with database');
});