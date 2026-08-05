const {Router} = require("express");
const accesslogRouter = Router();
const accesslogController = require("../controllers/accesslogController")
const {verifyToken} = require("../middleware/auth");

accesslogRouter.get("/logs",verifyToken,accesslogController.getLogs);

module.exports = accesslogRouter;