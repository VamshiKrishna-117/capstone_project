import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle, FaUpload, FaPen, FaVideo, FaTimes, FaPencilAlt, FaTrash } from "react-icons/fa";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./ChannelPage.css";

const formatViews = (views) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
  if (views >= 1000) return (views / 1000).toFixed(1) + "K";
  return views;
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
  return "Just now";
};

const TABS = ["Home", "Videos", "Playlists", "Posts"];
const CATEGORIES = ["Music", "Gaming", "Education", "Entertainment", "Sports", "News", "Technology", "Travel"];

const EMPTY_UPLOAD_FORM = {
  title: "",
  description: "",
  category: "Education",
  thumbnailUrl: "",
  videoUrl: "",
};

const ChannelPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState(EMPTY_UPLOAD_FORM);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Edit modal
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_UPLOAD_FORM);
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete confirmation
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit channel modal
  const [showEditChannelModal, setShowEditChannelModal] = useState(false);
  const [channelForm, setChannelForm] = useState({ channelName: "", description: "", channelBanner: "" });
  const [editChannelError, setEditChannelError] = useState("");
  const [editingChannel, setEditingChannel] = useState(false);

  useEffect(() => {
    const fetchChannel = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await API.get(`/channels/${id}`);
        setChannel(data.channel);
        setVideos(data.videos);
      } catch (err) {
        setError("Failed to load channel.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
    window.scrollTo(0, 0);
  }, [id]);

  const openUploadModal = () => {
    setUploadForm(EMPTY_UPLOAD_FORM);
    setUploadError("");
    setShowUploadModal(true);
  };

  const handleUploadField = (e) => {
    setUploadForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim() || !uploadForm.thumbnailUrl.trim() || !uploadForm.videoUrl.trim()) {
      setUploadError("Title, Thumbnail URL, and Video URL are required.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const { data } = await API.post("/videos", {
        ...uploadForm,
        channelId: channel._id,
      });
      setVideos([data, ...videos]);
      setShowUploadModal(false);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload video.");
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || "",
      category: video.category || "Education",
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
    });
    setEditError("");
  };

  const handleEditField = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.thumbnailUrl.trim() || !editForm.videoUrl.trim()) {
      setEditError("Title, Thumbnail URL, and Video URL are required.");
      return;
    }
    setEditing(true);
    setEditError("");
    try {
      const { data } = await API.put(`/videos/${editingVideo._id}`, editForm);
      setVideos((prev) => prev.map((v) => (v._id === editingVideo._id ? data : v)));
      setEditingVideo(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update video.");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteVideo = async () => {
    setDeleting(true);
    try {
      await API.delete(`/videos/${deletingVideoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== deletingVideoId));
      setDeletingVideoId(null);
    } catch (err) {
      console.error("Failed to delete video:", err);
    } finally {
      setDeleting(false);
    }
  };

  const openEditChannelModal = () => {
    setChannelForm({
      channelName: channel.channelName,
      description: channel.description || "",
      channelBanner: channel.channelBanner || "",
    });
    setEditChannelError("");
    setShowEditChannelModal(true);
  };

  const handleChannelField = (e) => {
    setChannelForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChannelSubmit = async (e) => {
    e.preventDefault();
    if (!channelForm.channelName.trim()) {
      setEditChannelError("Channel name is required.");
      return;
    }
    setEditingChannel(true);
    setEditChannelError("");
    try {
      const { data } = await API.put(`/channels/${channel._id}`, channelForm);
      setChannel(data);
      setShowEditChannelModal(false);
    } catch (err) {
      setEditChannelError(err.response?.data?.message || "Failed to update channel.");
    } finally {
      setEditingChannel(false);
    }
  };

  if (loading) return <div className="channel-loading">Loading channel...</div>;
  if (error) return <div className="channel-error">{error}</div>;
  if (!channel) return <div className="channel-error">Channel not found.</div>;

  const isOwner = user && channel.owner?._id === user._id;
  const latestVideo = videos.length > 0 ? videos[0] : null;
  const deletingVideo = videos.find((v) => v._id === deletingVideoId);

  return (
    <div className="channel-page">
      {/* Banner */}
      <div className="channel-banner">
        <img src={channel.channelBanner} alt={`${channel.channelName} banner`} />
      </div>

      {/* Channel Header */}
      <div className="channel-header">
        <div className="channel-avatar-xl">
          <img
            src={
              channel.avatar ||
              channel.owner?.avatar ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=" + channel.channelName
            }
            alt={channel.channelName}
          />
        </div>
        <div className="channel-header-info">
          <div className="channel-name-row">
            <h1>{channel.channelName}</h1>
            <span className="verified-badge">
              <FaCheckCircle />
            </span>
          </div>
          <div className="channel-handle-row">
            <span>@{channel.channelName.replace(/\s+/g, "")}</span>
            <span>•</span>
            <span>{formatViews(channel.subscribers)} subscribers</span>
            <span>•</span>
            <span>{videos.length} videos</span>
          </div>
          <div className="channel-about">
            {channel.description
              ? channel.description.substring(0, 80)
              : "Welcome to this channel"}
            <span className="more-link">...more</span>
          </div>
          <div className="channel-subscribe-row" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {isOwner ? (
              <>
                <button
                  className="channel-owner-btn"
                  style={{ backgroundColor: "#0f0f0f", color: "#fff" }}
                  onClick={openUploadModal}
                >
                  <FaUpload style={{ marginRight: "8px" }} />
                  Upload video
                </button>
                <button className="channel-owner-btn" onClick={openEditChannelModal}>
                  <FaPen style={{ marginRight: "8px" }} />
                  Edit channel
                </button>
              </>
            ) : (
              <button className="channel-subscribe-btn">Subscribe</button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="channel-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`channel-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Home" && (
        <>
          {videos.length === 0 ? (
             <div className="channel-empty-state">
               <FaVideo className="empty-icon" />
               <h2>No videos yet</h2>
               <p>Upload your first video to get started!</p>
               {isOwner && (
                 <button
                   className="channel-owner-btn"
                   style={{ backgroundColor: "#0f0f0f", color: "#fff", marginTop: "16px" }}
                   onClick={openUploadModal}
                 >
                   <FaUpload style={{ marginRight: "8px" }} />
                   Upload video
                 </button>
               )}
             </div>
          ) : latestVideo && (
            <Link to={`/video/${latestVideo._id}`} className="featured-video">
              <div className="featured-thumbnail">
                <img src={latestVideo.thumbnailUrl} alt={latestVideo.title} />
              </div>
              <div className="featured-info">
                <h3>{latestVideo.title}</h3>
                <div className="featured-meta">
                  {formatViews(latestVideo.views)} views •{" "}
                  {formatTimeAgo(latestVideo.uploadDate)}
                </div>
                <div className="featured-desc">{latestVideo.description}</div>
              </div>
            </Link>
          )}
        </>
      )}

      {activeTab === "Videos" && (
        <>
          {videos.length === 0 ? (
             <div className="channel-empty-state">
               <FaVideo className="empty-icon" />
               <h2>No videos yet</h2>
               <p>Upload your first video to get started!</p>
               {isOwner && (
                 <button
                   className="channel-owner-btn"
                   style={{ backgroundColor: "#0f0f0f", color: "#fff", marginTop: "16px" }}
                   onClick={openUploadModal}
                 >
                   <FaUpload style={{ marginRight: "8px" }} />
                   Upload video
                 </button>
               )}
             </div>
          ) : (
            <div className="channel-videos-grid">
              {videos.map((video) => (
                <div key={video._id} className="channel-video-card">
                  <Link to={`/video/${video._id}`} className="channel-video-link">
                    <div className="channel-video-thumb">
                      <img src={video.thumbnailUrl} alt={video.title} />
                    </div>
                    <div className="channel-video-title">{video.title}</div>
                    <div className="channel-video-meta">
                      {formatViews(video.views)} views •{" "}
                      {formatTimeAgo(video.uploadDate)}
                    </div>
                  </Link>
                  {isOwner && (
                    <div className="channel-video-actions">
                      <button
                        className="video-action-btn"
                        onClick={() => openEditModal(video)}
                      >
                        <FaPencilAlt /> Edit
                      </button>
                      <button
                        className="video-action-btn delete"
                        onClick={() => setDeletingVideoId(video._id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "Playlists" && (
        <div style={{ color: "#aaa", padding: "24px", textAlign: "center" }}>
          No playlists yet.
        </div>
      )}

      {activeTab === "Posts" && (
        <div style={{ color: "#aaa", padding: "24px", textAlign: "center" }}>
          No community posts yet.
        </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="modal-overlay" onClick={() => setEditingVideo(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit video</h2>
              <button className="modal-close-btn" onClick={() => setEditingVideo(null)}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="modal-field">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditField}
                  placeholder="Enter video title"
                />
              </div>

              <div className="modal-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditField}
                  placeholder="Tell viewers about your video"
                  rows={3}
                />
              </div>

              <div className="modal-field">
                <label>Category</label>
                <select name="category" value={editForm.category} onChange={handleEditField}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Thumbnail URL *</label>
                <input
                  type="url"
                  name="thumbnailUrl"
                  value={editForm.thumbnailUrl}
                  onChange={handleEditField}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="modal-field">
                <label>Video URL * <span className="modal-hint">(YouTube embed URL)</span></label>
                <input
                  type="url"
                  name="videoUrl"
                  value={editForm.videoUrl}
                  onChange={handleEditField}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              {editError && <div className="modal-error">{editError}</div>}

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setEditingVideo(null)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={editing}>
                  {editing ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVideoId && (
        <div className="modal-overlay" onClick={() => setDeletingVideoId(null)}>
          <div className="modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete video?</h2>
              <button className="modal-close-btn" onClick={() => setDeletingVideoId(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="confirm-body">
              <p>
                <strong>"{deletingVideo?.title}"</strong> will be permanently deleted.
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="modal-cancel-btn"
                  onClick={() => setDeletingVideoId(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="modal-submit-btn delete-confirm-btn"
                  onClick={handleDeleteVideo}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Channel Modal */}
      {showEditChannelModal && (
        <div className="modal-overlay" onClick={() => setShowEditChannelModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit channel</h2>
              <button className="modal-close-btn" onClick={() => setShowEditChannelModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleChannelSubmit}>
              <div className="modal-field">
                <label>Channel name *</label>
                <input
                  type="text"
                  name="channelName"
                  value={channelForm.channelName}
                  onChange={handleChannelField}
                  placeholder="Enter channel name"
                />
              </div>
              <div className="modal-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={channelForm.description}
                  onChange={handleChannelField}
                  placeholder="Describe your channel"
                  rows={3}
                />
              </div>
              <div className="modal-field">
                <label>Banner URL</label>
                <input
                  type="url"
                  name="channelBanner"
                  value={channelForm.channelBanner}
                  onChange={handleChannelField}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
              {editChannelError && <div className="modal-error">{editChannelError}</div>}
              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowEditChannelModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={editingChannel}>
                  {editingChannel ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload video</h2>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleUploadSubmit}>
              <div className="modal-field">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadField}
                  placeholder="Enter video title"
                />
              </div>

              <div className="modal-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleUploadField}
                  placeholder="Tell viewers about your video"
                  rows={3}
                />
              </div>

              <div className="modal-field">
                <label>Category</label>
                <select name="category" value={uploadForm.category} onChange={handleUploadField}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Thumbnail URL *</label>
                <input
                  type="url"
                  name="thumbnailUrl"
                  value={uploadForm.thumbnailUrl}
                  onChange={handleUploadField}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="modal-field">
                <label>Video URL * <span className="modal-hint">(YouTube embed URL)</span></label>
                <input
                  type="url"
                  name="videoUrl"
                  value={uploadForm.videoUrl}
                  onChange={handleUploadField}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              {uploadError && <div className="modal-error">{uploadError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelPage;
