const {WebSocketServer} = require("ws");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const enrollmentState = require("./enrollmentState");
function initWokwiSocket(io){
    const wss = new WebSocketServer({port: 8080});
    wss.on('listening', () => console.log(" WebSocket Server successfully listening on port 8080!"));

    wss.on("connection",(ws)=>{
        console.log("wokwi ESP32 connection established ");
        ws.on("message",async (rawData)=>{
            try{
                const parsedData = JSON.parse(rawData.toString());
                console.log("Raw payload from wokwi:",parsedData);
                if(parsedData.type == "FINGERPRINT_SCAN" && parsedData.fingerprint){
                    const scannedToken = parsedData.fingerprint;
                    console.log(`Tunneling biometric token [${parsedData.fingerprint}] to UI dashboard...`);

                    // const user =  User.findOne({fingerprint: scannedToken });
                    // if(user){
                    //     console.log(`Access Granted! Welcome, ${user.name}`);
                    //     io.emit("AUTH_RESULT",{
                    //         success: true,
                    //         message: "ACCESS GRANTED",
                    //         userName: user.name,
                    //         role: user.role || "User"

                    const userId = enrollmentState.getSession();
                    if(userId){
                        console.log(`Enrollment active`)
                        await User.findByIdAndUpdate(userId,{
                            fingerprint: scannedToken,
                            isActive: true
                        });
                        io.emit("BIOMETRIC_LINKED",{success: true, message: "Registration successful!"});
                        enrollmentState.clearSession();

                        ws.send(JSON.stringify({
                            command: "ENROLL_SUCCESS",
                            status: "ENROLLED",
                            message: "Fingerprint saved successfully"
                        }));
                    
                        
                    }else{
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
                }
            }catch(error){
                console.log(` Plain-text String from Wokwi: ${rawData.toString()}`);
            }
        });

        ws.on("close",()=>{
            console.log("wokwi connection closed");
        });
    });
    return wss;
}

module.exports = { initWokwiSocket};