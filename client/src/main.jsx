import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css"; // Global styles

/**
 * Main application bootstrap point.
 * - Wraps the app in StrictMode for identifying potential problems.
 * - Uses BrowserRouter for HTML5 history API based routing.
 * - Wraps the app in AuthProvider to inject authentication context globally.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Router provider for managing client-side navigation */}
    <BrowserRouter>
      {/* Global state provider for user authentication context */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
