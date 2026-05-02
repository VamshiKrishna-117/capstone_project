import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaYoutube, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import "./AuthPage.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const clearField = (name) =>
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setUsername("");
    setEmail("");
    setPassword("");
    setFieldErrors({});
    setServerError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const errs = {};
    if (!isLogin && username.trim().length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!emailRegex.test(email))
      errs.email = "Enter a valid email address.";
    if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    try {
      if (isLogin) {
        await login(email, password);
        navigate("/");
      } else {
        await register(username, email, password);
        // Switch to login tab and show success — do NOT auto-navigate
        setIsLogin(true);
        setUsername("");
        setEmail("");
        setPassword("");
        setFieldErrors({});
        setServerError("");
        setSuccessMessage("Account created! Please sign in.");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <FaYoutube />
          <span>YouTube</span>
        </div>
        <h2>{isLogin ? "Sign in" : "Create your Account"}</h2>
        <p className="auth-subtitle">to continue to YouTube Clone</p>

        {successMessage && (
          <div className="auth-success">
            <FaCheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        {serverError && (
          <div className="auth-error">
            <FaExclamationCircle />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearField("username"); }}
                placeholder="Username"
              />
              <label htmlFor="username">Username</label>
              {fieldErrors.username && (
                <span className="field-error">{fieldErrors.username}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearField("email"); }}
              placeholder="Email"
            />
            <label htmlFor="email">Email</label>
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearField("password"); }}
              placeholder="Password"
            />
            <label htmlFor="password">Password</label>
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="auth-actions">
            <button
              type="button"
              className="auth-toggle-btn"
              onClick={() => switchTab(!isLogin)}
            >
              {isLogin ? "Create account" : "Sign in instead"}
            </button>
            <button type="submit" className="auth-submit">
              {isLogin ? "Next" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
