const express = require("express");
const mongoose = require("mongoose");
const WebSocket = require("ws");

// import models
const User = require("../Database/models/User");
const AccessLog = require("../Database/models/AccessLog");

const app = express();
app.use(express.json());

//MongoDB Connection 
mongoose.connect(
  'mongodb://rajab2007bal_db_user:Test1234@ac-nisxnkl-shard-00-00.n030ezp.mongodb.net:27017,ac-nisxnkl-shard-00-01.n030ezp.mongodb.net:27017,ac-nisxnkl-shard-00-02.n030ezp.mongodb.net:27017/digilock?ssl=true&replicaSet=atlas-aosg6b-shard-0&authSource=admin&appName=Cluster0'
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

//Start HTTP Server
const server = app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// WebSocket Server 
const wss = new WebSocket.Server({ server });

// Security Variables 
let attempts = 0;
let isLocked = false;

// WebSocket Logic 
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (data) => {

    const message = JSON.parse(data);

    // Check if system locked
    if (isLocked) {
      ws.send(JSON.stringify({ status: "LOCKED" }));
      return;
    }

    //  Check user in DB
    const user = await User.findOne({
      pin: message.pin, //pin match check
      isActive: true //user allowed/banned
    });

    if (user) {
      //  Correct PIN
      attempts = 0;

      ws.send(JSON.stringify({ status: "GRANTED" }));

      await AccessLog.create({
        user: user._id,
        status: "SUCCESS",
        time: new Date()
      });

    } else {
      // Wrong PIN
      attempts++;

      ws.send(JSON.stringify({ status: "DENIED" }));

      await AccessLog.create({
        status: "FAILED",
        time: new Date()
      });

      //  Lock after 3 attempts
      if (attempts >= 3) {
        isLocked = true;

        ws.send(JSON.stringify({ status: "LOCKED" }));

        setTimeout(() => {
          isLocked = false;
          attempts = 0;
          console.log("System unlocked");
        }, 30000);
      }
    }
  });

  ws.send("Connected to server");
});