const {Router} = require("express");
const hardwareRouter = Router();
const user = require("../models/userModel");
//const enrollmentState = require("../services/enrollmentState");
const hardwareController = require("../controllers/hardwareController");
const protectHardware = require("../middleware/protectHardware");


hardwareRouter.post("/enroll",hardwareController.enroll);
hardwareRouter.post("/verifyFingerprint",protectHardware,hardwareController.verification);
//hardwareRouter.get("/logs",verifyToken,hardwareController.getLogs);
hardwareRouter.post("/startEnroll",hardwareController.startEnrollment);
// hardwareRouter.post("/scan1",hardwareController.scan1);
// hardwareRouter.post("/scan2",hardwareController.scan2);
module.exports=hardwareRouter;
