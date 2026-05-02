import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout">
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`page-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
