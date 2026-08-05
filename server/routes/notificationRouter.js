const { Router } = require("express");
const router = Router();

const { getNotifications } = require("../controllers/notificationController");

router.get("/", getNotifications);

module.exports = router;
