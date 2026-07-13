const { WebSocketServer } = require("ws");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const enrollmentState = require("./enrollmentState");

// 1. Maintain a global reference to the connected ESP32 socket
let deviceSocket = null;

function initWokwiSocket(io) {
    const wss = new WebSocketServer({ port: 8080 });
    wss.on('listening', () => console.log(" WebSocket Server successfully listening on port 8080!"));

    wss.on("connection", (ws) => {
        console.log("wokwi ESP32 connection established ");
        
        // Save the active connection instance for outbound commands
        deviceSocket = ws;
        console.log("Device socket stored.");

        ws.on("message", async (rawData) => {
            try {
                const parsedData = JSON.parse(rawData.toString());
                console.log("Raw payload from wokwi:", parsedData);

                if (parsedData.type == "FINGERPRINT_SCAN" && parsedData.fingerprint) {
                    const scannedToken = parsedData.fingerprint;
                    console.log(`Tunneling biometric token [${scannedToken}] to UI dashboard...`);

                    // Get the temporary frontend session token from memory cache
                    const sessionId = enrollmentState.getSession();

                    // ─── CASE 1: ATOMIC ENROLLMENT MODE ───────────────────────────────────
                    if (sessionId) {
                        console.log(`[Enrollment Active] Streaming token to active client session: ${sessionId}`);
                        
                        // Stream the token directly down to the React UI form via Socket.io
                        io.emit("FINGERPRINT_READY", {
                            success: true,
                            sessionId: sessionId,
                            fingerprint: scannedToken
                        });

                        // Instantly clear out volatile focus memory
                        enrollmentState.clearSession();

                        // Notify the hardware device simulator that tracking is buffered
                        ws.send(JSON.stringify({
                            status: "ENROLLED", 
                            message: "Fingerprint saved successfully to form state."
                        }));
                    
                    // ─── CASE 2: ACCESS VERIFICATION MODE ─────────────────────────────────
                    } else {
                        console.log(`verification Active. checking database for token: [${scannedToken}]`);
                        const user = await User.findOne({ fingerprint: scannedToken, isActive: true });
                        
                        if (user) {
                            await accessLog.create({
                                userId: user._id,
                                authType: "fingerprint",
                                status: "GRANTED",
                                scannedDataString: scannedToken
                            });
                            
                            io.emit("NEW_ACCESS_LOG", { name: user.name, status: "GRANTED", timestamp: new Date() });
                            ws.send(JSON.stringify({ command: "OPEN_DOOR", target: user.name }));
                            console.log("user found!");
                        } else {
                            await accessLog.create({
                                userId: null,
                                authType: "fingerprint",
                                status: "DENIED",
                                scannedDataString: scannedToken
                            });
                            
                            io.emit("NEW_ACCESS_LOG", {
                                name: "Unknown user",
                                status: "DENIED",
                                timestamp: new Date()
                            });
                            
                            ws.send(JSON.stringify({ command: "KEEP_LOCKED" }));
                            console.log("unknown user!");
                        }
                    }
                }
            } catch (error) {
                console.log(` Plain-text String from Wokwi: ${rawData.toString()}`);
            }
        });

        ws.on("close", () => {
            console.log("wokwi connection closed");
            // Clear reference if the socket drops to prevent memory leaks
            if (deviceSocket === ws) {
                deviceSocket = null;
            }
        });
    });
    return wss;
}

// 2. Added Outbound Pipeline helper function
function sendToDevice(data) {
    console.log("sendToDevice Called");
    if (!deviceSocket) {
        console.log("No active Wokwi ESP32 connection found.");
        return false;
    }
    console.log("Sending command payload to ESP: ", data);
    deviceSocket.send(JSON.stringify(data));
    return true;
}

// 3. Cleanly export both functions inside a standard module object
module.exports = { 
    initWokwiSocket,
    sendToDevice
};