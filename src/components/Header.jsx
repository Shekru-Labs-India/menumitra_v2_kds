import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // ✅ Menumitra logo
import OutletDropdown from "./OutletDropdown";

function Header({ filter, onFilterChange, onRefresh, onOutletSelect }) {
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [localFilter, setLocalFilter] = useState(filter || "today");
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userId = localStorage.getItem("user_id");
  const outletName = localStorage.getItem("outlet_name"); // ✅ Get hotel/outlet name
  const navigate = useNavigate();

  const handleOutletSelect = (outlet) => {
    setSelectedOutlet(outlet);
    if (onOutletSelect) onOutletSelect(outlet); // Propagate selected outlet to parent
  };

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
      "app_source" : "kds_app"
    };

    await fetch("https://men4u.xyz/v2/common/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logoutData),
    });

    // Clear all relevant keys including outlet related ones
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    localStorage.removeItem("device_id");
    localStorage.removeItem("outlet_id");
    localStorage.removeItem("outlet_name");
    // Or use localStorage.clear() if you want to clear all keys

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

   const toggleBtnStyle = {
    border: "none",
    borderRadius: 0,
    minWidth: 80,
    fontWeight: 600,
    fontSize: 18,
    padding: "8px 26px",
    boxShadow: "none",
  };

  const activeBtnStyle = {
    ...toggleBtnStyle,
    background: "#1673ff",
    color: "#fff",
};

const nonActiveBtnStyle = {
  ...toggleBtnStyle,
  background: "#fff",
  color: "#1673ff",
};



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
                  style={{ height: "40px", width: "40px", objectFit: "contain" }}
                />
                <span className="fs-5 fw-bold text-dark">Menumitra</span>
                
                <div>
                  {/* Pass handleOutletSelect to OutletDropdown */}
                  <OutletDropdown onSelect={handleOutletSelect} />
                </div>
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
                <div className="custom-toggle-group">
                    <button
                      type="button"
                      style={localFilter === "today" ? activeBtnStyle : nonActiveBtnStyle}
                      onClick={() => changeFilter("today")}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      style={localFilter === "all" ? activeBtnStyle : nonActiveBtnStyle}
                      onClick={() => changeFilter("all")}
                    >
                      All
                    </button>
                  </div>


                {/* Refresh */}
                <button
                  className="header-icons-items refresh-btn-heder"
                  title="Refresh"
                  onClick={() => onRefresh?.()}
                >
                  <i className="fa-solid fa-rotate" />
                </button>

                {/* Fullscreen */}
                <button
                  className="header-icons-items btn btn-outline-secondary"
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
                  className="header-icons-items btn btn-outline-danger"
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
                    <div className="modal-footer justify-content-between logout-box-container">
                      <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={() => handleLogoutConfirm(false)}
                      >
                        <i className="fa-solid fa-xmark me-1"></i> Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger mt-2"
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
