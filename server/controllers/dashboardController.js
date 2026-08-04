const { getDashboardData } = require("../services/dashboardService");

async function getDashboard(req, res) {
  try {
    const dashboard = await getDashboardData();

    res.json(dashboard);
  } catch (err) {
    console.error("Dashboard Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getDashboard,
};
