const {WebSocketServer} = require("ws");
//@param {Server} io
function initWokwiSocket(io){
    const wss = new WebSocketServer({port: 8080});

    wss.on("connection",(ws)=>{
        console.log("wokwi ESP32 Handshake established ");
        ws.on("message",(rawData)=>{
            try{
                const parsedData = JSON.parse(rawData.toString());
                console.log("Raw payload from wokwi:",parsedData);
                if(parsedData.type == "FINGERPRINT_SCAN" && parsedData.fingerprint){
                    console.log(`Tunneling biometric token [${parsedData.fingerprint}] to UI dashboard...`);
                    io.emit("WOKWI_PRINT_CAPTURED",{fingerprint: parsedData.fingerprint});
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