// routes/trafficRoutes.js
// Traffic log CRUD routes with authentication protection

const express = require("express");
const router = express.Router();

const {
  getAllTrafficLogs,
  getTrafficLogById,
  createTrafficLog,
  deleteTrafficLog,
} = require("../controllers/trafficController");
const { protect } = require("../middleware/authMiddleware");

// All traffic routes require a valid JWT token

// GET  /api/traffic          → Get all traffic logs (supports filters via query params)
// POST /api/traffic          → Create a new traffic log entry
router.route("/").get(protect, getAllTrafficLogs).post(protect, createTrafficLog);

// GET    /api/traffic/:id    → Get a specific traffic log by ID
// DELETE /api/traffic/:id    → Delete a traffic log by ID
router.route("/:id").get(protect, getTrafficLogById).delete(protect, deleteTrafficLog);

module.exports = router;
