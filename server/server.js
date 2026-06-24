require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Server } = require("socket.io");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const userRouter = require("./routes/userRouter");
const hardwareRouter = require("./routes/hardwareRouter");
const connectDB = require("./config/db");

const User = require("../Database/models/User");
const AccessLog = require("../Database/models/AccessLog");

const PORT = process.env.PORT || 3000;

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "key",
  resave: false,
  saveUninitialized: false
}));

require("./middleware/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", userRouter);
app.use("/api", hardwareRouter);

connectDB();

// --- HTTP SERVER ---
const httpServer = http.createServer(app);

// --- SOCKET.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});


app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// --- WEBSOCKET SERVER (ATTACHED) ---
const wss = new WebSocket.Server({
  server: httpServer,
  path: "/esp32"
});

let attempts = 0;
let isLocked = false;

wss.on("connection", (ws) => {
  console.log("ESP32 connected");

  ws.send(JSON.stringify({ status: "CONNECTED" }));

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data);

      if (isLocked) {
        ws.send(JSON.stringify({ status: "LOCKED" }));
        return;
      }

      const user = await User.findOne({
        pin: msg.pin,
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

        if (attempts >= 3) {
          isLocked = true;

          setTimeout(() => {
            isLocked = false;
            attempts = 0;
            console.log("Unlocked after timeout");
          }, 30000);
        }
      }

    } catch (err) {
      console.error(err);
      ws.send(JSON.stringify({ status: "ERROR" }));
    }
  });

  ws.on("close", () => {
    console.log("ESP32 disconnected");
  });
});

// --- START SERVER ---

httpServer.on("connection", (socket) => {
  console.log("Raw TCP connection from:", socket.remoteAddress);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

httpServer.on("upgrade", (req) => {
  console.log("Upgrade request received:", req.url);
});