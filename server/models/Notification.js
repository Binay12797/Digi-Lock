const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  event: {
    type: String,
    enum: ["FAILED_FINGERPRINT", "LOCK_TAMPER", "LOCK_OFFLINE", "USER_ADDED"],
    required: true
  },
  severity: {
    type: String,
    enum: ["critical", "warning", "info"],
    required: true
  },
  entityType: {
    type: String,
    enum: ["lock", "user"],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  entityName: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'notifications',
  versionKey: false
});

module.exports = mongoose.model("Notification", notificationSchema);