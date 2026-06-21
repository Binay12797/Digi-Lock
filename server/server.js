require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const userRouter = require("./routes/userRouter");

// Models (from Database branch)
const User = require("../Database/models/User");
const AccessLog = require("../Database/models/AccessLog");

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "key",
  resave: false,
  saveUninitialized: false
}));

require("./middleware/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use("/", userRouter);
mongoose.connect(
  "mongodb+srv://kranabhat338_db_user:0pQiliKmlxHqYfrW@cluster0.n030ezp.mongodb.net/"
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));
const wss = new WebSocket.Server({ server });

let attempts = 0;
let isLocked = false;

wss.on("connection", (ws) => {
  console.log("ESP32 connected");

  ws.on("message", async (data) => {
    const message = JSON.parse(data);

    if (isLocked) {
      ws.send(JSON.stringify({ status: "LOCKED" }));
      return;
    }

    const user = await User.findOne({
      pin: message.pin,
      isActive: true
    });

    if (user) {
      attempts = 0;

      ws.send(JSON.stringify({ status: "GRANTED" }));

      await AccessLog.create({
        user: user._id,
        status: "SUCCESS",
        time: new Date()
      });

    } else {
      attempts++;

      ws.send(JSON.stringify({ status: "DENIED" }));

      await AccessLog.create({
        status: "FAILED",
        time: new Date()
      });

      if (attempts >= 3) {
        isLocked = true;

        ws.send(JSON.stringify({ status: "LOCKED" }));

        setTimeout(() => {
          isLocked = false;
          attempts = 0;
        }, 30000);
      }
    }
  });
});
server.listen(3000, () => {
  console.log("Server running on port 3000");
});