import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header({ outletName, onFilterChange }) {
  const [loading, setLoading] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New state for confirmation dialog
  const [filter, setFilter] = useState("today"); // Default to "Today"

  const image = localStorage.getItem("image");
  const userId = localStorage.getItem("user_id");

  const navigate = useNavigate();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Debug: Log initial filter state to verify default
    console.log("Initial filter state:", filter);
    // Notify parent component (OrdersList) about filter change
    if (onFilterChange) {
      onFilterChange(filter);
    }
  }, [filter, onFilterChange]);

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const logoutData = {
        user_id: userId,
        role: "chef",
        app: "chef",
        device_token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNyIsImV4cCI6MTc1MTIxNTc0NSwiaWF0IjoxNzUwNjEwOTQ1LCJqdGkiOiI3OWEwN2I5NS1lMGNlLTQ3MWMtYjFhMC1iYWIxNjIwOThjMzQiLCJyb2xlIjoiY2hlZiIsImRldmljZSI6IjhTRG9IUlU5OTFXQnNsUllDTUZofHdlYiJ9.aTe59qiGZUylv8AAYdWW-VUaDyc49Ey1puWtRjrO1CI",
      };

      const response = await fetch("https://men4u.xyz/common_api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logoutData),
      });

      const data = await response.json();

      if (data.st === 1) {
        localStorage.clear();
        navigate("/login");
      } else {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      window.showToast?.("error", error.message || "Failed to log out.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = (confirm) => {
    if (confirm) {
      handleLogout();
    } else {
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      {/* Testing Environment Banner */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#b22222", // Darker red color
          color: "#fff",
          textAlign: "center",
          padding: "3px 0", // Reduced height
          fontSize: "14px",
          fontWeight: "bold",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1100, // Above header and modal
        }}
      >
        Testing Environment
      </div>

      {/* Header Section */}
      {!isFullscreen && (
        <header className="bg-white shadow-sm" style={{ marginTop: "25px", position: "relative" }}>
          <nav className="navbar navbar-light py-2">
            <div className="container-fluid px-5 d-flex justify-content-between align-items-center w-100">
              {/* Brand/Logo */}
              {!isImageError && image ? (
                <div className="navbar-brand d-flex align-items-center">
                  <img
                    src={image}
                    alt="Hotel Logo"
                    className="me-2 rounded-circle"
                    style={{ width: "40px", height: "40px" }}
                    onError={() => setIsImageError(true)}
                  />
                  <span className="fs-4 fw-bold">
                    {outletName?.toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="navbar-brand d-flex align-items-center">
                  <div
                    className="me-2 d-flex justify-content-center align-items-center rounded-circle"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#ddd",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    {outletName?.[0]?.toUpperCase() || "H"}
                  </div>
                  <span className="fs-4 fw-bold">
                    {outletName?.toUpperCase() || "HOTEL"}
                  </span>
                </div>
              )}

              {/* Centered Title */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                  zIndex: 1,
                }}
              >
                Kitchen Display System
              </div>

              {/* Toggle, Refresh, Fullscreen, and Logout Buttons - Grouped */}
              <div className="d-flex align-items-center" style={{ gap: 8 }}>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${filter === "today" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("today")}
                    // "Today" is blue by default when filter is "today"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("all")}
                    // "All" turns blue when filter is "all"
                  >
                    All
                  </button>
                </div>
                <button
                  className="btn btn-outline-secondary"
                  title="Refresh"
                  style={{ fontSize: 20, paddingRight: 8, paddingLeft: 8, margin: 0 }}
                >
                  <i className="fa-solid fa-rotate"></i>
                </button>
                <button
                  className="btn btn-outline-secondary"
                  title="Fullscreen"
                  onClick={handleFullscreen}
                  style={{
                    fontSize: 20,
                    paddingRight: 8,
                    paddingLeft: 8,
                    margin: 0,
                  }}
                >
                  <i
                    className={
                      isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen"
                    }
                  ></i>
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{ margin: 0 }}
                >
                  <i className="bx bx-log-out"></i>
                </button>
              </div>
            </div>
          </nav>

          {/* Overlay for darkening background */}
          {showLogoutConfirm && (
            <div
              className="modal-backdrop fade show"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100vh", // Ensure full viewport height
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
                zIndex: 1040, // Below modal (1050)
              }}
            />
          )}

          {/* Confirmation Dialog */}
          {showLogoutConfirm && (
            <div
              className="modal"
  tabIndex="-1"
  style={{
    display: "block",
    position: "fixed",
    top: "40%",              // ⬅️ Move down (try 55%, 60%, 65% based on preference)
    left: "50%",
    transform: "translateX(-50%)", // ⬅️ Only center horizontally, not vertically
    zIndex: 1050,
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  }}
            >
              <div
                className="modal-dialog"
                style={{ margin: 0 }} // Remove default modal margin
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <i
                      className="fa-solid fa-right-from-bracket"
                      style={{ fontSize: "24px", marginRight: "10px", color: "#dc3545" }} // Matches Exit Me button color
                    ></i>
                    <h5 className="modal-title">Confirm Logout</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowLogoutConfirm(false)}
                    ></button>
                  </div>
                  <div className="modal-body text-center">
                    <p>Are you sure you want to logout?</p>
                  </div>
                  <div className="modal-footer justify-content-center">
                    <button
                      type="button"
                      className="btn btn-secondary me-4"
                      onClick={() => handleLogoutConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleLogoutConfirm(true)}
                    >
                      Exit Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
      )}
    </>
  );
}

export default Header;