function showToast(type, message) {
  let toast = document.getElementById("toast");

  // Check if the toast container exists, create it if not
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  let icon;
  let title;
  let duration = 3000; // Default duration of 3 seconds

  switch (type) {
    case "success":
      icon = '<i class="fas fa-check-circle"></i>'; // Success icon
      title = "Success";
      break;
    case "error":
      icon = '<i class="fas fa-times-circle"></i>'; // Error icon
      title = "Error";
      break;
    case "info":
      icon = '<i class="fas fa-info-circle"></i>'; // Info icon
      title = "Info";
      break;
    case "warning":
      icon = '<i class="fas fa-exclamation-triangle"></i>'; // Warning icon
      title = "Warning";
      break;
    case "notification":
      icon = '<i class="fas fa-bell"></i>'; // Default notification icon
      title = "Notification";
      duration = 5000; // Set duration to 10 seconds for notifications
      break;
    default:
      icon = '<i class="fas fa-bell"></i>'; // Default notification icon
      title = "Notification";
  }

  // Set content and classes
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <div class="message">
        <span class="text-title">${title}</span>
        <span class="text-body">${message}</span>
      </div>
    </div>
    <i class="fas fa-times close" onclick="window.hideToast()"></i>
    <div class="progress-bar"></div>
  `;

  // Show the toast
  toast.classList.add("show");

  // Hide the toast after the specified duration
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

function hideToast() {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.classList.remove("show");
  }
}

// Attach showToast and hideToast to window
window.showToast = showToast;
window.hideToast = hideToast;
