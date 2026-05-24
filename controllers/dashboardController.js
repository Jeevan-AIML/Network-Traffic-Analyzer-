// controllers/dashboardController.js
// Aggregates traffic and alert data for the dashboard summary

const TrafficLog = require("../models/TrafficLog");
const Alert = require("../models/Alert");

// ─── @route  GET /api/dashboard/summary ──────────────────────────────────────
// @desc   Return aggregated statistics for the dashboard
// @access Private
const getDashboardSummary = async (req, res) => {
  try {
    // ── Traffic Packet Counts ──────────────────────────────────────────
    const totalPackets = await TrafficLog.countDocuments();
    const incomingPackets = await TrafficLog.countDocuments({ direction: "incoming" });
    const outgoingPackets = await TrafficLog.countDocuments({ direction: "outgoing" });
    const suspiciousPackets = await TrafficLog.countDocuments({ status: "suspicious" });

    // ── Protocol Breakdown ─────────────────────────────────────────────
    const tcpCount  = await TrafficLog.countDocuments({ protocol: "TCP" });
    const udpCount  = await TrafficLog.countDocuments({ protocol: "UDP" });
    const httpCount = await TrafficLog.countDocuments({ protocol: "HTTP" });
    const dnsCount  = await TrafficLog.countDocuments({ protocol: "DNS" });
    const icmpCount = await TrafficLog.countDocuments({ protocol: "ICMP" });

    // ── Active Alerts (not yet resolved) ──────────────────────────────
    const activeAlerts = await Alert.countDocuments({ resolved: false });

    // ── Top Source IPs (by request volume) ────────────────────────────
    const topSourceIPs = await TrafficLog.aggregate([
      { $group: { _id: "$sourceIP", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { sourceIP: "$_id", count: 1, _id: 0 } },
    ]);

    // ── Alert Severity Breakdown ───────────────────────────────────────
    const alertSeverityBreakdown = await Alert.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $project: { severity: "$_id", count: 1, _id: 0 } },
    ]);

    res.status(200).json({
      totalPackets,
      incomingPackets,
      outgoingPackets,
      suspiciousPackets,
      tcpCount,
      udpCount,
      httpCount,
      dnsCount,
      icmpCount,
      activeAlerts,
      topSourceIPs,
      alertSeverityBreakdown,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error.message);
    res.status(500).json({ message: "Server error fetching dashboard summary" });
  }
};

module.exports = { getDashboardSummary };
