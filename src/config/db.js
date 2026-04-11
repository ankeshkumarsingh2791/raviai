const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connection event: connected");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection event: error", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose connection event: disconnected");
    });

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
