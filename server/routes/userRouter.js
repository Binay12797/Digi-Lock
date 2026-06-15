const {Router} = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");

userRouter.get("/", userController.loginPage);          //page once the user goes to the website
userRouter.get("/create",userController.signUpPage);    //gets the signup page
userRouter.post("/create",userController.createUser);   //post the user data from signup page to backend
userRouter.post("/login",userController.login);


module.exports = userRouter;