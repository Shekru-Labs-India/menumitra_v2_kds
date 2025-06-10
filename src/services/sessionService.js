export const sessionService = {
  // Check if session is valid
  isSessionValid: () => {
    const authData = localStorage.getItem("authData");
    if (!authData) return false;

    const { last_activity } = JSON.parse(authData);
    const currentTime = new Date().getTime();
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Check if session has expired
    if (currentTime - last_activity > sessionTimeout) {
      sessionService.clearSession();
      return false;
    }

    // Update last activity time
    sessionService.updateLastActivity();
    return true;
  },

  // Update last activity time
  updateLastActivity: () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const data = JSON.parse(authData);
      data.last_activity = new Date().getTime();
      localStorage.setItem("authData", JSON.stringify(data));
      localStorage.setItem("last_activity", data.last_activity.toString());
    }
  },

  // Clear session data
  clearSession: () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("outlet_id");
    localStorage.removeItem("outlet_name");
    localStorage.removeItem("image");
    localStorage.removeItem("fcmToken");
    localStorage.removeItem("access");
    localStorage.removeItem("device_id");
    localStorage.removeItem("last_activity");
    localStorage.removeItem("authData");
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem("access");
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem("access") && sessionService.isSessionValid();
  },
};
