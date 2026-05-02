import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import VideoPage from "./pages/VideoPage";
import ChannelPage from "./pages/ChannelPage";
import Layout from "./components/Layout";

/**
 * App Component
 * 
 * Main entry point for the React application. 
 * Defines the routing structure using React Router.
 * Layout component wraps the main pages to provide consistent UI elements (like Header/Sidebar).
 */
function App() {
  return (
    <div className="app">
      {/* Route definitions for the application */}
      <Routes>
        {/* Home page route */}
        <Route 
          path="/" 
          element={
            <Layout>
              <HomePage />
            </Layout>
          } 
        />
        {/* Video playback page route */}
        <Route 
          path="/video/:id" 
          element={
            <Layout>
              <VideoPage />
            </Layout>
          } 
        />
        {/* User/Channel profile page route */}
        <Route 
          path="/channel/:id" 
          element={
            <Layout>
              <ChannelPage />
            </Layout>
          } 
        />
        {/* Authentication route (Login/Signup) */}
        <Route path="/auth" element={<AuthPage />} />
        {/* 404 Catch-all route */}
        <Route path="*" element={<div style={{ textAlign: "center", padding: "50px" }}><h2>404 - Page Not Found</h2></div>} />
      </Routes>
    </div>
  );
}

export default App;
