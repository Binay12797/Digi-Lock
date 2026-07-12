const {WebSocketServer} = require("ws");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const enrollmentState = require("./enrollmentState");
let deviceSocket = null;

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
                    enrollmentState.clearSession();
                    // Tell the ESP to return to idle/auth mode.
                    sendToDevice({
                        command: "SET_MODE",
                        mode: 0
                    });
                    console.log("Enrollment finished. Switching ESP back to mode 0.");
                }
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
                        
                    }}

                    //io.emit("WOKWI_PRINT_CAPTURED",{fingerprint: parsedData.fingerprint});
                
            }catch(error){
                console.log(` Plain-text String from Wokwi: ${rawData.toString()}`);
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