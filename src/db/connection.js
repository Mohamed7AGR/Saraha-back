import mongoose from "mongoose";
import configService from "../config/config.service.js";
import { client } from "./redisConnection.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(configService.DB_URI);
    console.log("Connected to MongoDB");
    await client.connect();
    console.log("Connected to Redis");
    await mongoose.syncIndexes();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
