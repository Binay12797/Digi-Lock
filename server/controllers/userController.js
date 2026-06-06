const user = require("../models/userModel");
async function createUser(req,res){
    try{
        const{name, email, password} = req.body;
        const newUser = new user(
            name = req.body.userName,
            email = req.body.userEmail,
            password = req.body.userPassword

        )
    }catch(err){
        console.log("error caught:",err);
        return res.status(400).json({
            success: false, error: error.message
        });

    }
    console.log("user created");
    await newUser.save();
    return res.status(201).json({
        success: true,
        message: `User created.`,
        user: newUser
    
    });
};

async function signUpPage(req,res){
    res.render("sign-up");
}

async function loginPage(req,res){
    res.render("login");
}

module.exports={
     createUser,
    signUpPage,
    loginPage
}