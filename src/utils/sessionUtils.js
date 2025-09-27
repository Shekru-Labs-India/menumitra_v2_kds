import { useNavigate } from 'react-router-dom';

export const handleApiError = (error, navigate) => {
  if (error.response) {
    const status = error.response.status;
    
    if (status === 401) {
      // Unauthorized - redirect to login
      localStorage.clear();
      navigate('/login');
      return true;
    }
    
    if (status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden:', error.response.data);
      return false;
    }
    
    if (status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
      return false;
    }
  }
  
  // Network error or other issues
  console.error('API Error:', error.message);
  return false;
};
