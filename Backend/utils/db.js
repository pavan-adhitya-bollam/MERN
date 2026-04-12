import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "jobportal"
    });
    console.log("MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);
    console.log("Connection URL:", process.env.MONGO_URL);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

export default connectDB;