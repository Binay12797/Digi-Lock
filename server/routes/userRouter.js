const {Router} = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");

userRouter.get("/", userController.loginPage);          //page once the user goes to the website
userRouter.get("/create",userController.signUpPage);    //gets the signup page
userRouter.post("/create",userController.createUser);   //post the user data from signup page to backend

userRouter.get('/api/test-auth', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ message: "Passport session is working!", user: req.user });
    }
    res.status(401).json({ message: "Unauthorized: No active session." });
});

module.exports = userRouter;