// routes/alertRoutes.js
// Alert management routes: list, create, and delete alerts

const express = require("express");
const router = express.Router();

const { getAllAlerts, createAlert, deleteAlert } = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

// All alert routes require a valid JWT token

// GET  /api/alerts      → Get all alerts (supports ?severity=High and ?resolved=false)
// POST /api/alerts      → Manually create an alert
router.route("/").get(protect, getAllAlerts).post(protect, createAlert);

// DELETE /api/alerts/:id  → Delete an alert by ID
router.route("/:id").delete(protect, deleteAlert);

module.exports = router;
