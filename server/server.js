require("dotenv").config();
const express = require("express"); //imports the express framework         //creates the server endpoint
const PORT = 3000;                  //defines the port 
const Path = require("node:path");  
const userRouter = require("./routes/userRouter")
const hardwareRouter= require("./routes/hardwareRouter");
const accesslogRouter = require("./routes/accesslogRouter");
const lockRouter = require("./routes/lockRouter");
const server = express();  

const connectDB = require("./config/db");
const cors = require("cors");
// NEW
server.use(cors({
  origin: ["http://localhost:5173", "https://art-dinginess-activity.ngrok-free.dev"],
  credentials: true
}));
// const passport = require("passport");
// const session = require("express-session");


//for socket.io
const {Server}= require("socket.io");
const http = require('http');

//for websocket
const{initWokwiSocket}= require("./services/wokwiSocketService");



connectDB();

const httpServer = http.createServer(server);
const io = new Server(httpServer,{
  cors: {
    origin: ["http://localhost:5173","https://art-dinginess-activity.ngrok-free.dev"], //Url of react
    methods: ["GET","POST"],
    credentials: true
  }
});

server.set("io",io);



server.use(cors());  //enables cors for all routes and origins
server.use(express.urlencoded({extended: true}));
server.use(express.json());         //parses the json object


io.on("connection",(socket)=>{
  console.log(`client conneted in websocekt Id: ${socket.id}`);
  socket.on("disconnect",()=>{
    console.log(`client disconnected: ${socket.id}`);
  });
});


initWokwiSocket(io);

server.use("/user",userRouter);
server.use("/api",hardwareRouter);
server.use("/api",accesslogRouter);
server.use("/lock/status", lockRouter);
httpServer.listen(PORT,()=>{             //listens at the port for req
    console.log(`server is running at port ${PORT}`);
});

