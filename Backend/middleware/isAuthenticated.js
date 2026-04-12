import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Checking for token in cookies:", !!req.cookies.token);
    console.log("Checking for token in Authorization header:", !!req.headers.authorization);
    
    // Check token from cookies first (for backward compatibility)
    let token = req.cookies.token;
    
    // If no cookie token, check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log("Found token in Authorization header:", token.substring(0, 20) + "...");
      }
    }
    
    if (!token) {
      console.log("No token found in cookies or Authorization header");
      return res
        .status(401)
        .json({ message: "No token provided", success: false });
    }
    
    console.log("Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      console.log("Token verification failed");
      return res.status(401).json({ message: "Invalid token", success: false });
    }
    
    console.log("Token verified successfully, userId:", decoded.userId);
    req.id = decoded.userId;
    next();
  } catch (error) {
    console.log("Token verification error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticateToken;