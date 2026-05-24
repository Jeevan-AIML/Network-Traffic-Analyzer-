// server.js
// Entry point for the Real-Time Network Traffic Analyzer Backend

// ─── Load Environment Variables ───────────────────────────────────────────────
require("dotenv").config();

// ─── Core Imports ─────────────────────────────────────────────────────────────
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// ─── Local Imports ────────────────────────────────────────────────────────────
const connectDB = require("./config/db");
const { startTrafficGenerator } = require("./utils/dummyTrafficGenerator");

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes      = require("./routes/authRoutes");
const trafficRoutes   = require("./routes/trafficRoutes");
const alertRoutes     = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes     = require("./routes/adminRoutes");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Initialize Express App ───────────────────────────────────────────────────
const app = express();

// ─── Create HTTP Server (needed for Socket.io) ────────────────────────────────
const server = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection event
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// ─── CORS Middleware ──────────────────────────────────────────────────────────
// Allow requests from the React frontend
app.use(
  cors({
     origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json());                        // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ─── Health Check Route ───────────────────────────────────────────────────────
// Useful for testing if the server is running
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "🚀 Real-Time Network Traffic Analyzer API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);      // Authentication: /api/auth/*
app.use("/api/traffic",   trafficRoutes);   // Traffic logs:  /api/traffic/*
app.use("/api/alerts",    alertRoutes);     // Alerts:        /api/alerts/*
app.use("/api/dashboard", dashboardRoutes); // Dashboard:     /api/dashboard/*
app.use("/api/admin",     adminRoutes);     // Admin:         /api/admin/*

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Catches any route not matched above
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches unhandled errors from route handlers and middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
  console.log(`🌍 CORS allowed from: ${process.env.CLIENT_URL}`);
  console.log(`\n📋 Available API Routes:`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/signup`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET    http://localhost:${PORT}/api/auth/profile`);
  console.log(`   GET    http://localhost:${PORT}/api/traffic`);
  console.log(`   POST   http://localhost:${PORT}/api/traffic`);
  console.log(`   GET    http://localhost:${PORT}/api/traffic/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/traffic/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/alerts`);
  console.log(`   POST   http://localhost:${PORT}/api/alerts`);
  console.log(`   DELETE http://localhost:${PORT}/api/alerts/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/dashboard/summary`);
  console.log(`   GET    http://localhost:${PORT}/api/admin/users`);
  console.log(`   DELETE http://localhost:${PORT}/api/admin/users/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/admin/stats\n`);

  // Start the real-time dummy traffic generator
  startTrafficGenerator(io);
});
