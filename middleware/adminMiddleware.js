// middleware/adminMiddleware.js
// Admin-only route guard — must be used AFTER protect middleware

/**
 * adminOnly middleware:
 * - Checks if the authenticated user has the "admin" role
 * - Allows access if admin, otherwise returns 403 Forbidden
 *
 * USAGE: router.get("/some-route", protect, adminOnly, controller)
 * NOTE: Always use protect before adminOnly
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // User is admin — allow access
  } else {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }
};

module.exports = { adminOnly };
