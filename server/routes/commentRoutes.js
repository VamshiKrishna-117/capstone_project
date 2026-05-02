import express from "express";
import { getComments, addComment, editComment, deleteComment } from "../controllers/commentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/comments/:videoId
router.get("/:videoId", getComments);

// POST /api/comments/:videoId  (protected)
router.post("/:videoId", protect, addComment);

// PUT /api/comments/:commentId (protected)
router.put("/:commentId", protect, editComment);

// DELETE /api/comments/:commentId (protected)
router.delete("/:commentId", protect, deleteComment);

export default router;
