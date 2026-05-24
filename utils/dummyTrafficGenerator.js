// utils/dummyTrafficGenerator.js
// Generates realistic fake network traffic data and broadcasts via Socket.io

const TrafficLog = require("../models/TrafficLog");
const Alert = require("../models/Alert");

// ─── Helper Data Arrays ───────────────────────────────────────────────────────

const protocols = ["TCP", "UDP", "HTTP", "DNS", "ICMP"];
const directions = ["incoming", "outgoing"];
const statuses = ["normal", "normal", "normal", "suspicious"]; // 75% normal, 25% suspicious

// Pool of sample IP addresses for realism
const sampleIPs = [
  "192.168.1.1",
  "192.168.1.25",
  "10.0.0.5",
  "10.0.0.12",
  "172.16.0.3",
  "172.16.0.8",
  "203.0.113.5",
  "198.51.100.7",
  "8.8.8.8",
  "1.1.1.1",
  "185.220.101.4",
  "91.108.4.10",
  "45.33.32.156",
  "104.21.0.1",
  "192.0.2.44",
];

// ─── IP Request Counter (for "Too Many Requests" alert) ───────────────────────
// Tracks how many packets each sourceIP sent in the current window
const ipRequestCounts = {};

/**
 * generateRandomIP:
 * Returns a random IP from the sample pool.
 */
const generateRandomIP = () =>
  sampleIPs[Math.floor(Math.random() * sampleIPs.length)];

/**
 * generateRandomPacketSize:
 * Returns a random packet size in bytes (between 64 and 1500).
 * Occasionally generates a large packet (>1000) to trigger alerts.
 */
const generateRandomPacketSize = () => {
  const isLarge = Math.random() < 0.2; // 20% chance of large packet
  return isLarge
    ? Math.floor(Math.random() * 500) + 1001  // 1001 – 1500
    : Math.floor(Math.random() * 936) + 64;   // 64 – 999
};

/**
 * generateTrafficEntry:
 * Creates a single traffic log object with randomized values.
 */
const generateTrafficEntry = () => {
  const sourceIP = generateRandomIP();
  const destinationIP = generateRandomIP();
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const packetSize = generateRandomPacketSize();
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const timestamp = new Date();

  return { sourceIP, destinationIP, protocol, packetSize, direction, status, timestamp };
};

// ─── Alert Rule Engine ────────────────────────────────────────────────────────

/**
 * checkAndCreateAlerts:
 * Evaluates alert rules against a traffic entry.
 * - Rule 1: packetSize > 1000  → High Packet Size alert
 * - Rule 2: status suspicious  → Suspicious Traffic alert
 * - Rule 3: sourceIP has >10 requests → Too Many Requests alert
 */
const checkAndCreateAlerts = async (entry) => {
  const alertsToCreate = [];

  // Rule 1: High packet size
  if (entry.packetSize > 1000) {
    alertsToCreate.push({
      alertType: "High Packet Size",
      message: `Packet size ${entry.packetSize} bytes from ${entry.sourceIP} exceeds threshold (1000 bytes)`,
      severity: "Medium",
      sourceIP: entry.sourceIP,
      timestamp: entry.timestamp,
    });
  }

  // Rule 2: Suspicious traffic
  if (entry.status === "suspicious") {
    alertsToCreate.push({
      alertType: "Suspicious Traffic",
      message: `Suspicious ${entry.protocol} traffic detected from ${entry.sourceIP} to ${entry.destinationIP}`,
      severity: "High",
      sourceIP: entry.sourceIP,
      timestamp: entry.timestamp,
    });
  }

  // Rule 3: Too many requests from same sourceIP
  ipRequestCounts[entry.sourceIP] = (ipRequestCounts[entry.sourceIP] || 0) + 1;
  if (ipRequestCounts[entry.sourceIP] === 10) {
    alertsToCreate.push({
      alertType: "Too Many Requests",
      message: `IP ${entry.sourceIP} has sent ${ipRequestCounts[entry.sourceIP]} packets — possible flood/scan`,
      severity: "Low",
      sourceIP: entry.sourceIP,
      timestamp: entry.timestamp,
    });
    // Reset counter after alerting so it can trigger again later
    ipRequestCounts[entry.sourceIP] = 0;
  }

  // Save all triggered alerts to MongoDB
  if (alertsToCreate.length > 0) {
    await Alert.insertMany(alertsToCreate);
  }
};

// ─── Main Generator ───────────────────────────────────────────────────────────

/**
 * startTrafficGenerator:
 * Starts an interval that:
 * 1. Generates a new traffic entry every 2 seconds
 * 2. Saves it to MongoDB
 * 3. Broadcasts it to all connected Socket.io clients via "trafficData" event
 * 4. Checks and creates alerts based on alert rules
 *
 * @param {SocketIO.Server} io - The Socket.io server instance
 * @returns {NodeJS.Timeout} - The interval handle (use clearInterval to stop)
 */
const startTrafficGenerator = (io) => {
  console.log("🚀 Real-time traffic generator started (every 2s)");

  const interval = setInterval(async () => {
    try {
      // 1. Generate a random traffic entry
      const entry = generateTrafficEntry();

      // 2. Save to MongoDB
      const savedLog = await TrafficLog.create(entry);

      // 3. Emit to all connected clients via Socket.io
      io.emit("trafficData", savedLog);

      // 4. Check alert rules and create alerts if needed
      await checkAndCreateAlerts(entry);

    } catch (error) {
      console.error("❌ Traffic generator error:", error.message);
    }
  }, 2000); // Every 2 seconds

  return interval;
};

module.exports = { startTrafficGenerator };
