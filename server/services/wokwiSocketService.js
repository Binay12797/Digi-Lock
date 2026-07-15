const {WebSocketServer} = require("ws");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const enrollmentState = require("./enrollmentState");
const devices = new Map();

function initWokwiSocket(io){
    const wss = new WebSocketServer({port: 8080});
    wss.on('listening', () => console.log(" WebSocket Server successfully listening on port 8080!"));

    wss.on("connection",(ws)=>{
        console.log("wokwi ESP32 connection established ");
        //server remembers which websocket belongs to ESP
        deviceSocket = ws;
        console.log("Device socket stored.");
        ws.on("message",async (rawData)=>{
            try{
                const parsedData = JSON.parse(rawData.toString());
                console.log("Raw payload from wokwi:",parsedData);
                // STATUS UPDATE
                if (parsedData.type === "STATUS_UPDATE") 
                {
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
                    // =====================================================

                    /*
                    await User.findByIdAndUpdate(sessionId, {
                        fingerprint: scannedToken,
                        isActive: true
                    });
                    */

                    io.emit("BIOMETRIC_LINKED", {
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
                    enrollmentState.clearSession();

                    console.log("Enrollment session completed.");
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
                
            }catch (error) {
                console.error("WebSocket handler error:");
                console.error(error);

                console.log("Raw message:");
                console.log(rawData.toString());
            }
        });

        ws.on("close",()=>{
            console.log("wokwi connection closed");
            if(deviceSocket === ws){
                deviceSocket = null;
            }
        });
    });
    return wss;
}

//verifation haldler
async function handleFingerprintScan(parsedData, io) {
    const scannedToken = parsedData.fingerprint;

    console.log("================================");
    console.log("Fingerprint Scan Received");
    console.log("UID:", scannedToken);
    console.log("================================");
    const granted = await verifyFingerprint(scannedToken);
    // Temporary
    // Later this will also return the matched user.
    const user = null;
    // Database logging will go here.
    /* =====================================================
    DATABASE ACCESS LOG (Enable when MongoDB is active)

    await accessLog.create({
        userId: user ? user._id : null,
        authType: "fingerprint",
        status: granted ? "GRANTED" : "DENIED",
        scannedDataString: scannedToken
    });

    ===================================================== */
    sendAuthenticationResult(granted);
}

// =====================================================
// TEMPORARY AUTHORIZATION
//
// TODO (Database Integration)
//
// Replace this entire function with:
//
// async function verifyFingerprint(uid) {
//     const user = await User.findOne({
//         fingerprint: uid,
//         isActive: true
//     });
//
//     return !!user;
// }
//
// =====================================================
async function verifyFingerprint(uid) {
    return uid === "FP-0001";
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


//added as a helper function
function sendToDevice(data) {
    //debug logs
    console.log("sendTodevice Called");
    if (!deviceSocket) {
        console.log("No ESP32 connected.");
        return false;
    }
    //debug logs
    console.log("Sending to ESP: ", data);

    deviceSocket.send(JSON.stringify(data));
    return true;
}


module.exports = { 
    initWokwiSocket,
    sendToDevice
};