const {Router} = require("express");
const fingerprintRouter = Router();
const fingerprintController = require("../controllers/fingerprintController")

fingerprintRouter.delete("/delete/:id", fingerprintController.deleteFingerprint);
fingerprintRouter.get("/get",fingerprintController.getFingerprint);

module.exports = fingerprintRouter;