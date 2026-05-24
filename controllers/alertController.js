// controllers/alertController.js
// Manage network traffic alerts — create, list, and delete

const Alert = require("../models/Alert");

// ─── @route  GET /api/alerts ──────────────────────────────────────────────────
// @desc   Get all alerts (newest first)
// @access Private
const getAllAlerts = async (req, res) => {
  try {
    const { severity, resolved, page = 1, limit = 50 } = req.query;

    // Build dynamic filter
    const filter = {};
    if (severity) filter.severity = severity;
    if (resolved !== undefined) filter.resolved = resolved === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Alert.countDocuments(filter);

    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 }) // Newest first
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Get alerts error:", error.message);
    res.status(500).json({ message: "Server error fetching alerts" });
  }
};

// ─── @route  POST /api/alerts ─────────────────────────────────────────────────
// @desc   Create a new alert manually
// @access Private
const createAlert = async (req, res) => {
  try {
    const { alertType, message, severity, sourceIP } = req.body;

    // Validate required fields
    if (!alertType || !message || !severity || !sourceIP) {
      return res.status(400).json({
        message: "alertType, message, severity, and sourceIP are required",
      });
    }

    const alert = await Alert.create({
      alertType,
      message,
      severity,
      sourceIP,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Alert created", alert });
  } catch (error) {
    console.error("Create alert error:", error.message);
    res.status(500).json({ message: "Server error creating alert" });
  }
};

// ─── @route  DELETE /api/alerts/:id ──────────────────────────────────────────
// @desc   Delete an alert by ID
// @access Private
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Delete alert error:", error.message);
    res.status(500).json({ message: "Server error deleting alert" });
  }
};

module.exports = { getAllAlerts, createAlert, deleteAlert };
