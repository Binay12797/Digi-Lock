const {Router} = require("express");
const hardwareRouter = Router();
const user = require("../models/userModel");
const enrollmentState = require("../services/enrollmentState");
const hardwareController = require("../controllers/hardwareController");

hardwareRouter.post("/enrollFingerprint",hardwareController.enroll);