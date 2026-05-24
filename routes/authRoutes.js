// routes/authRoutes.js
// Authentication routes: signup, login, and profile

const express = require("express");
const router = express.Router();

const { signup, login, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/signup  → Register a new user
router.post("/signup", signup);

// POST /api/auth/login   → Login and receive JWT token
router.post("/login", login);

// GET /api/auth/profile  → Get current user's profile (protected)
router.get("/profile", protect, getProfile);

module.exports = router;
