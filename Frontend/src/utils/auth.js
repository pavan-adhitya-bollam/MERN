// Utility functions for authentication persistence

// Check if user is logged in on app startup
export const checkAuthState = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  console.log("=== AUTH STATE CHECK ===");
  console.log("Token exists:", !!token);
  console.log("User data exists:", !!userStr);
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log("Parsed user:", user);
      return { token, user };
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  }
  return null;
};

// Save user state to localStorage
export const saveAuthState = (token, user) => {
  console.log("=== SAVING AUTH STATE ===");
  console.log("Saving token:", token ? token.substring(0, 20) + "..." : null);
  console.log("Saving user:", user);
  
  if (token) {
    localStorage.setItem("token", token);
  }
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

// Clear auth state
export const clearAuthState = () => {
  console.log("=== CLEARING AUTH STATE ===");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};
