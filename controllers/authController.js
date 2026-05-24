// controllers/authController.js
// Handles user registration, login, and profile retrieval

const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * generateToken:
 * Creates a signed JWT containing the user's ID.
 * Expires in 7 days.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ─── @route  POST /api/auth/signup ───────────────────────────────────────────
// @desc   Register a new user
// @access Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create user — password is hashed by the pre-save hook in User.js
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user", // Default to "user" if not specified
    });

    // Return user info and token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// @desc   Login user and return JWT token
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare entered password with stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Login successful — return user info and token
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ─── @route  GET /api/auth/profile ───────────────────────────────────────────
// @desc   Get the logged-in user's profile
// @access Private (requires JWT)
const getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = req.user;

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

module.exports = { signup, login, getProfile };
