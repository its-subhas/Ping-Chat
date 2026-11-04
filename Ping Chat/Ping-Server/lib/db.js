import dns from "node:dns"; // Remove before deployment
import mongoose from "mongoose";

dns.setServers(["1.1.1.1", "1.0.0.1"]); // Remove before deployment

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected Successfully!");
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/Ping`);
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
  }
};
