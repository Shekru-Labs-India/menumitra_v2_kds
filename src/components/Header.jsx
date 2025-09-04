import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Header({
  outletName,
  filter,
  onFilterChange,
  onRefresh,
  manualMode,
  onToggleManualMode,
}) {
  const [loading, setLoading] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const settingsRef = useRef(null);
  const image = localStorage.getItem("image");
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    if (showSettings) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
        device_token: "some-device-token",
      };

      await fetch("https://men4u.xyz/common_api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logoutData),
      });

      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      window.showToast?.("error", error.message || "Failed to log out.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = (confirm) => {
    if (confirm) handleLogout();
    else setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Testing Banner */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#b22222",
          color: "#fff",
          textAlign: "center",
          padding: "3px 0",
          fontSize: "14px",
          fontWeight: "bold",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1100,
        }}
      >
        Testing Environment
      </div>

      {!isFullscreen && (
        <header className="bg-white shadow-sm" style={{ marginTop: "25px", position: "relative" }}>
          <nav className="navbar navbar-light py-2">
            <div className="container-fluid px-5 d-flex justify-content-between align-items-center w-100">
              {/* Logo + Outlet */}
              {!isImageError && image ? (
                <div className="navbar-brand d-flex align-items-center">
                  <img
                    src={image}
                    alt="Hotel Logo"
                    className="me-2 rounded-circle"
                    style={{ width: "40px", height: "40px" }}
                    onError={() => setIsImageError(true)}
                  />
                  <span className="fs-4 fw-bold">{outletName?.toUpperCase()}</span>
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
                  <span className="fs-4 fw-bold">{outletName?.toUpperCase() || "HOTEL"}</span>
                </div>
              )}

              {/* Center Title */}
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

              {/* Controls */}
              <div className="d-flex align-items-center" style={{ gap: 8 }}>
                {/* Filter */}
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${filter === "today" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => onFilterChange("today")}
                    style={{
                      backgroundColor: filter === "today" ? "#007bff" : "transparent",
                      color: filter === "today" ? "#fff" : "#007bff",
                      borderColor: "#007bff",
                      transition: "background-color 0.2s, color 0.2s",
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => onFilterChange("all")}
                    style={{
                      backgroundColor: filter === "all" ? "#007bff" : "transparent",
                      color: filter === "all" ? "#fff" : "#007bff",
                      borderColor: "#007bff",
                      transition: "background-color 0.2s, color 0.2s",
                    }}
                  >
                    All
                  </button>
                </div>

                {/* Refresh */}
                <button
                  className="btn btn-outline-secondary"
                  title="Refresh"
                  onClick={() => onRefresh?.()}
                  style={{ fontSize: 20 }}
                >
                  <i className="fa-solid fa-rotate"></i>
                </button>

                {/* Fullscreen */}
                <button
                  className="btn btn-outline-secondary"
                  title="Fullscreen"
                  onClick={handleFullscreen}
                  style={{ fontSize: 20 }}
                >
                  <i className={isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen"}></i>
                </button>

                {/* ⚙️ Settings */}
                <div className="position-relative" ref={settingsRef}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowSettings((prev) => !prev)}
                    title="Settings"
                  >
                    <i className="fa-solid fa-gear"></i>
                  </button>

                  {showSettings && (
                    <div
                      className="card shadow-sm"
                      style={{
                        position: "absolute",
                        top: "110%",
                        right: 0,
                        zIndex: 1200,
                        minWidth: "86px",
                        height: "auto",
                        padding: "6px 8px",
                        overflow: "hidden",
                      }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <small className="text-muted mb-1">Manual Mode</small>
                        <button
                          className={`btn btn-sm ${manualMode ? "btn-success" : "btn-danger"}`}
                          onClick={() => onToggleManualMode(!manualMode)}
                          style={{ minWidth: 64, padding: "4px 10px", fontSize: 12 }}
                        >
                          {manualMode ? "ON" : "OFF"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout */}
                <button className="btn btn-outline-danger" onClick={() => setShowLogoutConfirm(true)}>
                  <i className="bx bx-log-out"></i>
                </button>
              </div>
            </div>
          </nav>

          {/* Optional overlay + confirm modal */}
          {showLogoutConfirm && (
            <>
              <div
                className="modal-backdrop fade show"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100vh",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1040,
                }}
              />
              <div
                className="modal"
                tabIndex="-1"
                style={{
                  display: "block",
                  position: "fixed",
                  top: "40%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1050,
                  width: "100%",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                <div className="modal-dialog" style={{ margin: 0 }}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <i
                        className="fa-solid fa-right-from-bracket"
                        style={{ fontSize: 24, marginRight: 10, color: "#dc3545" }}
                      ></i>
                      <h5 className="modal-title">Confirm Logout</h5>
                      <button type="button" className="btn-close" onClick={() => setShowLogoutConfirm(false)}></button>
                    </div>
                    <div className="modal-body text-center">
                      <p>Are you sure you want to logout?</p>
                    </div>
                    <div className="modal-footer justify-content-center">
                      <button type="button" className="btn btn-secondary me-4" onClick={() => handleLogoutConfirm(false)}>
                        Cancel
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => handleLogoutConfirm(true)}>
                        Exit Me
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </header>
      )}
    </>
  );
}

export default Header;