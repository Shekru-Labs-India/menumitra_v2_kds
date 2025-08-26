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
      const response = await axios.post("https://ghanish.in/v2/common/login", {
        mobile: mobileNumber,
        role: ["admin", "chef"],
        app_type: "pos",
      });

      if (response.data.detail && response.data.detail.includes("successfully")) {
        setShowOtpInput(true);
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

      const response = await axios.post("https://ghanish.in/v2/common/verify_otp", {
        mobile: mobileNumber,
        otp: otp,
        fcm_token: fcmToken,
        device_id: deviceSessId,
        device_model: "web",
        app_type: "pos",
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
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card rounded-4" style={{ maxWidth: "800px", height: "450px", width: "100%" }}>
          <div className="app-brand justify-content-center mt-5">
            <Link to="/" className="app-brand-link gap-3">
              <span className="app-brand-logo demo">
                <img src={logo} alt="MenuMitra" style={{ width: "40px", height: "40px" }} />
              </span>
              <span className="app-brand-text demo text-heading fw-semibold">MenuMitra</span>
            </Link>
          </div>
          <span className="app-brand-text demo text-heading fw-semibold text-center pt-5">Kitchen Display System</span>
          <div className="card-body pt-4">
            <form id="formAuthentication" className="mb-3 fv-plugins-bootstrap5 fv-plugins-framework" onSubmit={showOtpInput ? handleVerifyOTP : handleSendOTP} noValidate="novalidate">
              {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}

              {!showOtpInput ? (
                <div className="form-floating form-floating-outline mb-5 form-control-validation fv-plugins-icon-container">
                  <input
                    type="text"
                    className="form-control"
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
                  <label htmlFor="mobile">Mobile Number</label>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">Enter the 4-digit code sent to {mobileNumber}</div>
                  <div className="d-flex justify-content-center gap-3 mb-5">
                    {otpValues.map((value, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        className="form-control text-center"
                        style={{ width: "50px", height: "50px" }}
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

              <div className="mb-5">
                <button
                  className="btn bg-primary text-white d-grid w-100 waves-effect waves-light"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : showOtpInput ? "Verify OTP" : "Send OTP"}
                </button>
              </div>
            </form>

       

            {/* Footer brand, social icons, and version inside card */}
            <div className="d-flex flex-column align-items-center justify-content-center mt-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <img src={logo} alt="MenuMitra" className="kds-footer-logo me-2" />
                <h5 className="fw-normal text-black mb-0">MenuMitra</h5>
              </div>
              <div className="kds-socials d-flex justify-content-center gap-4 mb-3">
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
                version {APP_INFO.version} <span className="mx-2">•</span> {APP_INFO.releaseDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;