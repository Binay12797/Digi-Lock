const { Router } = require("express");
const hardwareRouter = Router();

const hardwareController = require("../controllers/hardwareController");
const protectHardware = require("../middleware/protectHardware");

hardwareRouter.post("/enrollFingerprint", hardwareController.enroll);

//hardwareRouter.post("/verifyFingerprint", protectHardware, hardwareController.verification);
hardwareRouter.post("/verifyFingerprint", hardwareController.verification);

hardwareRouter.post("/startEnroll", hardwareController.startEnrollment);
hardwareRouter.post("/scan1", hardwareController.scan1);
hardwareRouter.post("/scan2", hardwareController.scan2);

module.exports = hardwareRouter;