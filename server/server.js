require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const userRouter = require("./routes/userRouter");


const User = require("./models/userModel");
const AccessLog = require("./models/AccessLog");
const Door = require("./models/Door");
const Notification = require('./models/Notification')

const app = express();
const server = http.createServer(app);
const statsRoutes = require("./routes/stats");
app.use("/api/stats", statsRoutes);

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

let door = null;
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    door = await Door.findOne();
    if (door) {
      doorId = door._id;
      console.log("Using door:", doorId);
    } else {
      console.log("No Door document found in DB — successful unlocks won't be logged until one exists.");
    }
  })
  .catch(err => console.log(err));

const wss = new WebSocket.Server({ server, path: "/ws" });

let attempts = 0;
let isLocked = false;

wss.on("connection", (ws) => {
  console.log("ESP32 connected");

  ws.on("message", async (data) => {
    let message;

    try {
      message = JSON.parse(data);
    } catch (err) {
      console.log("Bad JSON from ESP32:", err.message);
      return;
    }

    try {
      if (isLocked) {
        ws.send(JSON.stringify({ status: "LOCKED" }));
        return;
      }

      const user = await User.findOne({
        fingerprintId: message.fingerprintId,
        isActive: true
      });

      if (user) {
        attempts = 0;

        ws.send(JSON.stringify({ status: "GRANTED" }));

      if (door) {
        await AccessLog.create({
          userId: user._id,
          doorId: doorId,
          action: "unlock",
          status: "success",
          methodtype: "fingerprint"
        });
        await Door.findByIdAndUpdate(doorId, {
          status: "unlocked",
          lastAccessedAt: new Date()
        });
      } else {
        console.log("Skipped AccessLog write — no doorId available.");
      }

      } else {
        attempts++;

        ws.send(JSON.stringify({ status: "DENIED" }));

        if (doorId) {
          await Notification.create({
            event: "FAILED_FINGERPRINT",
            severity: "critical",
            entityType: "lock",
            entityId: doorId,
            entityName: door ? door.location : "Unknown"
          });
        }
        // Not logged to AccessLog — userId is required and there's no matched user here.

        if (attempts >= 3) {
          isLocked = true;

          ws.send(JSON.stringify({ status: "LOCKED" }));

          setTimeout(() => {
            isLocked = false;
            attempts = 0;
          }, 30000);
        }
      }
    } catch (err) {
      console.log("Error processing message:", err.message);
    }
  });

  ws.on("close", async () => {
    console.log("ESP32 disconnected");

    if (doorId) {
      await Door.findByIdAndUpdate(doorId, { status: "offline" });

      await Notification.create({
        event: "LOCK_OFFLINE",
        severity: "warning",
        entityType: "lock",
        entityId: doorId,
        entityName: door ? door.location : "Unknown"
      });
    }
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});