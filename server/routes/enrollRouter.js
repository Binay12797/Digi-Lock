// routes/enrollRoutes.js or inside server.js
const {Router} = require("express");
const enrollRouter = Router();
const enrollmentState = require("../sockets/enrollmentState"); // Adjust path if needed
const { sendToDevice } = require("../sockets/wokwiSocket"); // Import helper to talk to ESP32

router.post("/api/startEnroll", (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
    }

    // 1. Store the active session ID so we know which signup form gets this fingerprint
    enrollmentState.setSession(sessionId); 
    console.log(`[API] Started enrollment session: ${sessionId}`);

    // 2. Command the ESP32 directly to start enrollment mode
    const sent = sendToDevice({
        command: "START_ENROLL"
    });

    if (sent) {
        return res.status(200).json({ 
            success: true, 
            message: "Enrollment started on hardware." 
        });
    } else {
        return res.status(503).json({ 
            success: false, 
            error: "ESP32 is not connected to the backend!" 
        });
    }
});

module.exports = router;