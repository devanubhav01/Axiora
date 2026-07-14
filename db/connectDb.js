import mongoose from "mongoose";

const connectDb = async () => {
  try {
    // Debugging (Temporary)
    console.log("==================================");
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

    if (process.env.MONGO_URI) {
      console.log(
        "MONGO_URI starts with:",
        process.env.MONGO_URI.substring(0, 35) + "..."
      );
    } else {
      console.log("MONGO_URI is UNDEFINED!");
    }
    console.log("==================================");

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default connectDb;