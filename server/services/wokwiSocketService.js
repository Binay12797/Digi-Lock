const {WebSocketServer} = require("ws");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const enrollmentState = require("./enrollmentState");
const deviceManager = require("./deviceManager");

function initWokwiSocket(io){
    const wss = new WebSocketServer({port: 8080});
    wss.on('listening', () => console.log(" WebSocket Server successfully listening on port 8080!"));

    wss.on("connection",(ws)=>{
        console.log("wokwi ESP32 connection established ");
        ws.on("message",async (rawData)=>{
            try{
                const parsedData = JSON.parse(rawData.toString());
                // Device registration
                if (parsedData.type === "HELLO") {
                    const deviceId = parsedData.deviceId;
                    if (!deviceId) {
                        console.log("HELLO received without deviceId.");
                        return;
                    }
                    ws.deviceId = deviceId;
                    deviceManager.register(deviceId, ws);
                    console.log(`Device registered: ${deviceId}`);
                    return;
                }
                console.log("Raw payload from wokwi:",parsedData);
                // STATUS UPDATE
                if (parsedData.type === "STATUS_UPDATE") 
                {
                     deviceManager.heartbeat(parsedData.deviceId);
                     console.log("Status:",parsedData);
                }

                // ENROLLMENT PROGRESS
                else if (parsedData.type === "ENROLL_PROGRESS") {
                    console.log("Enrollment Progress:", parsedData.state);
                    io.emit("ENROLL_PROGRESS", parsedData);
                }
                // ENROLLMENT COMPLETE
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

                    // =====================================================
                    // DATABASE SAVE (TEMPORARILY DISABLED)
                    // Uncomment when MongoDB is enabled.
                    // =====================================================
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
                        fingerprint: scannedToken
                    });
                }
                else if (parsedData.type === "FINGERPRINT_SCAN") {
                    await handleFingerprintScan(parsedData, io);
                }
                /*
                else{
                        // console.log(`Access Denied! Token [${scannedToken}] not registered.`);
                        // io.emit("AUTH_RESULT",{
                        //     success: false,
                        //     message: "Access Denied: Unknown User",
                        //     tokenAttempted: scannedToken
                        // });
                        console.log(`verification Active. checking database for token: [${scannedToken}]`);
                        const user = await User.findOne({fingerprint: scannedToken, isActive: true});
                        if(user){
                            await accessLog.create({
                                userId : user._id,
                                authType: "fingerprint",
                                status: "GRANTED",
                                scannedDataString: scannedToken
                            });
                            io.emit("NEW_ACCESS_LOG", { name: user.name, status: "GRANTED", timestamp: new Date() });
                            ws.send(JSON.stringify({command: "OPEN_DOOR", target: user.name}));
                            console.log("user found!");
                        }else{
                        
                            await accessLog.create({
                                userId: null,
                                authType: "fingerprint",
                                status: "DENIED",
                                scannedDataString: scannedToken
                            });
                            io.emit("NEW_ACCESS_LOG",{
                                name: "Unknown user",
                                status: "DENIED",
                                timestamp: new Date()
                            });
                            ws.send(JSON.stringify({command: "KEEP_LOCKED"}));
                            console.log("unknow user!");
                        
                    }}*/

                    //io.emit("WOKWI_PRINT_CAPTURED",{fingerprint: parsedData.fingerprint});
                
            }catch(error){
                console.log(` Plain-text String from Wokwi: ${rawData.toString()}`);
            }
        });

        ws.on("close", (code, reason) => {
            console.log("========== CLOSE EVENT ==========");
            console.log("Code:", code);
            console.log("Reason:", reason.toString());
            if (ws.deviceId) {
                deviceManager.unregister(ws.deviceId);
            }
        });
        ws.on("error", (err) => {
            console.log("Socket Error:", err.message);
        });
    });
    return wss;
}

//verifation haldler
async function handleFingerprintScan(parsedData, io) {
    const scannedToken = parsedData.fingerprint;
    const deviceId = parsedData.deviceId;
    console.log("================================");
    console.log("Fingerprint Scan Received");
    console.log("Device:", deviceId);
    console.log("UID:", scannedToken);
    console.log("================================");
    const granted = verifyFingerprint(scannedToken);
    sendAuthenticationResult(deviceId, granted);
}

//temp verification id list - later replace with ids from databse
function verifyFingerprint(uid) {
    // Temporary verification
    return uid === "1";
}
/* later for database implementation 
async function verifyFingerprint(uid) {
    const user = await User.findOne({
        fingerprint: uid,
        isActive: true
    });
    return !!user;
}*/ 

//authetication helper function
function sendAuthenticationResult(deviceId, granted) {
    if (granted) {
        sendToDevice(deviceId, {
            command: "OPEN_DOOR"
        });
    } else {
        sendToDevice(deviceId, {
            command: "DENY_ACCESS"
        });
    }
}

//added as a helper function
/*[WS] Sending START_ENROLL -> door-lock-01
[WS] Sending AUTH_CHECK -> door-lock-01
[WS] Sending OPEN_DOOR -> door-lock-01*/ 
function sendToDevice(deviceId, data) {
    console.log(`[WS] Sending ${data.command} -> ${deviceId}`);
    return deviceManager.send(deviceId, data);
}

module.exports = { 
    initWokwiSocket,
    sendToDevice
};