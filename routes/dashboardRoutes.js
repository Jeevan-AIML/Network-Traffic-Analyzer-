// routes/dashboardRoutes.js
// Dashboard summary route — returns aggregated network statistics

const express = require("express");
const router = express.Router();

const { getDashboardSummary } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/dashboard/summary  → Aggregated stats for dashboard
router.get("/summary", protect, getDashboardSummary);

module.exports = router;
