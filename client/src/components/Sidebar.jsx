import {
  FaUser,
  FaHistory,
  FaListAlt,
  FaClock,
  FaThumbsUp,
  FaVideo,
  FaDownload,
  FaGraduationCap,
  FaCut,
  FaChevronUp,
  FaChevronDown,
  FaShoppingBag,
  FaMusic,
  FaFilm,
  FaYoutube,
} from "react-icons/fa";
import "./Sidebar.css";

const SidebarItem = ({ icon, label }) => (
  <div className="sidebar-category">
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

const SidebarHeader = ({ label }) => (
  <div className="sidebar-section-header">{label}</div>
);

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* You */}
      <div className="sidebar-categories">
        <SidebarHeader label="You ›" />
        <SidebarItem icon={<FaUser />} label="Your channel" />
        <SidebarItem icon={<FaHistory />} label="History" />
        <SidebarItem icon={<FaListAlt />} label="Playlists" />
        <SidebarItem icon={<FaClock />} label="Watch Later" />
        <SidebarItem icon={<FaThumbsUp />} label="Liked videos" />
        <SidebarItem icon={<FaVideo />} label="Your videos" />
        <SidebarItem icon={<FaDownload />} label="Downloads" />
        <SidebarItem icon={<FaGraduationCap />} label="Courses" />
        <SidebarItem icon={<FaCut />} label="Clips" />
        <div className="sidebar-category sidebar-toggle-row">
          <span><FaChevronUp /></span>
          <span>Show fewer</span>
        </div>
      </div>

      {/* Explore */}
      <div className="sidebar-categories">
        <SidebarHeader label="Explore" />
        <SidebarItem icon={<FaShoppingBag />} label="Shopping" />
        <SidebarItem icon={<FaMusic />} label="Music" />
        <SidebarItem icon={<FaFilm />} label="Films" />
        <div className="sidebar-category sidebar-toggle-row">
          <span><FaChevronDown /></span>
          <span>Show more</span>
        </div>
      </div>

      {/* More from YouTube */}
      <div className="sidebar-categories">
        <SidebarHeader label="More from YouTube" />
        <div className="sidebar-category">
          <span className="sidebar-yt-icon"><FaYoutube /></span>
          <span>YouTube Music</span>
        </div>
        <div className="sidebar-category">
          <span className="sidebar-yt-icon"><FaYoutube /></span>
          <span>YouTube Kids</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
