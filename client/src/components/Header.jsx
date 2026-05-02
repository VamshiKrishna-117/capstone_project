import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaYoutube, FaBars, FaSearch, FaUserCircle, FaVideo, FaBell, FaSignOutAlt, FaIdBadge, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Header.css";

const EMPTY_CHANNEL_FORM = {
  channelName: "",
  description: "",
  avatar: "",
  channelBanner: "",
};

const Header = ({ toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CHANNEL_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search: navigate on every keystroke with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        navigate("/");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleMyChannel = async () => {
    setShowDropdown(false);
    try {
      const { data } = await API.get("/channels/my");
      navigate(`/channel/${data.channel._id}`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setCreateForm(EMPTY_CHANNEL_FORM);
        setCreateError("");
        setShowCreateModal(true);
      } else if (status === 401) {
        logout();
        navigate("/auth");
      } else {
        console.error("Failed to load channel", err);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const handleCreateField = (e) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.channelName.trim()) {
      setCreateError("Channel name is required.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const { data } = await API.post("/channels", {
        channelName: createForm.channelName.trim(),
        description: createForm.description.trim(),
        avatar: createForm.avatar.trim() || undefined,
        channelBanner: createForm.channelBanner.trim() || undefined,
      });
      setShowCreateModal(false);
      navigate(`/channel/${data._id}`);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create channel. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <FaBars className="menu-icon" onClick={toggleSidebar} />
          <Link to="/" className="header-logo">
            <FaYoutube />
            <span>YouTube</span>
          </Link>
        </div>

        <form className="header-center" onSubmit={handleSearch}>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </div>
        </form>

        <div className="header-right">
          {user ? (
            <>
              <button className="icon-btn"><FaVideo /></button>
              <button className="icon-btn"><FaBell /></button>
              <div className="user-profile-wrapper" ref={dropdownRef}>
                <div
                  className="user-profile"
                  style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>

                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="user-avatar-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="dropdown-user-info">
                        <div className="dropdown-name">{user.username}</div>
                        <div className="dropdown-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleMyChannel}>
                      <FaIdBadge className="dropdown-icon" />
                      <span>Your channel</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowDropdown(false); logout(); }}>
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth">
              <button className="sign-in-btn">
                <FaUserCircle size={20} />
                Sign in
              </button>
            </Link>
          )}
        </div>
      </header>

      {showCreateModal && (
        <div className="cc-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h2>Create your channel</h2>
              <button className="cc-close-btn" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {/* Live preview */}
              <div className="cc-preview">
                <div className="cc-banner-preview">
                  {createForm.channelBanner
                    ? <img src={createForm.channelBanner} alt="banner preview" className="cc-banner-img" onError={(e) => e.target.style.display = "none"} />
                    : <div className="cc-banner-empty">Banner preview</div>
                  }
                </div>
                <div className="cc-avatar-preview">
                  {createForm.avatar
                    ? <img src={createForm.avatar} alt="avatar preview" className="cc-avatar-img" onError={(e) => e.target.style.display = "none"} />
                    : <div className="cc-avatar-fallback">{user.username.charAt(0).toUpperCase()}</div>
                  }
                </div>
              </div>

              <div className="cc-fields">
                <div className="cc-field">
                  <label>Channel name <span className="cc-required">*</span></label>
                  <input
                    type="text"
                    name="channelName"
                    value={createForm.channelName}
                    onChange={handleCreateField}
                    placeholder="Enter your channel name"
                    autoFocus
                  />
                </div>

                <div className="cc-field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateField}
                    placeholder="Tell viewers about your channel"
                    rows={3}
                  />
                </div>

                <div className="cc-field">
                  <label>Profile picture URL</label>
                  <input
                    type="url"
                    name="avatar"
                    value={createForm.avatar}
                    onChange={handleCreateField}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="cc-field">
                  <label>Banner URL</label>
                  <input
                    type="url"
                    name="channelBanner"
                    value={createForm.channelBanner}
                    onChange={handleCreateField}
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                {createError && <div className="cc-error">{createError}</div>}

                <div className="cc-actions">
                  <button type="button" className="cc-cancel-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="cc-submit-btn" disabled={creating}>
                    {creating ? "Creating..." : "Create channel"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
