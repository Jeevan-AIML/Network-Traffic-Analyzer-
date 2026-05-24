// models/Alert.js
// Mongoose schema for network traffic alerts

const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    // Type of alert triggered
    alertType: {
      type: String,
      required: [true, "Alert type is required"],
      enum: [
        "High Packet Size",
        "Suspicious Traffic",
        "Too Many Requests",
        "Custom",
      ],
    },

    // Descriptive message explaining the alert
    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true,
    },

    // Severity level of the alert
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Severity is required"],
    },

    // The source IP that triggered the alert
    sourceIP: {
      type: String,
      required: [true, "Source IP is required"],
      trim: true,
    },

    // When this alert was generated
    timestamp: {
      type: Date,
      default: Date.now,
    },

    // Whether the alert has been reviewed/resolved
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by severity and timestamp
alertSchema.index({ severity: 1 });
alertSchema.index({ timestamp: -1 });
alertSchema.index({ sourceIP: 1 });

module.exports = mongoose.model("Alert", alertSchema);
