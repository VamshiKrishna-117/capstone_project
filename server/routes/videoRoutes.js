import express from "express";
import {
  getVideos,
  getVideoById,
  likeVideo,
  dislikeVideo,
  viewVideo,
  uploadVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/videos
router.get("/", getVideos);

// POST /api/videos  (upload — must be before /:id routes)
router.post("/", protect, uploadVideo);

// GET /api/videos/:id
router.get("/:id", getVideoById);

// PUT /api/videos/:id
router.put("/:id", protect, updateVideo);

// DELETE /api/videos/:id
router.delete("/:id", protect, deleteVideo);

// POST /api/videos/:id/like
router.post("/:id/like", protect, likeVideo);

// POST /api/videos/:id/dislike
router.post("/:id/dislike", protect, dislikeVideo);

// POST /api/videos/:id/view
router.post("/:id/view", viewVideo);

export default router;
