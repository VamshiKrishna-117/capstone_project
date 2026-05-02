import express from "express";
import { getChannelById, getChannels, getMyChannel, createChannel, updateChannel } from "../controllers/channelController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/channels
router.get("/", getChannels);

// GET /api/channels/my (protected)
router.get("/my", protect, getMyChannel);

// POST /api/channels (protected)
router.post("/", protect, createChannel);

// GET /api/channels/:id
router.get("/:id", getChannelById);

// PUT /api/channels/:id (protected)
router.put("/:id", protect, updateChannel);

export default router;
