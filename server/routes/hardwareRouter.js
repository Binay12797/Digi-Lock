const {Router} = require("express");
const hardwareRouter = Router();
const user = require("../models/userModel");
const enrollmentState = require("../services/enrollmentState");
const hardwareController = require("../controllers/hardwareController");
const protectHardware = require("../middleware/protectHardware");

hardwareRouter.post("/enrollFingerprint",hardwareController.enroll);
hardwareRouter.post("/verifyFingerprint",protectHardware,hardwareController.verification);
hardwareRouter.get("/logs",hardwareController.getLogs);

module.exports=hardwareRouter;
