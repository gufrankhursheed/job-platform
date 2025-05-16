import "./src/config/env.js";

import app from "./app.js";
import connectDb from "./src/db/index.js";

connectDb()
.then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log(`User-profile-server is running on port: ${process.env.PORT}`);
  });
})
.catch((error) => {
    console.log("Error: ", error)
})
