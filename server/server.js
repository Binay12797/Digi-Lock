require("dotenv").config();
const express = require("express"); //imports the express framework         //creates the server endpoint
const PORT = 3000;                  //defines the port 
const Path = require("node:path");  
const userRouter = require("./routes/userRouter")
const connectDB = require("./config/db");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const server = express();  

connectDB();


server.use(cors());  //enables cors for all routes and origins
server.use(express.urlencoded({extended: true}));
server.use(express.json());         //parses the json object
server.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: false
}))

require("./middleware/passport")(passport);
server.use(passport.initialize());
server.use(passport.session());
server.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
});



// server.set("views",Path.join(__dirname,"views"));
// server.set("view engine",'ejs');


server.use("/",userRouter);

server.listen(PORT,()=>{             //listens at the port for req
    console.log(`server is running at port ${PORT}`);
});