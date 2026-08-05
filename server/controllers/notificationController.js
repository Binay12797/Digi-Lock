const Notification = require("../models/notificationModel");

async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getNotifications,
};
