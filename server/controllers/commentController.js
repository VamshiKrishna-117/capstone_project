import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

// @desc    Get comments for a video
// @route   GET /api/comments/:videoId
// @access  Public
export const getComments = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const comments = await Comment.find({ videoId: req.params.videoId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a comment to a video
// @route   POST /api/comments/:videoId
// @access  Private
export const addComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const comment = await Comment.create({
      videoId: req.params.videoId,
      userId: req.user._id,
      text: text.trim(),
    });

    video.comments.push(comment._id);
    await video.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username avatar"
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Edit a comment
// @route   PUT /api/comments/:commentId
// @access  Private
export const editComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    comment.text = text.trim();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username avatar"
    );

    res.json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Video.findByIdAndUpdate(comment.videoId, {
      $pull: { comments: comment._id }
    });

    await comment.deleteOne();

    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
