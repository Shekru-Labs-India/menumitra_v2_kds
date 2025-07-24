import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header({ outletName }) {
  const [loading, setLoading] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    }
  };

  return (
    !isFullscreen && (
      <header className="bg-white shadow-sm">
        <nav className="navbar navbar-light py-2">
          <div className="container-fluid px-5">
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

            {/* Fullscreen and Logout Buttons - Grouped */}
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
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
              <Link
                to="/login"
                className="btn btn-outline-danger"
                onClick={handleLogout}
                style={{ margin: 0 }}
              >
                <i className="bx bx-log-out"></i>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    )
  );
}

export default Header;
