async function createUser(req,res){
    // try{
    //     const User = new User(
    //         name = req.body.userName,
    //         email = req.body.userEmail
    //     )
    // }catch(err){
    //     console.log("error caught:",err);

    // }
    console.log("user created");
    return res.redirect("/");
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
   
