const User = require("../models/addUserModel");
const AccessLog = require("../models/accesslogModel");

async function getDashboard(req, res) {
  try {
    const totalUsers = await User.countDocuments();

    const totalUnlocks = await AccessLog.countDocuments({
      status: "GRANTED",
    });

    const failedAttempts = await AccessLog.countDocuments({
      status: "DENIED",
    });

    const stats = [
      {
        id: 1,
        title: "Total Locks",
        value: 1,
        subtitle: "Registered Locks",
      },
      {
        id: 2,
        title: "Active Users",
        value: totalUsers,
        subtitle: "Authorized Users",
      },
      {
        id: 3,
        title: "Successful Unlocks",
        value: totalUnlocks,
        subtitle: "Door Opened",
      },
      {
        id: 4,
        title: "Failed Attempts",
        value: failedAttempts,
        subtitle: "Access Denied",
      },
    ];

    res.json({
      success: true,
      stats,
      lockUsage: [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getDashboard,
};
