const {Router} = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");
const {verifyToken} = require("../middleware/auth");


userRouter.post("/create",userController.createUser);   //post the user data from signup page to backend
userRouter.post("/login",userController.login);
userRouter.post("/startEnrollment",userController.startEnrollment);
userRouter.get("/profile",verifyToken, userController.getUserProfile);
userRouter.post("/addUser", userController.addUser);
module.exports = userRouter;