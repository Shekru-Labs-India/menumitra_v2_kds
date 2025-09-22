import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "axios";
import { APP_INFO } from "../config"; 

function Login() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!mobileNumber || mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("https://men4u.xyz/v2/common/login", {
        mobile: mobileNumber,
        role: ["admin", "chef", "super_owner"],
        app_type: "kds",
      });

      if (response.data.detail && response.data.detail.includes("successfully")) {
        setShowOtpInput(true);
        localStorage.setItem("user_role", response.data.user_role || response.data.role || "");

      } else {
        setError(response.data.detail || "Failed to send OTP");
      }
    } catch (error) {
      setError(error.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSessionId = (length) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value !== "" && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    const otp = otpValues.join("");
    if (!otp || otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const deviceSessId = generateRandomSessionId(20);
      const fcmToken = "dummy_fcm_token";

      const response = await axios.post("https://men4u.xyz/v2/common/verify_otp", {
        mobile: mobileNumber,
        otp: otp,
        fcm_token: fcmToken,
        device_id: deviceSessId,
        device_model: "web",
        app_type: "kds",
      });

      if (response.data && response.data.access_token) {
        const userData = {
          ...response.data,
          device_id: deviceSessId,
          fcm_token: fcmToken,
          last_activity: new Date().getTime(),
        };

        Object.entries(userData).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === "object" ? JSON.stringify(value) : value.toString());
        });

        localStorage.setItem("outlet_id", response.data.outlet_id);
        navigate("/orders");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <div className="card-login-page-main d-flex flex-column align-items-center justify-content-center" style={{ minWidth: "550px", maxWidth: "800px" }}>
          <div className="login-card-main-box">
            <div className="app-brand justify-content-center ">
            <Link to="/" className="d-flex flex-column app-brand-link" style={{ textDecoration: "none" }}>
              <span className="app-brand-logo demo">
                <img src={logo} alt="MenuMitra" style={{ width: "40px", height: "40px" }} />
              </span>
              <span className="app-brand-text demo text-heading fw-semibold">MenuMitra</span>
            </Link>
            
          </div>
          <div className="d-flex flex-column justify-content-center align-items-center mt-2">
            <span className="app-brand-text demo text-heading fw-semibold text-center pt-3">Kitchen Display System</span>
            <p className = "m-0 pb-1" style={{"color": "gray"}}>Sign in to continue to your account</p>
          </div>
          <div>
            <form id="formAuthentication" className="mb-3 form-container-login fv-plugins-bootstrap5 fv-plugins-framework" onSubmit={showOtpInput ? handleVerifyOTP : handleSendOTP} noValidate="novalidate">
              {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}
              {!showOtpInput ? (
                <div className="form-floating form-floating-outline mb-3 form-control-validation fv-plugins-icon-container">
                  <div>
                    <label htmlFor="mobile">Mobile Number <span className="red-asterisk">*</span></label>
                  </div>
                  <input
                    type="text"
                    className="form-control-login-form"
                    id="mobile"
                    name="mobile"
                    placeholder="Enter your mobile number"
                    value={mobileNumber}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, "").slice(0, 10);
                      if (/^[0-5]/.test(input)) {
                        setError("Mobile number cannot start with digits between 0 and 5.");
                        return;
                      } else {
                        setError("");
                      }
                      setMobileNumber(input);
                    }}
                    autoFocus
                  />
                  
                </div>
              ) : (
                <>
                  <div className="text-center mt-2 mb-4">Enter the 4-digit code sent to {mobileNumber}</div>
                  <div className="d-flex justify-content-center gap-3 mb-5">
                    {otpValues.map((value, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        className="form-control text-center"
                        style={{ width: "50px", height: "40px" }}
                        value={value}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        maxLength={1}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="mb-2">
                <button
                    className={`btn d-grid w-100 waves-effect waves-light ${
                      showOtpInput
                        ? "bg-primary text-white"
                        : mobileNumber.length === 10
                        ? "bg-primary text-white"
                        : "bg-secondary text-white"
                    }`}
                    type="submit"
                    disabled={
                      loading ||
                      (!showOtpInput && mobileNumber.length !== 10) // disable if Send OTP mode and not 10 digits
                    }
                    style={{ height: "40px", borderRadius: "10px" }}
                  >
                    {loading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : showOtpInput ? (
                      "Verify OTP"
                    ) : (
                      "Send OTP"
                    )}
                </button>
              </div>
            </form>
          </div>
          </div>
          <div className=" d-flex justify-content-center gap-1 mt-2">
            <a className="liking-items" href="https://menumitra.com/" target="_blank" rel="noopener noreferrer">
                  <p style={{"color": "gray"}}>Home</p>
            </a>
            <a className="liking-items" href="https://menumitra.com/book_demo/" target="_blank" rel="noopener noreferrer">
                  <p style={{"color": "gray"}}>Book a demo</p>
            </a>
            <a className="liking-items" href="https://menumitra.com/about_us/" target="_blank" rel="noopener noreferrer">
                  <p style={{"color": "gray"}}>Contact</p>
            </a>
            <a className="liking-items" href="https://menumitra.com/support/" target="_blank" rel="noopener noreferrer">
                  <p style={{"color": "gray"}}>Support</p>
            </a>
              
          </div>
          <div className="card-body pt-2">
            {/* Footer brand, social icons, and version inside card */}
            <div className="d-flex flex-column align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <img src={logo} alt="MenuMitra" className="kds-footer-logo" />
                <h5 className="fw-normal text-black mb-0">MenuMitra</h5>
              </div>
              <div className="kds-socials d-flex justify-content-center gap-1 mb-3">
                <a href="https://www.facebook.com/people/Menu-Mitra/61565082412478/" className="kds-social" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="ri-facebook-fill" />
                </a>
                <a href="https://www.instagram.com/menumitra/" className="kds-social" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="ri-instagram-fill" />
                </a>
                <a href="https://www.youtube.com/@menumitra" className="kds-social" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="ri-youtube-fill" />
                </a>
                <a href="https://google.com/MenuMitra" className="kds-social" target="_blank" rel="noopener noreferrer" aria-label="Google">
                  <i className="ri-google-fill" />
                </a>
              </div>
              <div className="kds-version text-center">
                Version {APP_INFO.version} <span className="mx-2">•</span> {APP_INFO.releaseDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;