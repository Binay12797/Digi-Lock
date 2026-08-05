const {Router} = require("express");
const dashboardRouter = Router();
const dashboardController = require("../controllers/dashboardController");

dashboardRouter.get("/", dashboardController.getDashboard);
module.exports = dashboardRouter;
