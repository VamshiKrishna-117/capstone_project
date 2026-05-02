import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaThumbsUp, FaThumbsDown, FaShare, FaEllipsisH, FaPencilAlt, FaTrash } from "react-icons/fa";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./VideoPage.css";

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";
  // Already an embed URL
  if (url.includes("youtube.com/embed/")) return url;

  let videoId = null;

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) videoId = shortMatch[1];

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  if (watchMatch) videoId = watchMatch[1];

  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shortsMatch) videoId = shortsMatch[1];

  // youtube.com/v/VIDEO_ID
  const vMatch = url.match(/youtube\.com\/v\/([^?&]+)/);
  if (vMatch) videoId = vMatch[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const VideoPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Description toggle
  const [descExpanded, setDescExpanded] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState("");
  const [showCommentActions, setShowCommentActions] = useState(false);

  // Like / dislike — synced with backend, optimistic updates
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  // View count (local copy, incremented on load)
  const [viewCount, setViewCount] = useState(0);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch the video
        const { data: videoData } = await API.get(`/videos/${id}`);
        setVideo(videoData);

        // Initialise like / dislike state from server data
        const likesArr = videoData.likes ?? [];
        const dislikesArr = videoData.dislikes ?? [];
        setLikeCount(likesArr.length);
        setDislikeCount(dislikesArr.length);
        setLiked(user ? likesArr.includes(user._id) : false);
        setDisliked(user ? dislikesArr.includes(user._id) : false);

        // Initialise view count then increment it (1.4)
        setViewCount(videoData.views ?? 0);
        try {
          await API.post(`/videos/${id}/view`);
          setViewCount((prev) => prev + 1);
        } catch {
          // Endpoint added in Phase 2 — silently ignore until then
        }

        // Fetch comments for this video
        const { data: commentsData } = await API.get(`/comments/${id}`);
        setComments(commentsData);

        // Fetch recommended videos (all videos minus current)
        const { data: allVideos } = await API.get("/videos");
        setRecommended(allVideos.filter((v) => v._id !== id));
      } catch (err) {
        setError("Failed to load video.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Reset states when video changes
    setDescExpanded(false);
    setLiked(false);
    setDisliked(false);
    setLikeCount(0);
    setDislikeCount(0);
    setViewCount(0);
    setCommentText("");
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = async () => {
    if (!user) { navigate("/auth"); return; }

    // Optimistic update
    const prevLiked = liked;
    const prevDisliked = disliked;
    setLiked(!prevLiked);
    setLikeCount((prev) => (prevLiked ? prev - 1 : prev + 1));
    if (prevDisliked) {
      setDisliked(false);
      setDislikeCount((prev) => prev - 1);
    }

    try {
      const { data } = await API.post(`/videos/${id}/like`);
      setLiked(data.liked);
      setDisliked(data.disliked);
      setLikeCount(data.likes);
      setDislikeCount(data.dislikes);
    } catch {
      // Revert optimistic update on failure
      setLiked(prevLiked);
      setDisliked(prevDisliked);
      setLikeCount((prev) => (prevLiked ? prev + 1 : prev - 1));
      if (prevDisliked) setDislikeCount((prev) => prev + 1);
    }
  };

  const handleDislike = async () => {
    if (!user) { navigate("/auth"); return; }

    // Optimistic update
    const prevDisliked = disliked;
    const prevLiked = liked;
    setDisliked(!prevDisliked);
    setDislikeCount((prev) => (prevDisliked ? prev - 1 : prev + 1));
    if (prevLiked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    }

    try {
      const { data } = await API.post(`/videos/${id}/dislike`);
      setLiked(data.liked);
      setDisliked(data.disliked);
      setLikeCount(data.likes);
      setDislikeCount(data.dislikes);
    } catch {
      // Revert optimistic update on failure
      setDisliked(prevDisliked);
      setLiked(prevLiked);
      setDislikeCount((prev) => (prevDisliked ? prev + 1 : prev - 1));
      if (prevLiked) setLikeCount((prev) => prev + 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      const { data } = await API.post(`/comments/${id}`, {
        text: commentText,
      });
      setComments([data, ...comments]);
      setCommentText("");
      setShowCommentActions(false);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleCancelComment = () => {
    setCommentText("");
    setShowCommentActions(false);
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const { data } = await API.put(`/comments/${commentId}`, { text: editText });
      setComments(comments.map((c) => (c._id === commentId ? data : c)));
      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error("Error editing comment:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  if (loading) return <div className="video-loading">Loading video...</div>;
  if (error) return <div className="video-error">{error}</div>;
  if (!video) return <div className="video-error">Video not found.</div>;

  return (
    <div className="video-page">
      {/* ---- Left: Primary Content ---- */}
      <div className="video-primary">
        {/* Video Player (YouTube Embed) */}
        <div className="video-player">
          <iframe
            src={getYouTubeEmbedUrl(video.videoUrl)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Video Title */}
        <h1 className="video-title">{video.title}</h1>

        {/* Action Row */}
        <div className="video-actions">
          <div className="channel-info">
            <div className="channel-avatar-lg">
              <img
                src={
                  video.channelId?.avatar ||
                  video.uploader?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.channelId?.channelName || "fallback"}`
                }
                alt={video.channelId?.channelName || video.uploader?.username}
              />
            </div>
            <div className="channel-text">
              <Link to={`/channel/${video.channelId?._id}`} className="name">
                {video.channelId?.channelName || "Unknown Channel"}
              </Link>
              <span className="subs">
                {video.channelId?.subscribers
                  ? formatViews(video.channelId.subscribers) + " subscribers"
                  : ""}
              </span>
            </div>
            <div className="channel-buttons">
              <button className="join-btn">Join</button>
              <button className="subscribe-btn">Subscribe</button>
            </div>
          </div>

          <div className="action-buttons">
            <div className="like-dislike">
              <button
                className={`action-btn ${liked ? "active" : ""}`}
                onClick={handleLike}
              >
                <FaThumbsUp /> {formatViews(likeCount)}
              </button>
              <button
                className={`action-btn ${disliked ? "active" : ""}`}
                onClick={handleDislike}
              >
                <FaThumbsDown /> {dislikeCount > 0 ? formatViews(dislikeCount) : ""}
              </button>
            </div>
            <button className="action-btn">
              <FaShare /> Share
            </button>
            <button className="action-btn">
              <FaEllipsisH />
            </button>
          </div>
        </div>

        {/* Description */}
        <div
          className="video-description"
          onClick={() => setDescExpanded(!descExpanded)}
        >
          <div className="desc-meta">
            {formatViews(viewCount)} views • {formatDate(video.uploadDate)}
          </div>
          <div className={`desc-text ${descExpanded ? "" : "collapsed"}`}>
            {video.description}
          </div>
          <button className="show-more-btn">
            {descExpanded ? "Show less" : "...more"}
          </button>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="comments-header">
            <h3>{comments.length} Comments</h3>
          </div>

          {/* Comment Input */}
          {user ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <div className="user-avatar-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => setShowCommentActions(true)}
                />
                {showCommentActions && (
                  <div className="comment-form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCancelComment}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="post-btn"
                      disabled={!commentText.trim()}
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <p style={{ color: "#aaa", marginBottom: "16px" }}>
              <Link to="/auth" style={{ color: "#3ea6ff" }}>
                Sign in
              </Link>{" "}
              to add a comment.
            </p>
          )}

          {/* Comments List */}
          {comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar">
                {comment.userId?.username
                  ? comment.userId.username.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div className="comment-body">
                <div className="comment-author">
                  @{comment.userId?.username || "Unknown"}
                  <span>{formatTimeAgo(comment.createdAt)}</span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="comment-edit-wrapper">
                    <input
                      type="text"
                      className="comment-edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <div className="comment-edit-actions">
                      <button className="cancel-btn" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                      <button
                        className="post-btn"
                        onClick={() => handleSaveEdit(comment._id)}
                        disabled={!editText.trim()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="comment-text">{comment.text}</div>
                )}

                {user && user._id === comment.userId?._id && editingCommentId !== comment._id && (
                  <div className="comment-actions">
                    <button
                      className="comment-action-btn"
                      onClick={() => handleEditComment(comment)}
                    >
                      <FaPencilAlt /> Edit
                    </button>
                    <button
                      className="comment-action-btn delete"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Right: Recommended Sidebar ---- */}
      <div className="video-secondary">
        {/* Filter pills */}
        <div className="sidebar-filters">
          <button className="sidebar-filter-btn active">All</button>
          <button className="sidebar-filter-btn">
            From {video.channelId?.channelName || "Channel"}
          </button>
          <button className="sidebar-filter-btn">Related</button>
        </div>

        {recommended.map((rec) => (
          <Link
            key={rec._id}
            to={`/video/${rec._id}`}
            className="recommended-card"
          >
            <div className="rec-thumbnail">
              <img src={rec.thumbnailUrl} alt={rec.title} />
            </div>
            <div className="rec-info">
              <div className="rec-title">{rec.title}</div>
              <div className="rec-channel">
                {rec.channelId?.channelName || "Unknown"}
              </div>
              <div className="rec-meta">
                {formatViews(rec.views)} views • {formatTimeAgo(rec.uploadDate)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoPage;
