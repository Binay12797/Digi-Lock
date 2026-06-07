const localstragegy = require("passport-local").Strategy;
const user = require("../models/userModel");

module.exports= function(passport){
    passport.use(
        new localstragegy({
            usernameField: 'userName',
            passwordField: 'userPassword'
        },
            async(username,password,done)=>{
                console.log("passport received:",username,password );
                try{
                    const user = await user.findOne({ userName: username});
                    console.log("Database found user:", user);
                    if(!user){
                        return done(null, false,{message: "Incorrect username"});
                    }
                    if(user.userPassword !== password){
                        return done(null, false, {message: "Incorrect password"});

                    }
                    console.log("Authentication successful");
                    return done(null,user);
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
            const user = await user.findById(id);
            done(null,user);
        }catch(err){
            done(err);
        }
    });

};