import "./src/config/env.js";

import app from "./app.js";
import { connectDB, sequelize } from "./src/db/index.js";
import { connectRabbitMQ } from "./src/utils/rabbitmq.js";

connectDB()
.then(async() => {
    await connectRabbitMQ()

    app.listen(process.env.PORT || 5003, () => {
        console.log(`Application server is running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Error: ", error)
})

sequelize.sync().then(() => {
    console.log('Sequelize models synchronized with database');
})