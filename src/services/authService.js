import axios from "axios";
import { API_URL } from "../config";

const BASE_URL = "https://men4u.xyz/v2/common";

export const authService = {
  // Send OTP
  sendOTP: async (mobileNumber) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        mobile: mobileNumber,
        role: "chef"
      });

      // API returns: {"detail": "Your OTP is sent successfully.", "role": "chef"}
      return response.data;
    } catch (error) {
      console.error("OTP Send Error:", error.response?.data || error.message);
      throw error.response?.data || { detail: "Failed to send OTP" };
    }
  },

  // Verify OTP
  verifyOTP: async (mobile, otp, fcmToken) => {
    const generateRandomSessionId = (length) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };

    const deviceSessId = generateRandomSessionId(20);

    try {
      const response = await axios.post(`${BASE_URL}/verify_otp`, {
        mobile,
        otp,
        fcm_token: fcmToken,
        device_id: deviceSessId,
        device_model: "web"
      });

      // API returns user data with access token
      const userData = {
        ...response.data,
        device_id: deviceSessId,
        fcm_token: fcmToken,
        last_activity: new Date().getTime()
      };

      // Store auth data in localStorage
      Object.entries(userData).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
      });

      // Store complete data for easy access
      localStorage.setItem("authData", JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error("OTP Verification Error:", error.response?.data || error.message);
      throw error.response?.data || { detail: "Failed to verify OTP" };
    }
  },
};
