const { WebSocketServer } = require("ws");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const enrollmentState = require("./enrollmentState");
const scanController = require("../controllers/scanController");
const { processVerification } = require("../controllers/hardwareController"); 
const devices = new Map();

// Global variable tracking the socket active handle
let deviceSocket = null; 

function initWokwiSocket(io){
    const wss = new WebSocketServer({port: 8080});
    wss.on('listening', () => console.log(" WebSocket Server successfully listening on port 8080!"));

    wss.on("connection", (ws) => {
        console.log("wokwi ESP32 connection established ");
        io.emit("started");
        deviceSocket = ws;
        console.log("Device socket stored.");

        ws.on("message", async (rawData) => {
            try {
                const parsedData = JSON.parse(rawData.toString());
                console.log("Raw payload from wokwi:", parsedData);
                
                // 1. STATUS UPDATE
                if (parsedData.type === "STATUS_UPDATE") {
                    console.log("Status:", parsedData);
                    /* ===============================================
                    // Future Database Sync
                    //
                    // When MongoDB is enabled, update the Lock
                    // document using the incoming STATUS_UPDATE.
                    //
                    // await Lock.findOneAndUpdate(
                        { deviceId: parsedData.deviceId },
                        {
                            status: parsedData.status,
                            lastUpdated: new Date()
                        },
                        {
                            upsert: true
                        }
                    );
                    //
                    // ===============================================*/
                }

                // 2. ENROLLMENT PROGRESS
                else if (parsedData.type === "ENROLL_PROGRESS") {
                    console.log("Enrollment Progress:", parsedData.state);
                    io.emit("ENROLL_PROGRESS", parsedData);

                    // --- STEP TRANSITION LOGIC ---
                    // If the ESP32 successfully saves scan 1, tell it to process Scan 2
                    // if (parsedData.state === "waiting_scan2") {
                    //     console.log("[Sensor] Scan 1 saved. Directing ESP32 to run Scan 2...");
                    //     ws.send(JSON.stringify({ 
                    //         command: "ENROLL_SCAN2" 
                    //     }));
                    // }
                }

                // 3. ENROLLMENT COMPLETE
                else if (parsedData.type === "ENROLL_COMPLETE" && parsedData.fingerprint) {
                    const scannedToken = parsedData.fingerprint;
                    const sessionId = enrollmentState.getSession();
                    
                    if (!sessionId) {
                        console.log("No active enrollment session.");
                        return;
                    }

                    console.log("==================================");
                    console.log("Enrollment Complete");
                    console.log("Session ID:", sessionId);
                    console.log("Fingerprint:", scannedToken);
                    console.log("==================================");

                    // Cleanly reset/exit enrollment state on the hardware
                    ws.send(JSON.stringify({ 
                        command: "EXIT_ENROLL" 
                    }));

                    // Optional MongoDB Save (Uncomment if needed)
                    /*
                    await User.findByIdAndUpdate(sessionId, {
                        fingerprint: scannedToken,
                        isActive: true
                    });
                    console.log("Fingerprint successfully saved.");
                    */

                    io.emit("FINGERPRINT_READY", {
                        success: true,
                        sessionId,
                        fingerprint: scannedToken,
                        message: "Registration successful!"
                    });

                    // Return ESP to normal mode
                    sendToDevice({
                        command: "SET_MODE",
                        mode: 0
                    });
                    //enrollmentState.clearSession();

                    console.log("Enrollment session completed.");
                }

                // 4. AUTHENTICATION FINGERPRINT SCAN
                else if (parsedData.type === "FINGERPRINT_SCAN") {
                    await handleFingerprintScan(parsedData, io);
                }

                // 5. PHYSICAL BUTTON SCAN TRIGGER
                else if (parsedData.type === "SCAN_TRIGGER") {
                    console.log(`[WS Intercept] Scan trigger requested by: ${parsedData.deviceId}`);
                    // Forward directly to scanController to initiate "START_ENROLL"
                    scanController.handleScanTrigger(parsedData, ws, io); 
                }

            } catch (error) {
                console.log(` Plain-text String from Wokwi: ${rawData.toString()}`);
            }
        });

        ws.on("close", () => {
            console.log("wokwi connection closed");
            if (deviceSocket === ws) {
                deviceSocket = null;
            }
        });
    });

    return wss;
}

// Verification handler
async function handleFingerprintScan(parsedData, io) {
    const scannedToken = parsedData.fingerprint;
    console.log(`[WS Event] Scanned Fingerprint: ${scannedToken}`);
    try {
        // Run the unified verification logic (DB search, Access logging, and Socket.io emission)
        const result = await processVerification(scannedToken, io);

        // Send physical commands back to your Wokwi ESP32 based on outcome
        if (result.accessGranted) {
            sendToDevice({ command: "OPEN_DOOR" });
        } else {
            sendToDevice({ command: "DENY_ACCESS" });
        }
    } catch (err) {
        console.error("WebSocket fingerprint processing failed:", err);
        sendToDevice({ command: "DENY_ACCESS" });
    }
}

// Temporary verification ID helper (replace with DB queries when ready)
function verifyFingerprint(uid) {
    const authorizedUIDs = ["1", "user_65bc830f3a1e"];
    return authorizedUIDs.includes(uid);
}

// Authentication helper
function sendAuthenticationResult(granted) {
    if (granted) {
        sendToDevice({
            command: "OPEN_DOOR"
        });
    } else {
        sendToDevice({
            command: "DENY_ACCESS"
        });
    }
}

// Send helper
function sendToDevice(data) {
    console.log("sendToDevice Called");
    if (!deviceSocket) {
        console.log("No ESP32 connected.");
        return false;
    }
    console.log("Sending to ESP: ", data);
    deviceSocket.send(JSON.stringify(data));
    return true;
}

module.exports = { 
    initWokwiSocket,
    sendToDevice
};