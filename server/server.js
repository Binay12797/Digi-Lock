require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const path = require("node:path");

const userRouter = require("./routes/userRouter");
const hardwareRouter = require("./routes/hardwareRouter");
const connectDB = require("./config/db");

// Import models
const User = require("../Database/models/User");
const AccessLog = require("../Database/models/AccessLog");

const PORT = process.env.PORT || 3000;
const WS_PORT = 81; // ESP32 WebSocket port

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "key",
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

// --- Routes ---
app.use("/", userRouter);
app.use("/api", hardwareRouter);

// --- MongoDB ---
connectDB();

// --- HTTP + Socket.io server (port 3000) ---
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket.io client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket.io client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`HTTP + Socket.io server running on port ${PORT}`);
});

// --- WebSocket server for ESP32 (port 81) ---
const wss = new WebSocket.Server({ port: WS_PORT });

let attempts = 0;
let isLocked = false;

wss.on("connection", (ws) => {
  console.log("ESP32 client connected on port 81");

  ws.send(JSON.stringify({ status: "CONNECTED" }));

  ws.on("message", async (data) => {
    try {
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
          status: "success",
          action: "unlock",
          time: new Date()
        });
      } else {
        attempts++;
        ws.send(JSON.stringify({ status: "DENIED" }));
        await AccessLog.create({
          status: "denied",
          action: "unlock",
          time: new Date()
        });

        if (attempts >= 3) {
          isLocked = true;
          ws.send(JSON.stringify({ status: "LOCKED" }));
          setTimeout(() => {
            isLocked = false;
            attempts = 0;
            console.log("System unlocked after lockout");
          }, 30000);
        }
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
      ws.send(JSON.stringify({ status: "ERROR" }));
    }
  });

  ws.on("close", () => {
    console.log("ESP32 client disconnected");
  });
});

console.log(`ESP32 WebSocket server running on port ${WS_PORT}`);