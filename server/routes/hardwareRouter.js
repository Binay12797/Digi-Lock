const {Router} = require("express");
const hardwareRouter = Router();
const user = require("../models/userModel");
//const enrollmentState = require("../services/enrollmentState");
const hardwareController = require("../controllers/hardwareController");
const protectHardware = require("../middleware/protectHardware");


hardwareRouter.post("/enrollFingerprint",hardwareController.enroll);
hardwareRouter.post("/verifyFingerprint",protectHardware,hardwareController.verification);
//hardwareRouter.get("/logs",verifyToken,hardwareController.getLogs);
hardwareRouter.post("/startEnroll",hardwareController.startEnrollment);
module.exports=hardwareRouter;
