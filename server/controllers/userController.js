const user = require("../models/userModel");
const passport = require("passport");
const enrollmentState = require("../services/enrollmentState");
async function createUser(req,res){
    try{
        const{name, email, password} = req.body;
        const newUser = new user({
            name: name,
            email : email,
            password :password}

        );
        await newUser.save();
        console.log("user created");
        return res.status(201).json({
            success: true,
            message: "user created",
            user: newUser
        });

    }catch(err){
        console.log("error caught:",err);
        return res.status(400).json({
            success: false, error: err.message
        });

    }
};

async function signUpPage(req,res){
    res.render("sign-up");
}

async function loginPage(req,res){
    res.json({
        success: true,
        message: "Digilock auth operational"
    });
};


// Inside userController.js
async function login(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if (err) { 
            return next(err); 
        }
        
        // If passport strategy returned false (auth failed)
        if (!user) { 
            return res.status(401).json({ 
                success: false, 
                message: info ? info.message : "Incorrect password." 
            }); 
        }
        
        // If auth succeeded, log the user into the session
        req.logIn(user, (err) => {
            if (err) { 
                return next(err); 
            }
            return res.status(200).json({ 
                success: true, 
                message: "Logged in successfully!", 
                user: user 
            });
        });
    })(req, res, next);
}

async function startEnrollment(req,res){
    const{userId} = req.body;
    if(!userId){
        return res.status(400).json({success: false, meassage: "User Id is required to start enrollement"});

    }
    enrollmentState.setSession(userId);
    return res.status(200).json({
        success: true,
        message: `Enrollment session started for user ${userId}. Ready for fingerprint scan`
    });
};
module.exports={
    createUser,
    signUpPage,
    loginPage,
    login,
    startEnrollment
}