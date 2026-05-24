// models/TrafficLog.js
// Mongoose schema for network traffic log entries

const mongoose = require("mongoose");

const trafficLogSchema = new mongoose.Schema(
  {
    // Source IP address of the packet
    sourceIP: {
      type: String,
      required: [true, "Source IP is required"],
      trim: true,
    },

    // Destination IP address of the packet
    destinationIP: {
      type: String,
      required: [true, "Destination IP is required"],
      trim: true,
    },

    // Network protocol used
    protocol: {
      type: String,
      enum: ["TCP", "UDP", "HTTP", "DNS", "ICMP"],
      required: [true, "Protocol is required"],
    },

    // Size of the packet in bytes
    packetSize: {
      type: Number,
      required: [true, "Packet size is required"],
      min: [0, "Packet size cannot be negative"],
    },

    // Whether the packet is incoming or outgoing
    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: [true, "Direction is required"],
    },

    // Traffic status: normal traffic or suspicious activity
    status: {
      type: String,
      enum: ["normal", "suspicious"],
      default: "normal",
    },

    // Timestamp when the packet was captured
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Also adds createdAt and updatedAt
  }
);

// Index commonly queried fields for faster lookups
trafficLogSchema.index({ sourceIP: 1 });
trafficLogSchema.index({ protocol: 1 });
trafficLogSchema.index({ status: 1 });
trafficLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model("TrafficLog", trafficLogSchema);
