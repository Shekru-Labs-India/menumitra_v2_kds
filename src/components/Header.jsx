import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // ✅ Menumitra logo

function Header({ filter, onFilterChange, onRefresh }) {
  const [localFilter, setLocalFilter] = useState(filter || "today");
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userId = localStorage.getItem("user_id");
  const outletName = localStorage.getItem("outlet_name"); // ✅ Get hotel/outlet name
  const navigate = useNavigate();

  useEffect(() => {
    setLocalFilter(filter || "today");
  }, [filter]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFullscreen = async () => {
    const elem = document.documentElement;
    try {
      if (!document.fullscreenElement) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen error:", err);
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

  const activeBtnStyle = {
    backgroundColor: "#0d6efd",
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 0 12px rgba(13,110,253,0.7)",
    border: "2px solid #0d6efd",
  };

  const outlineBtnStyle = { backgroundColor: "transparent" };
  const dropdownActiveStyle = {
    fontWeight: 700,
    backgroundColor: "#e9f4ff",
    color: "#0d6efd",
  };

  const changeFilter = (value) => {
    setLocalFilter(value);
    onFilterChange?.(value);
  };

  return (
    <>
      {!isFullscreen && (
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
      )}

      {!isFullscreen && (
        <header
          className="bg-white shadow-sm"
          style={{ marginTop: "35px", position: "relative" }}
        >
          <nav className="navbar navbar-expand-lg navbar-light py-2">
            <div className="container-fluid px-3 d-flex justify-content-between align-items-center">
              
              {/* ✅ Menumitra Logo + Name + Hotel/Outlet Name */}
              <div className="navbar-brand d-flex align-items-center gap-2">
                <img
                  src={logo}
                  alt="Menumitra Logo"
                  style={{ height: "35px", width: "35px", objectFit: "contain" }}
                />
                <span className="fs-5 fw-bold text-dark">Menumitra</span>
                {outletName && (
                  <span className="fs-6 fw-semibold ms-2 text-muted">
                    {outletName.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Center Title */}
              <div
                className="position-absolute top-50 start-50 translate-middle text-center"
                style={{ pointerEvents: "none" }}
              >
                <h1
                  className="mb-0 text-truncate"
                  style={{
                    fontSize: "clamp(20px, 5vw, 36px)",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  K D S
                </h1>
              </div>

              {/* Right Section */}
              <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                
                {/* Mobile dropdown */}
                <div className="dropdown d-lg-none">
                  <button
                    className="btn btn-outline-primary dropdown-toggle"
                    type="button"
                    id="filterDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {localFilter === "today" ? "Today" : "All"}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="filterDropdown">
                    <li>
                      <button
                        className="dropdown-item"
                        style={localFilter === "today" ? dropdownActiveStyle : {}}
                        onClick={() => changeFilter("today")}
                      >
                        Today {localFilter === "today" ? "✓" : ""}
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        style={localFilter === "all" ? dropdownActiveStyle : {}}
                        onClick={() => changeFilter("all")}
                      >
                        All {localFilter === "all" ? "✓" : ""}
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Desktop filter buttons */}
                <div className="btn-group d-none d-lg-flex" role="group">
                  <button
                    type="button"
                    className="btn"
                    style={
                      localFilter === "today" ? activeBtnStyle : outlineBtnStyle
                    }
                    onClick={() => changeFilter("today")}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={localFilter === "all" ? activeBtnStyle : outlineBtnStyle}
                    onClick={() => changeFilter("all")}
                  >
                    All
                  </button>
                </div>

                {/* Refresh */}
                <button
                  className="btn btn-outline-secondary"
                  title="Refresh"
                  onClick={() => onRefresh?.()}
                >
                  <i className="fa-solid fa-rotate" />
                </button>

                {/* Fullscreen */}
                <button
                  className="btn btn-outline-secondary"
                  title="Fullscreen"
                  onClick={handleFullscreen}
                >
                  <i
                    className={
                      isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen"
                    }
                  />
                </button>

                {/* Logout */}
                <button
                  className="btn btn-outline-danger"
                  title="Logout"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>
          </nav>

          {/* Logout Confirmation Modal */}
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
                  maxWidth: "320px",
                }}
              >
                <div className="modal-dialog" style={{ margin: 0 }}>
                  <div
                    className="modal-content"
                    style={{
                      border: "2px solid #dc3545",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div className="modal-header d-flex justify-content-center">
                      <h5 className="modal-title fw-bold text-center">
                        <i
                          className="fa-solid fa-right-from-bracket me-2"
                          style={{ color: "red" }}
                        ></i>
                        Confirm Logout
                      </h5>
                    </div>
                    <div className="modal-body text-center">
                      <p className="fw-bold">Are you sure you want to logout?</p>
                    </div>
                    <div className="modal-footer justify-content-between">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleLogoutConfirm(false)}
                      >
                        <i className="fa-solid fa-xmark me-1"></i> Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleLogoutConfirm(true)}
                      >
                        <i className="fa-solid fa-right-from-bracket me-2"></i> Exit Me
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
