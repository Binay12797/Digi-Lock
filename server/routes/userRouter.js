const {Router} = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");
const {verifyToken} = require("../middleware/auth");

//userRouter.get("/", userController.loginPage);          //page once the user goes to the website
//userRouter.get("/create",userController.signUpPage);    //gets the signup page
userRouter.post("/create",userController.createUser);   //post the user data from signup page to backend
userRouter.post("/login",userController.login);
userRouter.post("/startEnrollment",userController.startEnrollment);
userRouter.get("/profile",verifyToken, userController.getUserProfile);
userRouter.get("/info",userController.userInfo);
module.exports = userRouter;