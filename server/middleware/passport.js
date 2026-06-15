const localstragegy = require("passport-local").Strategy;
const user = require("../models/userModel");

module.exports= function(passport){
    passport.use(
        new localstragegy({
            usernameField: 'email',
            passwordField: 'password'
        },
            async(email,password,done)=>{
                console.log("passport received:",email,password );
                try{
                    const User = await user.findOne({ email: email});
                    console.log("Database found user:", user);
                    if(!User){
                        return done(null, false,{message: "Incorrect email"});
                    }
                    console.log("DB Password:", `[${User.password}]`);
                    console.log("Postman Password:", `[${password}]`);
                    if(User.password !== password){
                        return done(null, false, {message: "Incorrect password"});

                    }
                    console.log("Authentication successful");
                    return done(null,User);
                }catch(err){
                    return done(err);
                }
            }

    )
    );
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });

    passport.deserializeUser(async(id,done)=>{
        try{
            const User = await user.findById(id);
            done(null,user);
        }catch(err){
            done(err);
        }
    });

};