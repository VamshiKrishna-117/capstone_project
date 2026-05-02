/**
 * Express Server Configuration
 * 
 * Entry point for the backend API. It configures the Express application,
 * sets up middleware, connects to the MongoDB database, and registers API routes.
 */
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Initialize MongoDB connection
connectDB();

// Initialize Express app instance
const app = express();

// Middleware configuration
// Enable Cross-Origin Resource Sharing
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());

// API Routes mounting
// Authentication & User Management
app.use("/api/auth", authRoutes);
// Video CRUD & interactions
app.use("/api/videos", videoRoutes);
// Comment CRUD
app.use("/api/comments", commentRoutes);
// Channel CRUD & Management
app.use("/api/channels", channelRoutes);

// Health check route to verify server status
app.get("/", (req, res) => {
  res.json({ message: "YouTube Clone API is running" });
});

// Server initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
