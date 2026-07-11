import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL;
    const conn = await mongoose.connect(MONGO_URL);
    console.log("Connect to DB");
    console.log("DB host : ", conn.connection.host);
    console.log("DB Name : ", conn.connection.name);
    console.log("DB User : ", conn.connection.user);
  } catch (error) {
    console.log("Failed to connect to DB");
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;
