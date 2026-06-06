require("dotenv").config;
console.log("DEBUG: MONGODB_URL is:", process.env.MONGODB_URI);
const express = require("express"); //imports the express framework
const server = express();           //creates the server endpoint
const PORT = 3000;                  //defines the port 
const Path = require("node:path");  
const userRouter = require("./routes/userRouter")
const connectDB = require("./config/db");
const cors = require("cors");

connectDB();

server.use(cors());  //enables cors for all routes and origins
server.use(express.urlencoded({extended: true}));
server.use(express.json());         //parses the json object

server.set("views",Path.join(__dirname,"views"));
server.set("view engine",'ejs');


server.use("/",userRouter);

server.listen(PORT,()=>{             //listens at the port for req
    console.log(`server is running at port ${PORT}`);
});