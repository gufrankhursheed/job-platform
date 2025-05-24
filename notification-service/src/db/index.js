import mongoose from "mongoose";

const connectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`Connected to DB, DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDb connection failed")
        process.exit(1)
    }
}

export default connectDb