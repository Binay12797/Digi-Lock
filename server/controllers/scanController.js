// controllers/scanController.js

// Keep tracking context steps (0 = Step 1, 1 = Step 2)
let currentScanStep = 0; 

function executeScan1(ws) {
    console.log("[Scan Controller] Running heavy calculation/API handling logic for Scan 1...");
    
    // Use the active WebSocket connection passed to this function instead of sendToDevice
    if (!ws) {
        console.error("[Scan Controller] ESP32 not connected!");
        return false;
    }

    // Instead of HTTP (res.json), send the commands directly over WS matching what your EnrollmentManager expects!
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

/**
 * Handles alternating sequential click routing logic
 */
// 
function handleScanTrigger(data, ws, io) {
    console.log("=================================================");
    console.log("[Scan Controller] Button pressed! Initializing...");
    console.log("=================================================");

    if (!ws) {
        console.error("[Scan Controller] Error: ESP32 is not connected!");
        return;
    }

    // 1. Kickstart the enrollment process on the ESP32 (Sets its state_ to ENROLL_WAITING_SCAN1)
    ws.send(JSON.stringify({ 
        command: "START_ENROLL" 
    }));

    // 2. Update React Frontend UI
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