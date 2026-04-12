import axios from "axios";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: "https://dreamhire-backend-ljay.onrender.com/api",
  withCredentials: true, // Important for cookies
});

// Add request interceptor to include Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Adding Authorization header:", `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("Token expired or invalid, clearing localStorage");
      localStorage.removeItem("token");
      // Redirect to login or handle logout
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
