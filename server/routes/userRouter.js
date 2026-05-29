const {Router} = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");

userRouter.get("/", userController.loginPage);
userRouter.get("/create",userController.signUpPage);
userRouter.post("/create",userController.createUser);

module.exports = userRouter;