// controllers/adminController.js
// Admin-only operations: view users, delete users, system stats

const User = require("../models/User");
const TrafficLog = require("../models/TrafficLog");
const Alert = require("../models/Alert");

// ─── @route  GET /api/admin/users ────────────────────────────────────────────
// @desc   Get a list of all registered users (passwords excluded)
// @access Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ total: users.length, users });
  } catch (error) {
    console.error("Get all users error:", error.message);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// ─── @route  DELETE /api/admin/users/:id ─────────────────────────────────────
// @desc   Delete a user account by ID
// @access Admin only
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting their own account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User ${user.email} deleted successfully` });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ message: "Server error deleting user" });
  }
};

// ─── @route  GET /api/admin/stats ────────────────────────────────────────────
// @desc   Get overall system statistics for admin overview
// @access Admin only
const getSystemStats = async (req, res) => {
  try {
    const totalUsers       = await User.countDocuments();
    const adminUsers       = await User.countDocuments({ role: "admin" });
    const regularUsers     = await User.countDocuments({ role: "user" });
    const totalTrafficLogs = await TrafficLog.countDocuments();
    const totalAlerts      = await Alert.countDocuments();
    const unresolvedAlerts = await Alert.countDocuments({ resolved: false });

    // Most recent 5 users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalUsers,
      adminUsers,
      regularUsers,
      totalTrafficLogs,
      totalAlerts,
      unresolvedAlerts,
      recentUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({ message: "Server error fetching system stats" });
  }
};

module.exports = { getAllUsers, deleteUser, getSystemStats };
