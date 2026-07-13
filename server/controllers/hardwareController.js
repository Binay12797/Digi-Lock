const enrollmentState = require("../services/enrollmentState");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const { sendToDevice } = require("../services/wokwiSocketService");

async function scan1(req, res) {
    const success = sendToDevice({
        command: "ENROLL_SCAN1"
    });

    if (!success) {
        return res.status(500).json({
            success: false, // ─── FIXED: typo "fakse" changed to false
            message: "ESP not connected"
        });
    }

    res.json({
        success: true,
        message: "Scan 1 requested"
    });
}

async function scan2(req, res) {
    const success = sendToDevice({
        command: "ENROLL_SCAN2"
    });

    if (!success) {
        return res.status(500).json({
            success: false,
            message: "ESP32 not connected"
        });
    }

    res.json({
        success: true,
        message: "Scan 2 requested"
    });
}

async function startEnrollment(req, res) {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ success: false, message: "sessionId is required to start an enrollment session" });
    }

    try {
        enrollmentState.setSession(sessionId);
        console.log("Starting Enroll");
       

        sendToDevice({
            command: "START_ENROLL",
        });

        console.log("START_ENROLL sent");
        console.log(`Enrollment session successfully started for user: ${sessionId}. Ready for fingerprint payload.`)
        setTimeout(() => {
            const currentSession = enrollmentState.getSession();
            if (currentSession === sessionId) {
                
                console.log("enrollment session timedout");

                const io = req.app.get("io");
                io.emit("ENROLLMENT_TIMEOUT", { message: "Enrollment window expired." });
                enrollmentState.clearSession(); // Explicit clean up on timeout
            }
        }, 60000);

        return res.json({ 
            success: true, 
            message: `Enrollment session successfully started for user: ${sessionId}. Ready for fingerprint payload.` 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

async function enroll(req, res) {
    const { fingerprint } = req.body;
    const userId = enrollmentState.getSession();
    const io = req.app.get("io");

    if (!userId) {
        return res.status(400).json({ success: false, message: "No active enrollment session found" });
    }

    try {
        await User.findByIdAndUpdate(userId, {
            fingerprint: fingerprint,
            isActive: true
        });
        
        io.emit("BIOMETRIC_LINKED", { success: true, message: "Registration successful!" });
        enrollmentState.clearSession();
        
        return res.json({ success: true, message: "Data successfully synced to db" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

async function verification(req, res) {
    const { fingerprint } = req.body;
    const io = req.app.get("io");

    try {
        const user = await User.findOne({ fingerprint, isActive: true });
        
        if (user) {
            // ─── FIXED: Changed "User._id" and "User.name" to "user._id" and "user.name" ───
            // The uppercase 'User' refers to the model template itself, while lowercase 'user' 
            // refers to the specific individual record returned by findOne().
            await accessLog.create({
                userId: user._id, 
                authType: "fingerprint",
                status: "GRANTED",
                scannedDataString: fingerprint
            });

            io.emit("NEW_ACCESS_LOG", { name: user.name, status: "GRANTED", timestamp: new Date() });
            return res.json({ accessGranted: true, action: "OPEN_DOOR", username: user.name });

        } else {
            await accessLog.create({
                userId: null,
                authType: "fingerprint",
                status: "DENIED",
                scannedDataString: fingerprint
            });

            io.emit("NEW_ACCESS_LOG", { name: "Unknown user", status: "DENIED", timestamp: new Date() });
            return res.status(401).json({ accessGranted: false, action: "LOCKED" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    enroll,
    verification,
    startEnrollment,
    scan1,
    scan2
};