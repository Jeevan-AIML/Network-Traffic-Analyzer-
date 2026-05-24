// middleware/authMiddleware.js
// JWT authentication middleware — protects private routes

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect middleware:
 * - Reads the JWT token from the Authorization header (Bearer token)
 * - Verifies and decodes it using the JWT_SECRET
 * - Attaches the authenticated user to req.user
 * - Calls next() if valid, returns 401 if not
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify the token with our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID stored in the token payload
      // Exclude the password field from the result
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // Token is valid — proceed to the route handler
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
