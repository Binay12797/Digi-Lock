const User = require("../models/addUserModel");
const AccessLog = require("../models/accesslogModel");

async function getDashboardData() {
  const totalUsers = await User.countDocuments();

  const successfulUnlocks = await AccessLog.countDocuments({
    status: "GRANTED",
  });

  const failedAttempts = await AccessLog.countDocuments({
    status: "DENIED",
  });

  return {
    stats: [
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
        value: successfulUnlocks,
        subtitle: "Door Opened",
      },
      {
        id: 4,
        title: "Failed Attempts",
        value: failedAttempts,
        subtitle: "Access Denied",
      },
    ],
    lockUsage: [],
  };
}

module.exports = {
  getDashboardData,
};
