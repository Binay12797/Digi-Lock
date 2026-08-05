const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["critical", "warning", "info"],
      required: true,
    },

    entityName: {
      type: String,
      default: "",
    },

    lockName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);

