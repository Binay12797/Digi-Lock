const User = require("../models/addUserModel");
const AccessLog = require("../models/accesslogModel");

async function getDashboardData() {
  const totalUsers = await User.countDocuments({
    isActive: true,
  });

  const successfulUnlocks = await AccessLog.countDocuments({
    status: "GRANTED",
  });

  const failedAttempts = await AccessLog.countDocuments({
    status: "DENIED",
  });

  const usage = await AccessLog.aggregate([
    {
      $match: {
        status: "GRANTED",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        unlocks: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return {
    stats: [
      {
        id: 1,
        title: "Total Locks",
        value: 1,
        subtitle: "Registered Locks",
        icon: "lock",
        color: "#3b82f6",
      },
      {
        id: 2,
        title: "Active Users",
        value: totalUsers,
        subtitle: "Authorized Users",
        icon: "users",
        color: "#10b981",
      },
      {
        id: 3,
        title: "Successful Unlocks",
        value: successfulUnlocks,
        subtitle: "Door Opened",
        icon: "unlock",
        color: "#8b5cf6",
      },
      {
        id: 4,
        title: "Failed Attempts",
        value: failedAttempts,
        subtitle: "Access Denied",
        icon: "warning",
        color: "#ef4444",
      },
    ],
    lockUsage: usage.map((item) => ({
      date: item._id,
      unlocks: item.unlocks,
    })),
  };
}

module.exports = {
  getDashboardData,
};
