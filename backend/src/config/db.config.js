import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const MONGO_URL = process.env.MONGO_URL;
        const conn = await mongoose.connect(MONGO_URL);
        console.log("Connect to DB")
        console.log("DB host : ", conn.connection.host);
        console.log("DB Name : ", conn.connection.name);
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

export default connectDB;