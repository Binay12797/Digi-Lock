const { Router } = require("express");
const dashboardController = require("../controllers/dashboardController");
const dashboardRouter = Router();
dashboardRouter.get("/dashboard", dashboardController.getDashboard);
module.exports = dashboardRouter;
