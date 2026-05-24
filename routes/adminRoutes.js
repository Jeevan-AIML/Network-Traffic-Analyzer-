// routes/adminRoutes.js
// Admin-only routes: user management and system statistics
// Requires both JWT auth (protect) AND admin role (adminOnly)

const express = require("express");
const router = express.Router();

const { getAllUsers, deleteUser, getSystemStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Middleware chain: protect (JWT check) → adminOnly (role check) → controller

// GET    /api/admin/users        → List all registered users
// (no POST — user creation is done via /api/auth/signup)
router.get("/users", protect, adminOnly, getAllUsers);

// DELETE /api/admin/users/:id    → Delete a user account
router.delete("/users/:id", protect, adminOnly, deleteUser);

// GET    /api/admin/stats        → System-wide statistics
router.get("/stats", protect, adminOnly, getSystemStats);

module.exports = router;
