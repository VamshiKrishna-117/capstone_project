import mongoose from "mongoose";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import User from "../models/User.js";

// @desc    Get channel by ID
// @route   GET /api/channels/:id
// @access  Public
export const getChannelById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }

    const channel = await Channel.findById(req.params.id)
      .populate("owner", "username avatar");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Get videos for this channel
    const videos = await Video.find({ channelId: channel._id })
      .populate("uploader", "username avatar")
      .sort({ uploadDate: -1 });

    res.json({ channel, videos });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all channels
// @route   GET /api/channels
// @access  Public
export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate("owner", "username avatar");

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's own channel
// @route   GET /api/channels/my
// @access  Private
export const getMyChannel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.channels || user.channels.length === 0) {
      return res.status(404).json({ message: "You don't have a channel yet" });
    }

    const channel = await Channel.findById(user.channels[0])
      .populate("owner", "username avatar");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Get videos for this channel
    const videos = await Video.find({ channelId: channel._id })
      .populate("uploader", "username avatar")
      .sort({ uploadDate: -1 });

    res.json({ channel, videos });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a channel for the logged-in user
// @route   POST /api/channels
// @access  Private
export const createChannel = async (req, res) => {
  try {
    // req.user is already the full user document from protect middleware
    if (req.user.channels && req.user.channels.length > 0) {
      return res.status(400).json({ message: "You already have a channel" });
    }

    const channel = await Channel.create({
      channelName: req.body?.channelName || req.user.username + "'s Channel",
      owner: req.user._id,
      description: req.body?.description || "Welcome to my channel!",
      ...(req.body?.avatar && { avatar: req.body.avatar }),
      ...(req.body?.channelBanner && { channelBanner: req.body.channelBanner }),
    });

    // Use $push to avoid triggering the password pre-save hook and validators
    await User.findByIdAndUpdate(req.user._id, { $push: { channels: channel._id } });

    res.status(201).json(channel);
  } catch (error) {
    console.error("createChannel error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a channel
// @route   PUT /api/channels/:id
// @access  Private
export const updateChannel = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }

    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this channel" });
    }

    const { channelName, description, channelBanner } = req.body;

    if (channelName !== undefined) channel.channelName = channelName;
    if (description !== undefined) channel.description = description;
    if (channelBanner !== undefined) channel.channelBanner = channelBanner;

    const updated = await channel.save();
    await updated.populate("owner", "username avatar");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
