import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import FilterButtons from "../components/FilterButtons";
import VideoCard from "../components/VideoCard";
import "./HomePage.css";

/**
 * HomePage Component
 * 
 * Renders the main dashboard of the application displaying a grid of video cards.
 * It handles fetching videos from the backend, filtering them based on category,
 * and displaying search results based on the URL search parameters.
 */
const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  
  // To get search query from URL (e.g., /?search=react)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError("");
      try {
        // Build query string
        let query = "";
        if (searchQuery) {
          query = `?search=${searchQuery}`;
        } else if (activeFilter !== "All") {
          query = `?category=${activeFilter}`;
        }

        const { data } = await API.get(`/videos${query}`);
        setVideos(data);
      } catch (err) {
        setError("Failed to fetch videos. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeFilter, searchQuery]); // Re-fetch when filter or search changes

  return (
    <div className="homepage">
      {!searchQuery && (
        <FilterButtons 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />
      )}
      
      {searchQuery && (
        <div style={{ padding: "16px 24px", fontSize: "1.2rem", fontWeight: "500" }}>
          Search results for "{searchQuery}"
        </div>
      )}

      {loading ? (
        <div className="loading-message">Loading videos...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : videos.length === 0 ? (
        <div className="no-results">No videos found.</div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
