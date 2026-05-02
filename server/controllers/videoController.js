import mongoose from "mongoose";
import Video from "../models/Video.js";
import User from "../models/User.js";
import Channel from "../models/Channel.js";
import Comment from "../models/Comment.js";

// @desc    Get all videos (with search & filter)
// @route   GET /api/videos
// @access  Public
export const getVideos = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    // Build query object
    let query = {};
    
    // Add category filter if provided and not "All"
    if (category && category !== "All") {
      query.category = category;
    }
    
    // Add search filter if provided — escape special regex chars to prevent ReDoS
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.title = { $regex: escaped, $options: "i" };
    }

    const videos = await Video.find(query)
      .populate("uploader", "username avatar")
      .populate("channelId", "channelName avatar channelBanner")
      .sort({ uploadDate: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single video by ID
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(req.params.id)
      .populate("uploader", "username avatar")
      .populate("channelId", "channelName avatar channelBanner subscribers")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username avatar" }
      });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Toggle like on a video
// @route   POST /api/videos/:id/like
// @access  Protected
export const likeVideo = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = video.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      video.likes.pull(userId);
    } else {
      video.likes.push(userId);
      video.dislikes.pull(userId);
    }

    await video.save();

    res.json({
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      liked: !alreadyLiked,
      disliked: video.dislikes.some((id) => id.equals(userId)),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Toggle dislike on a video
// @route   POST /api/videos/:id/dislike
// @access  Protected
export const dislikeVideo = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.user._id;
    const alreadyDisliked = video.dislikes.some((id) => id.equals(userId));

    if (alreadyDisliked) {
      video.dislikes.pull(userId);
    } else {
      video.dislikes.push(userId);
      video.likes.pull(userId);
    }

    await video.save();

    res.json({
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      liked: video.likes.some((id) => id.equals(userId)),
      disliked: !alreadyDisliked,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Increment view count
// @route   POST /api/videos/:id/view
// @access  Public
export const viewVideo = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({ views: video.views });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a video
// @route   PUT /api/videos/:id
// @access  Protected
export const updateVideo = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this video" });
    }

    const { title, description, thumbnailUrl, videoUrl, category } = req.body;

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (category !== undefined) video.category = category;

    const updated = await video.save();
    await updated.populate("uploader", "username avatar");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Protected
export const deleteVideo = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    await Channel.findByIdAndUpdate(video.channelId, { $pull: { videos: video._id } });
    await Comment.deleteMany({ videoId: video._id });
    await video.deleteOne();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Upload a new video
// @route   POST /api/videos
// @access  Protected
export const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, thumbnailUrl, videoUrl, channelId } = req.body;

    if (!title || !thumbnailUrl || !videoUrl || !channelId) {
      return res.status(400).json({ message: "Title, thumbnail URL, video URL, and channel ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to upload to this channel" });
    }

    const video = await Video.create({
      title,
      description: description || "",
      category: category || "Entertainment",
      thumbnailUrl,
      videoUrl,
      channelId,
      uploader: req.user._id,
    });

    channel.videos.push(video._id);
    await channel.save();

    const populated = await video.populate("uploader", "username avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
