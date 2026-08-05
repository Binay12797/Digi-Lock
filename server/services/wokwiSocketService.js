const { WebSocketServer } = require("ws");
const enrollmentState = require("./enrollmentState");
const scanController = require("../controllers/scanController");
const { processVerification } = require("../controllers/hardwareController");

// Track connected devices by ID and active single device fallback
const devices = new Map();
let deviceSocket = null;

function initWokwiSocket(io) {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on("listening", () => {
    console.log("WebSocket Server successfully listening on port 8080!");
  });

  wss.on("connection", (ws) => {
    console.log("Wokwi ESP32 connection established");
    io.emit("started");
    
    deviceSocket = ws;

    ws.on("message", async (rawData) => {
      let parsedData;

      // Parse incoming string
      try {
        parsedData = JSON.parse(rawData.toString());
        console.log("Raw payload from Wokwi:", parsedData);
      } catch (parseError) {
        console.log(`Plain-text message from Wokwi: ${rawData.toString()}`);
        return;
      }

      // Map device socket if deviceId is supplied
      if (parsedData.deviceId) {
        ws.deviceId = parsedData.deviceId; // Tag socket instance with device ID
        devices.set(parsedData.deviceId, ws);
      }

      // Dispatch events
      try {
        switch (parsedData.type) {
          //  Initial Handshake from Hardware
          case "HELLO":
            console.log(`[Device Registered] ${parsedData.deviceId || "door-lock-01"}`);
            
            // Notify frontend that hardware is connected and online
            io.emit("HARDWARE_STATUS_CHANGED", {
              deviceId: parsedData.deviceId || "door-lock-01",
              isOnline: true,
              timestamp: new Date().toISOString()
            });
            break;

          //  Periodic Status Update from Hardware
          case "STATUS_UPDATE":
            console.log(`[Status Update] Device ${parsedData.deviceId || "Default"}:`, parsedData);
            
            // Emit live lock state to React UI via Socket.io
            io.emit("LOCK_STATUS_UPDATED", {
              deviceId: parsedData.deviceId || "door-lock-01",
              status: parsedData.status, // "LOCKED" or "UNLOCKED"
              mode: parsedData.mode,     // 0 (Verification) or 1 (Enrollment)
              timestamp: new Date().toISOString()
            });
            break;

          case "ENROLL_PROGRESS":
            console.log("Enrollment Progress:", parsedData.state);
            io.emit("ENROLL_PROGRESS", parsedData);
            break;

          case "ENROLL_COMPLETE":
            if (parsedData.fingerprint) {
              handleEnrollComplete(parsedData, io);
            }
            break;

          case "FINGERPRINT_SCAN":
            await handleFingerprintScan(parsedData, io);
            break;

          case "SCAN_TRIGGER":
            console.log(`[WS Intercept] Scan trigger requested by: ${parsedData.deviceId}`);
            if (scanController.handleScanTrigger) {
              scanController.handleScanTrigger(parsedData, ws, io);
            }
            break;

          default:
            console.warn("Unhandled message type:", parsedData.type);
            break;
        }
      } catch (error) {
        console.error("Error executing WebSocket message handler:", error);
      }
    });

    ws.on("close", () => {
      console.log("Wokwi connection closed");
      const disconnectedId = ws.deviceId || "door-lock-01";

      if (deviceSocket === ws) {
        deviceSocket = null;
      }
      
      // Clean up device map entry
      for (const [id, socket] of devices.entries()) {
        if (socket === ws) {
          devices.delete(id);
          break;
        }
      }

      // Notify React UI that hardware went offline
      io.emit("HARDWARE_STATUS_CHANGED", {
        deviceId: disconnectedId,
        isOnline: false,
        timestamp: new Date().toISOString()
      });
    });

    ws.on("error", (err) => {
      console.error("WebSocket connection error:", err);
    });
  });

  return wss;
}

// Enrollment Handler
function handleEnrollComplete(parsedData, io) {
  const scannedToken = parsedData.fingerprint;
  const sessionId = enrollmentState.getSession();

  if (!sessionId) {
    console.log("No active enrollment session found.");
    return;
  }

  // Notify frontend clients
  io.emit("FINGERPRINT_READY", {
    success: true,
    sessionId,
    fingerprint: scannedToken,
    message: "Registration successful!",
  });

  // Return ESP32 to normal operational mode
  sendToDevice({ command: "SET_MODE", mode: 0 });
}

// Verification Handler
async function handleFingerprintScan(parsedData, io) {
  const scannedToken = parsedData.fingerprint;
  console.log(`[WS Event] Scanned Fingerprint: ${scannedToken}`);

  try {
    const result = await processVerification(scannedToken, io);

    if (result && result.accessGranted) {
      sendToDevice({ command: "OPEN_DOOR" });
    } else {
      sendToDevice({ command: "DENY_ACCESS" });
    }
  } catch (err) {
    console.error("WebSocket fingerprint processing failed:", err);
    sendToDevice({ command: "DENY_ACCESS" });
  }
}

// Helper to send JSON payloads to connected ESP32 hardware
function sendToDevice(data, deviceId = null) {
  let targetSocket = deviceSocket;

  if (deviceId && devices.has(deviceId)) {
    targetSocket = devices.get(deviceId);
  }

  if (!targetSocket || targetSocket.readyState !== targetSocket.OPEN) {
    console.log("No active or open ESP32 socket available.");
    return false;
  }

  console.log("Sending payload to ESP32:", data);
  targetSocket.send(JSON.stringify(data));
  return true;
}

module.exports = {
  initWokwiSocket,
  sendToDevice,
};