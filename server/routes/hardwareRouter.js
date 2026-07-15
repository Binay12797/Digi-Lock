const { Router } = require("express");
const hardwareRouter = Router();

const hardwareController = require("../controllers/hardwareController");
const protectHardware = require("../middleware/protectHardware");

//hardwareRouter.post("/verifyFingerprint", protectHardware, hardwareController.verification);
hardwareRouter.post("/verifyFingerprint", hardwareController.verification);
hardwareRouter.post("/startEnroll", hardwareController.startEnrollment);

module.exports = hardwareRouter;