import axios from "axios";
import { API_URL } from "../config";

export const authService = {
  // Send OTP
  sendOTP: async (mobileNumber) => {
    try {
      const response = await fetch("https://men4u.xyz/common_api/user_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobileNumber, role: "chef" }),
      });
      const result = await response.json();
      if (result.st === 1) {
        return { success: true, message: result.msg, role: result.role };
      } else {
        // Check for maximum sessions error
        if (
          result.msg &&
          result.msg.toLowerCase().includes("maximum active sessions")
        ) {
          return {
            success: false,
            error:
              "Maximum active sessions reached. Please logout from other devices.",
            isMaxSessionsError: true,
          };
        }
        return { success: false, error: result.msg || "Failed to send OTP" };
      }
    } catch (error) {
      console.error("OTP Send Error:", error);
      return { success: false, error: "Failed to send OTP" };
    }
  },

  // Verify OTP
  verifyOTP: async (mobile, otp, fcmToken) => {
    const generateRandomSessionId = (length) => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let sessionId = "";
      for (let i = 0; i < length; i++) {
        sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return sessionId;
    };

    // Generate a 20-character session ID
    const deviceSessId = generateRandomSessionId(20);

    try {
      const response = await fetch(
        "https://men4u.xyz/kitchen_display_system_api/kds_verify_otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: mobile,
            otp,
            fcm_token: fcmToken,
            device_id: deviceSessId,
            device_model: "web",
          }),
        }
      );
      const result = await response.json();

      if (result.st === 1) {
        // Store all necessary session data
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("outlet_id", result.outlet_id);
        localStorage.setItem("outlet_name", result.outlet_name);
        localStorage.setItem("image", result.image);
        localStorage.setItem("fcmToken", fcmToken);
        localStorage.setItem("access", result.access);
        localStorage.setItem("device_id", deviceSessId);
        localStorage.setItem("last_activity", new Date().getTime().toString());
        localStorage.setItem("device_token", result.device_token);

        // Store the complete auth data for easy access
        const authData = {
          user_id: result.user_id,
          outlet_id: result.outlet_id,
          outlet_name: result.outlet_name,
          image: result.image,
          access: result.access,
          device_id: deviceSessId,
          last_activity: new Date().getTime(),
        };
        localStorage.setItem("authData", JSON.stringify(authData));
      }

      return result;
    } catch (error) {
      console.error("OTP Verification Error:", error);
      return { st: 0, msg: "Failed to verify OTP" };
    }
  },
};
