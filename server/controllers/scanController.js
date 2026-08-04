
let currentScanStep = 0; 

function executeScan1(ws) {
    console.log("[Scan Controller] Running heavy calculation/API handling logic for Scan 1...");
    
    
    if (!ws) {
        console.error("[Scan Controller] ESP32 not connected!");
        return false;
    }

   
    ws.send(JSON.stringify({
        command: "ENROLL_SCAN1"
    }));

    console.log("Scan 1 requested successfully to ESP32");
    return true; 
}

function executeScan2(ws) {
    console.log("[Scan Controller] Running heavy verification logic for Scan 2...");
    
    if (!ws) {
        console.error("[Scan Controller] ESP32 not connected!");
        return false;
    }

    ws.send(JSON.stringify({
        command: "ENROLL_SCAN2"
    }));

    console.log("Scan 2 requested successfully to ESP32");
    return true; 
}
 
function handleScanTrigger(data, ws, io) {
    
    console.log("[Scan Controller] Button pressed! Initializing...");
    

    if (!ws) {
        console.error("[Scan Controller] Error: ESP32 is not connected!");
        return;
    }

    
    ws.send(JSON.stringify({ 
        command: "START_ENROLL" 
    }));

   
    if (io) {
        io.emit("GLOBAL_SCAN_STATUS", { 
            step: 0, 
            text: "Enrollment started. Place finger on sensor for Scan 1." 
        });
    }
}

module.exports = {
    handleScanTrigger
};