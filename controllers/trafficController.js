// controllers/trafficController.js
// CRUD operations for network traffic logs with search & filter support

const TrafficLog = require("../models/TrafficLog");

// ─── @route  GET /api/traffic ─────────────────────────────────────────────────
// @desc   Get all traffic logs with optional filters
// @access Private
// @query  protocol, direction, status, sourceIP, destinationIP, date
const getAllTrafficLogs = async (req, res) => {
  try {
    const {
      protocol,
      direction,
      status,
      sourceIP,
      destinationIP,
      date,
      page = 1,
      limit = 50,
    } = req.query;

    // Build a dynamic MongoDB filter object
    const filter = {};

    if (protocol)       filter.protocol       = protocol.toUpperCase();
    if (direction)      filter.direction      = direction.toLowerCase();
    if (status)         filter.status         = status.toLowerCase();
    if (sourceIP)       filter.sourceIP       = sourceIP;
    if (destinationIP)  filter.destinationIP  = destinationIP;

    // Filter by date (matches logs from the given date)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.timestamp = { $gte: startOfDay, $lte: endOfDay };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await TrafficLog.countDocuments(filter);

    const logs = await TrafficLog.find(filter)
      .sort({ timestamp: -1 }) // Newest first
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get traffic logs error:", error.message);
    res.status(500).json({ message: "Server error fetching traffic logs" });
  }
};

// ─── @route  GET /api/traffic/:id ────────────────────────────────────────────
// @desc   Get a single traffic log by ID
// @access Private
const getTrafficLogById = async (req, res) => {
  try {
    const log = await TrafficLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Traffic log not found" });
    }
    res.status(200).json(log);
  } catch (error) {
    console.error("Get traffic log by ID error:", error.message);
    res.status(500).json({ message: "Server error fetching traffic log" });
  }
};

// ─── @route  POST /api/traffic ────────────────────────────────────────────────
// @desc   Create a new traffic log entry manually
// @access Private
const createTrafficLog = async (req, res) => {
  try {
    const { sourceIP, destinationIP, protocol, packetSize, direction, status } = req.body;

    // Validate required fields
    if (!sourceIP || !destinationIP || !protocol || packetSize === undefined || !direction) {
      return res.status(400).json({
        message: "sourceIP, destinationIP, protocol, packetSize, and direction are required",
      });
    }

    const log = await TrafficLog.create({
      sourceIP,
      destinationIP,
      protocol,
      packetSize,
      direction,
      status: status || "normal",
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Traffic log created", log });
  } catch (error) {
    console.error("Create traffic log error:", error.message);
    res.status(500).json({ message: "Server error creating traffic log" });
  }
};

// ─── @route  DELETE /api/traffic/:id ─────────────────────────────────────────
// @desc   Delete a traffic log by ID
// @access Private
const deleteTrafficLog = async (req, res) => {
  try {
    const log = await TrafficLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Traffic log not found" });
    }
    res.status(200).json({ message: "Traffic log deleted successfully" });
  } catch (error) {
    console.error("Delete traffic log error:", error.message);
    res.status(500).json({ message: "Server error deleting traffic log" });
  }
};

module.exports = {
  getAllTrafficLogs,
  getTrafficLogById,
  createTrafficLog,
  deleteTrafficLog,
};
