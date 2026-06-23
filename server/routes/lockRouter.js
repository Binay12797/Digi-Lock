const {Router} = require("express");
const lockRouter = Router();
const lockController = require("../controllers/lockController");
lockRouter.get("/:deviceId", lockController.getLockStatus);
lockRouter.post("/update", lockController.updateLockStatus);

module.exports = lockRouter;