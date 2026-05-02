import { Link } from "react-router-dom";
import "./VideoCard.css";

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

const VideoCard = ({ video }) => {
  return (
    <Link to={`/video/${video._id}`} className="video-card">
      <div className="video-thumbnail">
        <img src={video.thumbnailUrl} alt={video.title} />
      </div>
      <div className="video-details">
        <div className="channel-avatar">
          <img
            src={
              video.channelId?.avatar ||
              video.uploader?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.channelId?.channelName || "fallback"}`
            }
            alt={video.channelId?.channelName || video.uploader?.username || "Unknown"}
          />
        </div>
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          <div className="channel-name">{video.channelId?.channelName || "Unknown Channel"}</div>
          <div className="video-meta">
            {formatViews(video.views)} views • {formatTimeAgo(video.uploadDate)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
