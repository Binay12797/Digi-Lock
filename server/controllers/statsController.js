const Door = require("../models/Door");
const User = require("../models/User");
const AccessLog = require("../models/AccessLog");

exports.getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalLocks = await Door.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const unlocksToday = await AccessLog.countDocuments({
      action: "unlock",
      status: "success",
      timestamp: { $gte: startOfToday }
    });
    const failedToday = await AccessLog.countDocuments({
      status: "failed",
      timestamp: { $gte: startOfToday }
    });

    res.json([
      { id: 1, title: "Total Locks", value: totalLocks, subtitle: "Registered locks", icon: "lock" },
      { id: 2, title: "Active Users", value: activeUsers, subtitle: "Registered users", icon: "users" },
      { id: 3, title: "Unlocks Today", value: unlocksToday, subtitle: "Successful unlocks", icon: "unlock" },
      { id: 4, title: "Failed Attempts", value: failedToday, subtitle: "Failed authentications", icon: "warning" }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};